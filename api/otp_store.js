// simple in-memory OTP store
const otpStore = {};

export function storeOtp(email, otp) {
  otpStore[email] = { otp, expires: Date.now() + 180000 }; // 3 min
}

export function verifyOtp(email, otp) {
  if (!otpStore[email]) return false;
  const record = otpStore[email];
  if (record.otp !== otp || Date.now() > record.expires) return false;
  return true;
}

export function deleteOtp(email) {
  delete otpStore[email];
}
