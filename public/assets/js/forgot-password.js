document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("forgot-password-form");
  const msg = document.getElementById("fp-msg");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("fp-email").value.trim();

    try {
      const res = await fetch("/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (res.ok) {
        msg.style.color = "green";
        msg.textContent = "Password reset link sent! Check your email.";
      } else {
        msg.style.color = "red";
        msg.textContent = data.error || "Failed to send reset link.";
      }
    } catch (err) {
      console.error(err);
      msg.style.color = "red";
      msg.textContent = "Server error. Try again later.";
    }
  });
});
