const register = async (event) => {
    event.preventDefault(); // Prevent default form submission
  
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const shipping_address = document.getElementById('shipping_address').value.trim();
  
    // Validate form data
    if (!username || !password || !name || !email || !phone || !shipping_address) {
      alert('All fields are required.');
      return;
    }
  
    try {
      const response = await fetch('http://localhost:3000/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          password,
          name,
          email,
          phone,
          shipping_address,
        }),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        alert('Registration successful! Redirecting to login...');
        window.location.href = '/login.html'; // Redirect to login page
      } else {
        alert(`Registration failed: ${data.message}`);
      }
    } catch (error) {
      console.error('Error during registration:', error);
      alert('An error occurred. Please try again later.');
    }
  };
  
  document.getElementById('register-form').addEventListener('submit', register);
  