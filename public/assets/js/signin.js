document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("signInForm");
  const passwordInput = document.getElementById("password");
  const toggleBtn = document.createElement("button");

  // 👁️ Toggle password same as register page
  toggleBtn.type = "button";
  toggleBtn.className = "eye";
  toggleBtn.innerHTML = '<i class="fa-solid fa-eye"></i>';
  toggleBtn.style.right = "12px";
  toggleBtn.style.top = "50%";
  toggleBtn.style.position = "absolute";
  toggleBtn.style.transform = "translateY(-50%)";
  toggleBtn.style.background = "none";
  toggleBtn.style.border = "none";
  toggleBtn.style.cursor = "pointer";
  passwordInput.parentElement.style.position = "relative";
  passwordInput.parentElement.appendChild(toggleBtn);

  toggleBtn.addEventListener("click", () => {
    const icon = toggleBtn.querySelector("i");
    if (passwordInput.type === "password") {
      passwordInput.type = "text";
      icon.classList.replace("fa-eye", "fa-eye-slash");
    } else {
      passwordInput.type = "password";
      icon.classList.replace("fa-eye-slash", "fa-eye");
    }
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value.trim();
    const password = passwordInput.value.trim();

    try {
      const res = await fetch("/api/sign-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (res.ok && data.ok) {
        // Save email to sessionStorage for OTP page
        sessionStorage.setItem("hawkguard_signin_email", email);
        window.location.href = "/verify-otp.html";
      } else {
        alert(data.error || "Sign in failed.");
      }
    } catch (err) {
      console.error(err);
      alert("Server error. Please try again later.");
    }
  });
});
