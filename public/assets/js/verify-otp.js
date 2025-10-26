document.addEventListener("DOMContentLoaded", () => {
  const inputs = Array.from(document.querySelectorAll(".otp"));
  const btn = document.getElementById("verify-otp-btn");
  const msg = document.getElementById("otp-msg");

  // Auto-focus, numeric only
  inputs.forEach((input, idx) => {
    input.addEventListener("input", (e) => {
      e.target.value = e.target.value.replace(/\D/g, "");
      if (e.target.value && idx < inputs.length - 1) inputs[idx + 1].focus();
    });
    input.addEventListener("keydown", (e) => {
      if (e.key === "Backspace" && !e.target.value && idx > 0)
        inputs[idx - 1].focus();
    });
    input.addEventListener("paste", (e) => {
      e.preventDefault();
      const paste = (e.clipboardData || window.clipboardData).getData("text");
      const digits = paste.replace(/\D/g, "").slice(0, 6);
      for (let i = 0; i < 6; i++) inputs[i].value = digits[i] || "";
    });
  });

  btn.addEventListener("click", async () => {
    const otp = inputs.map((i) => i.value).join("");
    if (otp.length !== 6) {
      msg.textContent = "Enter 6 digits";
      msg.style.color = "red";
      return;
    }
    const email = sessionStorage.getItem("hawkguard_signin_email");
    if (!email) {
      alert("Please sign in again");
      window.location.href = "/sign-in.html";
      return;
    }

    try {
      const res = await fetch("/api/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });
      const j = await res.json();
      if (!res.ok || !j.ok) {
        msg.textContent = j.error || "Verification failed";
        msg.style.color = "red";
        return;
      }
      window.location.href = "/dashboard.html";
    } catch (err) {
      console.error(err);
      alert("Server error");
    }
  });
});
