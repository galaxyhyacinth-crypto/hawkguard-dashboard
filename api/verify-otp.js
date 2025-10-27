import { supabaseServer } from "../lib/supabaseServer.js";

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  const { email, otp } = req.body;
  if (!email || !otp) return res.status(400).json({ error: "Invalid data" });

  try {
    const { data, error } = await supabaseServer
      .from("otp_store")
      .select("*")
      .eq("email", email)
      .eq("otp", otp)
      .single();

    if (error || !data) return res.status(400).json({ error: "Invalid or expired OTP" });

    const now = new Date();
    const expiry = new Date(data.expires_at);
    if (now > expiry) return res.status(400).json({ error: "OTP expired" });

    await supabaseServer.from("otp_store").delete().eq("email", email);

    res.status(200).json({ message: "OTP verified successfully" });
  } catch (err) {
    console.error("❌ Verify OTP error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
}
