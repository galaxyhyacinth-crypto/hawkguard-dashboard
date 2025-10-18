import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendOTPEmail = async (to, otp) => {
  await transporter.sendMail({
    from: `"HawkGuard" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Your OTP Code",
    html: `
      <div style="font-family:sans-serif">
        <h2>Sign In Verification</h2>
        <p>Your OTP code is:</p>
        <h1 style="letter-spacing:3px;">${otp}</h1>
        <p>This code will expire in 2 minutes.</p>
      </div>
    `,
  });
};
