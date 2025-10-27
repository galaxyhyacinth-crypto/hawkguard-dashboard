// ✅ signin.js — HawkGuard Sign In
document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector(".auth-card form");
  const emailInput = document.querySelector("#email");
  const passwordInput = document.querySelector("#password");
  const errorMsg = document.querySelector(".auth-error");
  const signinBtn = document.querySelector(".auth-btn");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    if (!email || !password) {
      errorMsg.textContent = "⚠️ Please enter both email and password";
      errorMsg.style.display = "block";
      return;
    }

    signinBtn.disabled = true;
    signinBtn.textContent = "Signing in...";

    try {
      const res = await fetch("/api/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        // ✅ Simpan email untuk OTP page
        sessionStorage.setItem("hawkguard_signin_email", email);

        // Redirect ke OTP verify page
        window.location.href = "/verify-otp.html";
      } else {
        errorMsg.textContent = data.error || "❌ Invalid credentials";
        errorMsg.style.display = "block";
      }
    } catch (err) {
      console.error("❌ Sign In error:", err);
      errorMsg.textContent = "⚠️ Server error, please try again.";
      errorMsg.style.display = "block";
    } finally {
      signinBtn.disabled = false;
      signinBtn.textContent = "Sign In";
    }
  });
});
