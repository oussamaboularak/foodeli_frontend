
import fetch from 'node-fetch';

const testMenuApi = async () => {
    try {
        // 1. Get a restaurant ID
        console.log('Fetching Restaurants to get an ID...');
        const restRes = await fetch('http://localhost:3000/v1/restaurants');
        const restData = await restRes.json();
        if (!restData.data || restData.data.length === 0) {
            console.log('No restaurants found. Cannot test menu.');
            return;
        }
        const restaurantId = restData.data[0].id;
        console.log(`Using Restaurant ID: ${restaurantId}`);

        // 2. Get Menus for this restaurant
        console.log(`Fetching Menus for Restaurant ${restaurantId}...`);
        const menuRes = await fetch(`http://localhost:3000/v1/restaurants/${restaurantId}/menus`);
        const menuData = await menuRes.json();
        console.log('GET /v1/restaurants/:id/menus Response Status:', menuRes.status);
        console.log('GET /v1/restaurants/:id/menus Response:', JSON.stringify(menuData, null, 2));

        if (menuData.data && menuData.data.length > 0) {
            const menuId = menuData.data[0].id;
            // 3. Get One Menu
            console.log(`Fetching Menu Item ${menuId}...`);
            const oneRes = await fetch(`http://localhost:3000/v1/restaurants/menus/${menuId}`);
            const oneData = await oneRes.json();
            console.log('GET /v1/restaurants/menus/:id Response:', JSON.stringify(oneData, null, 2));

            // 4. Get Option Groups
            console.log(`Fetching Option Groups for Menu ${menuId}...`);
            const ogRes = await fetch(`http://localhost:3000/v1/restaurants/menus/${menuId}/option-groups`);
            const ogData = await ogRes.json();
            console.log('GET option-groups Response:', JSON.stringify(ogData, null, 2));
        }

    } catch (error) {
        console.error('Error:', error);
    }
};

testMenuApi();
