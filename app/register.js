document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("registerForm");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const full_name = document.getElementById("full_name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const retypePassword = document.getElementById("retype_password").value.trim();

    if (password !== retypePassword) {
      showAlert("Passwords do not match.", "error");
      return;
    }

    // reCAPTCHA (if added)
    let recaptchaToken = "";
    if (typeof grecaptcha !== "undefined") {
      recaptchaToken = await grecaptcha.execute(RECAPTCHA_SITE_KEY, { action: "register" });
    }

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ full_name, email, password, recaptchaToken }),
      });

      const data = await res.json();

      if (res.ok && data.ok) {
        showAlert("Registered successfully! Please sign in.", "success");
        setTimeout(() => (window.location.href = "/signin.html"), 2000);
      } else {
        showAlert(data.error || "Registration failed.", "error");
      }
    } catch (err) {
      console.error(err);
      showAlert("Server error. Please try again later.", "error");
    }
  });
});

/* -------------------- Helper: showAlert -------------------- */
function showAlert(message, type = "error") {
  // Remove any existing alert
  const old = document.querySelector(".alert-message");
  if (old) old.remove();

  const alertBox = document.createElement("div");
  alertBox.className = `alert-message ${type === "success" ? "bg-green-500" : "bg-red-500"} text-white px-4 py-2 rounded-lg text-center mt-4`;
  alertBox.textContent = message;

  const container = document.querySelector(".register-container") || document.body;
  container.prepend(alertBox);

  setTimeout(() => alertBox.remove(), 4000);
}
