document.getElementById('forgotForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('email').value;
  const messageEl = document.getElementById('message');

  try {
    const res = await fetch('http://localhost:5001/api/v1/auth/reset-password/${token}', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email })
    });

    const data = await res.json();

    if (data.success) {
      messageElement.style.color = 'green';
      messageElement.textContent = 'Reset link sent to your email.';
    } else {
      messageElement.style.color = 'red';
      messageElement.textContent = data.message;
    }

  } catch (err) {
    messageElement.style.color = 'red';
    messageElement.textContent = 'Server error. Please try again.';
  }
});