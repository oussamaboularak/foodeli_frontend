export enum UserRole {
    CLIENT = 'CLIENT',
    GUEST = 'GUEST',
    RESTAURANT = 'RESTAURANT',
    DRIVER = 'DRIVER',
    OWNER = 'OWNER',
}

export interface User {
    id: string;
    firstName: string;
    lastName: string;
    phone: string;
    role: UserRole;
    createdAt?: string;
    updatedAt?: string;
}

export interface CreateUserPayload {
    firstName: string;
    lastName: string;
    phone: string;
    password: string;
    role: UserRole;
}

export interface UpdateUserPayload {
    firstName?: string;
    lastName?: string;
    phone?: string;
    password?: string;
    role?: UserRole;
}
