/**
 * Small helpers for formatting dates.
 */

/**
 * Format a date into something like "Feb 1, 2026, 10:30 AM".
 * @param {string|number|Date} value - Date-ish value
 * @returns {string}
 */
export const formatDate = (value) => {
  if (!value) {
    return '';
  }

  try {
    const date = value instanceof Date ? value : new Date(value);

    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  } catch (error) {
    // If value is weird, just bail out with empty string
    return '';
  }
};

