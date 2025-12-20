
import fetch from 'node-fetch';

const debugLogin = async () => {
    try {
        console.log('Attempting login with: 0551234567 / password123');
        const response = await fetch('http://localhost:3000/v1/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                phone: '0551234567',
                password: 'password123'
            })
        });

        console.log('Status:', response.status);
        const text = await response.text();
        console.log('Body:', text);

    } catch (error) {
        console.error('Error:', error);
    }
};

debugLogin();
