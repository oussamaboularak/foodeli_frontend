import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { restaurantsApi } from '@/api/restaurants';
import { menuApi } from '@/api/menu';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import DashboardLayout from '@/components/DashboardLayout';
import { MenuOptionsManagement } from '@/components/menu/MenuOptionsManagement';
import type { Restaurant } from '@/types/restaurant';
import type { MenuItem } from '@/types/menu';
import { ArrowLeft, Plus, X, Trash2, UtensilsCrossed, Tag, Edit, Settings, Eye } from 'lucide-react';

const RestaurantDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
    const [itemForOptions, setItemForOptions] = useState<MenuItem | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        category: '',
    });
    const [itemImage, setItemImage] = useState<File | null>(null);

    useEffect(() => {
        if (id) {
            loadRestaurant();
            loadMenuItems();
        }
    }, [id]);

    const loadRestaurant = async () => {
        try {
            const data = await restaurantsApi.getById(id!);
            setRestaurant(data);
        } catch (error) {
            console.error('Failed to load restaurant:', error);
        }
    };

    const loadMenuItems = async () => {
        try {
            setLoading(true);
            const data = await menuApi.getMenuItems(id!);
            setMenuItems(data || []);
        } catch (error: any) {
            console.error('Failed to load menu items:', error);
            // Handle 500 errors gracefully
            if (error.response?.status === 500) {
                console.log('Backend menu API error - possibly no menu items exist yet');
            } else {
                console.error('Unexpected error:', error.message);
            }
            setMenuItems([]); // Set empty array to prevent undefined errors
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (item: MenuItem) => {
        setEditingItem(item);
        setFormData({
            name: item.name,
            description: item.description || '',
            price: item.price.toString(),
            category: item.category,
        });
        setShowForm(true);
        // Scroll to form
        const formElement = document.getElementById('menu-item-form');
        if (formElement) formElement.scrollIntoView({ behavior: 'smooth' });
    };

    const handleCancel = () => {
        setShowForm(false);
        setEditingItem(null);
        setFormData({ name: '', description: '', price: '', category: '' });
        setItemImage(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingItem) {
                await menuApi.updateMenuItem(editingItem.id, {
                    name: formData.name,
                    description: formData.description,
                    price: parseFloat(formData.price),
                    category: formData.category,
                    restaurantId: id!,
                    image: itemImage || undefined,
                });
                alert('Menu item updated successfully');
            } else {
                await menuApi.createMenuItem({
                    name: formData.name,
                    description: formData.description,
                    price: parseFloat(formData.price),
                    category: formData.category,
                    restaurantId: id!,
                    image: itemImage || undefined,
                });
                alert('Menu item created successfully');
            }

            handleCancel();
            loadMenuItems();
        } catch (error) {
            console.error('Failed to save menu item:', error);
            alert('Failed to save menu item');
        }
    };

    const handleDelete = async (itemId: string) => {
        if (!confirm('Are you sure you want to delete this menu item?')) return;
        try {
            await menuApi.deleteMenuItem(itemId);
            loadMenuItems();
        } catch (error) {
            console.error('Failed to delete menu item:', error);
            alert('Failed to delete menu item');
        }
    };

    const groupedMenuItems = menuItems.reduce((acc, item) => {
        const category = item.category || 'Uncategorized';
        if (!acc[category]) {
            acc[category] = [];
        }
        acc[category].push(item);
        return acc;
    }, {} as Record<string, MenuItem[]>);

    if (loading && !restaurant) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-64">
                    <div className="text-lg">Loading...</div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div>
                {/* Header */}
                <div className="mb-8">
                    <Button
                        variant="outline"
                        onClick={() => navigate('/restaurants')}
                        className="mb-4"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Restaurants
                    </Button>

                    {restaurant && (
                        <Card className="border-0 shadow-lg overflow-hidden">
                            <div className="h-2 bg-gradient-to-r from-blue-500 to-cyan-500" />
                            {restaurant.coverUrl && (
                                <div className="h-64 overflow-hidden bg-gray-100">
                                    <img
                                        src={restaurant.coverUrl}
                                        alt={restaurant.name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            )}
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <CardTitle className="text-3xl mb-2">{restaurant.name}</CardTitle>
                                        <CardDescription className="text-base">{restaurant.description}</CardDescription>
                                        <div className="mt-4 space-y-2 text-sm text-gray-600">
                                            <p>📍 Location: {restaurant.location.coordinates[1]}, {restaurant.location.coordinates[0]}</p>
                                            <p>📞 {restaurant.phone}</p>
                                        </div>
                                    </div>
                                </div>
                            </CardHeader>
                        </Card>
                    )}
                </div>

                {/* Menu Section Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-2xl font-bold text-gray-900">Menu Items</h3>
                        <p className="text-gray-600 mt-1">Manage your restaurant's menu</p>
                    </div>
                    <div className="flex gap-3">
                        <Button
                            onClick={() => navigate(`/restaurants/${id}/menu`)}
                            variant="outline"
                            className="border-purple-500 text-purple-600 hover:bg-purple-50"
                        >
                            <Eye className="h-4 w-4 mr-2" />
                            View Full Menu
                        </Button>
                        <Button
                            onClick={() => {
                                if (showForm) {
                                    handleCancel();
                                } else {
                                    setShowForm(true);
                                }
                            }}
                            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                        >
                            {showForm ? (
                                <>
                                    <X className="h-4 w-4 mr-2" />
                                    Cancel
                                </>
                            ) : (
                                <>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Menu Item
                                </>
                            )}
                        </Button>
                    </div>
                </div>

                {/* Create/Edit Form Modal */}
                {showForm && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
                        <Card id="menu-item-form" className="w-full max-w-2xl shadow-2xl border-0 animate-in fade-in zoom-in-95 duration-200 bg-white">
                            <div className="h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-t-xl" />
                            <CardHeader className="relative">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="absolute right-4 top-4"
                                    onClick={handleCancel}
                                >
                                    <X className="h-5 w-5" />
                                </Button>
                                <CardTitle>{editingItem ? 'Edit Menu Item' : 'Create New Menu Item'}</CardTitle>
                                <CardDescription>
                                    {editingItem ? 'Update menu item details' : 'Add a new item to your menu'}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Item Name *
                                            </label>
                                            <Input
                                                required
                                                maxLength={200}
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                placeholder="e.g., Margherita Pizza"
                                                className="h-10"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Price (DZD) *
                                            </label>
                                            <Input
                                                required
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                max="999999.99"
                                                value={formData.price}
                                                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                                placeholder="99.00"
                                                className="h-10"
                                                title="Price must be between 0 and 999,999.99"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Description *
                                        </label>
                                        <Textarea
                                            required
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            placeholder="Describe the menu item"
                                            rows={3}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Category *
                                        </label>
                                        <Input
                                            required
                                            maxLength={100}
                                            value={formData.category}
                                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                            placeholder="e.g., Pizza, Burgers, Desserts"
                                            className="h-10"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Item Image {editingItem && '(Leave empty to keep current)'}
                                        </label>
                                        <Input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => setItemImage(e.target.files?.[0] || null)}
                                            className="h-10"
                                        />
                                    </div>

                                    <div className="flex gap-3 pt-4">
                                        <Button
                                            type="submit"
                                            className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                                        >
                                            {editingItem ? 'Update Menu Item' : 'Create Menu Item'}
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={handleCancel}
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Menu Items by Category */}
                {Object.keys(groupedMenuItems).length === 0 ? (
                    <Card className="border-0 shadow-md">
                        <CardContent className="py-16 text-center">
                            <UtensilsCrossed className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500 text-lg">No menu items yet</p>
                            <p className="text-gray-400 text-sm mt-2">Click "Add Menu Item" to create your first one</p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-8">
                        {Object.entries(groupedMenuItems).map(([category, items]) => (
                            <div key={category}>
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
                                        <Tag className="h-5 w-5 text-white" />
                                        <h4 className="text-lg font-bold text-white">{category}</h4>
                                    </div>
                                    <div className="flex-1 h-px bg-gradient-to-r from-purple-200 to-transparent" />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {items.map((item) => (
                                        <Card
                                            key={item.id}
                                            className="border-0 shadow-md hover:shadow-lg transition-all duration-200 overflow-hidden group relative"
                                        >
                                            <div className="h-2 bg-gradient-to-r from-purple-500 to-pink-500" />

                                            {/* Action Buttons Overlay */}
                                            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                                                <Button
                                                    size="icon"
                                                    variant="secondary"
                                                    className="h-8 w-8 bg-white/90 hover:bg-white shadow-sm"
                                                    onClick={() => setItemForOptions(item)}
                                                    title="Manage Options"
                                                >
                                                    <Settings className="h-4 w-4 text-gray-600" />
                                                </Button>
                                                <Button
                                                    size="icon"
                                                    variant="secondary"
                                                    className="h-8 w-8 bg-white/90 hover:bg-white shadow-sm"
                                                    onClick={() => handleEdit(item)}
                                                    title="Edit Item"
                                                >
                                                    <Edit className="h-4 w-4 text-purple-600" />
                                                </Button>
                                                <Button
                                                    size="icon"
                                                    variant="destructive"
                                                    className="h-8 w-8 shadow-sm"
                                                    onClick={() => handleDelete(item.id)}
                                                    title="Delete Item"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>

                                            {item.image_url && (
                                                <div className="h-48 overflow-hidden bg-gray-100">
                                                    <img
                                                        src={item.image_url}
                                                        alt={item.name}
                                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                                    />
                                                </div>
                                            )}
                                            <CardHeader>
                                                <div className="flex items-start justify-between">
                                                    <CardTitle className="text-lg flex-1">{item.name}</CardTitle>
                                                    <span className="text-xl font-bold text-green-600 ml-2">
                                                        {item.price.toFixed(2)} DZD
                                                    </span>
                                                </div>
                                                <CardDescription className="line-clamp-2">{item.description}</CardDescription>
                                            </CardHeader>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Options Management Overlay */}
                {itemForOptions && (
                    <MenuOptionsManagement
                        menuItem={itemForOptions}
                        onClose={() => setItemForOptions(null)}
                    />
                )}
            </div>
        </DashboardLayout>
    );
};

export default RestaurantDetailPage;
