// api/verify-otp.js
import { verifyOtp, deleteOtp } from "./otp-store.js";

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ error: "Missing fields" });

    const valid = verifyOtp(email, otp);
    if (!valid) return res.status(400).json({ error: "Invalid or expired OTP" });

    deleteOtp(email);
    res.json({ ok: true });
  } catch (err) {
    console.error("verify-otp error", err);
    res.status(500).json({ error: "Server error" });
  }
}
