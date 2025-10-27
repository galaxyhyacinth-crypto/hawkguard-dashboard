const form = document.getElementById("registerForm");

if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const full_name = document.getElementById("full_name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const retype = document.getElementById("retype_password").value.trim();

    if (password !== retype)
      return showAlert("⚠️ Passwords do not match.", "error");

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ full_name, email, password }),
      });

      let data = {};
      try {
        data = await res.json();
      } catch {
        data = { error: "Server returned invalid response." };
      }

      if (res.ok && data.ok) {
        showAlert("✅ Registered successfully!", "success", () => {
          window.location.href = "/sign-in.html";
        });
      } else if (data.error?.includes("already")) {
        showAlert("⚠️ User already registered.", "error");
      } else {
        showAlert(data.error || "❌ Registration failed.", "error");
      }
    } catch (err) {
      console.error("❌ Fetch error:", err);
      showAlert("Server error. Please try again later.", "error");
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
