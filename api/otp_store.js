// api/otp_store.js
import { supabase } from "./_supabase.js";

export async function saveOtp(email, otp, ttlMs) {
  const expires_at = new Date(Date.now() + ttlMs).toISOString();

  await supabase
    .from("otp_store")
    .upsert({ email, otp, expires_at }); // upsert = insert or update if exists
}

export async function verifyOtp(email, otp) {
  const { data, error } = await supabase
    .from("otp_store")
    .select("otp, expires_at")
    .eq("email", email)
    .single();

  if (error || !data) return false;

  const now = new Date();
  const expiry = new Date(data.expires_at);
  if (data.otp !== otp || now > expiry) return false;

  return true;
}

export async function deleteOtp(email) {
  await supabase.from("otp_store").delete().eq("email", email);
}
