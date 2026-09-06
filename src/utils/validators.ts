/**
 * Form validation utilities
 */

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isValidPhone(phone: string): boolean {
  // Pakistani phone format: +92 or 03xx
  return /^(\+92|0)?3\d{2}[- ]?\d{7}$/.test(phone.replace(/\s/g, ''));
}

export function isValidPassword(password: string): { valid: boolean; message: string } {
  if (password.length < 6) {
    return { valid: false, message: 'Password must be at least 6 characters' };
  }
  return { valid: true, message: '' };
}

export function isRequired(value: string, fieldName: string): string | null {
  if (!value || !value.trim()) return `${fieldName} is required`;
  return null;
}

export function isPositiveNumber(value: number, fieldName: string): string | null {
  if (value <= 0) return `${fieldName} must be greater than 0`;
  return null;
}

export function validateCheckoutForm(data: {
  first_name: string;
  last_name: string;
  phone: string;
  address: string;
  city: string;
}): string | null {
  if (!data.first_name.trim()) return 'First name is required';
  if (!data.last_name.trim()) return 'Last name is required';
  if (!data.phone.trim()) return 'Phone number is required';
  if (data.phone.trim() && !isValidPhone(data.phone)) return 'Invalid phone number';
  if (!data.address.trim()) return 'Address is required';
  if (!data.city.trim()) return 'City is required';
  return null;
}

export function validateRegistration(data: {
  email: string;
  password: string;
  first_name: string;
}): string | null {
  if (!data.first_name.trim()) return 'First name is required';
  if (!data.email.trim()) return 'Email is required';
  if (!isValidEmail(data.email)) return 'Invalid email address';
  const pw = isValidPassword(data.password);
  if (!pw.valid) return pw.message;
  return null;
}
