import { verifyOTP } from "../send-otp/route";

export async function POST(req) {
  try {
    const { email, otp } = await req.json();
    if (!email || !otp)
      return Response.json({ error: "Missing fields" }, { status: 400 });

    const valid = verifyOTP(email, otp);
    if (!valid)
      return Response.json({ error: "Invalid or expired OTP" }, { status: 400 });

    return Response.json({ success: true, message: "OTP verified" });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}
