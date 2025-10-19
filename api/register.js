// api/register.js
import bcrypt from "bcryptjs";
import { supabaseServer } from "./_supabase.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { full_name, email, password, recaptchaToken } = req.body;
    if (!full_name || !email || !password) return res.status(400).json({ error: "Missing fields" });

    // Optional reCAPTCHA verification (if configured)
    if (process.env.RECAPTCHA_SECRET_KEY) {
      try {
        const r = await fetch("https://www.google.com/recaptcha/api/siteverify", {
          method: "POST",
          body: new URLSearchParams({ secret: process.env.RECAPTCHA_SECRET_KEY, response: recaptchaToken })
        });
        const jr = await r.json();
        if (!jr.success) return res.status(400).json({ error: "reCAPTCHA failed" });
      } catch (e) {
        console.warn("reCAPTCHA request failed:", e);
        return res.status(400).json({ error: "reCAPTCHA verification failed" });
      }
    }

    // password complexity
    const pwdRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$])[A-Za-z\d!@#$]{8,16}$/;
    if (!pwdRegex.test(password)) return res.status(400).json({ error: "Password rules not met" });

    const hash = await bcrypt.hash(password, 10);

    const { error } = await supabaseServer.from("users").insert([{ full_name, email, password: hash }]);
    if (error) {
      // nicer message for duplicate email
      const msg = (error.message || "").toLowerCase();
      if (msg.includes("duplicate") || msg.includes("users_email_key")) {
        return res.status(400).json({ error: "User already registered" });
      }
      return res.status(400).json({ error: error.message || "Database error" });
    }

    return res.json({ ok: true, message: "Registered successfully" });
  } catch (err) {
    console.error("register error", err);
    return res.status(500).json({ error: "Server error" });
  }
}
