import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { restaurantsApi } from '@/api/restaurants';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import DashboardLayout from '@/components/DashboardLayout';
import type { Restaurant } from '@/types/restaurant';
import { Store, MapPin, Phone, Plus, X, Edit, Trash2, Search } from 'lucide-react';

const RestaurantsPage: React.FC = () => {
    const navigate = useNavigate();
    const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingRestaurant, setEditingRestaurant] = useState<Restaurant | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        phone: '',
        latitude: '',
        longitude: '',
    });
    const [coverImage, setCoverImage] = useState<File | null>(null);

    useEffect(() => {
        loadRestaurants();
    }, []);

    const loadRestaurants = async () => {
        try {
            setLoading(true);
            const data = await restaurantsApi.getAll();
            setRestaurants(data);
        } catch (error) {
            console.error('Failed to load restaurants:', error);
            setRestaurants([]);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (restaurant: Restaurant, e: React.MouseEvent) => {
        e.stopPropagation();
        setEditingRestaurant(restaurant);
        setFormData({
            name: restaurant.name,
            description: restaurant.description || '',
            phone: restaurant.phone,
            latitude: restaurant.location.coordinates[1].toString(),
            longitude: restaurant.location.coordinates[0].toString(),
        });
        setShowForm(true);
    };

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm('Are you sure you want to delete this restaurant? This action cannot be undone.')) return;

        try {
            await restaurantsApi.delete(id);
            setRestaurants(restaurants.filter(r => r.id !== id));
        } catch (error) {
            console.error('Failed to delete restaurant:', error);
            alert('Failed to delete restaurant');
        }
    };

    const handleCancel = () => {
        setShowForm(false);
        setEditingRestaurant(null);
        setFormData({ name: '', description: '', phone: '', latitude: '', longitude: '' });
        setCoverImage(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const lat = parseFloat(formData.latitude);
        const lng = parseFloat(formData.longitude);

        if (isNaN(lat) || isNaN(lng)) {
            alert('Please enter valid numbers for latitude and longitude');
            return;
        }

        try {
            const payload = {
                name: formData.name,
                description: formData.description,
                phone: formData.phone,
                location: { lng, lat },
                cover: coverImage || undefined,
            };

            if (editingRestaurant) {
                await restaurantsApi.update(editingRestaurant.id, payload);
            } else {
                await restaurantsApi.create(payload);
            }

            handleCancel();
            loadRestaurants();
        } catch (error: any) {
            console.error('Failed to save restaurant:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Failed to save restaurant';
            alert(`Failed to save restaurant: ${errorMessage}`);
        }
    };

    const filteredRestaurants = restaurants.filter(r =>
        r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Restaurants</h2>
                        <p className="text-gray-500">Manage your restaurant locations and details</p>
                    </div>
                    <Button
                        onClick={() => {
                            if (showForm) handleCancel();
                            else setShowForm(true);
                        }}
                        className={`${showForm ? 'bg-gray-100 text-gray-900 hover:bg-gray-200' : 'bg-orange-500 hover:bg-orange-600'} text-white transition-colors`}
                    >
                        {showForm ? (
                            <><X className="h-4 w-4 mr-2" /> Cancel</>
                        ) : (
                            <><Plus className="h-4 w-4 mr-2" /> Add Restaurant</>
                        )}
                    </Button>
                </div>

                {/* Search Bar */}
                {!showForm && restaurants.length > 0 && (
                    <div className="relative max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Search restaurants..."
                            className="pl-10 bg-white border-gray-200 focus:border-orange-500 focus:ring-orange-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                )}

                {/* Form Section */}
                {showForm && (
                    <Card className="border-none shadow-lg animate-in fade-in slide-in-from-top-4 duration-300">
                        <div className="h-1 bg-gradient-to-r from-orange-500 to-red-500 rounded-t-xl" />
                        <CardContent className="p-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">
                                {editingRestaurant ? 'Edit Restaurant' : 'Create New Restaurant'}
                            </h3>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">Name</label>
                                        <Input
                                            required
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            placeholder="Restaurant Name"
                                            className="focus:border-orange-500 focus:ring-orange-500"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">Phone</label>
                                        <Input
                                            required
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            placeholder="06..."
                                            className="focus:border-orange-500 focus:ring-orange-500"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Description</label>
                                    <Textarea
                                        required
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="Brief description..."
                                        rows={3}
                                        className="focus:border-orange-500 focus:ring-orange-500"
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">Latitude</label>
                                        <Input
                                            type="number" step="any" required
                                            value={formData.latitude}
                                            onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                                            className="focus:border-orange-500 focus:ring-orange-500"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">Longitude</label>
                                        <Input
                                            type="number" step="any" required
                                            value={formData.longitude}
                                            onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                                            className="focus:border-orange-500 focus:ring-orange-500"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Cover Image</label>
                                    <Input
                                        type="file" accept="image/*"
                                        onChange={(e) => setCoverImage(e.target.files?.[0] || null)}
                                        className="file:bg-orange-50 file:text-orange-700 file:border-0 file:rounded-md file:px-2 file:py-1 file:mr-4 file:text-sm file:font-medium hover:file:bg-orange-100"
                                    />
                                </div>
                                <div className="flex justify-end gap-3 pt-4">
                                    <Button type="button" variant="outline" onClick={handleCancel}>Cancel</Button>
                                    <Button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white">
                                        {editingRestaurant ? 'Save Changes' : 'Create Restaurant'}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                )}

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {loading ? (
                        <div className="col-span-full py-12 text-center text-gray-500">Loading restaurants...</div>
                    ) : filteredRestaurants.length === 0 ? (
                        <div className="col-span-full py-12 text-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                            <Store className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500 font-medium">No restaurants found</p>
                        </div>
                    ) : (
                        filteredRestaurants.map((restaurant) => (
                            <Card
                                key={restaurant.id}
                                className="group overflow-hidden border-none shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer bg-white"
                                onClick={() => navigate(`/restaurants/${restaurant.id}`)}
                            >
                                <div className="relative h-48 bg-gray-100 overflow-hidden">
                                    {restaurant.coverUrl ? (
                                        <img
                                            src={restaurant.coverUrl}
                                            alt={restaurant.name}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-orange-50 text-orange-200">
                                            <Store className="h-16 w-16" />
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />

                                    {/* Quick Actions */}
                                    <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 transform translate-y-2 group-hover:translate-y-0">
                                        <button
                                            onClick={(e) => handleEdit(restaurant, e)}
                                            className="p-2 bg-white/90 hover:bg-white text-gray-700 hover:text-orange-600 rounded-full shadow-sm backdrop-blur-sm transition-colors"
                                        >
                                            <Edit className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={(e) => handleDelete(restaurant.id, e)}
                                            className="p-2 bg-white/90 hover:bg-white text-gray-700 hover:text-red-600 rounded-full shadow-sm backdrop-blur-sm transition-colors"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                                <CardContent className="p-5">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-bold text-lg text-gray-900 line-clamp-1 group-hover:text-orange-600 transition-colors">
                                            {restaurant.name}
                                        </h3>
                                    </div>
                                    <p className="text-sm text-gray-500 line-clamp-2 mb-4 h-10">
                                        {restaurant.description}
                                    </p>
                                    <div className="flex flex-col gap-2 text-sm text-gray-400">
                                        <div className="flex items-center gap-2">
                                            <MapPin className="h-4 w-4 text-orange-400" />
                                            <span className="truncate">{restaurant.location.coordinates[1].toFixed(4)}, {restaurant.location.coordinates[0].toFixed(4)}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Phone className="h-4 w-4 text-orange-400" />
                                            <span>{restaurant.phone}</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default RestaurantsPage;
