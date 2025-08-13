// Contact form handling
document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById('contactForm');
  const submitBtn = document.getElementById('submitBtn');
  const btnText = submitBtn.querySelector('.btn-text');
  const btnLoading = submitBtn.querySelector('.btn-loading');
  const formStatus = document.getElementById('formStatus');

  form.addEventListener('submit', handleFormSubmit);

  async function handleFormSubmit(e) {
    e.preventDefault();
    
    // Get form data
    const formData = new FormData(form);
    const data = {
      name: formData.get('name').trim(),
      email: formData.get('email').trim(),
      subject: formData.get('subject')?.trim() || '',
      message: formData.get('message').trim(),
      honeypot: formData.get('honeypot') // Spam protection
    };

    // Basic client-side validation
    if (!data.name || !data.email || !data.message) {
      showStatus('Please fill in all required fields.', 'error');
      return;
    }

    if (!isValidEmail(data.email)) {
      showStatus('Please enter a valid email address.', 'error');
      return;
    }

    if (data.message.length < 10) {
      showStatus('Please enter a message with at least 10 characters.', 'error');
      return;
    }

    // Check honeypot (spam protection)
    if (data.honeypot) {
      showStatus('Spam detected. Please try again.', 'error');
      return;
    }

    // Set loading state
    setLoadingState(true);
    clearStatus();

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (response.ok && result.success) {
        showStatus('✅ Message sent successfully! I\'ll get back to you soon.', 'success');
        form.reset();
        
        // Track successful submission (optional analytics)
        if (typeof gtag !== 'undefined') {
          gtag('event', 'contact_form_submit', {
            event_category: 'engagement',
            event_label: 'contact_form'
          });
        }
      } else {
        throw new Error(result.error || 'Failed to send message');
      }

    } catch (error) {
      console.error('Contact form error:', error);
      showStatus('❌ Failed to send message. Please try again or email me directly.', 'error');
    } finally {
      setLoadingState(false);
    }
  }

  function setLoadingState(loading) {
    submitBtn.disabled = loading;
    
    if (loading) {
      btnText.style.display = 'none';
      btnLoading.style.display = 'inline';
      submitBtn.classList.add('loading');
    } else {
      btnText.style.display = 'inline';
      btnLoading.style.display = 'none';
      submitBtn.classList.remove('loading');
    }
  }

  function showStatus(message, type) {
    formStatus.textContent = message;
    formStatus.className = `form-status ${type}`;
    formStatus.style.display = 'block';
    
    // Auto-hide success messages after 5 seconds
    if (type === 'success') {
      setTimeout(() => {
        clearStatus();
      }, 5000);
    }
  }

  function clearStatus() {
    formStatus.style.display = 'none';
    formStatus.textContent = '';
    formStatus.className = 'form-status';
  }

  function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Character counter for message field
  const messageField = document.getElementById('message');
  const maxLength = messageField.getAttribute('maxlength');
  
  if (maxLength) {
    const counter = document.createElement('div');
    counter.className = 'char-counter';
    counter.style.fontSize = '12px';
    counter.style.color = 'var(--muted)';
    counter.style.textAlign = 'right';
    counter.style.marginTop = '4px';
    
    messageField.parentNode.appendChild(counter);
    
    function updateCounter() {
      const remaining = maxLength - messageField.value.length;
      counter.textContent = `${remaining} characters remaining`;
      
      if (remaining < 100) {
        counter.style.color = 'var(--accent)';
      } else {
        counter.style.color = 'var(--muted)';
      }
    }
    
    messageField.addEventListener('input', updateCounter);
    updateCounter(); // Initial count
  }

  // Auto-resize textarea
  messageField.addEventListener('input', function() {
    this.style.height = 'auto';
    this.style.height = this.scrollHeight + 'px';
  });

  // Form field animations
  const formInputs = form.querySelectorAll('input, textarea');
  formInputs.forEach(input => {
    input.addEventListener('focus', function() {
      this.parentNode.classList.add('focused');
    });
    
    input.addEventListener('blur', function() {
      if (!this.value) {
        this.parentNode.classList.remove('focused');
      }
    });
    
    // Check if field has value on load
    if (input.value) {
      input.parentNode.classList.add('focused');
    }
  });
});

// Add CSS for contact form styling
const contactStyles = document.createElement('style');
contactStyles.textContent = `
  .contact-section {
    padding: 60px 0;
  }
  
  .contact-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 60px;
    align-items: start;
  }
  
  .contact-info h2,
  .contact-form-container h2 {
    font-size: 24px;
    margin-bottom: 24px;
    color: var(--accent);
  }
  
  .contact-info h3 {
    font-size: 18px;
    margin: 32px 0 16px 0;
    color: var(--fg);
  }
  
  .contact-item {
    margin-bottom: 16px;
    line-height: 1.6;
  }
  
  .contact-item strong {
    color: var(--accent);
    display: inline-block;
    width: 80px;
  }
  
  .contact-item a {
    color: var(--fg);
    text-decoration: none;
  }
  
  .contact-item a:hover {
    color: var(--accent);
  }
  
  .social-links {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
  }
  
  .social-link {
    padding: 8px 16px;
    background: var(--card-bg);
    border: 1px solid var(--border);
    border-radius: 8px;
    color: var(--fg);
    text-decoration: none;
    transition: all 0.2s ease;
  }
  
  .social-link:hover {
    border-color: var(--accent);
    color: var(--accent);
  }
  
  .contact-form {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }
  
  .form-group {
    position: relative;
  }
  
  .form-group label {
    display: block;
    margin-bottom: 6px;
    font-weight: 500;
    color: var(--fg);
  }
  
  .form-group.focused label {
    color: var(--accent);
  }
  
  .contact-form input,
  .contact-form textarea {
    width: 100%;
    padding: 12px;
    background: var(--card-bg);
    border: 1px solid var(--border);
    border-radius: 8px;
    color: var(--fg);
    font-family: inherit;
    transition: border-color 0.2s ease;
  }
  
  .contact-form input:focus,
  .contact-form textarea:focus {
    outline: none;
    border-color: var(--accent);
  }
  
  .contact-form textarea {
    resize: vertical;
    min-height: 120px;
  }
  
  .form-status {
    padding: 12px;
    border-radius: 8px;
    margin-top: 16px;
    display: none;
  }
  
  .form-status.success {
    background: rgba(23, 185, 120, 0.1);
    border: 1px solid var(--accent);
    color: var(--accent);
  }
  
  .form-status.error {
    background: rgba(239, 68, 68, 0.1);
    border: 1px solid #ef4444;
    color: #ef4444;
  }
  
  .btn.loading {
    opacity: 0.7;
    cursor: not-allowed;
  }
  
  .cta-section {
    text-align: center;
    padding: 60px 0;
    background: var(--card-bg);
    border-radius: 16px;
    margin-top: 60px;
  }
  
  .cta-section h2 {
    font-size: 28px;
    margin-bottom: 16px;
  }
  
  .cta-section p {
    color: var(--muted);
    margin-bottom: 32px;
    max-width: 600px;
    margin-left: auto;
    margin-right: auto;
  }
  
  .cta-buttons {
    display: flex;
    gap: 16px;
    justify-content: center;
    flex-wrap: wrap;
  }
  
  @media (max-width: 768px) {
    .contact-grid {
      grid-template-columns: 1fr;
      gap: 40px;
    }
    
    .social-links {
      justify-content: center;
    }
    
    .cta-buttons {
      flex-direction: column;
      align-items: center;
    }
  }
`;
document.head.appendChild(contactStyles);
