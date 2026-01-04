import { useEffect, useState } from 'react';
import { ordersApi } from '@/api/orders';
import { usersApi } from '@/api/users';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import DashboardLayout from '@/components/DashboardLayout';
import { OrderStatus } from '@/types/order';
import type { Order } from '@/types/order';
import type { User } from '@/types/user';
import { Package, MapPin, User as UserIcon, Clock, Trash2, TrendingUp, ChevronRight, CheckCircle2, AlertCircle } from 'lucide-react';

const OrdersPage: React.FC = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [drivers, setDrivers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
    const [selectedDriver, setSelectedDriver] = useState<string>('');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [ordersData, allUsers] = await Promise.all([
                ordersApi.getAll(),
                usersApi.getAll()
            ]);
            setOrders(ordersData);
            setDrivers(allUsers.filter(user => user.role === 'DRIVER'));
        } catch (error) {
            console.error('Failed to load orders or drivers:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAssignDriver = async (orderId: string) => {
        if (!selectedDriver) return;
        try {
            await ordersApi.assignDriver(orderId, selectedDriver);
            setSelectedOrder(null);
            setSelectedDriver('');
            loadData();
        } catch (error) {
            console.error('Failed to assign driver:', error);
        }
    };

    const handleUpdateStatus = async (orderId: string, status: OrderStatus) => {
        try {
            await ordersApi.updateStatus(orderId, status);
            loadData();
        } catch (error) {
            console.error('Failed to update status:', error);
        }
    };

    const handleDeleteOrder = async (orderId: string) => {
        if (!confirm('Are you sure you want to delete this order?')) return;
        try {
            await ordersApi.delete(orderId);
            loadData();
        } catch (error) {
            console.error('Failed to delete order:', error);
        }
    };

    const getStatusStyles = (status: OrderStatus) => {
        switch (status) {
            case OrderStatus.COMPLETED:
                return 'bg-emerald-50 text-emerald-600 border-emerald-100';
            case OrderStatus.OUT_FOR_DELIVERY:
            case OrderStatus.READY:
                return 'bg-blue-50 text-blue-600 border-blue-100';
            case OrderStatus.PREPARING:
            case OrderStatus.ACCEPTED:
                return 'bg-orange-50 text-orange-600 border-orange-100';
            case OrderStatus.PENDING:
                return 'bg-yellow-50 text-yellow-600 border-yellow-100';
            case OrderStatus.CANCELLED:
            case OrderStatus.REJECTED:
                return 'bg-red-50 text-red-600 border-red-100';
            default:
                return 'bg-gray-50 text-gray-600 border-gray-100';
        }
    };

    const getNextStatus = (currentStatus: OrderStatus): OrderStatus | null => {
        const statusFlow: Record<string, OrderStatus | null> = {
            [OrderStatus.PENDING]: OrderStatus.ACCEPTED,
            [OrderStatus.ACCEPTED]: OrderStatus.PREPARING,
            [OrderStatus.PREPARING]: OrderStatus.READY,
            [OrderStatus.READY]: OrderStatus.OUT_FOR_DELIVERY,
            [OrderStatus.OUT_FOR_DELIVERY]: OrderStatus.COMPLETED,
        };
        return statusFlow[currentStatus] || null;
    };

    const stats = [
        { label: 'Total Orders', value: orders.length, icon: Package, color: 'text-orange-500', bg: 'bg-orange-50' },
        { label: 'Pending', value: orders.filter(o => o.status === OrderStatus.PENDING).length, icon: AlertCircle, color: 'text-yellow-600', bg: 'bg-yellow-50' },
        { label: 'In Progress', value: orders.filter(o => (['ACCEPTED', 'PREPARING', 'READY', 'OUT_FOR_DELIVERY'] as string[]).includes(o.status)).length, icon: TrendingUp, color: 'text-blue-500', bg: 'bg-blue-50' },
        { label: 'Completed', value: orders.filter(o => o.status === OrderStatus.COMPLETED).length, icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    ];

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Orders Management</h2>
                    <p className="text-gray-500">Track and manage all customer orders in real-time</p>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {stats.map((stat) => (
                        <Card key={stat.label} className="border-none shadow-sm hover:shadow-md transition-shadow">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                                        <h3 className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</h3>
                                    </div>
                                    <div className={`p-3 rounded-xl ${stat.bg}`}>
                                        <stat.icon className={`h-6 w-6 ${stat.color}`} />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Orders Grid/List */}
                <div className="space-y-4">
                    {loading ? (
                        <div className="py-20 text-center text-gray-500 italic">Finding orders...</div>
                    ) : orders.length === 0 ? (
                        <Card className="border-none bg-gray-50/50">
                            <CardContent className="py-16 text-center">
                                <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-500 font-medium text-lg">No orders found</p>
                                <p className="text-gray-400 text-sm">When customers place orders, they will appear here.</p>
                            </CardContent>
                        </Card>
                    ) : (
                        orders.map((order) => (
                            <Card key={order.id} className="border-none shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden bg-white">
                                <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-gray-100">
                                    {/* Primary Info */}
                                    <div className="p-6 flex-1">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold">
                                                    #{order.id.slice(-4).toUpperCase()}
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-gray-900">{order.clientFirstName} {order.clientLastName}</h4>
                                                    <p className="text-xs text-gray-400 flex items-center gap-1">
                                                        <Clock className="h-3 w-3" /> {new Date(order.createdAt).toLocaleString()}
                                                    </p>
                                                </div>
                                            </div>
                                            <Badge variant="outline" className={`rounded-full px-3 py-0.5 text-xs font-semibold uppercase tracking-wider ${getStatusStyles(order.status)}`}>
                                                {order.status}
                                            </Badge>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <Store className="h-4 w-4 text-orange-400" />
                                                <span className="font-medium">{order.restaurantName}</span>
                                            </div>
                                            <div className="flex items-start gap-2 text-sm text-gray-400">
                                                <MapPin className="h-4 w-4 mt-0.5 text-gray-300" />
                                                <span className="line-clamp-1 italic text-xs">Lat: {order.deliveryLocation.coordinates[1].toFixed(4)}, Lng: {order.deliveryLocation.coordinates[0].toFixed(4)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action & Pricing Center */}
                                    <div className="p-6 md:w-80 bg-gray-50/30 flex flex-col justify-between gap-4">
                                        <div className="flex items-end justify-between">
                                            <p className="text-sm font-medium text-gray-500">Total Price</p>
                                            <div className="text-right">
                                                <p className="text-xl font-black text-emerald-600">{order.total.toFixed(2)} DZD</p>
                                                <p className="text-[10px] text-gray-400">incl. delivery {order.deliveryFee} DZD</p>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            {order.driverId ? (
                                                <div className="flex items-center gap-2 p-2 bg-emerald-50 rounded-lg border border-emerald-100">
                                                    <UserIcon className="h-4 w-4 text-emerald-600" />
                                                    <span className="text-xs font-semibold text-emerald-700">Driver: {order.driverFirstName} {order.driverLastName}</span>
                                                </div>
                                            ) : (
                                                <div className="flex gap-2">
                                                    {selectedOrder === order.id ? (
                                                        <div className="flex flex-col w-full gap-2">
                                                            <select
                                                                className="w-full text-xs h-9 rounded-md border border-gray-200 bg-white px-3 focus:outline-none focus:ring-1 focus:ring-orange-500"
                                                                value={selectedDriver}
                                                                onChange={(e) => setSelectedDriver(e.target.value)}
                                                            >
                                                                <option value="">Choose Driver...</option>
                                                                {drivers.map(d => <option key={d.id} value={d.id}>{d.firstName} {d.lastName}</option>)}
                                                            </select>
                                                            <div className="flex gap-2">
                                                                <Button size="sm" className="flex-1 bg-orange-500 hover:bg-orange-600 text-white" onClick={() => handleAssignDriver(order.id)}>Assign</Button>
                                                                <Button size="sm" variant="outline" className="flex-1" onClick={() => setSelectedOrder(null)}>X</Button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <Button size="sm" variant="outline" className="w-full text-xs h-9 border-orange-200 text-orange-600 hover:bg-orange-50" onClick={() => setSelectedOrder(order.id)}>
                                                            <UserIcon className="h-3 w-3 mr-2" /> Assign Driver
                                                        </Button>
                                                    )}
                                                </div>
                                            )}

                                            <div className="flex gap-2">
                                                {getNextStatus(order.status) && (
                                                    <Button
                                                        size="sm"
                                                        className="flex-1 bg-gray-900 border-none hover:bg-orange-600 text-white transition-all transform hover:scale-[1.02]"
                                                        onClick={() => handleUpdateStatus(order.id, getNextStatus(order.status)!)}
                                                    >
                                                        Next Step <ChevronRight className="h-3 w-3 ml-1" />
                                                    </Button>
                                                )}
                                                <button
                                                    onClick={() => handleDeleteOrder(order.id)}
                                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        ))
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default OrdersPage;
import { Store } from 'lucide-react';

