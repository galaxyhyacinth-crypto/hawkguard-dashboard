document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("registerForm");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const full_name = document.getElementById("full_name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const retype = document.getElementById("retype_password").value.trim();

    if (password !== retype) return showAlert("Passwords do not match", "error");

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ full_name, email, password })
      });

      const data = await res.json();

      if (res.ok && data.ok) {
        showAlert("✅ Registered successfully! Redirecting...", "success");
        setTimeout(() => (window.location.href = "/sign-in.html"), 2000);
      } else if (data.error?.includes("already")) {
        showAlert("⚠️ User already registered.", "error");
      } else {
        showAlert(data.error || "❌ Registration failed.", "error");
      }
    } catch (err) {
      console.error(err);
      showAlert("Server error. Please try again later.", "error");
    }
  });
});

function showAlert(message, type = "error") {
  const old = document.querySelector(".alert-message");
  if (old) old.remove();

  const alert = document.createElement("div");
  alert.className = "alert-message";
  alert.style.backgroundColor = type === "success" ? "#22c55e" : "#ef4444";
  alert.textContent = message;

  document.querySelector(".auth-card").appendChild(alert);
  setTimeout(() => alert.remove(), 4000);
}
