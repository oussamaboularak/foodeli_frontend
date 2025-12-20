export interface DeliveryConfig {
    id: string;
    name: string;
    description?: string;
    baseFee: number;
    perKmRate: number;
    tax?: number; // Backend sends tax too
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CreateDeliveryConfigPayload {
    name: string;
    description?: string;
    baseFee: number;
    perKmRate: number;
    isActive: boolean;
}

export interface UpdateDeliveryConfigPayload {
    name?: string;
    description?: string;
    baseFee?: number;
    perKmRate?: number;
    isActive?: boolean;
}

export interface DeliveryFeeRequest {
    restaurantId: string;
    deliveryLocation: {
        lng: number;
        lat: number;
    };
}

export interface DeliveryFeeResponse {
    success: boolean;
    message?: string;
    data: {
        fee: number;
        distance: number;
    };
}
