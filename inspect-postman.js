
import fs from 'fs';

try {
    const raw = fs.readFileSync('c:\\Users\\oussama.boularak\\Downloads\\foodelibeta\\project\\Foodeli_postman.json', 'utf8');
    const json = JSON.parse(raw);

    // Recursive function to find requests
    const findRequests = (items, path = '') => {
        items.forEach(item => {
            if (item.item) {
                findRequests(item.item, path + ' > ' + item.name);
            } else if (item.request) {
                const method = item.request.method;
                const url = item.request.url?.raw || item.request.url;
                if (url && (url.includes('delivery') || url.includes('fee'))) {
                    console.log(`${method} ${url} (${path} > ${item.name})`);
                }
            }
        });
    };

    if (json.item) {
        findRequests(json.item);
    }

} catch (e) {
    console.error(e);
}
