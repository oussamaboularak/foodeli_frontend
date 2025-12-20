
import fetch from 'node-fetch';

const testUsersApi = async () => {
    try {
        // 1. Login
        console.log('Logging in...');
        const loginRes = await fetch('http://localhost:3000/v1/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone: '0551234567', password: 'password123' })
        });
        const loginData = await loginRes.json();
        const token = loginData.accessToken;

        // Decode
        const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        const userId = payload.userId || payload.id;

        // 2. Get User By ID
        console.log(`Fetching User ${userId}...`);
        const userRes = await fetch(`http://localhost:3000/v1/users/${userId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const userData = await userRes.json();
        console.log('GET /v1/users/:id Response:', JSON.stringify(userData, null, 2));

        // 3. Get All Users
        console.log('Fetching All Users...');
        const allRes = await fetch('http://localhost:3000/v1/users', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const allData = await allRes.json();
        console.log('GET /v1/users Response:', JSON.stringify(allData, null, 2));

    } catch (error) {
        console.error('Error:', error);
    }
};

testUsersApi();
