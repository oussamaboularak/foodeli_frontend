export interface MenuItem {
    id: string;
    restaurant_id: string;
    name: string;
    description?: string;
    price: number;
    category: string;
    image_url?: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface MenuOption {
    id: string;
    name: string;
    priceAdjustment: number;
    groupId: string;
    createdAt: string;
    updatedAt: string;
}

export interface MenuOptionGroup {
    id: string;
    menu_item_id: string;
    name: string;
    description?: string;
    min_selections: number;
    max_selections: number;
    isRequired?: boolean;
    options?: MenuOption[];
    createdAt?: string;
    updatedAt?: string;
}

export interface MenuItemFormData {
    name: string;
    description?: string;
    price: number;
    restaurantId: string;
    category: string;
    image?: File;
}

export interface MenuOptionFormData {
    name: string;
    priceAdjustment: number;
    groupId: string;
}

export interface MenuOptionGroupFormData {
    name: string;
    description?: string;
    itemId: string;
    isRequired: boolean;
    minSelect: number;
    maxSelect: number;
}
