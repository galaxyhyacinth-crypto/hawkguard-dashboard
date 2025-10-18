import bcrypt from "bcryptjs";
import { supabaseServer } from "./_supabase.js";
import fetch from "node-fetch";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { full_name, email, password, recaptchaToken } = req.body;
    if (!full_name || !email || !password) return res.status(400).json({ error: "Missing fields" });

    // Optional reCAPTCHA verify server-side
    if (process.env.RECAPTCHA_SECRET_KEY) {
      const r = await fetch(`https://www.google.com/recaptcha/api/siteverify`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${encodeURIComponent(recaptchaToken || "")}`
      });
      const jr = await r.json();
      if (!jr.success) return res.status(400).json({ error: "reCAPTCHA failed" });
    }

    // server-side password validation
    const pwdRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$])[A-Za-z\d!@#$]{8,16}$/;
    if (!pwdRegex.test(password)) return res.status(400).json({ error: "Password rules not met" });

    const hash = await bcrypt.hash(password, 10);

    const { error } = await supabaseServer.from("users").insert([{ full_name, email, password: hash }]);
    if (error) {
      console.error("Supabase insert error:", error);
      return res.status(400).json({ error: error.message || "Database error" });
    }

    return res.json({ ok: true });
  } catch (err) {
    console.error("register error", err);
    return res.status(500).json({ error: "Server error" });
  }
}
