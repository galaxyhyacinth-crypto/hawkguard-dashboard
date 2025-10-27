const form = document.getElementById("verifyOtpForm");
const inputs = document.querySelectorAll(".otp-inputs input");

// Auto focus next input
inputs.forEach((input, i) => {
  input.addEventListener("input", () => {
    if (input.value.length === 1 && i < inputs.length - 1) {
      inputs[i + 1].focus();
    }
  });
});

// Get email from query param
const urlParams = new URLSearchParams(window.location.search);
const email = urlParams.get("email");

if (!email) {
  alert("Email not found. Please sign in again.");
  window.location.href = "/sign-in.html";
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const otp = Array.from(inputs).map((i) => i.value).join("");

  try {
    const res = await fetch("/api/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp }),
    });

    const data = await res.json();

    if (res.ok && data.success) {
      window.location.href = "/dashboard.html";
    } else {
      showAlert(data.error || "❌ Invalid or expired OTP");
    }
  } catch (err) {
    console.error("Fetch error:", err);
    showAlert("Server unreachable. Please try again.");
  }
});

function showAlert(message) {
  const old = document.querySelector(".alert-message");
  if (old) old.remove();

  const overlay = document.createElement("div");
  overlay.style.position = "fixed";
  overlay.style.top = "0";
  overlay.style.left = "0";
  overlay.style.width = "100%";
  overlay.style.height = "100%";
  overlay.style.background = "rgba(0,0,0,0.3)";
  overlay.style.zIndex = "9998";
  overlay.style.backdropFilter = "blur(1px)";
  document.body.appendChild(overlay);

  const alert = document.createElement("div");
  alert.className = "alert-message";
  alert.innerHTML = `
    <span>${message}</span>
    <br>
    <button id="alertOkBtn" style="
      margin-top:8px;
      padding:4px 12px;
      border:none;
      border-radius:4px;
      background:#00b4ff;
      color:white;
      font-weight:600;
      cursor:pointer;
    ">OK</button>
  `;

  document.body.appendChild(alert);

  document.getElementById("alertOkBtn").addEventListener("click", () => {
    alert.remove();
    overlay.remove();
  });
}
