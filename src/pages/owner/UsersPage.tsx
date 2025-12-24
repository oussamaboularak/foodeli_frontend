import React, { useEffect, useState } from 'react';
import { usersApi } from '@/api/users';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import DashboardLayout from '@/components/DashboardLayout';
import { UserRole } from '@/types/user';
import type { User, CreateUserPayload } from '@/types/user';
import { Users as UsersIcon, Plus, X, Trash2, Edit, UserCircle, Phone, Shield, Search } from 'lucide-react';

const UsersPage: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        phone: '',
        password: '',
        role: UserRole.CLIENT,
    });

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            setLoading(true);
            const data = await usersApi.getAll();
            setUsers(data);
        } catch (error) {
            console.error('Failed to load users:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingUser) {
                const updatePayload: any = {
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    phone: formData.phone,
                    role: formData.role,
                };
                if (formData.password) {
                    updatePayload.password = formData.password;
                }
                await usersApi.update(editingUser.id, updatePayload);
            } else {
                const createPayload: CreateUserPayload = {
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    phone: formData.phone,
                    password: formData.password,
                    role: formData.role,
                };
                await usersApi.create(createPayload);
            }
            setShowForm(false);
            setEditingUser(null);
            setFormData({ firstName: '', lastName: '', phone: '', password: '', role: UserRole.CLIENT });
            loadUsers();
        } catch (error) {
            console.error('Failed to save user:', error);
        }
    };

    const handleEdit = (user: User) => {
        setEditingUser(user);
        setFormData({
            firstName: user.firstName,
            lastName: user.lastName,
            phone: user.phone,
            password: '',
            role: user.role,
        });
        setShowForm(true);
    };

    const handleDelete = async (userId: string) => {
        if (!confirm('Are you sure you want to delete this user?')) return;
        try {
            await usersApi.delete(userId);
            loadUsers();
        } catch (error) {
            console.error('Failed to delete user:', error);
        }
    };

    const handleCancel = () => {
        setShowForm(false);
        setEditingUser(null);
        setFormData({ firstName: '', lastName: '', phone: '', password: '', role: UserRole.CLIENT });
    };

    const getRoleStyles = (role: UserRole) => {
        switch (role) {
            case UserRole.OWNER:
                return 'bg-purple-50 text-purple-600 border-purple-100';
            case UserRole.DRIVER:
                return 'bg-blue-50 text-blue-600 border-blue-100';
            case UserRole.RESTAURANT:
                return 'bg-orange-50 text-orange-600 border-orange-100';
            case UserRole.CLIENT:
                return 'bg-emerald-50 text-emerald-600 border-emerald-100';
            default:
                return 'bg-gray-50 text-gray-600 border-gray-100';
        }
    };

    const filteredUsers = users.filter(user =>
        `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.phone.includes(searchQuery)
    );

    const stats = [
        { label: 'Total Users', value: users.length, icon: UsersIcon, color: 'text-gray-900', bg: 'bg-gray-100' },
        { label: 'Clients', value: users.filter(u => u.role === 'CLIENT').length, icon: UserCircle, color: 'text-emerald-500', bg: 'bg-emerald-50' },
        { label: 'Drivers', value: users.filter(u => u.role === 'DRIVER').length, icon: Shield, color: 'text-blue-500', bg: 'bg-blue-50' },
        { label: 'Admin/Staff', value: users.filter(u => ['OWNER', 'RESTAURANT'].includes(u.role)).length, icon: Shield, color: 'text-orange-500', bg: 'bg-orange-50' },
    ];

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Users Management</h2>
                        <p className="text-gray-500">Manage system roles and customer accounts</p>
                    </div>
                    <Button
                        onClick={() => setShowForm(true)}
                        className="bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-200 transition-all font-semibold px-6"
                    >
                        <Plus className="h-5 w-5 mr-2" /> Add New User
                    </Button>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {stats.map((stat) => (
                        <Card key={stat.label} className="border-none shadow-sm">
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

                {/* Search and Filters */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        placeholder="Search users by name or phone..."
                        className="pl-10 h-11 bg-white border-gray-100 shadow-sm focus:ring-orange-500"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                {/* Users List */}
                <div className="space-y-4">
                    {loading ? (
                        <div className="py-20 text-center text-gray-400 italic">Fetching users...</div>
                    ) : filteredUsers.length === 0 ? (
                        <Card className="border-none bg-gray-50/50">
                            <CardContent className="py-20 text-center">
                                <UsersIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-500 font-medium">No users found matching your search</p>
                            </CardContent>
                        </Card>
                    ) : (
                        filteredUsers.map((user) => (
                            <Card key={user.id} className="border-none shadow-sm hover:shadow-lg transition-all duration-200 group overflow-hidden bg-white">
                                <div className={`h-1 w-full flex-shrink-0 ${user.role === 'OWNER' ? 'bg-purple-400' : 'bg-orange-400'}`} />
                                <div className="flex items-center p-6">
                                    {/* Avatar */}
                                    <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-orange-50 group-hover:text-orange-500 transition-colors flex-shrink-0">
                                        <UserCircle className="h-10 w-10" />
                                    </div>

                                    {/* User Info */}
                                    <div className="flex-1 ml-6">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h4 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                                {user.firstName} {user.lastName}
                                                {user.role === 'OWNER' && <Shield className="h-4 w-4 text-purple-500" />}
                                            </h4>
                                            <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getRoleStyles(user.role)}`}>
                                                {user.role}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-gray-500">
                                            <Phone className="h-4 w-4" />
                                            {user.phone}
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-2 ml-4">
                                        <Button variant="outline" size="sm" className="h-9 px-4 rounded-lg hover:bg-orange-50 hover:text-orange-600 hover:border-orange-100" onClick={() => handleEdit(user)}>
                                            <Edit className="h-4 w-4 mr-1.5" /> Edit
                                        </Button>
                                        <Button variant="outline" size="sm" className="h-9 w-9 rounded-lg hover:bg-red-50 hover:text-red-600 hover:border-red-100 p-0" onClick={() => handleDelete(user.id)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        ))
                    )}
                </div>
            </div>

            {/* Modal Form */}
            {showForm && (
                <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <Card className="w-full max-w-lg shadow-2xl border-none animate-in fade-in zoom-in-95 duration-200 bg-white scale-100">
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                            <h3 className="text-xl font-bold text-gray-900">{editingUser ? 'Edit User Details' : 'Register New User'}</h3>
                            <button onClick={handleCancel} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X className="h-5 w-5 text-gray-500" /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">First Name</label>
                                    <Input required value={formData.firstName} onChange={e => setFormData({ ...formData, firstName: e.target.value })} placeholder="e.g. Sami" className="h-11 bg-gray-50/50 border-gray-100" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Last Name</label>
                                    <Input required value={formData.lastName} onChange={e => setFormData({ ...formData, lastName: e.target.value })} placeholder="e.g. Alaoui" className="h-11 bg-gray-50/50 border-gray-100" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Phone Number</label>
                                <Input required pattern="[0-9]{10}" maxLength={10} value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '') })} placeholder="06XXXXXXXX" className="h-11 bg-gray-50/50 border-gray-100" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Password {editingUser && '(optional)'}</label>
                                <Input type="password" required={!editingUser} minLength={6} value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} placeholder="••••••••" className="h-11 bg-gray-50/50 border-gray-100" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Account Role</label>
                                <select
                                    className="w-full h-11 px-3 rounded-md border border-gray-100 bg-gray-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    value={formData.role}
                                    onChange={e => setFormData({ ...formData, role: e.target.value as UserRole })}
                                >
                                    <option value="CLIENT">Client (Customer)</option>
                                    <option value="DRIVER">Driver (Delivery)</option>
                                    <option value="RESTAURANT">Restaurant Manager</option>
                                    <option value="OWNER">System Admin</option>
                                </select>
                            </div>
                            <div className="flex gap-4 pt-4">
                                <Button type="button" variant="ghost" onClick={handleCancel} className="flex-1 h-11 font-semibold text-gray-500">Cancel</Button>
                                <Button type="submit" className="flex-1 h-11 bg-gray-900 border-none hover:bg-orange-600 text-white font-bold transition-all">
                                    {editingUser ? 'Save Changes' : 'Create Account'}
                                </Button>
                            </div>
                        </form>
                    </Card>
                </div>
            )}
        </DashboardLayout>
    );
};

export default UsersPage;

