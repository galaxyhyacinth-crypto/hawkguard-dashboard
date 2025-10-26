document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("signInForm");

  // 👁️ Toggle password same as register page
  window.togglePassword = (id, btn) => {
    const input = document.getElementById(id);
    const icon = btn.querySelector("i");
    if (input.type === "password") {
      input.type = "text";
      icon.classList.replace("fa-eye", "fa-eye-slash");
    } else {
      input.type = "password";
      icon.classList.replace("fa-eye-slash", "fa-eye");
    }
  };

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    try {
      const res = await fetch("/api/sign-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (res.ok && data.ok) {
        // ✅ simpan email utk OTP
        sessionStorage.setItem("hawkguard_signin_email", email);
        // ✅ redirect ke verify OTP page
        window.location.href = "/verify-otp.html";
      } else {
        alert(data.error || "Sign in failed");
      }
    } catch (err) {
      console.error(err);
      alert("Server error. Please try again later.");
    }
  });
});
