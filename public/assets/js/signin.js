document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('signin-form');
  const toggle = document.getElementById('toggle-signin-password');

  if (toggle) {
    toggle.addEventListener('click', () => {
      const pwd = document.getElementById('signin-password');
      if (pwd) pwd.type = pwd.type === 'password' ? 'text' : 'password';
    });
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('signin-email').value.trim();
    const password = document.getElementById('signin-password').value.trim();
    try {
      const res = await fetch('/api/signin', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ email, password })
      });
      const j = await res.json();
      if (!res.ok) return alert(j.error || 'Sign in failed');
      // store email to session for OTP verification
      sessionStorage.setItem('hawkguard_signin_email', email);
      alert('OTP sent to email. Redirecting to verify page.');
      window.location.href = '/verify-otp.html';
    } catch (err) {
      console.error(err);
      alert('Server error');
    }
  });
});
