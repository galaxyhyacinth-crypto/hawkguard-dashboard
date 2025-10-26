document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("reset-password-form");
  const msg = document.getElementById("reset-msg");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const newPassword = document.getElementById("new-password").value.trim();
    const confirmPassword = document.getElementById("confirm-password").value.trim();
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (newPassword !== confirmPassword) {
      msg.style.color = "red";
      msg.textContent = "Passwords do not match";
      return;
    }

    try {
      const res = await fetch("/api/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        msg.style.color = "green";
        msg.textContent = "Password reset successfully!";
        setTimeout(() => window.location.href = "/sign-in.html", 2000);
      } else {
        msg.style.color = "red";
        msg.textContent = data.error || "Failed to reset password.";
      }
    } catch (err) {
      console.error(err);
      msg.style.color = "red";
      msg.textContent = "Server error. Try again later.";
    }
  });
});
