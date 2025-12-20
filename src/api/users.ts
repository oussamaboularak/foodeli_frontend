import apiClient from './client';
import type { User, CreateUserPayload, UpdateUserPayload } from '@/types/user';

interface ApiResponse<T> {
    success: boolean;
    message?: string;
    data: T;
}

export const usersApi = {
    getAll: async (): Promise<User[]> => {
        const response = await apiClient.get<{ data: User[] }>('/v1/users');
        return response.data.data;
    },

    getById: async (userId: string): Promise<User> => {
        const response = await apiClient.get<User>(`/v1/users/${userId}`);
        return response.data;
    },

    create: async (payload: CreateUserPayload): Promise<{ id: string }> => {
        const response = await apiClient.post<ApiResponse<{ id: string }>>(
            '/v1/users',
            payload
        );
        return response.data.data;
    },

    update: async (userId: string, payload: UpdateUserPayload): Promise<void> => {
        const response = await apiClient.put<ApiResponse<void>>(`/v1/users/${userId}`, payload);
        return response.data.data;
    },

    delete: async (userId: string): Promise<void> => {
        const response = await apiClient.delete<ApiResponse<void>>(`/v1/users/${userId}`);
        return response.data.data;
    },
};
