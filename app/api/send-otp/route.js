import { sendOTPEmail } from "../../../lib/nodemailer";

let otpStore = {};

export async function POST(req) {
  try {
    const { email } = await req.json();
    if (!email) return Response.json({ error: "Missing email" }, { status: 400 });

    const otp = Math.floor(100000 + Math.random() * 900000); // 6-digit OTP
    otpStore[email] = { otp, expires: Date.now() + 2 * 60 * 1000 };

    await sendOTPEmail(email, otp);

    return Response.json({ success: true, message: "OTP sent to email" });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Failed to send OTP" }, { status: 500 });
  }
}

export async function GET() {
  return Response.json({ message: "Use POST request only" });
}

export function verifyOTP(email, inputOtp) {
  const record = otpStore[email];
  if (!record) return false;
  if (Date.now() > record.expires) return false;
  return record.otp.toString() === inputOtp.toString();
}
