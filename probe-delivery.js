
import fetch from 'node-fetch';

const probeDelivery = async () => {
    try {
        // Login first
        const loginRes = await fetch('http://localhost:3000/v1/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone: '0551234567', password: 'password123' })
        });
        const loginData = await loginRes.json();
        const token = loginData.accessToken;

        const endpoints = [
            '/v1/delivery/fee',
            '/v1/delivery-configs/fee',
            '/v1/delivery-configs/calculate',
            '/v1/delivery/calculate',
            '/v1/deliveries/fee',
            '/v1/delivery-fee'
        ];

        console.log('Probing Delivery Fee Endpoints...');

        for (const path of endpoints) {
            const res = await fetch(`http://localhost:3000${path}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ distance: 5 })
            });
            console.log(`${path} -> ${res.status}`);
            if (res.status !== 404) {
                const text = await res.text();
                console.log(`FOUND? Body: ${text.substring(0, 100)}`);
            }
        }

    } catch (error) {
        console.error('Error:', error);
    }
};

probeDelivery();
