import axios from 'axios';

const client = axios.create({
    baseURL: 'http://localhost:3000'
});

async function probe() {
    try {
        // Login first
        console.log("Logging in...");
        const loginRes = await client.post('/v1/auth/login', {
            phone: '0551234567',
            password: 'password123'
        });
        const token = loginRes.data.data.accessToken;
        console.log("Login successful.");

        const headers = { Authorization: `Bearer ${token}` };

        // Probe Endpoints
        const endpoints = ['/v1/orders', '/v1/users', '/v1/restaurants'];

        for (const endpoint of endpoints) {
            try {
                console.log(`Probing ${endpoint}...`);
                await client.get(endpoint, { headers });
                console.log(`✅ ${endpoint} SUCCESS`);
            } catch (error) {
                console.error(`❌ ${endpoint} FAILED: ${error.response?.status} - ${error.response?.statusText}`);
            }
        }

    } catch (error) {
        console.error("Setup failed:", error.message);
        if (error.response) {
            console.error("Response:", error.response.status, error.response.data);
        }
    }
}

probe();
