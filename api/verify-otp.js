// api/verify-otp.js
import { verifyOtp, deleteOtp } from "./otp_store.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ error: "Missing fields" });

    const ok = verifyOtp(email, String(otp));
    if (!ok) return res.status(400).json({ error: "Invalid or expired OTP" });

    // success — you can return a simple token or user info
    deleteOtp(email);
    return res.json({ ok: true, message: "OTP verified" });
  } catch (err) {
    console.error("verify-otp error", err);
    return res.status(500).json({ error: "Server error" });
  }
}
