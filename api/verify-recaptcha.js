import fetch from "node-fetch";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const { token } = req.body;
  if (!token) return res.status(400).json({ error: "Missing token" });

  try {
    const secret = process.env.RECAPTCHA_SECRET_KEY;
    if (!secret) return res.status(400).json({ error: "reCAPTCHA secret not configured" });

    const resp = await fetch(`https://www.google.com/recaptcha/api/siteverify`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `secret=${encodeURIComponent(secret)}&response=${encodeURIComponent(token)}`
    });
    const data = await resp.json();
    if (!data.success) return res.status(400).json({ ok: false, data });

    return res.json({ ok: true, data });
  } catch (err) {
    console.error("reCAPTCHA verify error", err);
    return res.status(500).json({ error: "Failed to verify reCAPTCHA" });
  }
}
