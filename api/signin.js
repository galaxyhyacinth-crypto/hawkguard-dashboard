import { supabaseServer } from "../lib/supabaseServer.js";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }

    console.log("🔹 Signin attempt:", email);

    // ✅ Fetch user
    const { data: users, error: fetchError } = await supabaseServer
      .from("users")
      .select("*")
      .eq("email", email)
      .limit(1);

    if (fetchError) {
      console.error("❌ Supabase fetch error:", fetchError.message);
      return res.status(500).json({ error: "Database fetch failed" });
    }

    if (!users || users.length === 0) {
      console.log("❌ User not found");
      return res.status(404).json({ error: "User not found" });
    }

    const user = users[0];

    // ✅ Verify password
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      console.log("❌ Wrong password");
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // ✅ Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

    // ✅ Store OTP in Supabase
    const { error: otpError } = await supabaseServer
      .from("otp_store")
      .upsert([{ email, otp, expires_at: expiresAt }], { onConflict: "email" });

    if (otpError) {
      console.error("❌ OTP store error:", otpError.message);
      return res.status(500).json({ error: "Failed to save OTP" });
    }

    // ✅ Send OTP to Gmail
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.SMTP_USER, // your Gmail address
        pass: process.env.SMTP_PASS, // App Password
      },
    });

    await transporter.sendMail({
      from: `"HawkGuard" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Your HawkGuard OTP Code",
      text: `Your OTP code is: ${otp}. It expires in 5 minutes.`,
    });

    console.log(`✅ OTP sent to email ${email}: ${otp}`);

    // ✅ Return success
    return res.status(200).json({ otpRequired: true, message: "OTP sent" });
  } catch (err) {
    console.error("💥 Server error:", err);
    return res.status(500).json({ error: "Server error", details: err.message });
  }
}
