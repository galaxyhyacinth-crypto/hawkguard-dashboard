const form = document.getElementById('reset-password-form');
const msg = document.getElementById('rp-msg');

// Ambil token dari URL
const urlParams = new URLSearchParams(window.location.search);
const token = urlParams.get('token');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const newPassword = document.getElementById('rp-new-password').value;

  const res = await fetch('/api/password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'reset', token, newPassword }),
  });

  const data = await res.json();
  if (res.ok) {
    msg.textContent = data.message;
    msg.style.color = 'green';
  } else {
    msg.textContent = data.error;
    msg.style.color = 'red';
  }
});
