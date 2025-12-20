import apiClient from './client';

export interface LoginCredentials {
  phone: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  accessToken: string; // Updated to match backend
  refreshToken: string;
}

export interface MeResponse {
  success: boolean;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    phone: string;
    role: string;
  };
}

export interface RegisterCredentials {
  phone: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  data: {
    userId: string;
  };
}

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const response = await apiClient.post('/v1/auth/login', credentials);
    return response.data;
  },

  register: async (credentials: RegisterCredentials): Promise<RegisterResponse> => {
    const response = await apiClient.post('/v1/auth/register', credentials);
    return response.data;
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/v1/auth/logout');
  },

};
