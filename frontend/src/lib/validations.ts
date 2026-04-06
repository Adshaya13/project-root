/**
 * Validation utilities for authentication forms
 */

/**
 * Validates Sri Lanka phone number format
 * Accepts formats like: +94701234567, 0701234567, +94-70-123-4567
 * Sri Lanka phone carriers: Dialog (70,71), Mobitel (76,77), Hutch (78), Airtel (75)
 */
export function isValidSriLankaPhone(phone: string): boolean {
  if (!phone) return false;

  // Remove common separators
  const cleaned = phone.replace(/[\s\-()]/g, "");

  // Pattern for +94 or 0 prefix followed by valid carrier codes
  const patterns = [
    /^\+94(70|71|75|76|77|78)\d{7}$/, // +94701234567
    /^0(70|71|75|76|77|78)\d{7}$/, // 0701234567
    /^\+94\d{9}$/, // +94 with 9 digits
  ];

  return patterns.some((pattern) => pattern.test(cleaned));
}

/**
 * Validates email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validates password strength
 * At least 8 characters
 */
export function isValidPassword(password: string): boolean {
  return password.length >= 8;
}

/**
 * Checks if email format is valid for university
 */
export function isValidUniversityEmail(email: string): boolean {
  return isValidEmail(email);
}

/**
 * Gets error message for phone validation
 */
export function getPhoneErrorMessage(phone: string): string | null {
  if (!phone) {
    return "Phone number is required";
  }

  if (!isValidSriLankaPhone(phone)) {
    return "Please enter a valid Sri Lanka phone number (e.g., +94701234567 or 0701234567)";
  }

  return null;
}

/**
 * Gets error message for email validation
 */
export function getEmailErrorMessage(email: string): string | null {
  if (!email) {
    return "Email is required";
  }

  if (!isValidEmail(email)) {
    return "Please enter a valid email address";
  }

  return null;
}

/**
 * Gets error message for password validation
 */
export function getPasswordErrorMessage(password: string): string | null {
  if (!password) {
    return "Password is required";
  }

  if (!isValidPassword(password)) {
    return "Password must be at least 8 characters long";
  }

  return null;
}
