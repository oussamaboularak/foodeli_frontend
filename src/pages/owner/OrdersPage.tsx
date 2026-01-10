import { useEffect, useState } from 'react';
import type { User } from '@/types/user';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import DashboardLayout from '@/components/DashboardLayout';
import { OrderStatus } from '@/types/order';
import type { Order } from '@/types/order';

import { Package, MapPin, User as UserIcon, Clock, Trash2, TrendingUp, ChevronRight, CheckCircle2, AlertCircle, Eye, Copy, X } from 'lucide-react';

const OrdersPage: React.FC = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [drivers, setDrivers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
    const [selectedDriver, setSelectedDriver] = useState<string>('');
    const [previewOrder, setPreviewOrder] = useState<Order | null>(null);
    const [copySuccess, setCopySuccess] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);

            // Mock Orders Data
            const mockOrders: Order[] = [
                {
                    id: '1a2b3c4d-5e6f-7g8h-9i0j-k1l2m3n4o5p6',
                    clientId: 'client-001',
                    clientFirstName: 'Ahmed',
                    clientLastName: 'Benali',
                    driverId: 'driver-001',
                    driverFirstName: 'Karim',
                    driverLastName: 'Meziane',
                    restaurantId: 'rest-001',
                    restaurantName: 'Pizza Palace',
                    deliveryLocation: {
                        type: 'Point',
                        coordinates: [6.273320, 36.755544]
                    },
                    subtotal: 1200,
                    deliveryFee: 150,
                    tax: 50,
                    total: 1400,
                    status: OrderStatus.OUT_FOR_DELIVERY,
                    createdAt: new Date(Date.now() - 3600000).toISOString(),
                    updatedAt: new Date(Date.now() - 1800000).toISOString()
                },
                {
                    id: '2b3c4d5e-6f7g-8h9i-0j1k-l2m3n4o5p6q7',
                    clientId: 'client-002',
                    clientFirstName: 'Fatima',
                    clientLastName: 'Zahra',
                    restaurantId: 'rest-002',
                    restaurantName: 'Burger House',
                    deliveryLocation: {
                        type: 'Point',
                        coordinates: [6.288014, 36.757308]
                    },
                    subtotal: 850,
                    deliveryFee: 120,
                    tax: 40,
                    total: 1010,
                    status: OrderStatus.PENDING,
                    createdAt: new Date(Date.now() - 600000).toISOString(),
                    updatedAt: new Date(Date.now() - 600000).toISOString()
                },
                {
                    id: '3c4d5e6f-7g8h-9i0j-1k2l-m3n4o5p6q7r8',
                    clientId: 'client-003',
                    clientFirstName: 'Youssef',
                    clientLastName: 'Alami',
                    driverId: 'driver-002',
                    driverFirstName: 'Rachid',
                    driverLastName: 'Bouazza',
                    restaurantId: 'rest-003',
                    restaurantName: 'Sushi Express',
                    deliveryLocation: {
                        type: 'Point',
                        coordinates: [6.265432, 36.748901]
                    },
                    subtotal: 2100,
                    deliveryFee: 180,
                    tax: 85,
                    total: 2365,
                    status: OrderStatus.PREPARING,
                    createdAt: new Date(Date.now() - 1200000).toISOString(),
                    updatedAt: new Date(Date.now() - 900000).toISOString()
                },
                {
                    id: '4d5e6f7g-8h9i-0j1k-2l3m-n4o5p6q7r8s9',
                    clientId: 'client-004',
                    clientFirstName: 'Amina',
                    clientLastName: 'Kaddouri',
                    driverId: 'driver-003',
                    driverFirstName: 'Hassan',
                    driverLastName: 'Mokhtar',
                    restaurantId: 'rest-001',
                    restaurantName: 'Pizza Palace',
                    deliveryLocation: {
                        type: 'Point',
                        coordinates: [6.280123, 36.760234]
                    },
                    subtotal: 950,
                    deliveryFee: 130,
                    tax: 45,
                    total: 1125,
                    status: OrderStatus.COMPLETED,
                    createdAt: new Date(Date.now() - 7200000).toISOString(),
                    updatedAt: new Date(Date.now() - 3600000).toISOString()
                },
                {
                    id: '5e6f7g8h-9i0j-1k2l-3m4n-o5p6q7r8s9t0',
                    clientId: 'client-005',
                    clientFirstName: 'Omar',
                    clientLastName: 'Tazi',
                    restaurantId: 'rest-004',
                    restaurantName: 'Tacos Corner',
                    deliveryLocation: {
                        type: 'Point',
                        coordinates: [6.271890, 36.752345]
                    },
                    subtotal: 650,
                    deliveryFee: 100,
                    tax: 30,
                    total: 780,
                    status: OrderStatus.ACCEPTED,
                    createdAt: new Date(Date.now() - 900000).toISOString(),
                    updatedAt: new Date(Date.now() - 600000).toISOString()
                },
                {
                    id: '6f7g8h9i-0j1k-2l3m-4n5o-p6q7r8s9t0u1',
                    clientId: 'client-006',
                    clientFirstName: 'Salma',
                    clientLastName: 'Idrissi',
                    driverId: 'driver-001',
                    driverFirstName: 'Karim',
                    driverLastName: 'Meziane',
                    restaurantId: 'rest-002',
                    restaurantName: 'Burger House',
                    deliveryLocation: {
                        type: 'Point',
                        coordinates: [6.269876, 36.756789]
                    },
                    subtotal: 1450,
                    deliveryFee: 160,
                    tax: 65,
                    total: 1675,
                    status: OrderStatus.READY,
                    createdAt: new Date(Date.now() - 1500000).toISOString(),
                    updatedAt: new Date(Date.now() - 1200000).toISOString()
                }
            ];

            // Mock Drivers Data
            const mockDrivers: User[] = [
                {
                    id: 'driver-001',
                    firstName: 'Karim',
                    lastName: 'Meziane',
                    phone: '0661234567',
                    role: 'DRIVER' as any,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                },
                {
                    id: 'driver-002',
                    firstName: 'Rachid',
                    lastName: 'Bouazza',
                    phone: '0662345678',
                    role: 'DRIVER' as any,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                },
                {
                    id: 'driver-003',
                    firstName: 'Hassan',
                    lastName: 'Mokhtar',
                    phone: '0663456789',
                    role: 'DRIVER' as any,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                }
            ];

            setOrders(mockOrders);
            setDrivers(mockDrivers);
        } catch (error) {
            console.error('Failed to load orders or drivers:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAssignDriver = async (orderId: string) => {
        if (!selectedDriver) return;
        try {
            // Mock: Update local state
            setOrders(orders.map(order => {
                if (order.id === orderId) {
                    const driver = drivers.find(d => d.id === selectedDriver);
                    return {
                        ...order,
                        driverId: selectedDriver,
                        driverFirstName: driver?.firstName,
                        driverLastName: driver?.lastName
                    };
                }
                return order;
            }));
            setSelectedOrder(null);
            setSelectedDriver('');
        } catch (error) {
            console.error('Failed to assign driver:', error);
        }
    };

    const handleUpdateStatus = async (orderId: string, status: OrderStatus) => {
        try {
            // Mock: Update local state
            setOrders(orders.map(order =>
                order.id === orderId ? { ...order, status, updatedAt: new Date().toISOString() } : order
            ));
        } catch (error) {
            console.error('Failed to update status:', error);
        }
    };

    const handleDeleteOrder = async (orderId: string) => {
        if (!confirm('Are you sure you want to delete this order?')) return;
        try {
            // Mock: Remove from local state
            setOrders(orders.filter(order => order.id !== orderId));
        } catch (error) {
            console.error('Failed to delete order:', error);
        }
    };

    const handleCopyOrder = (order: Order) => {
        const orderDetails = `
Order ID: ${order.id}
Client: ${order.clientFirstName} ${order.clientLastName}
Restaurant: ${order.restaurantName}
Status: ${order.status}
Subtotal: ${order.subtotal.toFixed(2)} DZD
Delivery Fee: ${order.deliveryFee.toFixed(2)} DZD
Tax: ${order.tax.toFixed(2)} DZD
Total: ${order.total.toFixed(2)} DZD
Delivery Location: Lat ${order.deliveryLocation.coordinates[1].toFixed(6)}, Lng ${order.deliveryLocation.coordinates[0].toFixed(6)}
${order.driverId ? `Driver: ${order.driverFirstName} ${order.driverLastName}` : 'No driver assigned'}
Created: ${new Date(order.createdAt).toLocaleString()}
        `.trim();

        navigator.clipboard.writeText(orderDetails).then(() => {
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2000);
        }).catch(err => {
            console.error('Failed to copy:', err);
        });
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

                {/* Orders Data Grid */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    {loading ? (
                        <div className="py-20 text-center text-gray-500 italic">Finding orders...</div>
                    ) : orders.length === 0 ? (
                        <div className="py-16 text-center">
                            <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500 font-medium text-lg">No orders found</p>
                            <p className="text-gray-400 text-sm">When customers place orders, they will appear here.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Order ID
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Client
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Restaurant
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Driver
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Total
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
                                    {orders.map((order) => (
                                        <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-xs">
                                                        #{order.id.slice(-4).toUpperCase()}
                                                    </div>
                                                    <div className="text-xs text-gray-400 flex items-center gap-1">
                                                        <Clock className="h-3 w-3" />
                                                        {new Date(order.createdAt).toLocaleDateString()}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-bold text-gray-900">
                                                    {order.clientFirstName} {order.clientLastName}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2 text-sm text-gray-900">
                                                    <Store className="h-4 w-4 text-orange-400" />
                                                    {order.restaurantName}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {order.driverId ? (
                                                    <div className="flex items-center gap-2">
                                                        <UserIcon className="h-4 w-4 text-emerald-600" />
                                                        <span className="text-sm font-medium text-emerald-700">
                                                            {order.driverFirstName} {order.driverLastName}
                                                        </span>
                                                    </div>
                                                ) : selectedOrder === order.id ? (
                                                    <div className="flex flex-col gap-2 min-w-[180px]">
                                                        <select
                                                            className="w-full text-xs h-8 rounded-md border border-gray-200 bg-white px-2 focus:outline-none focus:ring-1 focus:ring-orange-500"
                                                            value={selectedDriver}
                                                            onChange={(e) => setSelectedDriver(e.target.value)}
                                                        >
                                                            <option value="">Choose Driver...</option>
                                                            {drivers.map(d => <option key={d.id} value={d.id}>{d.firstName} {d.lastName}</option>)}
                                                        </select>
                                                        <div className="flex gap-1">
                                                            <Button size="sm" className="flex-1 h-7 text-xs bg-orange-500 hover:bg-orange-600 text-white" onClick={() => handleAssignDriver(order.id)}>Assign</Button>
                                                            <Button size="sm" variant="outline" className="h-7 w-7 p-0 text-xs" onClick={() => setSelectedOrder(null)}>X</Button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="text-xs h-8 border-orange-200 text-orange-600 hover:bg-orange-50"
                                                        onClick={() => setSelectedOrder(order.id)}
                                                    >
                                                        <UserIcon className="h-3 w-3 mr-1" /> Assign
                                                    </Button>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-bold text-emerald-600">
                                                    {order.total.toFixed(2)} DZD
                                                </div>
                                                <div className="text-xs text-gray-400">
                                                    +{order.deliveryFee} delivery
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <Badge variant="outline" className={`rounded-full px-3 py-1 text-xs font-semibold uppercase ${getStatusStyles(order.status)}`}>
                                                    {order.status}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex justify-end gap-1">
                                                    {getNextStatus(order.status) && (
                                                        <button
                                                            onClick={() => handleUpdateStatus(order.id, getNextStatus(order.status)!)}
                                                            className="p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                                                            title="Next Step"
                                                        >
                                                            <ChevronRight className="h-4 w-4" />
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => setPreviewOrder(order)}
                                                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                        title="Preview Order"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleCopyOrder(order)}
                                                        className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                        title="Copy Order Details"
                                                    >
                                                        <Copy className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteOrder(order.id)}
                                                        className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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

                {/* Copy Success Notification */}
                {copySuccess && (
                    <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-in fade-in slide-in-from-top-2">
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-5 w-5" />
                            <span className="font-semibold">Order details copied to clipboard!</span>
                        </div>
                    </div>
                )}

                {/* Preview Order Modal */}
                {previewOrder && (
                    <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                        <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border-none animate-in fade-in zoom-in-95 duration-200 bg-white">
                            <div className="p-4 md:p-6 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-orange-50 to-white sticky top-0 z-10">
                                <div className="flex-1 min-w-0 mr-4">
                                    <h3 className="text-xl md:text-2xl font-bold text-gray-900">Order Details</h3>
                                    <p className="text-xs md:text-sm text-gray-500 mt-1 truncate">#{previewOrder.id.slice(-8).toUpperCase()}</p>
                                </div>
                                <button
                                    onClick={() => setPreviewOrder(null)}
                                    className="p-2 hover:bg-white rounded-full transition-colors flex-shrink-0"
                                >
                                    <X className="h-5 w-5 md:h-6 md:w-6 text-gray-500" />
                                </button>
                            </div>
                            <CardContent className="p-4 md:p-6 space-y-4 md:space-y-6">
                                {/* Client Info */}
                                <div className="space-y-2">
                                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Client Information</h4>
                                    <div className="flex items-center gap-3 p-3 md:p-4 bg-gray-50 rounded-lg">
                                        <UserIcon className="h-8 w-8 md:h-10 md:w-10 text-gray-400 flex-shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-gray-900 text-sm md:text-base break-words">{previewOrder.clientFirstName} {previewOrder.clientLastName}</p>
                                            <p className="text-xs md:text-sm text-gray-500 truncate">Client ID: {previewOrder.clientId}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Restaurant Info */}
                                <div className="space-y-2">
                                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Restaurant</h4>
                                    <div className="p-3 md:p-4 bg-orange-50 rounded-lg">
                                        <p className="font-bold text-orange-900 text-sm md:text-base break-words">{previewOrder.restaurantName}</p>
                                        <p className="text-xs md:text-sm text-orange-600 truncate">ID: {previewOrder.restaurantId}</p>
                                    </div>
                                </div>

                                {/* Driver Info */}
                                {previewOrder.driverId && (
                                    <div className="space-y-2">
                                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Assigned Driver</h4>
                                        <div className="p-3 md:p-4 bg-emerald-50 rounded-lg">
                                            <p className="font-bold text-emerald-900 text-sm md:text-base break-words">{previewOrder.driverFirstName} {previewOrder.driverLastName}</p>
                                            <p className="text-xs md:text-sm text-emerald-600 truncate">Driver ID: {previewOrder.driverId}</p>
                                        </div>
                                    </div>
                                )}

                                {/* Delivery Location */}
                                <div className="space-y-2">
                                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Delivery Location</h4>
                                    <div className="flex items-start gap-2 p-3 md:p-4 bg-blue-50 rounded-lg">
                                        <MapPin className="h-4 w-4 md:h-5 md:w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs md:text-sm text-blue-900 font-mono break-all">
                                                Lat: {previewOrder.deliveryLocation.coordinates[1].toFixed(6)}
                                            </p>
                                            <p className="text-xs md:text-sm text-blue-900 font-mono break-all">
                                                Lng: {previewOrder.deliveryLocation.coordinates[0].toFixed(6)}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Pricing Breakdown */}
                                <div className="space-y-2">
                                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Pricing Details</h4>
                                    <div className="p-3 md:p-4 bg-gray-50 rounded-lg space-y-2">
                                        <div className="flex justify-between text-xs md:text-sm gap-2">
                                            <span className="text-gray-600">Subtotal</span>
                                            <span className="font-semibold text-gray-900 text-right">{previewOrder.subtotal.toFixed(2)} DZD</span>
                                        </div>
                                        <div className="flex justify-between text-xs md:text-sm gap-2">
                                            <span className="text-gray-600">Delivery Fee</span>
                                            <span className="font-semibold text-gray-900 text-right">{previewOrder.deliveryFee.toFixed(2)} DZD</span>
                                        </div>
                                        <div className="flex justify-between text-xs md:text-sm gap-2">
                                            <span className="text-gray-600">Tax</span>
                                            <span className="font-semibold text-gray-900 text-right">{previewOrder.tax.toFixed(2)} DZD</span>
                                        </div>
                                        <div className="pt-2 border-t border-gray-200 flex justify-between gap-2">
                                            <span className="font-bold text-gray-900 text-sm md:text-base">Total</span>
                                            <span className="font-bold text-lg md:text-xl text-emerald-600 text-right">{previewOrder.total.toFixed(2)} DZD</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Status & Timestamps */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Status</h4>
                                        <Badge variant="outline" className={`rounded-full px-3 py-1 text-xs font-semibold uppercase ${getStatusStyles(previewOrder.status)}`}>
                                            {previewOrder.status}
                                        </Badge>
                                    </div>
                                    <div className="space-y-2">
                                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Created</h4>
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <Clock className="h-4 w-4" />
                                            {new Date(previewOrder.createdAt).toLocaleString()}
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-3 pt-4">
                                    <Button
                                        onClick={() => handleCopyOrder(previewOrder)}
                                        className="flex-1 bg-green-500 hover:bg-green-600 text-white"
                                    >
                                        <Copy className="h-4 w-4 mr-2" />
                                        Copy Details
                                    </Button>
                                    <Button
                                        onClick={() => setPreviewOrder(null)}
                                        variant="outline"
                                        className="flex-1"
                                    >
                                        Close
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default OrdersPage;
import { Store } from 'lucide-react';

