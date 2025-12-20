
import fetch from 'node-fetch';

const testDeliveryApi = async () => {
    try {
        console.log('Logging in...');
        const loginRes = await fetch('http://localhost:3000/v1/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone: '0551234567', password: 'password123' })
        });
        const loginData = await loginRes.json();
        const token = loginData.accessToken;
        console.log('Login Status:', loginRes.status);
        console.log('Token Length:', token ? token.length : 0);

        console.log('Fetching All Delivery Configs using GET /v1/delivery-configs...');
        const res = await fetch('http://localhost:3000/v1/delivery-configs', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        console.log('GET /v1/delivery-configs Response Status:', res.status);

        if (res.status === 200) {
            console.log('GET /v1/delivery-configs Response:', JSON.stringify(data, null, 2));

            // Test Fee Calculation if configs exist or just dry run
            console.log('Testing Fee Calculation POST /v1/delivery/fee...');
            const feeRes = await fetch('http://localhost:3000/v1/delivery/fee', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ distance: 5 }) // Sample distance
            });
            const feeData = await feeRes.json();
            console.log('POST /v1/delivery/fee Response:', JSON.stringify(feeData, null, 2));

        } else {
            console.log('Error Response:', JSON.stringify(data, null, 2));
        }

    } catch (error) {
        console.error('Error:', error);
    }
};

testDeliveryApi();
