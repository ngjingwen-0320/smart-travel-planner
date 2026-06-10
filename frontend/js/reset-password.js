document.getElementById('resetPasswordForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const params = new URLSearchParams(window.location.search);
  const token = params.get('token');

  const newPassword = document.getElementById('newPassword').value;
  const confirmPassword = document.getElementById('confirmPassword').value;
  const messageElement = document.getElementById('message');

  if (!token) {
    messageElement.style.color = 'red';
    messageElement.textContent = 'Invalid or missing token';
    return;
  }

  if (newPassword !== confirmPassword) {
    messageElement.style.color = 'red';
    messageElement.textContent = 'Passwords do not match';
    return;
  }

  try {
    const res = await fetch(`http://localhost:5001/api/v1/auth/reset-password/${token}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ password: newPassword })
    });

    const data = await res.json();

    if (data.success) {
      messageElement.style.color = 'green';
      messageElement.textContent = 'Password reset successful! Redirecting...';

      setTimeout(() => {
        window.location.href = 'login.html';
      }, 1500);

    } else {
      messageElement.style.color = 'red';
      messageElement.textContent = data.message;
    }

  } catch (err) {
    messageElement.style.color = 'red';
    messageElement.textContent = 'Server error. Please try again.';
  }
});