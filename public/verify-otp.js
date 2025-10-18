<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Verify OTP - HawkGuard</title>
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <link rel="stylesheet" href="assets/css/style.css" />
</head>
<body class="auth-page">
  <div class="card">
    <h2>Enter OTP</h2>
    <p>Please check your email for the 6-digit OTP.</p>
    <form id="otpForm">
      <label>OTP
        <input type="text" id="otp" inputmode="numeric" maxlength="6" required />
      </label>
      <button type="submit" class="toggle-btn">Verify OTP</button>
      <p class="small"><a href="/signin.html">Back to Sign In</a></p>
      <p id="msg" class="msg"></p>
    </form>
  </div>

  <script src="assets/js/verify-otp.js"></script>
</body>
</html>
