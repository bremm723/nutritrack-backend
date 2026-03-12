/**
 * Simple input validators (kept lightweight — no external lib needed).
 */

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function isPositiveNumber(value) {
  return typeof value === 'number' && value > 0;
}

module.exports = { isValidEmail, isNonEmptyString, isPositiveNumber };
