// backend/server.js
import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public"));

const PORT = process.env.PORT || 5000;

// --- Supabase ---
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("❌ Missing Supabase credentials in .env");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// --- fetch polyfill (for reCAPTCHA if needed) ---
const fetchFunc = globalThis.fetch ? globalThis.fetch.bind(globalThis) : null;

// --- Nodemailer setup (✅ fixed secure Gmail connection) ---
const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

// In-memory OTP store
const otpStore = {};

function generateNumericOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function verifyRecaptcha(token) {
  const secret = process.env.RECAPTCHA_SECRET_KEY;
  if (!secret) return { success: true };
  if (!fetchFunc) {
    console.warn("fetch not available for reCAPTCHA verification.");
    return { success: false };
  }
  try {
    const params = new URLSearchParams();
    params.append("secret", secret);
    params.append("response", token);
    const resp = await fetchFunc(
      "https://www.google.com/recaptcha/api/siteverify",
      {
        method: "POST",
        body: params,
      }
    );
    const json = await resp.json();
    return json;
  } catch (err) {
    console.error("reCAPTCHA verify error", err);
    return { success: false };
  }
}

/* -------------------- API Endpoints -------------------- */

// REGISTER
app.post("/api/register", async (req, res) => {
  try {
    const { full_name, email, password, recaptchaToken } = req.body;
    if (!full_name || !email || !password)
      return res.status(400).json({ error: "Missing fields" });

    const rc = await verifyRecaptcha(recaptchaToken);
    if (!rc.success)
      return res.status(400).json({ error: "reCAPTCHA verification failed" });

    const pwdRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$])[A-Za-z\d!@#$]{8,16}$/;
    if (!pwdRegex.test(password))
      return res
        .status(400)
        .json({ error: "Password does not meet complexity rules" });

    const hash = await bcrypt.hash(password, 10);

    const { error } = await supabase
      .from("users")
      .insert([{ full_name, email, password: hash }]);

    // ✅ Custom error handling for duplicate email
    if (error) {
      if (
        error.message.includes("duplicate key value") ||
        error.message.includes("users_email_key")
      ) {
        return res.status(400).json({ error: "User already registered" });
      }
      return res.status(400).json({ error: error.message });
    }

    return res.json({ ok: true, message: "Registered successfully" });
  } catch (err) {
    console.error("Register error", err);
    return res.status(500).json({ error: "Server error" });
  }
});

// SIGNIN -> send OTP
app.post("/api/signin", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: "Missing fields" });

    const { data: users, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .limit(1);

    if (error) return res.status(500).json({ error: error.message });
    if (!users || users.length === 0)
      return res.status(401).json({ error: "Invalid credentials" });

    const user = users[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: "Invalid credentials" });

    const otp = generateNumericOtp();
    const expirySeconds = Number(process.env.OTP_EXPIRY_SECONDS || 180);
    const expiry = Date.now() + expirySeconds * 1000;

    otpStore[email] = {
      otp,
      expires: expiry,
      userId: user.id,
      full_name: user.full_name,
    };

    const mailOptions = {
      from: `"HAWKGUARD SURVEILLANCE SYSTEM" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "HAWKGUARD — Your 6-digit OTP",
      text: `Your HAWKGUARD verification code is: ${otp}. It expires in ${expirySeconds} seconds.`,
      html: `<p>Your HAWKGUARD verification code is: <strong>${otp}</strong></p><p>It expires in ${expirySeconds} seconds.</p>`,
    };

    // ✅ safer sendMail (with try-catch to prevent "Unexpected socket close" crash)
    try {
      await transporter.sendMail(mailOptions);
    } catch (mailErr) {
      console.error("Email send error:", mailErr);
      return res.status(500).json({ error: "Failed to send OTP email" });
    }

    return res.json({
      ok: true,
      message: "OTP sent",
      expires_in: expirySeconds,
    });
  } catch (err) {
    console.error("Signin error", err);
    return res.status(500).json({ error: "Server error" });
  }
});

// VERIFY OTP
app.post("/api/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp)
      return res.status(400).json({ error: "Missing fields" });

    const record = otpStore[email];
    if (!record) return res.status(400).json({ error: "No OTP found" });
    if (Date.now() > record.expires) {
      delete otpStore[email];
      return res.status(400).json({ error: "OTP expired" });
    }
    if (record.otp !== String(otp))
      return res.status(400).json({ error: "Invalid OTP" });

    const token = Buffer.from(`${record.userId}:${Date.now()}`).toString("base64");
    const full_name = record.full_name || "";
    delete otpStore[email];
    return res.json({ ok: true, token, full_name });
  } catch (err) {
    console.error("verify-otp error", err);
    return res.status(500).json({ error: "Server error" });
  }
});

// SUMMARY
app.get("/api/summary", async (req, res) => {
  try {
    const { count: registeredCount } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true });
    let unregisteredCount = 0;
    try {
      const r = await supabase
        .from("UNREGISTERED LOGS")
        .select("*", { count: "exact", head: true });
      unregisteredCount = r.count || 0;
    } catch (_) {
      const r2 = await supabase
        .from("unregistered_logs")
        .select("*", { count: "exact", head: true });
      unregisteredCount = r2.count || 0;
    }
    return res.json({
      registered: registeredCount || 0,
      unregistered: unregisteredCount || 0,
    });
  } catch (err) {
    console.error("summary error", err);
    return res.status(500).json({ error: "Server error" });
  }
});

// ENTRIES
app.get("/api/entries", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("ENTRIES")
      .select("*")
      .order("Entry_Date", { ascending: false })
      .limit(200);
    if (error) return res.status(500).json({ error: error.message });
    return res.json({ data: data || [] });
  } catch (err) {
    console.error("entries error", err);
    return res.status(500).json({ error: "Server error" });
  }
});

app.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT}`)
);
