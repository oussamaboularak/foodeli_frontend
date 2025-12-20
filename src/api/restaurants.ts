import apiClient from './client';
import type { Restaurant, RestaurantFormData } from '@/types/restaurant';

export interface ApiResponse<T> {
    success: boolean;
    message?: string;
    data: T;
}

export const restaurantsApi = {
    getAll: async (): Promise<Restaurant[]> => {
        const response = await apiClient.get<ApiResponse<Restaurant[]>>('/v1/restaurants');
        return response.data.data;
    },

    getById: async (id: string): Promise<Restaurant> => {
        const response = await apiClient.get<Restaurant>(`/v1/restaurants/${id}`);
        return response.data;
    },

    create: async (data: RestaurantFormData): Promise<{ id: string }> => {
        const formData = new FormData();
        formData.append('name', data.name);
        formData.append('description', data.description);
        formData.append('phone', data.phone);

        // Use flat keys for coordinates as per backend schema
        formData.append('lng', data.location.lng.toString());
        formData.append('lat', data.location.lat.toString());

        // Backend requires cover field - send valid 1x1 PNG if no file provided to satisfy image processor
        if (data.cover) {
            formData.append('cover', data.cover);
        } else {
            // Minimal 1x1 pixel transparent PNG
            const emptyImage = await fetch('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=')
                .then(res => res.blob());
            formData.append('cover', emptyImage, 'placeholder.png');
        }

        // Axios normally handles Content-Type for FormData automatically, but we need to override the default application/json
        const response = await apiClient.post<ApiResponse<{ id: string }>>(
            '/v1/restaurants',
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }
        );
        return response.data.data;
    },

    update: async (id: string, data: Partial<RestaurantFormData>): Promise<void> => {
        const formData = new FormData();
        if (data.name) formData.append('name', data.name);
        if (data.description) formData.append('description', data.description);
        if (data.phone) formData.append('phone', data.phone);
        if (data.location) {
            formData.append('lng', data.location.lng.toString());
            formData.append('lat', data.location.lat.toString());
        }
        if (data.cover) formData.append('cover', data.cover);

        await apiClient.put(`/v1/restaurants/${id}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    },

    delete: async (id: string): Promise<void> => {
        await apiClient.delete(`/v1/restaurants/${id}`);
    },

    getDeliveryFee: async (restaurantId: string, lat: number, lng: number): Promise<number> => {
        const response = await apiClient.get<any>(
            `/v1/restaurants/${restaurantId}/delivery-fee`,
            {
                params: {
                    lat,
                    lng,
                },
                transformResponse: [
                    (data) => {
                        // Backend bug workaround: Response is "NaN150.00" which is invalid JSON.
                        // We strip non-numeric chars (except dot) if it looks like this.
                        if (typeof data === 'string' && data.includes('NaN')) {
                            const cleaned = data.replace('NaN', '');
                            return parseFloat(cleaned);
                        }
                        // Default JSON parse
                        try {
                            return JSON.parse(data);
                        } catch (e) {
                            return data;
                        }
                    }
                ]
            }
        );
        return response.data;
    },
};
