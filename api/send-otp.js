import { supabase } from "./supabase.js";

export async function sendOtpAndStore(email) {
  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expires_at = new Date(Date.now() + 3*60*1000).toISOString(); // 3 minutes expiry

  // Store OTP in Supabase table "otp_store"
  const { error } = await supabase.from("otp_store").upsert(
    [{ email, otp, expires_at }],
    { onConflict: ["email"] }
  );

  if (error) throw error;

  console.log(`DEBUG OTP for ${email}: ${otp}`);
  return otp; // For testing only
}
