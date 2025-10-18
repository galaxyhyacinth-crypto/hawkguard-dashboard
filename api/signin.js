import bcrypt from "bcryptjs";
import { supabaseServer } from "./_supabase.js";
import { sendOtpAndStore } from "./send-otp.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Missing fields" });

    const { data: users, error } = await supabaseServer.from("users").select("*").eq("email", email).limit(1);
    if (error) return res.status(500).json({ error: error.message });
    if (!users || users.length === 0) return res.status(401).json({ error: "Invalid credentials" });

    const user = users[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: "Invalid credentials" });

    // Send OTP
    await sendOtpAndStore(email, user.id, user.full_name);

    return res.json({ ok: true, message: "OTP sent" });
  } catch (err) {
    console.error("signin error", err);
    return res.status(500).json({ error: "Server error" });
  }
}
