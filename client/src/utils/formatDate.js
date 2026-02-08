// Date formatter

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
    return '';
  }
};

