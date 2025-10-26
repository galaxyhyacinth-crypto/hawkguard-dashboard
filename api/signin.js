// api/sign-in.js
import bcrypt from "bcryptjs";
import { supabase } from "./supabase.js";
import { sendOtpAndStore } from "./send-otp.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: "Missing fields" });

  const { data: users, error } = await supabase.from("users").select("*").eq("email", email).limit(1);
  if (error) return res.status(500).json({ error: error.message });
  if (!users || users.length === 0) return res.status(401).json({ error: "Invalid credentials" });

  const user = users[0];
  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(401).json({ error: "Invalid credentials" });

  try {
    await sendOtpAndStore(email);
  } catch (err) {
    console.error("Send OTP failed:", err);
    return res.status(500).json({ error: "Failed to send OTP email" });
  }

  res.json({ ok: true, message: "OTP sent" });
}
