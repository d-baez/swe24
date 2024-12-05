const login = async (event) => {
    event.preventDefault(); // Prevent form submission
  
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
  
    try {
      const response = await fetch('/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
  
      if (!response.ok) {
        throw new Error(`Login failed: ${response.statusText}`);
      }
  
      const result = await response.json();
      localStorage.setItem('token', result.token);
      localStorage.setItem('userId', result.user.id);
  
      alert('Login successful!');
      window.location.href = '/products.html'; // Redirect to products page
    } catch (error) {
      console.error(error);
      alert('Login failed. Please try again.');
    }
  };
  
  document.getElementById('login-form').addEventListener('submit', login);
  