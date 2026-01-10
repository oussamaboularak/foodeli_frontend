import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { restaurantsApi } from '@/api/restaurants';
import { menuApi } from '@/api/menu';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import DashboardLayout from '@/components/DashboardLayout';
import { MenuOptionsManagement } from '@/components/menu/MenuOptionsManagement';
import type { Restaurant } from '@/types/restaurant';
import type { MenuItem } from '@/types/menu';
import { ArrowLeft, Plus, X, Trash2, UtensilsCrossed, Tag, Edit, Settings, Eye, MapPin, Phone, Image as ImageIcon, ExternalLink } from 'lucide-react';

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
    const [selectedCategory, setSelectedCategory] = useState<string>('all');

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
            setMenuItems([]);
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
            } else {
                await menuApi.createMenuItem({
                    name: formData.name,
                    description: formData.description,
                    price: parseFloat(formData.price),
                    category: formData.category,
                    restaurantId: id!,
                    image: itemImage || undefined,
                });
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
        }
    };

    // Get all unique categories
    const allCategories = Array.from(new Set(menuItems.map(item => item.category || 'Uncategorized')));

    // Filter menu items by selected category
    const filteredMenuItems = selectedCategory === 'all'
        ? menuItems
        : menuItems.filter(item => (item.category || 'Uncategorized') === selectedCategory);

    const groupedMenuItems = filteredMenuItems.reduce((acc, item) => {
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
                    <div className="animate-spin h-8 w-8 border-4 border-orange-500 border-t-transparent rounded-full"></div>
                </div>
            </DashboardLayout>
        );
    }

    const getGoogleMapsLink = () => {
        if (!restaurant?.location?.coordinates) return '#';
        const [lng, lat] = restaurant.location.coordinates;
        return `https://www.google.com/maps?q=${lat},${lng}`;
    };

    return (
        <DashboardLayout>
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header Section */}
                <div className="flex flex-col gap-6">
                    <div className="flex items-start gap-5">
                        <button
                            onClick={() => navigate('/restaurants')}
                            className="p-3 bg-white border border-gray-100 rounded-2xl text-gray-400 hover:text-orange-500 hover:border-orange-100 transition-all shadow-sm group"
                        >
                            <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                        </button>
                        <div className="flex-1">
                            <div className="flex items-center gap-2 text-orange-500 mb-1">
                                <UtensilsCrossed className="h-4 w-4" />
                                <span className="text-xs font-bold uppercase tracking-widest text-orange-400">Restaurant Detail</span>
                            </div>
                            <h2 className="text-4xl font-black text-gray-900 tracking-tight">{restaurant?.name || 'Loading...'}</h2>
                        </div>
                        <div className="flex gap-3">
                            <Button
                                onClick={() => navigate(`/restaurants/${id}/menu`)}
                                variant="outline"
                                className="h-12 px-6 border-orange-100 text-orange-600 hover:bg-orange-50 rounded-xl font-bold shadow-sm"
                            >
                                <Eye className="h-4 w-4 mr-2" /> View Full Menu
                            </Button>
                            <Button
                                onClick={() => setShowForm(true)}
                                className="h-12 px-8 bg-gray-900 hover:bg-orange-600 text-white shadow-xl shadow-gray-200 transition-all font-bold rounded-xl"
                            >
                                <Plus className="h-5 w-5 mr-2" /> Add Menu Item
                            </Button>
                        </div>
                    </div>

                    {restaurant && (
                        <Card className="border-none shadow-2xl shadow-gray-100 overflow-hidden bg-white rounded-[2.5rem]">
                            <div className="flex flex-col lg:flex-row">
                                {restaurant.coverUrl && (
                                    <div className="lg:w-1/3 h-64 lg:h-auto overflow-hidden bg-gray-50 flex-shrink-0">
                                        <img
                                            src={restaurant.coverUrl}
                                            alt={restaurant.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                )}
                                <div className="flex-1 p-8 lg:p-12">
                                    <div className="space-y-6">
                                        <div>
                                            <h3 className="text-2xl font-black text-gray-900 mb-2">About Restaurant</h3>
                                            <p className="text-gray-500 text-lg leading-relaxed font-medium">
                                                {restaurant.description || "No description provided for this restaurant."}
                                            </p>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-100">
                                            <div className="space-y-4">
                                                <div className="flex items-center gap-4 group">
                                                    <div className="p-3 bg-orange-50 text-orange-500 rounded-2xl group-hover:bg-orange-500 group-hover:text-white transition-all">
                                                        <MapPin className="h-5 w-5" />
                                                    </div>
                                                    <div>
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-0.5">Location</span>
                                                        <a
                                                            href={getGoogleMapsLink()}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-sm font-bold text-gray-700 hover:text-orange-600 flex items-center gap-1 transition-colors"
                                                        >
                                                            {restaurant.location.coordinates[1].toFixed(6)}, {restaurant.location.coordinates[0].toFixed(6)}
                                                            <ExternalLink className="h-3 w-3" />
                                                        </a>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="space-y-4">
                                                <div className="flex items-center gap-4 group">
                                                    <div className="p-3 bg-orange-50 text-orange-500 rounded-2xl group-hover:bg-orange-500 group-hover:text-white transition-all">
                                                        <Phone className="h-5 w-5" />
                                                    </div>
                                                    <div>
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-0.5">Contact Number</span>
                                                        <p className="text-sm font-bold text-gray-900">{restaurant.phone || 'No phone provided'}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    )}
                </div>

                {/* Menu Section Header */}
                <div className="flex items-center gap-4 mt-12 pb-2">
                    <h3 className="text-2xl font-black text-gray-900 tracking-tight">Current Menu Items</h3>
                    <div className="h-px flex-1 bg-gray-100"></div>
                    <span className="px-4 py-1.5 bg-gray-900 text-white text-[10px] font-black uppercase tracking-widest rounded-full">
                        {menuItems.length} Items Total
                    </span>
                </div>

                {/* Category Filter */}
                {menuItems.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-6">
                        <button
                            onClick={() => setSelectedCategory('all')}
                            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${selectedCategory === 'all'
                                    ? 'bg-orange-500 text-white shadow-lg shadow-orange-100'
                                    : 'bg-white text-gray-600 border border-gray-200 hover:border-orange-300 hover:text-orange-600'
                                }`}
                        >
                            All Categories
                        </button>
                        {allCategories.map((category) => (
                            <button
                                key={category}
                                onClick={() => setSelectedCategory(category)}
                                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${selectedCategory === category
                                        ? 'bg-orange-500 text-white shadow-lg shadow-orange-100'
                                        : 'bg-white text-gray-600 border border-gray-200 hover:border-orange-300 hover:text-orange-600'
                                    }`}
                            >
                                {category}
                            </button>
                        ))}
                    </div>
                )}


                {/* Menu Items Data Grid */}
                <div className="space-y-8 pb-20">
                    {Object.keys(groupedMenuItems).length === 0 ? (
                        <Card className="border-none bg-gray-50/50 rounded-[2rem]">
                            <CardContent className="py-24 text-center">
                                <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                                    <UtensilsCrossed className="h-10 w-10 text-gray-200" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900">No menu items yet</h3>
                                <p className="text-gray-500 mt-2 max-w-sm mx-auto">Start by adding delicious items to your restaurant's menu.</p>
                                <Button
                                    onClick={() => setShowForm(true)}
                                    className="mt-8 bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 rounded-xl h-12 shadow-lg shadow-orange-100"
                                >
                                    Add Your First Item
                                </Button>
                            </CardContent>
                        </Card>
                    ) : (
                        Object.entries(groupedMenuItems).map(([category, items]) => (
                            <div key={category} className="space-y-4">
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-100 rounded-2xl shadow-sm">
                                        <Tag className="h-5 w-5 text-orange-500" />
                                        <h4 className="text-lg font-black text-gray-900">{category}</h4>
                                    </div>
                                    <div className="h-px flex-1 bg-gray-100 opacity-50"></div>
                                </div>

                                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead className="bg-gray-50 border-b border-gray-200">
                                                <tr>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Item
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Description
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Price
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Status
                                                    </th>
                                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Actions
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {items.map((item) => (
                                                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="flex items-center">
                                                                <div className="h-12 w-12 flex-shrink-0">
                                                                    {item.image_url ? (
                                                                        <img
                                                                            src={item.image_url}
                                                                            alt={item.name}
                                                                            className="h-12 w-12 rounded-lg object-cover"
                                                                        />
                                                                    ) : (
                                                                        <div className="h-12 w-12 rounded-lg bg-orange-50 flex items-center justify-center">
                                                                            <ImageIcon className="h-6 w-6 text-orange-400" />
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <div className="ml-4">
                                                                    <div className="text-sm font-bold text-gray-900">
                                                                        {item.name}
                                                                    </div>
                                                                    <div className="text-xs text-gray-500">
                                                                        {item.category}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="text-sm text-gray-500 max-w-md truncate">
                                                                {item.description || "No description"}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="text-sm font-bold text-orange-600">
                                                                {item.price.toFixed(2)} DZD
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${item.is_active
                                                                ? 'bg-green-100 text-green-800'
                                                                : 'bg-gray-100 text-gray-800'
                                                                }`}>
                                                                {item.is_active ? 'Active' : 'Draft'}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                            <div className="flex justify-end gap-2">
                                                                <button
                                                                    onClick={() => setItemForOptions(item)}
                                                                    className="p-2 bg-gray-50 hover:bg-orange-50 text-gray-600 hover:text-orange-600 rounded-lg transition-colors"
                                                                    title="Configure Options"
                                                                >
                                                                    <Settings className="h-4 w-4" />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleEdit(item)}
                                                                    className="p-2 bg-gray-50 hover:bg-orange-50 text-gray-600 hover:text-orange-600 rounded-lg transition-colors"
                                                                    title="Edit"
                                                                >
                                                                    <Edit className="h-4 w-4" />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDelete(item.id)}
                                                                    className="p-2 bg-gray-50 hover:bg-red-50 text-gray-600 hover:text-red-600 rounded-lg transition-colors"
                                                                    title="Delete"
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Create/Edit Form Modal */}
                {showForm && (
                    <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                        <Card className="w-full max-w-2xl shadow-2xl border-none animate-in fade-in zoom-in-95 duration-200 bg-white rounded-[2.5rem] overflow-hidden">
                            <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-orange-600 rounded-2xl text-white shadow-lg shadow-orange-100">
                                        <Plus className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black text-gray-900 tracking-tight">
                                            {editingItem ? 'Update Menu Item' : 'New Menu Addition'}
                                        </h3>
                                        <p className="text-sm text-gray-500 font-medium">Configure item details and pricing</p>
                                    </div>
                                </div>
                                <button
                                    onClick={handleCancel}
                                    className="p-3 hover:bg-white rounded-2xl transition-all shadow-sm border border-transparent hover:border-gray-100 text-gray-400"
                                >
                                    <X className="h-6 w-6" />
                                </button>
                            </div>
                            <CardContent className="p-8">
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Item Name</label>
                                            <Input
                                                required
                                                maxLength={200}
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                placeholder="e.g. Traditional Margherita"
                                                className="h-12 bg-gray-50 border-transparent focus:bg-white focus:border-orange-500 rounded-xl transition-all font-bold"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Price (DZD)</label>
                                            <Input
                                                required
                                                type="number"
                                                step="0.01"
                                                value={formData.price}
                                                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                                placeholder="0.00"
                                                className="h-12 bg-gray-50 border-transparent focus:bg-white focus:border-orange-500 rounded-xl transition-all font-black text-orange-600"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Category</label>
                                        <Input
                                            required
                                            maxLength={100}
                                            value={formData.category}
                                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                            placeholder="e.g. Wood-fired Pizza"
                                            className="h-12 bg-gray-50 border-transparent focus:bg-white focus:border-orange-500 rounded-xl transition-all"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Item Description</label>
                                        <Textarea
                                            required
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            placeholder="Write something delicious about this item..."
                                            rows={4}
                                            className="bg-gray-50 border-transparent focus:bg-white focus:border-orange-500 rounded-2xl transition-all min-h-[120px]"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Item Photography</label>
                                        <div className="relative group/upload">
                                            <Input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => setItemImage(e.target.files?.[0] || null)}
                                                className="h-14 bg-gray-50 border-dashed border-2 border-gray-200 hover:border-orange-400 transition-colors rounded-2xl cursor-pointer pt-3"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex gap-4 pt-6">
                                        <Button
                                            type="submit"
                                            className="flex-1 h-14 bg-gray-900 hover:bg-orange-600 text-white font-black rounded-2xl shadow-xl shadow-gray-200 transition-all text-lg"
                                        >
                                            {editingItem ? 'Update Configuration' : 'Confirm & Add Item'}
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
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
