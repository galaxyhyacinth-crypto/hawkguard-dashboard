"use client";
import { useState } from "react";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [sent, setSent] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const sendOtp = async () => {
    if (!email) return setMessage("Please enter your email.");
    setLoading(true);
    const res = await fetch("/api/send-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    setLoading(false);
    if (data.success) {
      setSent(true);
      setMessage("OTP sent to your email!");
    } else setMessage(data.error || "Failed to send OTP");
  };

  const verifyOtp = async () => {
    if (!email || !otp) return setMessage("Missing fields");
    const res = await fetch("/api/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp }),
    });
    const data = await res.json();
    if (data.success) {
      setMessage("✅ Verified! Redirecting...");
      setTimeout(() => (window.location.href = "/dashboard"), 1000);
    } else setMessage("❌ Invalid or expired OTP");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
      <div className="bg-gray-800 p-8 rounded-2xl w-96">
        <h2 className="text-2xl font-bold mb-4 text-center">Sign In</h2>

        <input
          type="email"
          placeholder="Email"
          className="w-full p-2 mb-3 bg-gray-700 rounded-lg"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        {sent && (
          <input
            type="text"
            placeholder="Enter OTP"
            className="w-full p-2 mb-3 bg-gray-700 rounded-lg"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />
        )}

        <button
          onClick={sent ? verifyOtp : sendOtp}
          disabled={loading}
          className="w-full py-2 bg-blue-600 hover:bg-blue-700 rounded-lg"
        >
          {loading ? "Processing..." : sent ? "Verify OTP" : "Send OTP"}
        </button>

        {sent && (
          <button
            onClick={sendOtp}
            className="w-full mt-2 text-sm text-blue-400 underline"
          >
            Resend code
          </button>
        )}

        <p className="mt-3 text-center text-sm">{message}</p>
      </div>
    </div>
  );
}
