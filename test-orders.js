
import fetch from 'node-fetch';

const testOrdersApi = async () => {
    try {
        console.log('Logging in...');
        const loginRes = await fetch('http://localhost:3000/v1/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone: '0551234567', password: 'password123' })
        });
        const loginData = await loginRes.json();
        console.log('Login Data:', JSON.stringify(loginData));
        const token = loginData.accessToken;
        console.log('Token:', token);

        console.log('Fetching All Orders using GET /v1/orders...');
        const res = await fetch('http://localhost:3000/v1/orders', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        console.log('GET /v1/orders Response Status:', res.status);
        if (res.status === 200) {
            console.log('GET /v1/orders Response:', JSON.stringify(data, null, 2));
            if (data.data && data.data.length > 0) {
                const firstId = data.data[0].id;
                console.log(`Fetching Order ${firstId}...`);
                const oneRes = await fetch(`http://localhost:3000/v1/orders/${firstId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const oneData = await oneRes.json();
                console.log('GET /v1/orders/:id Response:', JSON.stringify(oneData, null, 2));
            }
        } else {
            console.log('Error Response:', JSON.stringify(data, null, 2));
        }

    } catch (error) {
        console.error('Error:', error);
    }
};

testOrdersApi();
