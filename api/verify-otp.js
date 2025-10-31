import { supabase } from "./supabase.js";

// backend endpoint untuk verify OTP
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { email, otp } = req.body;

    if (!email || !otp || otp.length !== 6) {
      return res.status(400).json({ error: "Invalid email or OTP format" });
    }

    // semak OTP + email dalam table otp_store
    const { data, error } = await supabase
      .from("otp_store")
      .select("*")
      .eq("email", email)
      .eq("otp", otp)
      .single();

    if (error || !data) {
      return res.status(400).json({ error: "Invalid or expired OTP" });
    }

    // semak masa tamat OTP
    const now = new Date();
    const expiry = new Date(data.expires_at);
    if (now > expiry) {
      return res.status(400).json({ error: "OTP expired" });
    }

    // optional: delete OTP selepas berjaya
    await supabase.from("otp_store").delete().eq("email", email);

    return res.status(200).json({ message: "OTP verified successfully" });
  } catch (err) {
    console.error("❌ Verify OTP error:", err);
    return res.status(500).json({ error: "Server error" });
  }
}
