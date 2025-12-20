import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authApi } from '@/api/auth';
import { usersApi } from '@/api/users';
import { jwtDecode } from "jwt-decode";
import type { User, AuthState } from '@/types/auth';

interface AuthContextType extends AuthState {
  login: (phone: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: { user: User } }
  | { type: 'LOGIN_FAILURE' }
  | { type: 'LOGOUT' }
  | { type: 'SET_LOADING'; payload: boolean };

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOGIN_START':
      return { ...state, isLoading: true };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        isAuthenticated: true,
        isLoading: false,
      };
    case 'LOGIN_FAILURE':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
      };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    default:
      return state;
  }
};

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
};

interface JWTPayload {
  userId: string;
  role: string;
  exp: number;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const decoded = jwtDecode<JWTPayload>(token);
          // Check expiry if needed (optional for now)
          const user = await usersApi.getById(decoded.userId);
          const typedUser: User = {
            ...user,
            role: user.role as 'OWNER' | 'CLIENT' | 'DRIVER' | 'RESTAURANT' | 'GUEST'
          };
          dispatch({ type: 'LOGIN_SUCCESS', payload: { user: typedUser } });
        } catch (error) {
          console.error("Auth initialization failed:", error);
          localStorage.removeItem('token');
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      } else {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };
    initAuth();
  }, []);

  const login = async (phone: string, password: string) => {
    dispatch({ type: 'LOGIN_START' });
    try {
      const response = await authApi.login({ phone, password });
      const accessToken = response.accessToken;
      localStorage.setItem('token', accessToken);

      const decoded = jwtDecode<JWTPayload>(accessToken);
      const user = await usersApi.getById(decoded.userId);
      const typedUser: User = {
        ...user,
        role: user.role as 'OWNER' | 'CLIENT' | 'DRIVER' | 'RESTAURANT' | 'GUEST'
      };

      dispatch({ type: 'LOGIN_SUCCESS', payload: { user: typedUser } });
    } catch (error) {
      dispatch({ type: 'LOGIN_FAILURE' });
      throw error;
    }
  };

  const logout = () => {
    authApi.logout().catch(console.error);
    localStorage.removeItem('token');
    dispatch({ type: 'LOGOUT' });
  };

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
