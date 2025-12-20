
import fetch from 'node-fetch';

const testRestaurantFee = async () => {
    try {
        console.log('Logging in...');
        const loginRes = await fetch('http://localhost:3000/v1/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone: '0551234567', password: 'password123' })
        });
        const loginData = await loginRes.json();
        const token = loginData.accessToken;

        // Get a restaurant
        const restRes = await fetch('http://localhost:3000/v1/restaurants');
        const restData = await restRes.json();
        console.log('Restaurants Status:', restRes.status);
        if (!restData.data || restData.data.length === 0) {
            console.log('No restaurants found or invalid response.');
            return;
        }
        const restaurantId = restData.data[0].id;

        console.log(`Testing Fee for Restaurant ${restaurantId}...`);

        // GET /v1/restaurants/:id/delivery-fee?lat=...&lng=...
        const feeRes = await fetch(`http://localhost:3000/v1/restaurants/${restaurantId}/delivery-fee?lat=36.7&lng=3.0`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        console.log('Status:', feeRes.status);
        const feeText = await feeRes.text();
        console.log('Response Body:', feeText);

    } catch (error) {
        console.error('Error:', error);
    }
};

testRestaurantFee();
