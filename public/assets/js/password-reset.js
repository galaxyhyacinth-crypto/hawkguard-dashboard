const form = document.getElementById('reset-password-form');
const urlParams = new URLSearchParams(window.location.search);
const token = urlParams.get('token');

form.addEventListener('submit', async e => {
  e.preventDefault();
  const newPassword = document.getElementById('new-password').value;
  const confirmPassword = document.getElementById('confirm-password').value;

  if (newPassword !== confirmPassword) {
    alert('Passwords do not match!');
    return;
  }

  try {
    const res = await fetch('/api/password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'reset', token, newPassword })
    });
    const data = await res.json();
    alert(data.message || data.error);
    if (data.message) window.location.href = '/sign-in.html';
  } catch (err) {
    alert('Server error, try again later.');
  }
});
