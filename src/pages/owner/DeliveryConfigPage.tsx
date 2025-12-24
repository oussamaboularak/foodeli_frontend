import React, { useEffect, useState } from 'react';
import { deliveryApi } from '@/api/delivery';
import type { DeliveryConfig } from '@/types/delivery';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Truck, Plus, X, Edit, Calculator, Trash2, MapPin, Info } from 'lucide-react';
import { restaurantsApi } from '@/api/restaurants';
import type { Restaurant } from '@/types/restaurant';

const DeliveryConfigPage: React.FC = () => {
    const [configs, setConfigs] = useState<DeliveryConfig[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [showCalculator, setShowCalculator] = useState(false);
    const [editingConfig, setEditingConfig] = useState<DeliveryConfig | null>(null);
    const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        baseFee: '',
        perKmRate: '',
        tax: '',
        isActive: true,
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [configsData, restsData] = await Promise.all([
                deliveryApi.getConfigs(),
                restaurantsApi.getAll()
            ]);
            setConfigs(configsData);
            setRestaurants(restsData);
        } catch (error) {
            console.error('Failed to load delivery data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (config: DeliveryConfig) => {
        setEditingConfig(config);
        setFormData({
            name: config.name,
            description: config.description || '',
            baseFee: config.baseFee.toString(),
            perKmRate: config.perKmRate.toString(),
            tax: (config.tax || 0).toString(),
            isActive: config.isActive,
        });
        setShowForm(true);
    };

    const handleCancel = () => {
        setShowForm(false);
        setEditingConfig(null);
        setFormData({ name: '', description: '', baseFee: '', perKmRate: '', tax: '', isActive: true });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = {
                name: formData.name,
                description: formData.description,
                baseFee: parseFloat(formData.baseFee),
                perKmRate: parseFloat(formData.perKmRate),
                tax: parseFloat(formData.tax) || 0,
                isActive: formData.isActive,
            };

            if (editingConfig) {
                await deliveryApi.updateConfig(editingConfig.id, payload);
            } else {
                await deliveryApi.createConfig(payload);
            }

            handleCancel();
            const data = await deliveryApi.getConfigs();
            setConfigs(data);
        } catch (error) {
            console.error('Failed to save config:', error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this delivery configuration?')) return;
        try {
            await deliveryApi.deleteConfig(id);
            const data = await deliveryApi.getConfigs();
            setConfigs(data);
        } catch (error) {
            console.error('Failed to delete config:', error);
        }
    };

    return (
        <DashboardLayout>
            <div className="space-y-6 pb-20">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-3xl font-black text-gray-900 tracking-tight">Delivery Logistics</h2>
                        <p className="text-gray-500 mt-1">Manage pricing rules, taxes and kilometrage rates</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button
                            onClick={() => setShowCalculator(true)}
                            variant="outline"
                            className="h-12 px-6 border-orange-100 bg-orange-50/50 text-orange-600 hover:bg-orange-600 hover:text-white transition-all font-bold rounded-xl"
                        >
                            <Calculator className="h-5 w-5 mr-2" /> Fee Simulator
                        </Button>
                        <Button
                            onClick={() => setShowForm(true)}
                            className="h-12 px-6 bg-gray-900 hover:bg-orange-600 text-white shadow-xl shadow-gray-200 transition-all font-bold rounded-xl"
                        >
                            <Plus className="h-5 w-5 mr-2" /> Add Rule
                        </Button>
                    </div>
                </div>

                {/* Info Card */}
                <div className="bg-blue-50/50 border border-blue-100 p-4 rounded-2xl flex items-start gap-3">
                    <Info className="h-5 w-5 text-blue-500 mt-0.5 shrink-0" />
                    <p className="text-sm text-blue-700 leading-relaxed font-medium">
                        Fees are calculated as: <span className="font-bold">Base Fee + (Distance in KM × Per KM Rate)</span>.
                        Only the <span className="font-bold">Active</span> configuration will be used for live orders.
                    </p>
                </div>

                {/* Configurations Table */}
                <Card className="border-none shadow-sm overflow-hidden bg-white rounded-3xl">
                    <CardContent className="p-0">
                        {loading ? (
                            <div className="py-20 text-center text-gray-400 italic">Updating logistics data...</div>
                        ) : configs.length === 0 ? (
                            <div className="py-20 text-center bg-gray-50/50">
                                <Truck className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-500 font-medium">No delivery rules configured yet</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-gray-50/50 border-b border-gray-100">
                                            <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Name</th>
                                            <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Description</th>
                                            <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Base Fee</th>
                                            <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Tax (DZD)</th>
                                            <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Price per KM</th>
                                            <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Status</th>
                                            <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {configs.map((config) => (
                                            <tr key={config.id} className={`group hover:bg-gray-50/50 transition-colors ${config.isActive ? 'bg-orange-50/20' : ''}`}>
                                                <td className="px-6 py-4 font-bold text-gray-900">{config.name}</td>
                                                <td className="px-6 py-4 text-sm text-gray-500">{config.description || '-'}</td>
                                                <td className="px-6 py-4 text-right font-black text-gray-900">{config.baseFee.toFixed(2)} DZD</td>
                                                <td className="px-6 py-4 text-right font-black text-gray-900">{(config.tax || 0).toFixed(2)} DZD</td>
                                                <td className="px-6 py-4 text-right font-black text-gray-900 text-orange-600">{config.perKmRate.toFixed(2)} DZD</td>
                                                <td className="px-6 py-4 text-center">
                                                    {config.isActive ? (
                                                        <span className="px-3 py-1 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest rounded-full">Active</span>
                                                    ) : (
                                                        <span className="px-3 py-1 bg-gray-200 text-gray-500 text-[10px] font-black uppercase tracking-widest rounded-full">Inactive</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="h-9 w-9 p-0 bg-white border-gray-100 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-100 rounded-xl transition-all"
                                                            onClick={() => handleEdit(config)}
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="h-9 w-9 p-0 bg-white border-gray-100 hover:bg-red-50 hover:text-red-500 hover:border-red-100 rounded-xl transition-all"
                                                            onClick={() => handleDelete(config.id)}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Modal Form */}
            {showForm && (
                <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <Card className="w-full max-w-lg shadow-2xl border-none animate-in fade-in zoom-in-95 duration-200 bg-white scale-100 rounded-3xl overflow-hidden">
                        <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">{editingConfig ? 'Update Rule' : 'New Delivery Rule'}</h3>
                                <p className="text-xs text-gray-500 font-medium mt-1">Configure automated fee and tax calculations</p>
                            </div>
                            <button onClick={handleCancel} className="p-2 hover:bg-white rounded-xl transition-colors shadow-sm"><X className="h-5 w-5 text-gray-500" /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-8 space-y-5">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Rule Name</label>
                                <Input required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. Standard Logistics" className="h-12 bg-gray-50/50 border-gray-100 rounded-xl" />
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Base Fee (DZD)</label>
                                    <Input required type="number" step="0.01" value={formData.baseFee} onChange={e => setFormData({ ...formData, baseFee: e.target.value })} placeholder="0.00" className="h-12 bg-gray-50/50 border-gray-100 rounded-xl" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Tax (DZD)</label>
                                    <Input required type="number" step="0.01" value={formData.tax} onChange={e => setFormData({ ...formData, tax: e.target.value })} placeholder="0.00" className="h-12 bg-gray-50/50 border-gray-100 rounded-xl" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Price per KM</label>
                                    <Input required type="number" step="0.01" value={formData.perKmRate} onChange={e => setFormData({ ...formData, perKmRate: e.target.value })} placeholder="0.00" className="h-12 bg-gray-50/50 border-gray-100 rounded-xl" />
                                </div>
                            </div>
                            <div className="pt-4 pb-2">
                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <div className="relative">
                                        <input type="checkbox" checked={formData.isActive} onChange={e => setFormData({ ...formData, isActive: e.target.checked })} className="sr-only" />
                                        <div className={`w-12 h-6 rounded-full transition-colors ${formData.isActive ? 'bg-orange-500' : 'bg-gray-200'}`}></div>
                                        <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${formData.isActive ? 'translate-x-6' : 'translate-x-0'}`}></div>
                                    </div>
                                    <span className="text-sm font-bold text-gray-700 group-hover:text-orange-500 transition-colors">Set as the Default Active Rule</span>
                                </label>
                            </div>
                            <div className="flex gap-4 pt-6">
                                <Button type="button" variant="ghost" onClick={handleCancel} className="flex-1 h-12 font-bold text-gray-500 rounded-xl">Discard</Button>
                                <Button type="submit" className="flex-1 h-12 bg-gray-900 hover:bg-orange-600 text-white font-bold transition-all rounded-xl shadow-lg shadow-gray-200">
                                    {editingConfig ? 'Save Rule' : 'Initialize Rule'}
                                </Button>
                            </div>
                        </form>
                    </Card>
                </div>
            )}

            {/* Simulator Modal */}
            {showCalculator && (
                <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
                    <DeliveryFeeSimulator restaurants={restaurants} onClose={() => setShowCalculator(false)} />
                </div>
            )}
        </DashboardLayout>
    );
};

const DeliveryFeeSimulator: React.FC<{ restaurants: Restaurant[]; onClose: () => void; }> = ({ restaurants, onClose }) => {
    const [restaurantId, setRestaurantId] = useState('');
    const [lat, setLat] = useState('');
    const [lng, setLng] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<{ fee: number; distance: number } | null>(null);

    const handleCalculate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setLoading(true);
            const data = await deliveryApi.calculateFee({
                restaurantId,
                deliveryLocation: { lat: parseFloat(lat), lng: parseFloat(lng) },
            });
            setResult(data);
        } catch (error) {
            console.error('Calculation error:', error);
            alert('Simulation failed. Target might be out of range.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="w-full max-w-xl shadow-2xl border-none animate-in zoom-in-95 duration-200 bg-white rounded-3xl overflow-hidden">
            <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-orange-50/50">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-white rounded-2xl shadow-sm text-orange-500">
                        <Calculator className="h-6 w-6" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-gray-900">Fee Simulator</h3>
                        <p className="text-xs text-gray-500 font-medium">Verify pricing before going live</p>
                    </div>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-white rounded-xl transition-colors shadow-sm"><X className="h-5 w-5 text-gray-500" /></button>
            </div>
            <div className="p-8">
                <form onSubmit={handleCalculate} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2 space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Starting Restaurant</label>
                        <select className="w-full h-12 px-4 rounded-xl border border-gray-100 bg-gray-50/50 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500/20" value={restaurantId} onChange={e => setRestaurantId(e.target.value)} required>
                            <option value="">Choose a location...</option>
                            {restaurants.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Target Latitude</label>
                        <Input type="number" step="any" required value={lat} onChange={e => setLat(e.target.value)} placeholder="33.57..." className="h-12 bg-gray-50/50 border-gray-100 rounded-xl" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Target Longitude</label>
                        <Input type="number" step="any" required value={lng} onChange={e => setLng(e.target.value)} placeholder="-7.58..." className="h-12 bg-gray-50/50 border-gray-100 rounded-xl" />
                    </div>
                    <Button type="submit" disabled={loading} className="md:col-span-2 h-12 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl shadow-lg shadow-orange-100 transition-all">
                        {loading ? 'Processing...' : 'Calculate Delivery Estimate'}
                    </Button>
                </form>

                {result && (
                    <div className="mt-8 p-6 bg-gray-900 rounded-3xl text-white animate-in slide-in-from-bottom-4 duration-500">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-xs font-bold uppercase tracking-widest opacity-50">Simulation Results</span>
                            <div className="flex bg-white/10 px-2 py-1 rounded-lg">
                                <MapPin className="h-3 w-3 mr-1" />
                                <span className="text-[10px] font-bold">LIVE CALCULATION</span>
                            </div>
                        </div>
                        <div className="flex items-end justify-between">
                            <div>
                                <p className="text-3xl font-black">{result.fee.toFixed(2)}<small className="text-sm ml-1 opacity-60">DZD</small></p>
                                <p className="text-xs font-medium text-orange-400 mt-1">Estimated delivery fee</p>
                            </div>
                            <div className="text-right">
                                <p className="text-xl font-bold">{result.distance.toFixed(2)}<small className="text-xs ml-1 opacity-60">km</small></p>
                                <p className="text-xs font-medium opacity-50 mt-1">Driving distance</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Card>
    );
};

export default DeliveryConfigPage;

