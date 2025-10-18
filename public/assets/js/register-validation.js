const passwordInput = document.getElementById("password");
const confirmPassword = document.getElementById("confirmPassword");
const registerBtn = document.getElementById("registerBtn");

const rules = {
  length: document.getElementById("length"),
  uppercase: document.getElementById("uppercase"),
  lowercase: document.getElementById("lowercase"),
  number: document.getElementById("number"),
  special: document.getElementById("special"),
};

// ✅ Password rule validation
passwordInput.addEventListener("input", () => {
  const val = passwordInput.value;

  const checks = {
    length: val.length >= 8 && val.length <= 16,
    uppercase: /[A-Z]/.test(val),
    lowercase: /[a-z]/.test(val),
    number: /\d/.test(val),
    special: /[!@#$%^&*()_\-+=]/.test(val),
  };

  let allValid = true;
  Object.entries(checks).forEach(([key, passed]) => {
    rules[key].style.color = passed ? "limegreen" : "red";
    if (!passed) allValid = false;
  });

  // Enable register button only when all are valid
  registerBtn.disabled = !allValid;
});

// ✅ Toggle password visibility (works for both password and confirm password)
function togglePassword(id, el) {
  const input = document.getElementById(id);
  if (input.type === "password") {
    input.type = "text";
    el.textContent = "🙈";
  } else {
    input.type = "password";
    el.textContent = "👁️";
  }
}
