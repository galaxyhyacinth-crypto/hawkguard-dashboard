const form = document.getElementById("signinForm");

if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    try {
      const res = await fetch("/api/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      let data = {};
      try {
        data = await res.json();
      } catch {
        data = { error: "Server returned invalid response." };
      }

      if (res.ok && data.otpRequired) {
        // ✅ Redirect terus ke OTP page
        window.location.href = `/verify-otp.html?email=${encodeURIComponent(email)}`;
      } else {
        showAlert(data.error || "❌ Sign In failed.", "error");
      }
    } catch (err) {
      console.error("❌ Fetch error:", err);
      showAlert("Server unreachable. Please try again.", "error");
    }
  });
}

function showAlert(message, type = "error", callback = null) {
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

  alert.setAttribute(
    "style",
    "background-color:#fff;color:#000;border:1px solid #ddd;font-weight:600;box-shadow:0 4px 10px rgba(0,0,0,0.1);white-space:nowrap;padding:15px 25px;border-radius:8px;position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);z-index:9999;text-align:center;"
  );

  document.body.appendChild(alert);

  document.getElementById("alertOkBtn").addEventListener("click", () => {
    alert.remove();
    overlay.remove();
    if (callback) callback();
  });
}
