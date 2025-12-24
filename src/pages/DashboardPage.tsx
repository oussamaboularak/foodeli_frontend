import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import DashboardLayout from '@/components/DashboardLayout';
import { Store, Users, DollarSign, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ordersApi } from '@/api/orders';
import { usersApi } from '@/api/users';
import { restaurantsApi } from '@/api/restaurants';
import type { Order } from '@/types/order';

/** 
 * CUSTOM HOOK: useDashboardData
 * Handles sequential fetching and data transformation to keep the UI clean.
 */
function useDashboardData() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalOrders: 0, activeUsers: 0, totalRestaurants: 0, revenue: 0 });
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [topRestaurants, setTopRestaurants] = useState<any[]>([]);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const safe = async <T,>(p: Promise<T>, f: T): Promise<T> => { try { return await p; } catch { return f; } };

      try {
        // Fetch sequentially to prevent backend 500 errors
        const orders = await safe(ordersApi.getAll(), []);
        const users = await safe(usersApi.getAll(), []);
        const restaurants = await safe(restaurantsApi.getAll(), []);

        // Aggregate Stats
        const revenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
        setStats({ totalOrders: orders.length, activeUsers: users.length, totalRestaurants: restaurants.length, revenue });

        // Transform Recent Orders
        setRecentOrders([...orders]
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 5));

        // Rank Restaurants
        const revMap = new Map();
        const countMap = new Map();
        orders.forEach(o => {
          revMap.set(o.restaurantId, (revMap.get(o.restaurantId) || 0) + (o.total || 0));
          countMap.set(o.restaurantId, (countMap.get(o.restaurantId) || 0) + 1);
        });

        setTopRestaurants(restaurants
          .map(r => ({ id: r.id, name: r.name, revenue: revMap.get(r.id) || 0, orders: countMap.get(r.id) || 0 }))
          .sort((a, b) => b.revenue - a.revenue)
          .slice(0, 5)
          .map((r, i) => ({ ...r, rank: i + 1 })));
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return { loading, stats, recentOrders, topRestaurants };
}

const DashboardPage: React.FC = () => {
  const { loading, stats, recentOrders, topRestaurants } = useDashboardData();
  const navigate = useNavigate();

  const statCards = useMemo(() => [
    { title: 'Total Orders', value: stats.totalOrders.toLocaleString(), icon: ShoppingBag },
    { title: 'Active Users', value: stats.activeUsers.toLocaleString(), icon: Users },
    { title: 'Restaurants', value: stats.totalRestaurants.toLocaleString(), icon: Store },
    { title: 'Revenue', value: `DZD ${stats.revenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, trend: '+15.3%', icon: DollarSign },
  ], [stats]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Dashboard</h2>
          <p className="text-sm sm:text-base text-gray-500">Welcome back! Here's what's happening today.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat, idx) => (
            <StatCard key={idx} {...stat} />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RecentOrdersCard loading={loading} orders={recentOrders} onViewAll={() => navigate('/orders')} />
          <TopRestaurantsCard loading={loading} restaurants={topRestaurants} onViewAll={() => navigate('/restaurants')} />
        </div>
      </div>
    </DashboardLayout>
  );
};

/* SUB-COMPONENTS */

const StatCard = ({ title, value }: { title: string; value: string }) => (
  <Card className="border-none shadow-sm hover:shadow-md transition-shadow">
    <CardContent className="p-4 sm:p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs sm:text-sm font-medium text-gray-500">{title}</p>
          <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1 sm:mt-2">{value}</h3>
        </div>
      </div>

    </CardContent>
  </Card>
);

const RecentOrdersCard = ({ loading, orders, onViewAll }: any) => (
  <Card className="border-none shadow-sm">
    <div className="p-4 sm:p-6 flex items-center justify-between border-b border-gray-100">
      <h3 className="font-bold text-gray-900 text-base sm:text-lg">Recent Orders</h3>
      <Button variant="ghost" size="sm" className="text-orange-500 hover:bg-orange-50 text-xs sm:text-sm" onClick={onViewAll}>View all</Button>
    </div>
    <CardContent className="p-0">
      <div className="divide-y divide-gray-50">
        {loading ? (
          <div className="p-6 sm:p-8 text-center text-gray-500 text-sm">Loading orders...</div>
        ) : orders.length === 0 ? (
          <div className="p-6 sm:p-8 text-center text-gray-500 text-sm">No orders yet.</div>
        ) : (
          orders.map((order: any) => (
            <div key={order.id} className="p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 hover:bg-gray-50 transition-colors cursor-pointer">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-xs sm:text-sm flex-shrink-0">
                  {order.clientFirstName?.[0] || 'U'}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-gray-900 text-sm sm:text-base truncate">{order.clientFirstName} {order.clientLastName}</p>
                  <p className="text-xs sm:text-sm text-gray-500 truncate">{order.restaurantName}</p>
                </div>
              </div>
              <div className="flex items-center justify-between sm:text-right sm:block pl-11 sm:pl-0">
                <p className="font-bold text-gray-900 text-sm sm:text-base">DZD {(order.total || 0).toFixed(2)}</p>
                <div className="flex items-center gap-2 mt-0 sm:mt-1 sm:justify-end">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                  <span className="text-[10px] text-gray-400">
                    {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </CardContent>
  </Card>
);

const TopRestaurantsCard = ({ loading, restaurants, onViewAll }: any) => (
  <Card className="border-none shadow-sm">
    <div className="p-4 sm:p-6 flex items-center justify-between border-b border-gray-100">
      <h3 className="font-bold text-gray-900 text-base sm:text-lg">Top Restaurants</h3>
      <Button variant="ghost" size="sm" className="text-orange-500 hover:bg-orange-50 text-xs sm:text-sm" onClick={onViewAll}>View all</Button>
    </div>
    <CardContent className="p-0">
      <div className="divide-y divide-gray-50">
        {loading ? (
          <div className="p-6 sm:p-8 text-center text-gray-500 text-sm">Loading restaurants...</div>
        ) : restaurants.length === 0 ? (
          <div className="p-6 sm:p-8 text-center text-gray-500 text-sm">No restaurants yet.</div>
        ) : (
          restaurants.map((r: any) => (
            <div key={r.id} className="p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center font-bold text-gray-400 bg-gray-50 rounded-lg text-xs flex-shrink-0">{r.rank}</div>
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-orange-50 flex items-center justify-center text-orange-600 flex-shrink-0"><Store className="h-4 w-4 sm:h-5 sm:w-5" /></div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-gray-900 text-sm sm:text-base truncate">{r.name}</p>
                  <p className="text-xs sm:text-sm text-gray-500">{r.orders} orders</p>
                </div>
              </div>
              <div className="sm:text-right pl-14 sm:pl-0">
                <p className="font-bold text-gray-900 text-sm sm:text-base">DZD {r.revenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                <p className="text-xs text-gray-400">revenue</p>
              </div>
            </div>
          ))
        )}
      </div>
    </CardContent>
  </Card>
);

const getStatusColor = (s: string) => {
  if (['DELIVERED', 'COMPLETED'].includes(s)) return 'bg-emerald-100 text-emerald-700';
  if (['PREPARING', 'ACCEPTED', 'READY', 'OUT_FOR_DELIVERY'].includes(s)) return 'bg-orange-100 text-orange-700';
  if (s === 'PENDING') return 'bg-yellow-100 text-yellow-700';
  if (['CANCELLED', 'REJECTED'].includes(s)) return 'bg-red-100 text-red-700';
  return 'bg-gray-100 text-gray-700';
};

export default DashboardPage;

