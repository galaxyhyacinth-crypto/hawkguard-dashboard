import { supabase } from "./_supabase.js";

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  try {
    const { email, otp } = req.body;
    if (!email || !otp)
      return res.status(400).json({ error: "Missing fields" });

    const { data, error } = await supabase
      .from("otp_store")
      .select("*")
      .eq("email", email)
      .eq("otp", otp)
      .single();

    if (error || !data) return res.status(400).json({ error: "Invalid or expired OTP" });

    // Delete OTP after verification
    await supabase.from("otp_store").delete().eq("email", email);

    return res.json({ ok: true, message: "OTP verified" });
  } catch (err) {
    console.error("verify-otp error", err);
    return res.status(500).json({ error: "Server error" });
  }
}
