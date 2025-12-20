
import fetch from 'node-fetch';

const testRestaurantsApi = async () => {
    try {
        console.log('Fetching All Restaurants...');
        const allRes = await fetch('http://localhost:3000/v1/restaurants');
        const allData = await allRes.json();
        console.log('GET /v1/restaurants Response Status:', allRes.status);
        console.log('GET /v1/restaurants Response Keys:', Object.keys(allData));
        if (allData.data && Array.isArray(allData.data) && allData.data.length > 0) {
            console.log('First Restaurant Sample:', JSON.stringify(allData.data[0], null, 2));
            const firstId = allData.data[0].id;

            console.log(`Fetching Restaurant ${firstId}...`);
            const oneRes = await fetch(`http://localhost:3000/v1/restaurants/${firstId}`);
            const oneData = await oneRes.json();
            console.log('GET /v1/restaurants/:id Response Status:', oneRes.status);
            console.log('GET /v1/restaurants/:id Response:', JSON.stringify(oneData, null, 2));
        } else if (Array.isArray(allData)) {
            console.log('Response is an array.');
        } else {
            console.log('Response Structure:', JSON.stringify(allData, null, 2));
        }

    } catch (error) {
        console.error('Error:', error);
    }
};

testRestaurantsApi();
