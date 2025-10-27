const form = document.getElementById('forgot-password-form');
const msg = document.getElementById('fp-msg');

form.addEventListener('submit', async e => {
  e.preventDefault();
  const email = document.getElementById('fp-email').value;

  try {
    const res = await fetch('/api/password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'forgot', email })
    });
    const data = await res.json();
    msg.textContent = data.message || data.error;
  } catch (err) {
    msg.textContent = 'Server error, try again later.';
  }
});
