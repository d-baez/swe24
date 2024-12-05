
// Login function
const login = async (event) => {
    event.preventDefault();
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    if (!username || !password) {
        alert('Please enter both username and password.');
        return;
    }
    try {
        const response = await fetch('/api/users/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        });
        if (!response.ok) {
            throw new Error('Login failed');
        }
        const user = await response.json();
        localStorage.setItem('userId', user.id); // Save user ID in local storage for session handling
        window.location.href = '/index.html'; // Redirect to home page after successful login
    } catch (error) {
      console.error(error);
      alert('Login failed. Please try again.');
    }
  };
  
  document.getElementById('login-form').addEventListener('submit', login);
  