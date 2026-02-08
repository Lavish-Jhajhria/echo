// Form validation helpers

// Check email format
export const isValidEmail = (email) => {
  if (!email) {
    return false;
  }

  // Basic regex check
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(email.trim());
};

// Validate feedback form
export const validateFeedbackForm = (formData) => {
  const errors = {};

  if (!formData.name || !formData.name.trim()) {
    errors.name = 'Name is required.';
  } else if (formData.name.trim().length > 100) {
    errors.name = 'Name must be at most 100 characters.';
  }

  if (!formData.email || !formData.email.trim()) {
    errors.email = 'Email is required.';
  } else if (!isValidEmail(formData.email)) {
    errors.email = 'Please enter a valid email address.';
  }

  if (!formData.message || !formData.message.trim()) {
    errors.message = 'Message is required.';
  } else if (formData.message.trim().length > 1000) {
    errors.message = 'Message must be at most 1000 characters.';
  }

  const isValid = Object.keys(errors).length === 0;

  return {
    isValid,
    errors
  };
};

