// Temporary in-memory OTP storage
// (You can replace this later with Supabase or Redis if needed)
const otpStore = new Map();

export function saveOTP(email, otp) {
  otpStore.set(email, { otp, timestamp: Date.now() });
}

export function verifyOTP(email, otp) {
  const record = otpStore.get(email);
  if (!record) return false;
  const expired = Date.now() - record.timestamp > 3 * 60 * 1000; // 3 minutes
  if (expired) {
    otpStore.delete(email);
    return false;
  }
  const match = record.otp === otp;
  if (match) otpStore.delete(email);
  return match;
}
