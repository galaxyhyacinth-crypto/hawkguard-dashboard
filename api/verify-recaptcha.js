// api/verify-recaptcha.js
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ error: "Missing token" });

    const secret = process.env.RECAPTCHA_SECRET_KEY;
    if (!secret) return res.status(400).json({ error: "reCAPTCHA secret not configured" });

    const params = new URLSearchParams();
    params.append("secret", secret);
    params.append("response", token);

    const r = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      body: params
    });
    const j = await r.json();
    if (!j.success) return res.status(400).json({ ok: false, data: j });
    return res.json({ ok: true, data: j });
  } catch (err) {
    console.error("verify-recaptcha error", err);
    return res.status(500).json({ error: "Server error" });
  }
}
