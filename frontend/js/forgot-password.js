document.getElementById('forgotForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('email').value;
  const messageEl = document.getElementById('message');

  try {
    const res = await fetch('http://localhost:5001/api/v1/auth/forgot-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email })
    });

    const data = await res.json();

    if (data.success) {
      messageEl.style.color = 'green';
      messageEl.textContent = 'Reset link sent to your email.';
    } else {
      messageEl.style.color = 'red';
      messageEl.textContent = data.message;
    }

  } catch (err) {
    messageEl.style.color = 'red';
    messageEl.textContent = 'Server error. Please try again.';
  }
});