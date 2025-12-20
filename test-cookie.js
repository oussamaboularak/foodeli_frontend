
import fetch from 'node-fetch';

const testCookie = async () => {
    try {
        const res = await fetch('http://localhost:3000/v1/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone: '0551234567', password: 'password123' })
        });

        console.log('Status:', res.status);
        const setCookie = res.headers.get('set-cookie');
        console.log('Set-Cookie Header:', setCookie);

        const data = await res.json();
        console.log('Body accessToken:', data.accessToken ? 'Yes' : 'No');
        console.log('Body refreshToken:', data.refreshToken ? 'Yes' : 'No');

    } catch (error) {
        console.error('Error:', error);
    }
};

testCookie();
