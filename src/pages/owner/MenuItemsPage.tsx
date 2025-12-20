import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { restaurantsApi } from '@/api/restaurants';
import { menuApi } from '@/api/menu';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import DashboardLayout from '@/components/DashboardLayout';
import type { Restaurant } from '@/types/restaurant';
import type { MenuItem } from '@/types/menu';
import { ArrowLeft, Plus, UtensilsCrossed, Tag, Edit, Trash2, Settings, Search, Filter, Image as ImageIcon, ChevronRight } from 'lucide-react';

const MenuItemsPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');

    useEffect(() => {
        if (id) {
            loadData();
        }
    }, [id]);

    const loadData = async () => {
        try {
            setLoading(true);
            const [restData, itemsData] = await Promise.all([
                restaurantsApi.getById(id!),
                menuApi.getMenuItems(id!)
            ]);
            setRestaurant(restData);
            setMenuItems(itemsData || []);
        } catch (error: any) {
            console.error('Failed to load menu data:', error);
            setMenuItems([]);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (itemId: string) => {
        if (!confirm('Are you sure you want to delete this menu item?')) return;
        try {
            await menuApi.deleteMenuItem(itemId);
            setMenuItems(prev => prev.filter(item => item.id !== itemId));
        } catch (error) {
            console.error('Failed to delete item:', error);
        }
    };

    const categories = Array.from(new Set(menuItems.map(item => item.category)));

    const filteredItems = menuItems.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.description?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const groupedItems = filteredItems.reduce((acc, item) => {
        if (!acc[item.category]) acc[item.category] = [];
        acc[item.category].push(item);
        return acc;
    }, {} as Record<string, MenuItem[]>);

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-gray-100">
                    <div className="flex items-start gap-5">
                        <button
                            onClick={() => navigate('/restaurants')}
                            className="p-3 bg-white border border-gray-100 rounded-2xl text-gray-400 hover:text-orange-500 hover:border-orange-100 transition-all shadow-sm"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </button>
                        <div>
                            <div className="flex items-center gap-2 text-orange-500 mb-1">
                                <UtensilsCrossed className="h-4 w-4" />
                                <span className="text-xs font-bold uppercase tracking-widest text-orange-400">Restaurant Menu</span>
                            </div>
                            <h2 className="text-3xl font-black text-gray-900 tracking-tight">{restaurant?.name || 'Loading...'}</h2>
                            <p className="text-gray-500 text-sm mt-1">{menuItems.length} curated items in the list</p>
                        </div>
                    </div>

                    <Button
                        onClick={() => navigate(`/restaurants/${id}/add-item`)}
                        className="bg-gray-900 hover:bg-orange-600 text-white shadow-xl shadow-gray-200 transition-all font-bold h-12 px-8 rounded-xl"
                    >
                        <Plus className="h-5 w-5 mr-2" /> Add Menu Item
                    </Button>
                </div>

                {/* Filters Row */}
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Find an item (e.g. Burger, Pizza...)"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-11 pr-4 h-12 bg-white border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all shadow-sm"
                        />
                    </div>
                    <div className="flex gap-2">
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="px-5 h-12 bg-white border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 text-sm font-semibold text-gray-700 shadow-sm"
                        >
                            <option value="all">All Categories</option>
                            {categories.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                </div>

                {/* Empty State */}
                {!loading && filteredItems.length === 0 && (
                    <Card className="border-none bg-gray-50/50">
                        <CardContent className="py-24 text-center">
                            <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                                <UtensilsCrossed className="h-10 w-10 text-gray-200" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">No items found</h3>
                            <p className="text-gray-500 mt-2 max-w-sm mx-auto">Either you haven't added any items to this menu yet, or no items match your search criteria.</p>
                        </CardContent>
                    </Card>
                )}

                {/* Loading State */}
                {loading && (
                    <div className="py-24 text-center">
                        <div className="animate-spin h-8 w-8 border-4 border-orange-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                        <p className="text-gray-400 font-medium">Loading menu items...</p>
                    </div>
                )}

                {/* Menu Sections */}
                <div className="space-y-12 pb-20">
                    {Object.entries(groupedItems).map(([category, items]) => (
                        <div key={category} className="space-y-6">
                            <div className="flex items-center gap-4">
                                <h4 className="text-xl font-black text-gray-900 flex items-center gap-2">
                                    <Tag className="h-5 w-5 text-orange-500" />
                                    {category}
                                </h4>
                                <div className="h-px flex-1 bg-gray-100"></div>
                                <span className="text-xs font-bold text-gray-400 bg-gray-50 px-3 py-1 rounded-full">{items.length} items</span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {items.map((item) => (
                                    <Card key={item.id} className="border-none shadow-sm hover:shadow-xl transition-all duration-300 group overflow-hidden bg-white rounded-3xl">
                                        <div className="relative h-56 w-full overflow-hidden bg-gray-50">
                                            {item.image_url ? (
                                                <img src={item.image_url} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                            ) : (
                                                <div className="w-full h-full flex flex-col items-center justify-center text-gray-200">
                                                    <ImageIcon className="h-12 w-12 mb-2" />
                                                    <span className="text-xs font-bold uppercase tracking-widest opacity-50">No Image</span>
                                                </div>
                                            )}
                                            <div className="absolute top-4 right-4 flex gap-2 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 z-10">
                                                <button onClick={() => navigate(`/restaurants/${id}/menu-options/${item.id}`)} className="p-2.5 bg-white/90 backdrop-blur shadow-lg rounded-xl text-gray-700 hover:text-orange-500 transition-colors" title="Settings">
                                                    <Settings className="h-4 w-4" />
                                                </button>
                                                <button onClick={() => navigate(`/restaurants/${id}/edit-item/${item.id}`)} className="p-2.5 bg-white/90 backdrop-blur shadow-lg rounded-xl text-orange-600 hover:bg-orange-600 hover:text-white transition-all transform hover:scale-105" title="Edit">
                                                    <Edit className="h-4 w-4" />
                                                </button>
                                                <button onClick={() => handleDelete(item.id)} className="p-2.5 bg-red-500 shadow-lg rounded-xl text-white hover:bg-red-600 transition-all transform hover:scale-105" title="Delete">
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                            <div className="absolute top-4 left-4">
                                                <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-sm ${item.is_active ? 'bg-emerald-500 text-white' : 'bg-gray-400 text-white'}`}>
                                                    {item.is_active ? 'Active' : 'Private'}
                                                </span>
                                            </div>
                                        </div>
                                        <CardContent className="p-6">
                                            <div className="flex justify-between items-start mb-2">
                                                <h5 className="text-lg font-bold text-gray-900 group-hover:text-orange-600 transition-colors line-clamp-1">{item.name}</h5>
                                                <span className="text-lg font-black text-orange-600 shrink-0 ml-4">{item.price.toFixed(2)}<small className="text-[10px] ml-1">DZD</small></span>
                                            </div>
                                            <p className="text-sm text-gray-500 line-clamp-2 min-h-[40px] mb-4">{item.description || "No description provided for this delicious item."}</p>
                                            <div className="pt-4 border-t border-gray-50 flex items-center justify-between">
                                                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{item.category}</span>
                                                <button onClick={() => navigate(`/restaurants/${id}/menu-options/${item.id}`)} className="text-xs font-bold text-orange-500 flex items-center gap-1 hover:underline">
                                                    Manage Options <ChevronRight className="h-3 w-3" />
                                                </button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default MenuItemsPage;

