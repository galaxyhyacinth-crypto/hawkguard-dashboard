// api/otp_store.js
const otpMap = new Map();

/**
 * Save OTP for email with expiry (ms)
 */
export function saveOtp(email, otp, ttlMs = 180000) {
  const expiresAt = Date.now() + ttlMs;
  otpMap.set(email, { otp, expiresAt });
  // cleanup after expiry
  setTimeout(() => otpMap.delete(email), ttlMs + 5000);
}

/**
 * Verify OTP
 */
export function verifyOtp(email, otpInput) {
  const rec = otpMap.get(email);
  if (!rec) return false;
  if (Date.now() > rec.expiresAt) {
    otpMap.delete(email);
    return false;
  }
  const ok = String(rec.otp) === String(otpInput);
  if (ok) otpMap.delete(email);
  return ok;
}

/**
 * Delete OTP (explicit)
 */
export function deleteOtp(email) {
  otpMap.delete(email);
}
