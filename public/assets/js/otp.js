// verify-otp.js
document.addEventListener('DOMContentLoaded', () => {
  const inputs = Array.from(document.querySelectorAll('.otp'));
  const btn = document.getElementById('verify-otp-btn');
  const msg = document.getElementById('otp-msg');
  const countdownEl = document.getElementById('countdown');

  // Auto-focus / numeric-only handling
  inputs.forEach((input, idx) => {
    input.addEventListener('input', (e) => {
      const val = e.target.value.replace(/\D/g, ''); // numeric only
      e.target.value = val;
      if (val && idx < inputs.length - 1) inputs[idx + 1].focus();
    });
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace' && !e.target.value && idx > 0) {
        inputs[idx - 1].focus();
      }
    });
    // prevent paste of non-digits and allow paste of full 6-digit
    input.addEventListener('paste', (e) => {
      e.preventDefault();
      const paste = (e.clipboardData || window.clipboardData).getData('text');
      const digits = paste.replace(/\D/g, '').slice(0,6);
      if (digits.length === 6) {
        inputs.forEach((el, i) => el.value = digits[i]);
      }
    });
  });

  // Countdown timer
  const expirySeconds = Number(sessionStorage.getItem('hawkguard_otp_expiry_seconds')) || Number((Math.floor((Number(${process.env.OTP_EXPIRY_SECONDS || 180})))) || 180);
  // If server didn't set a stored expiry, default to 180s (3 min)
  let remaining = Number(sessionStorage.getItem('hawkguard_otp_remaining')) || (Number(process.env?.OTP_EXPIRY_SECONDS) || 180);

  // start a 180-second timer always - show mm:ss
  // We'll compute from now: if server stores per-email expiry, for now we run client-side 180s
  remaining = 180;
  function updateCountdown() {
    const mm = String(Math.floor(remaining / 60)).padStart(2, '0');
    const ss = String(remaining % 60).padStart(2, '0');
    countdownEl.textContent = `${mm}:${ss}`;
    if (remaining <= 0) {
      clearInterval(timerInterval);
      msg.textContent = 'OTP expired. Please sign in again.';
      msg.style.color = 'red';
    }
    remaining--;
  }
  updateCountdown();
  const timerInterval = setInterval(updateCountdown, 1000);

  btn.addEventListener('click', async () => {
    const otp = inputs.map(i => i.value).join('');
    if (otp.length !== 6) return alert('Enter 6-digit OTP');
    const email = sessionStorage.getItem('hawkguard_signin_email');
    if (!email) {
      alert('Missing email. Please sign in again.');
      window.location.href = '/sign-in.html';
      return;
    }

    try {
      const res = await fetch('/api/verify-otp', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ email, otp })
      });
      const j = await res.json();
      if (!res.ok) {
        msg.textContent = j.error || 'Verification failed';
        msg.style.color = 'red';
        return;
      }
      // store token & name (if any) and redirect
      // token handling is rudimentary; you can extend to JWT or supabase sessions
      localStorage.setItem('hawkguard_token', j.token || '');
      localStorage.setItem('hawkguard_fullname', j.full_name || '');
      window.location.href = '/dashboard.html';
    } catch (err) {
      console.error(err);
      alert('Server error');
    }
  });
});
