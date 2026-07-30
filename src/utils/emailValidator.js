/**
 * Normalizes email address by trimming whitespace and converting to lowercase.
 * @param {string} email 
 * @returns {string}
 */
export function normalizeEmail(email) {
  if (!email) return '';
  return email.trim().toLowerCase();
}

/**
 * Validates email format using standard regex.
 * @param {string} email 
 * @returns {boolean}
 */
export function validateEmail(email) {
  if (!email) return false;
  // Simple but effective email validation regex
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(normalizeEmail(email));
}
