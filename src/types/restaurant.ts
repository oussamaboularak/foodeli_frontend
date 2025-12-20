export interface Restaurant {
    id: string;
    name: string;
    description: string;
    phone: string;
    location: {
        type: 'Point';
        coordinates: [number, number]; // [longitude, latitude]
    };
    coverUrl?: string;
    createdAt: string;
    updatedAt: string;
}

export interface RestaurantFormData {
    name: string;
    description: string;
    phone: string;
    location: {
        lng: number;
        lat: number;
    };
    cover?: File;
}

export interface RestaurantResponse {
    success: boolean;
    message?: string;
    data: Restaurant | Restaurant[];
}
