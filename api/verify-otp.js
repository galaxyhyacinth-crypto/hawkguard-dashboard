import { supabase } from "./supabase.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { email, otp } = req.body;
  if (!email || !otp) return res.status(400).json({ error: "Email & OTP required" });

  try {
    const { data: record, error } = await supabase
      .from("otp_store")
      .select("*")
      .eq("email", email)
      .single();

    if (error || !record) return res.status(400).json({ error: "OTP not found" });

    if (record.otp !== otp) return res.status(401).json({ error: "Wrong OTP" });

    if (new Date(record.expires_at) < new Date())
      return res.status(400).json({ error: "OTP expired" });

    // Delete OTP after successful verification
    await supabase.from("otp_store").delete().eq("email", email);

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("Server error:", err);
    return res.status(500).json({ error: "Server error" });
  }
}
