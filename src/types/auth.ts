export interface User {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: 'OWNER' | 'CLIENT' | 'DRIVER' | 'RESTAURANT' | 'GUEST';
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
