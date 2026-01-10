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

                {/* Data Grid */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    {loading ? (
                        <div className="py-12 text-center text-gray-500">Loading restaurants...</div>
                    ) : filteredRestaurants.length === 0 ? (
                        <div className="py-12 text-center bg-gray-50">
                            <Store className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500 font-medium">No restaurants found</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Restaurant
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Description
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Phone
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Location
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredRestaurants.map((restaurant) => (
                                        <tr
                                            key={restaurant.id}
                                            className="hover:bg-gray-50 transition-colors cursor-pointer"
                                            onClick={() => navigate(`/restaurants/${restaurant.id}`)}
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="h-10 w-10 flex-shrink-0">
                                                        {restaurant.coverUrl ? (
                                                            <img
                                                                src={restaurant.coverUrl}
                                                                alt={restaurant.name}
                                                                className="h-10 w-10 rounded-lg object-cover"
                                                            />
                                                        ) : (
                                                            <div className="h-10 w-10 rounded-lg bg-orange-50 flex items-center justify-center">
                                                                <Store className="h-5 w-5 text-orange-400" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {restaurant.name}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-500 max-w-xs truncate">
                                                    {restaurant.description}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center text-sm text-gray-900">
                                                    <Phone className="h-4 w-4 text-orange-500 mr-2" />
                                                    {restaurant.phone}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center text-sm text-gray-500">
                                                    <MapPin className="h-4 w-4 text-orange-500 mr-2 flex-shrink-0" />
                                                    <span className="truncate max-w-[150px]">
                                                        {restaurant.location.coordinates[1].toFixed(4)}, {restaurant.location.coordinates[0].toFixed(4)}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={(e) => handleEdit(restaurant, e)}
                                                        className="p-2 bg-gray-50 hover:bg-orange-50 text-gray-600 hover:text-orange-600 rounded-lg transition-colors"
                                                        title="Edit"
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={(e) => handleDelete(restaurant.id, e)}
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
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default RestaurantsPage;
