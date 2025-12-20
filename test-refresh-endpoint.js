
import fetch from 'node-fetch';

const testRefreshEndpoint = async () => {
    try {
        console.log('Logging in...');
        const loginRes = await fetch('http://localhost:3000/v1/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone: '0551234567', password: 'password123' })
        });
        const loginData = await loginRes.json();
        const refreshToken = loginData.refreshToken;

        if (!refreshToken) {
            console.error('No refresh token received on login!');
            return;
        }

        console.log('Got Refresh Token. Length:', refreshToken.length);

        console.log('Testing Refresh Endpoint POST /v1/auth/refresh-token...');
        const refreshRes = await fetch('http://localhost:3000/v1/auth/refresh-token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken })
        });

        console.log('Refresh Status:', refreshRes.status);
        const refreshData = await refreshRes.json();
        console.log('New Access Token:', refreshData.accessToken ? 'Yes' : 'No');
        console.log('New Refresh Token:', refreshData.refreshToken ? 'Yes' : 'No');

    } catch (error) {
        console.error('Error:', error);
    }
};

testRefreshEndpoint();
