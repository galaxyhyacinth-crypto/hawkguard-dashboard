import { supabaseServer } from "../lib/supabaseServer.js";

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { email } = req.body;

  try {
    // Check if user exists
    const { data: user, error: userError } = await supabaseServer
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (userError) return res.status(404).json({ error: 'User not found' });

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000); // 6 digits

    // Store OTP in otp_store table
    const { error: otpError } = await supabaseServer
      .from('otp_store')
      .upsert({ email, otp, created_at: new Date().toISOString() });

    if (otpError) throw otpError;

    // TODO: Send OTP via email (e.g., nodemailer)

    res.status(200).json({ message: 'OTP sent successfully', otp }); // for dev, remove otp in prod
  } catch (err) {
    console.error('❌ Forgot password error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
}
