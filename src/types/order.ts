export enum OrderStatus {
    PENDING = 'PENDING',
    ACCEPTED = 'ACCEPTED',
    PREPARING = 'PREPARING',
    READY = 'READY',
    OUT_FOR_DELIVERY = 'OUT_FOR_DELIVERY',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED',
    REJECTED = 'REJECTED',
}

export interface OrderItem {
    menuItemId: string;
    optionGroupId: string;
    itemOptionId: string;
    quantity: number;
}

export interface Order {
    id: string;
    clientId: string;
    clientFirstName: string;
    clientLastName: string;
    driverId?: string;
    driverFirstName?: string;
    driverLastName?: string;
    restaurantId: string;
    restaurantName: string;
    deliveryLocation: {
        type: 'Point';
        coordinates: [number, number]; // [longitude, latitude]
    };
    subtotal: number;
    deliveryFee: number;
    tax: number;
    total: number;
    status: OrderStatus;
    createdAt: string;
    updatedAt: string;
}

export interface CreateOrderPayload {
    userId: string;
    restaurantId: string;
    orderItems: OrderItem[];
    deliveryLocation: {
        lng: number;
        lat: number;
    };
}

export interface AssignDriverPayload {
    driverId: string;
}

export interface UpdateOrderStatusPayload {
    status: OrderStatus;
}
