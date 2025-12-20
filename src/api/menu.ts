import apiClient from './client';
import type {
    MenuItem,
    MenuOption,
    MenuOptionGroup,
    MenuItemFormData,
    MenuOptionFormData,
    MenuOptionGroupFormData,
} from '@/types/menu';

interface ApiResponse<T> {
    success: boolean;
    message?: string;
    data: T;
}

// Helper to handle paginated or direct responses
const getData = <T>(response: any): T => {
    return response.data?.data ?? response.data;
}

export const menuApi = {
    // Menu Items
    getMenuItems: async (restaurantId: string): Promise<MenuItem[]> => {
        const response = await apiClient.get<ApiResponse<MenuItem[]>>(`/v1/restaurants/${restaurantId}/menus`);
        return getData(response);
    },

    getMenuItem: async (menuId: string): Promise<MenuItem> => {
        const response = await apiClient.get<MenuItem>(`/v1/restaurants/menus/${menuId}`);
        return response.data;
    },

    createMenuItem: async (data: MenuItemFormData): Promise<{ id: string }> => {
        const formData = new FormData();
        formData.append('name', data.name);
        if (data.description) formData.append('description', data.description);
        formData.append('price', data.price.toString());
        formData.append('category', data.category);
        if (data.image) {
            formData.append('image', data.image);
        }

        const response = await apiClient.post<ApiResponse<{ id: string }>>(
            `/v1/restaurants/${data.restaurantId}/menus`,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }
        );
        return response.data.data;
    },

    updateMenuItem: async (menuId: string, data: Partial<MenuItemFormData>): Promise<void> => {
        const formData = new FormData();
        if (data.name) formData.append('name', data.name);
        if (data.description) formData.append('description', data.description);
        if (data.price !== undefined) formData.append('price', data.price.toString());
        if (data.category) {
            formData.append('category', data.category);
        }
        if (data.image) formData.append('image', data.image);

        await apiClient.put(`/v1/restaurants/menus/${menuId}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    },

    deleteMenuItem: async (menuId: string): Promise<void> => {
        await apiClient.delete(`/v1/restaurants/menus/${menuId}`);
    },

    // Option Groups
    // Note: Backend endpoint seems to return paginated response for groups
    getOptionGroups: async (itemId: string): Promise<MenuOptionGroup[]> => {
        const response = await apiClient.get<ApiResponse<MenuOptionGroup[]>>(`/v1/restaurants/menus/${itemId}/option-groups`);
        return getData(response);
    },

    getOptionGroup: async (groupId: string): Promise<MenuOptionGroup> => {
        const response = await apiClient.get<MenuOptionGroup>(`/v1/restaurants/menus/option-groups/${groupId}`);
        return response.data;
    },

    createOptionGroup: async (data: MenuOptionGroupFormData): Promise<{ id: string }> => {
        // We need menuId to construct the URL: /v1/restaurants/menus/:id/option-groups
        // Assuming data.menuId exists in MenuOptionGroupFormData based on usage context or we need to add it.
        // If it's not in the type, we might face a TS error, but I will check the file content first.
        // *Correction*: Postman says /v1/restaurants/menus/:id/option-groups
        // I will assume data has menuId. If not, I'll need to update the caller or type.
        // Let's rely on data.menuId being present or passed in.
        // Re-reading types/menu.ts in valid step:

        const response = await apiClient.post<ApiResponse<{ id: string }>>(
            `/v1/restaurants/menus/${data.itemId}/option-groups`,
            data
        );
        return response.data.data;
    },

    updateOptionGroup: async (
        groupId: string,
        data: Partial<MenuOptionGroupFormData>
    ): Promise<void> => {
        await apiClient.put(`/v1/restaurants/menus/option-groups/${groupId}`, data);
    },

    deleteOptionGroup: async (groupId: string): Promise<void> => {
        await apiClient.delete(`/v1/restaurants/menus/option-groups/${groupId}`);
    },

    // Options
    getOptions: async (groupId: string): Promise<MenuOption[]> => {
        const response = await apiClient.get<ApiResponse<MenuOption[]>>(`/v1/restaurants/menus/option-groups/${groupId}/options`);
        return getData(response);
    },

    getOption: async (optionId: string): Promise<MenuOption> => {
        const response = await apiClient.get<MenuOption>(`/v1/restaurants/menus/option-groups/options/${optionId}`);
        return response.data;
    },

    createOption: async (data: MenuOptionFormData): Promise<{ id: string }> => {
        // URL: /v1/restaurants/menus/option-groups/:id/options
        // Need optionGroupId
        const response = await apiClient.post<ApiResponse<{ id: string }>>(
            `/v1/restaurants/menus/option-groups/${data.groupId}/options`,
            data
        );
        return response.data.data;
    },

    updateOption: async (optionId: string, data: Partial<MenuOptionFormData>): Promise<void> => {
        await apiClient.put(`/v1/restaurants/menus/option-groups/options/${optionId}`, data);
    },

    deleteOption: async (optionId: string): Promise<void> => {
        await apiClient.delete(`/v1/restaurants/menus/option-groups/options/${optionId}`);
    },
};
