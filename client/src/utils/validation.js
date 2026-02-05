/**
 * Basic validation helpers for the feedback form.
 */

/**
 * Check if email looks valid.
 * @param {string} email - Email to validate
 * @returns {boolean}
 */
export const isValidEmail = (email) => {
  if (!email) {
    return false;
  }

  // Simple pattern is enough for client-side checks
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(email.trim());
};

/**
 * Validate feedback form values.
 * @param {Object} formData - Form values
 * @param {string} formData.name - Name
 * @param {string} formData.email - Email
 * @param {string} formData.message - Message
 * @returns {Object} { isValid, errors }
 */
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

