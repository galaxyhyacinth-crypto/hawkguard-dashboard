import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import bcrypt from 'bcryptjs';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { action, email, token, newPassword } = req.body;

  try {
    if (action === 'forgot') {
      // 1️⃣ check user exists
      const { data: user, error: userErr } = await supabase
        .from('users')
        .select('email')
        .eq('email', email)
        .single();

      if (userErr || !user) return res.status(400).json({ error: 'Email not found' });

      // 2️⃣ generate reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 3600 * 1000); // 1 hour

      const { error: tokenErr } = await supabase
        .from('reset_tokens')
        .insert([{ email, token: resetToken, expires_at: expiresAt }]);
      if (tokenErr) throw tokenErr;

      // 3️⃣ send email via SMTP
      const resetLink = `${process.env.BASE_URL}/reset-password.html?token=${resetToken}`;
      console.log('🔹 Reset link:', resetLink); // log for debug

      const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
      });

      const mailOptions = {
        from: `"HawkGuard" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'HawkGuard Password Reset',
        html: `<p>Click the link below to reset your password:</p>
               <a href="${resetLink}">${resetLink}</a>
               <p>Link expires in 1 hour.</p>`
      };

      // send mail with try/catch to log any errors
      try {
        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Email sent:', info.messageId);
      } catch (err) {
        console.error('❌ Error sending email:', err);
        return res.status(500).json({ error: 'Failed to send email. Check SMTP settings.' });
      }

      return res.json({ message: 'Reset link sent to your email' });
    }

    if (action === 'reset') {
      // 1️⃣ check token exists & not expired
      const { data: tokenRow, error: tokenErr } = await supabase
        .from('reset_tokens')
        .select('*')
        .eq('token', token)
        .single();

      if (tokenErr || !tokenRow) return res.status(400).json({ error: 'Invalid token' });
      if (new Date(tokenRow.expires_at) < new Date()) return res.status(400).json({ error: 'Token expired' });

      // 2️⃣ update user password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      const { error: updateErr } = await supabase
        .from('users')
        .update({ password: hashedPassword })
        .eq('email', tokenRow.email);
      if (updateErr) throw updateErr;

      // 3️⃣ delete token
      await supabase.from('reset_tokens').delete().eq('token', token);

      return res.json({ message: 'Password reset successful' });
    }

    res.status(400).json({ error: 'Invalid action' });
  } catch (err) {
    console.error('💥 Password API error:', err);
    res.status(500).json({ error: err.message || 'Server error' });
  }
}
