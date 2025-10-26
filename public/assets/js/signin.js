document.addEventListener("DOMContentLoaded", () => {
  const togglePassword = document.getElementById("togglePassword");
  const passwordInput = document.getElementById("password");
  const form = document.getElementById("signInForm");

  togglePassword.addEventListener("click", () => {
    if (passwordInput.type === "password") {
      passwordInput.type = "text";
    } else {
      passwordInput.type = "password";
    }
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value.trim();
    const password = passwordInput.value;

    try {
      const res = await fetch("/api/sign-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (res.ok && data.ok) {
        alert("Signed in successfully!");
        window.location.href = "/dashboard.html";
      } else {
        alert(data.error || "Sign in failed.");
      }
    } catch (err) {
      console.error(err);
      alert("Server error. Please try again later.");
    }
  });

  // Forgot password
  document.getElementById("forgotPasswordLink").addEventListener("click", () => {
    const email = prompt("Enter your email to reset password:");
    if (!email) return;
    fetch("/api/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email })
    }).then(res => res.json())
      .then(data => alert(data.message || "Check your email for reset link."))
      .catch(err => alert("Server error."));
  });
});
