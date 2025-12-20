import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
    Home, Store, Package, Users, LogOut, Truck, Menu
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface LayoutProps {
    children: React.ReactNode;
}

const DashboardLayout: React.FC<LayoutProps> = ({ children }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { logout, user } = useAuth();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const navItems = [
        { path: '/dashboard', icon: Home, label: 'Dashboard' },
        { path: '/restaurants', icon: Store, label: 'Restaurants' },
        { path: '/orders', icon: Package, label: 'Orders' },
        { path: '/users', icon: Users, label: 'Users' },
        { path: '/delivery', icon: Truck, label: 'Delivery' },
    ];

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const isActive = (path: string) => location.pathname === path;

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar */}
            <aside
                className={`
                    fixed inset-y-0 left-0 z-50 bg-[#1a1c23] text-gray-400 transition-all duration-300 ease-in-out
                    ${isSidebarOpen ? 'w-64' : 'w-20'} 
                    hidden md:flex flex-col border-r border-gray-800
                `}
            >
                {/* Logo */}
                <div className="h-16 flex items-center px-6 border-b border-gray-800">
                    <div className="flex items-center gap-3 text-white">
                        <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                            <span className="font-bold text-lg">F</span>
                        </div>
                        {isSidebarOpen && <span className="font-bold text-xl tracking-tight">Foodeli</span>}
                    </div>
                </div>

                {/* Nav Items */}
                <nav className="flex-1 py-6 px-3 space-y-1">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const active = isActive(item.path);
                        return (
                            <button
                                key={item.path}
                                onClick={() => navigate(item.path)}
                                className={`
                                    w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 group
                                    ${active
                                        ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'
                                        : 'hover:bg-gray-800 hover:text-white'
                                    }
                                `}
                            >
                                <Icon className={`h-5 w-5 ${active ? 'text-white' : 'text-gray-400 group-hover:text-white'}`} />
                                {isSidebarOpen && (
                                    <span className="font-medium">{item.label}</span>
                                )}
                            </button>
                        );
                    })}
                </nav>

                {/* User Profile Snippet (Bottom Sidebar) */}
                <div className="p-4 border-t border-gray-800">
                    <div className={`flex items-center gap-3 ${isSidebarOpen ? '' : 'justify-center'}`}>
                        <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-white font-medium">
                            {user?.firstName?.charAt(0) || 'A'}
                        </div>
                        {isSidebarOpen && (
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-white truncate">
                                    {user?.firstName} {user?.lastName}
                                </p>
                                <p className="text-xs text-gray-500 truncate">Admin</p>
                            </div>
                        )}
                        {isSidebarOpen && (
                            <button
                                onClick={handleLogout}
                                className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-full transition-colors"
                            >
                                <LogOut className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${isSidebarOpen ? 'md:ml-64' : 'md:ml-20'}`}>
                {/* Top Header */}
                <header className="h-16 bg-white border-b border-gray-200 sticky top-0 z-40 px-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg hidden md:block"
                        >
                            <Menu className="h-5 w-5" />
                        </button>

                        {/* Mobile Menu Toggle (Visible only on small screens) */}
                        <div className="md:hidden flex items-center gap-2">
                            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center text-white">
                                <span className="font-bold">F</span>
                            </div>
                            <span className="font-bold text-gray-900">Foodeli</span>
                        </div>


                    </div>

                    <div className="flex items-center gap-4">

                        {/* Mobile Logout (only visible on mobile) */}
                        <Button variant="ghost" size="sm" onClick={handleLogout} className="md:hidden text-red-600">
                            <LogOut className="h-4 w-4" />
                        </Button>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 p-6 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
