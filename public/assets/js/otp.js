// ✅ otp.js — Final version (auto focus + redirect + timer)
document.addEventListener("DOMContentLoaded", () => {
  const inputs = Array.from(document.querySelectorAll(".otp-input"));
  const verifyBtn = document.querySelector(".otp-submit");
  const errorMsg = document.querySelector(".otp-error");
  const countdownEl = document.getElementById("countdown");

  // 🧠 Auto move ke next box (taip 1 digit)
  inputs.forEach((input, index) => {
    input.addEventListener("input", (e) => {
      const value = e.target.value.replace(/\D/g, ""); // hanya digit
      e.target.value = value;

      // delay sikit untuk elak event conflict
      if (value && index < inputs.length - 1) {
        setTimeout(() => inputs[index + 1].focus(), 50);
      }
    });

    // Backspace ke box sebelum
    input.addEventListener("keydown", (e) => {
      if (e.key === "Backspace" && !input.value && index > 0) {
        inputs[index - 1].focus();
      }
    });

    // Paste terus 6 digit
    input.addEventListener("paste", (e) => {
      e.preventDefault();
      const paste = (e.clipboardData || window.clipboardData).getData("text");
      const digits = paste.replace(/\D/g, "").slice(0, 6);
      if (digits.length === 6) {
        inputs.forEach((el, i) => (el.value = digits[i]));
        inputs[5].focus();
      }
    });
  });

  // 🕒 Countdown (3 minit)
  let remaining = 180;
  function updateCountdown() {
    const mm = String(Math.floor(remaining / 60)).padStart(2, "0");
    const ss = String(remaining % 60).padStart(2, "0");
    countdownEl.textContent = `${mm}:${ss}`;
    if (remaining <= 0) {
      clearInterval(timer);
      errorMsg.textContent = "❌ OTP expired. Please sign in again.";
      errorMsg.style.display = "block";
      verifyBtn.disabled = true;
    }
    remaining--;
  }
  const timer = setInterval(updateCountdown, 1000);
  updateCountdown();

  // 📨 Verify OTP
  verifyBtn.addEventListener("click", async () => {
    const otp = inputs.map((i) => i.value).join("");
    const email = sessionStorage.getItem("hawkguard_signin_email");

    if (!email) {
      alert("Missing email. Please sign in again.");
      window.location.href = "/signin";
      return;
    }

    if (otp.length !== 6) {
      errorMsg.textContent = "⚠️ Please enter all 6 digits";
      errorMsg.style.display = "block";
      return;
    }

    try {
      const res = await fetch("/api/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      const data = await res.json();

      if (res.ok) {
        // ✅ OTP sah → simpan status & redirect
        localStorage.setItem("hawkguard_verified", "true");
        errorMsg.style.display = "none";
        window.location.href = "/dashboard.html";
      } else {
        errorMsg.textContent = data.error || "❌ Invalid or expired OTP";
        errorMsg.style.display = "block";
      }
    } catch (err) {
      console.error("❌ Error verifying OTP:", err);
      errorMsg.textContent = "⚠️ Server error, please try again.";
      errorMsg.style.display = "block";
    }
  });
});
