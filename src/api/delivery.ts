import apiClient from './client';
import type {
    DeliveryConfig,
    CreateDeliveryConfigPayload,
    UpdateDeliveryConfigPayload,
    DeliveryFeeRequest,
    DeliveryFeeResponse,
} from '@/types/delivery';

interface ApiResponse<T> {
    success: boolean;
    message?: string;
    data: T;
}

export const deliveryApi = {
    getConfigs: async (): Promise<DeliveryConfig[]> => {
        const response = await apiClient.get<ApiResponse<DeliveryConfig[]>>('/v1/delivery-configs');
        return response.data.data;
    },

    getConfig: async (configId: string): Promise<DeliveryConfig> => {
        const response = await apiClient.get<DeliveryConfig>(
            `/v1/delivery-configs/${configId}`
        );
        return response.data;
    },

    createConfig: async (payload: CreateDeliveryConfigPayload): Promise<{ id: string }> => {
        const response = await apiClient.post<ApiResponse<{ id: string }>>(
            '/v1/delivery-configs',
            payload
        );
        return response.data.data;
    },

    updateConfig: async (
        configId: string,
        payload: UpdateDeliveryConfigPayload
    ): Promise<void> => {
        await apiClient.put(`/v1/delivery-configs/${configId}`, payload);
    },

    deleteConfig: async (configId: string): Promise<void> => {
        await apiClient.delete(`/v1/delivery-configs/${configId}`);
    },

    calculateFee: async (payload: DeliveryFeeRequest): Promise<{ fee: number; distance: number }> => {
        const response = await apiClient.post<DeliveryFeeResponse>(
            '/v1/delivery-configs/calculate-fee',
            payload
        );
        return response.data.data;
    },
};
