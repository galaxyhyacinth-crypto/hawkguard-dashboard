import { supabase } from "./supabase.js";
import bcrypt from "bcryptjs";

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }

    // ✅ Fetch user
    const { data: users, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .limit(1);

    if (error) {
      console.error("Supabase fetch error:", error.message);
      return res.status(500).json({ error: "Database fetch failed" });
    }

    if (!users || users.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const user = users[0];

    // ✅ Verify password
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // ✅ Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

    // ✅ Store OTP
    const { error: otpError } = await supabase
      .from("otp_store")
      .upsert([{ email, otp, expires_at: expiresAt }], { onConflict: "email" });

    if (otpError) {
      console.error("OTP store error:", otpError.message);
      return res.status(500).json({ error: "Failed to save OTP" });
    }

    // ✅ Return success JSON (no email sending yet)
   return res.status(200).json({ otpRequired: true, message: "OTP sent" });

  } catch (err) {
    console.error("Server error:", err);
    return res.status(500).json({ error: "Server error", details: err.message });
  }
}
