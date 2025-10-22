const fetch = require('node-fetch');

async function testLogin() {
  try {
    console.log('Testing login for ruiztms20@gmail.com...');
    const response = await fetch('http://localhost:5000/api/v1/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'ruiztms20@gmail.com',
        password: 'maxfranco'
      })
    });

    const data = await response.json();
    console.log('Response status:', response.status);
    console.log('Response data:', data);

  } catch (error) {
    console.error('Error:', error.message);
  }
}

testLogin();
