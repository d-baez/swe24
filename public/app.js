document.addEventListener('DOMContentLoaded', () => {
  // Helper function for showing alerts
  const showAlert = (message, type = 'error') => {
    alert(`${type.toUpperCase()}: ${message}`);
  };

  // Function to handle registration
  const handleRegistration = async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    const email = document.getElementById('email').value.trim();

    // Basic client-side validation
    if (!username || !password || !email) {
      showAlert('All fields are required.');
      return;
    }

    try {
      const response = await fetch('/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, email }),
      });

      const data = await response.json();

      if (response.ok) {
        alert(data.message);
        window.location.href = '/login.html'; // Redirect to login page after successful registration
      } else {
        showAlert(data.message);
      }
    } catch (error) {
      showAlert('An error occurred during registration.');
    }
  };

  // Function to handle login
  const handleLogin = async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();

    // Basic client-side validation
    if (!username || !password) {
      showAlert('Username and password are required.');
      return;
    }

    try {
      const response = await fetch('/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        alert(data.message);
        window.location.href = '/'; // Redirect to the homepage after successful login
      } else {
        showAlert(data.message);
      }
    } catch (error) {
      showAlert('An error occurred during login.');
    }
  };

  // Attach event listeners to forms
  const registerForm = document.getElementById('register-form');
  if (registerForm) {
    registerForm.addEventListener('submit', handleRegistration);
  }

  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  }
});
