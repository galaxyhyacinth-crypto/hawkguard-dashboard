import bcrypt from "bcryptjs";
import { supabase } from "./_supabase.js";
import { sendOtpAndStore } from "./send-otp.js";

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: "Missing fields" });

    // Fetch user from Supabase
    const { data: users, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .limit(1);

    if (error) return res.status(500).json({ error: error.message });
    if (!users || users.length === 0)
      return res.status(401).json({ error: "Invalid credentials" });

    const user = users[0];

    // Check password
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: "Invalid credentials" });

    // Send OTP
    try {
      const otp = await sendOtpAndStore(email);
      // store email in sessionStorage frontend
      return res.json({ ok: true, message: "OTP sent", email });
    } catch (otpErr) {
      console.error("OTP error:", otpErr);
      return res.status(500).json({ error: "Failed to send OTP" });
    }
  } catch (err) {
    console.error("Sign-in error:", err);
    return res.status(500).json({ error: "Server error" });
  }
}
