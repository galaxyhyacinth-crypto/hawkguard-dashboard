document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('register-form');
  const pwd = document.getElementById('password');
  const pwd2 = document.getElementById('password2');

  // toggle eyes
  ['toggle-password','toggle-password2'].forEach(id => {
    const btn = document.getElementById(id);
    if (!btn) return;
    btn.addEventListener('click', () => {
      const input = btn.previousElementSibling || document.querySelector(`#${id === 'toggle-password' ? 'password' : 'password2'}`);
      if (input) input.type = input.type === 'password' ? 'text' : 'password';
    });
  });

  function validatePassword(value){
    return {
      length: /^.{8,16}$/.test(value),
      upper: /[A-Z]/.test(value),
      lower: /[a-z]/.test(value),
      number: /\d/.test(value),
      special: /[!@#$]/.test(value)
    };
  }

  pwd.addEventListener('input', () => {
    const v = validatePassword(pwd.value);
    document.getElementById('li-length').classList.toggle('valid', v.length);
    document.getElementById('li-upper').classList.toggle('valid', v.upper);
    document.getElementById('li-lower').classList.toggle('valid', v.lower);
    document.getElementById('li-number').classList.toggle('valid', v.number);
    document.getElementById('li-special').classList.toggle('valid', v.special);
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const full_name = document.getElementById('full_name').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = pwd.value.trim();
    const password2 = pwd2.value.trim();

    if (password !== password2) return alert('Passwords do not match');

    const v = validatePassword(password);
    if (!v.length || !v.upper || !v.lower || !v.number || !v.special) {
      return alert('Password does not meet complexity rules');
    }

    // get recaptcha token (if widget present)
    let recaptchaToken = null;
    if (window.grecaptcha) recaptchaToken = grecaptcha.getResponse();

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ full_name, email, password, recaptchaToken })
      });
      const j = await res.json();
      if (!res.ok) return alert(j.error || 'Register failed');
      alert('Registered successfully. Redirecting to sign-in.');
      window.location.href = '/sign-in.html';
    } catch (err) {
      console.error(err);
      alert('Server error');
    }
  });
});
