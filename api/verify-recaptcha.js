export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  try {
    const { token } = req.body;
    const secret = process.env.RECAPTCHA_SECRET_KEY;
    if (!token || !secret)
      return res.status(400).json({ error: "Missing token or secret" });

    const params = new URLSearchParams();
    params.append("secret", secret);
    params.append("response", token);

    const response = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      body: params,
    });

    const result = await response.json();
    if (!result.success) return res.status(400).json({ error: "Invalid reCAPTCHA" });

    res.json({ ok: true });
  } catch (err) {
    console.error("verify-recaptcha error", err.message);
    res.status(500).json({ error: "Server error" });
  }
}
