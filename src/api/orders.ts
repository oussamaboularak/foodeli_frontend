import apiClient from './client';
import type {
    Order,
    CreateOrderPayload,
} from '@/types/order';

interface ApiResponse<T> {
    success: boolean;
    message?: string;
    data: T;
}

export const ordersApi = {
    getAll: async (): Promise<Order[]> => {
        const response = await apiClient.get<ApiResponse<Order[]>>('/v1/orders');
        return response.data.data;
    },

    getById: async (orderId: string): Promise<Order> => {
        const response = await apiClient.get<Order>(`/v1/orders/${orderId}`);
        return response.data;
    },

    create: async (payload: CreateOrderPayload): Promise<{ id: string }> => {
        const response = await apiClient.post<ApiResponse<{ id: string }>>(
            '/v1/orders',
            payload
        );
        return response.data.data;
    },

    // Note: User request didn't explicitly specify separate driver/status endpoints, 
    // but listed "PUT /v1/orders/:id Update order". 
    // I will map specific updates to this generic endpoint or keep specific if backend supports them.
    // Assuming generic update for now based on user request "Update order (e.g., status)"
    update: async (orderId: string, payload: Partial<Order>): Promise<void> => {
        await apiClient.put(`/v1/orders/${orderId}`, payload);
    },

    // Keeping specific methods if they wrap the generic update for convenience, 
    // but ensuring they point to the correct base endpoint if needed.
    // However, strictly following "PUT /v1/orders/:id", I will replace these.

    updateStatus: async (orderId: string, status: string): Promise<void> => {
        await apiClient.put(`/v1/orders/${orderId}`, { status });
    },

    assignDriver: async (orderId: string, driverId: string): Promise<void> => {
        await apiClient.put(`/v1/orders/${orderId}`, { driverId });
    },

    delete: async (orderId: string): Promise<void> => {
        await apiClient.delete(`/v1/orders/${orderId}`);
    },

    // NEW: Get order items
    getItems: async (orderId: string): Promise<any> => {
        const response = await apiClient.get<any>(`/v1/orders/items/${orderId}`);
        return response.data;
    }
};
