document.addEventListener('DOMContentLoaded', () => {
  const inputs = Array.from(document.querySelectorAll('.otp'));
  const btn = document.getElementById('verify-otp-btn');
  const msg = document.getElementById('otp-msg');
  const countdown = document.getElementById('countdown');
  const BASE_URL = ""; // relative path

  // auto-advance, numeric only, paste handling
  inputs.forEach((input, idx) => {
    input.addEventListener('input', (e) => {
      const val = e.target.value.replace(/\D/g,'');
      e.target.value = val;
      if (val && idx < inputs.length -1) inputs[idx+1].focus();
    });
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace' && !e.target.value && idx > 0) {
        inputs[idx-1].focus();
      }
    });
    input.addEventListener('paste', (e) => {
      e.preventDefault();
      const paste = (e.clipboardData||window.clipboardData).getData('text');
      const digits = paste.replace(/\D/g,'').slice(0,6);
      for (let i=0;i<6;i++) inputs[i].value = digits[i]||'';
    });
  });

  // countdown 180s
  let remaining = Number(sessionStorage.getItem('hawkguard_otp_remaining')) || 180;
  const timer = setInterval(() => {
    const mm = String(Math.floor(remaining/60)).padStart(2,'0');
    const ss = String(remaining%60).padStart(2,'0');
    countdown.textContent = `${mm}:${ss}`;
    if (remaining <= 0) {
      clearInterval(timer);
      msg.textContent = 'OTP expired. Please sign in again.';
      msg.style.color = 'red';
      inputs.forEach(i=>i.disabled=true);
      btn.disabled = true;
    }
    remaining--;
  }, 1000);

  btn.addEventListener('click', async () => {
    const otp = inputs.map(i=>i.value).join('');
    if (otp.length !== 6) return alert('Enter 6 digits');
    const email = sessionStorage.getItem('hawkguard_signin_email');
    if (!email) { alert('Please sign in again'); window.location.href='/sign-in.html'; return; }

    try {
      const res = await fetch("/api/verify-otp", {
        method:'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ email, otp })
      });
      const j = await res.json();
      if (!res.ok) {
        msg.textContent = j.error || j.message || 'Verification failed';
        msg.style.color = 'red';
        return;
      }
      window.location.href = '/dashboard.html';
    } catch (err) {
      console.error(err); alert('Server error');
    }
  });
});
