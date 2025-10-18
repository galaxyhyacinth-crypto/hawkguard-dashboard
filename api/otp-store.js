// api/otp-store.js
// Simple in-memory OTP storage (temporary, resets when server restarts)

const otpStore = new Map();

/**
 * Save OTP for a given email
 * @param {string} email 
 * @param {string} otp 
 * @param {number} ttlMs - time to live in milliseconds
 */
export function saveOtp(email, otp, ttlMs = 180000) {
  const expiresAt = Date.now() + ttlMs;
  otpStore.set(email, { otp, expiresAt });
  // auto-delete after expiry
  setTimeout(() => otpStore.delete(email), ttlMs);
}

/**
 * Verify if OTP is valid for email
 * @param {string} email 
 * @param {string} otpInput 
 * @returns {boolean}
 */
export function verifyOtp(email, otpInput) {
  const record = otpStore.get(email);
  if (!record) return false;
  if (Date.now() > record.expiresAt) {
    otpStore.delete(email);
    return false;
  }
  return record.otp === otpInput;
}

export function deleteOtp(email) {
  otpStore.delete(email);
}
