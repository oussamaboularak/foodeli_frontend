import React, { useEffect, useState } from 'react';
import { menuApi } from '@/api/menu';
import type { MenuItem, MenuOptionGroup, MenuOption, MenuOptionGroupFormData, MenuOptionFormData } from '@/types/menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Plus, X, Trash2, Edit, Check, ChevronRight, Settings2 } from 'lucide-react';

interface MenuOptionsManagementProps {
    menuItem: MenuItem;
    onClose: () => void;
}

export const MenuOptionsManagement: React.FC<MenuOptionsManagementProps> = ({ menuItem, onClose }) => {
    const [groups, setGroups] = useState<MenuOptionGroup[]>([]);
    const [selectedGroup, setSelectedGroup] = useState<MenuOptionGroup | null>(null);
    const [options, setOptions] = useState<MenuOption[]>([]);
    const [loading, setLoading] = useState(false);

    // Form States
    const [showGroupForm, setShowGroupForm] = useState(false);
    const [editingGroup, setEditingGroup] = useState<MenuOptionGroup | null>(null);
    const [groupForm, setGroupForm] = useState<MenuOptionGroupFormData>({
        name: '',
        description: '',
        itemId: menuItem.id,
        isRequired: false,
        minSelect: 0,
        maxSelect: 1,
    });

    const [showOptionForm, setShowOptionForm] = useState(false);
    const [editingOption, setEditingOption] = useState<MenuOption | null>(null);
    const [optionForm, setOptionForm] = useState<MenuOptionFormData>({
        name: '',
        priceAdjustment: 0,
        groupId: '',
    });

    useEffect(() => {
        loadGroups();
    }, [menuItem.id]);

    useEffect(() => {
        if (selectedGroup) {
            loadOptions(selectedGroup.id);
        } else {
            setOptions([]);
        }
    }, [selectedGroup]);

    const loadGroups = async () => {
        try {
            const data = await menuApi.getOptionGroups(menuItem.id);
            setGroups(data);
        } catch (error) {
            console.error('Failed to load option groups:', error);
        }
    };

    const loadOptions = async (groupId: string) => {
        try {
            const data = await menuApi.getOptions(groupId);
            setOptions(data);
        } catch (error) {
            console.error('Failed to load options:', error);
        }
    };

    // --- Group Handlers ---

    const handleGroupSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingGroup) {
                await menuApi.updateOptionGroup(editingGroup.id, groupForm);
            } else {
                await menuApi.createOptionGroup(groupForm);
            }
            setShowGroupForm(false);
            setEditingGroup(null);
            setGroupForm({
                name: '',
                description: '',
                itemId: menuItem.id,
                isRequired: false,
                minSelect: 0,
                maxSelect: 1,
            });
            loadGroups();
        } catch (error) {
            console.error('Failed to save group:', error);
            alert('Failed to save option group');
        }
    };

    const handleEditGroup = (group: MenuOptionGroup) => {
        setEditingGroup(group);
        setGroupForm({
            name: group.name,
            description: group.description || '',
            itemId: menuItem.id,
            isRequired: group.isRequired || false,
            minSelect: group.min_selections,
            maxSelect: group.max_selections,
        });
        setShowGroupForm(true);
    };

    const handleDeleteGroup = async (group: MenuOptionGroup) => {
        if (!confirm(`Delete group "${group.name}" and all its options?`)) return;
        try {
            await menuApi.deleteOptionGroup(group.id);
            if (selectedGroup?.id === group.id) setSelectedGroup(null);
            loadGroups();
        } catch (error) {
            console.error('Failed to delete group:', error);
            alert('Failed to delete group');
        }
    };

    // --- Option Handlers ---

    const handleOptionSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedGroup) return;
        try {
            const payload = { ...optionForm, groupId: selectedGroup.id };
            if (editingOption) {
                await menuApi.updateOption(editingOption.id, payload);
            } else {
                await menuApi.createOption(payload);
            }
            setShowOptionForm(false);
            setEditingOption(null);
            setOptionForm({ name: '', priceAdjustment: 0, groupId: selectedGroup.id });
            loadOptions(selectedGroup.id);
        } catch (error) {
            console.error('Failed to save option:', error);
            alert('Failed to save option');
        }
    };

    const handleEditOption = (option: MenuOption) => {
        setEditingOption(option);
        setOptionForm({
            name: option.name,
            priceAdjustment: option.priceAdjustment,
            groupId: option.groupId,
        });
        setShowOptionForm(true);
    };

    const handleDeleteOption = async (optionId: string) => {
        if (!confirm('Delete this option?')) return;
        try {
            await menuApi.deleteOption(optionId);
            if (selectedGroup) loadOptions(selectedGroup.id);
        } catch (error) {
            console.error('Failed to delete option:', error);
            alert('Failed to delete option');
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
            <Card className="w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl border-0">
                <div className="h-2 bg-gradient-to-r from-purple-500 to-pink-500" />
                <CardHeader className="flex flex-row items-center justify-between pb-4 border-b">
                    <div>
                        <CardTitle className="text-xl">Manage Options: {menuItem.name}</CardTitle>
                        <CardDescription>Configure sizes, toppings, and extras</CardDescription>
                    </div>
                    <Button variant="ghost" size="icon" onClick={onClose}>
                        <X className="h-5 w-5" />
                    </Button>
                </CardHeader>

                <div className="flex flex-1 overflow-hidden">
                    {/* Left Sidebar: Groups */}
                    <div className="w-1/3 border-r bg-gray-50 flex flex-col overflow-y-auto">
                        <div className="p-4 border-b bg-white sticky top-0 z-10">
                            <Button
                                className="w-full bg-white text-purple-600 border-2 border-purple-100 hover:bg-purple-50 hover:border-purple-200"
                                onClick={() => {
                                    setEditingGroup(null);
                                    setGroupForm({
                                        name: '',
                                        description: '',
                                        itemId: menuItem.id,
                                        isRequired: false,
                                        minSelect: 0,
                                        maxSelect: 1,
                                    });
                                    setShowGroupForm(true);
                                }}
                            >
                                <Plus className="h-4 w-4 mr-2" /> Add Group
                            </Button>
                        </div>
                        <div className="p-2 space-y-2">
                            {groups.map(group => (
                                <div
                                    key={group.id}
                                    onClick={() => setSelectedGroup(group)}
                                    className={`p-3 rounded-lg cursor-pointer transition-all border ${selectedGroup?.id === group.id
                                        ? 'bg-purple-50 border-purple-200 shadow-sm'
                                        : 'bg-white border-transparent hover:bg-gray-100 hover:border-gray-200'
                                        }`}
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <h4 className={`font-semibold ${selectedGroup?.id === group.id ? 'text-purple-700' : 'text-gray-700'}`}>
                                            {group.name}
                                        </h4>
                                        {selectedGroup?.id === group.id && (
                                            <div className="flex gap-1">
                                                <Button size="icon" variant="ghost" className="h-6 w-6" onClick={(e) => { e.stopPropagation(); handleEditGroup(group); }}>
                                                    <Edit className="h-3 w-3" />
                                                </Button>
                                                <Button size="icon" variant="ghost" className="h-6 w-6 text-red-500 hover:text-red-600" onClick={(e) => { e.stopPropagation(); handleDeleteGroup(group); }}>
                                                    <Trash2 className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-xs text-gray-500 line-clamp-1">{group.description}</p>
                                    <div className="flex gap-2 mt-2 text-xs text-gray-400">
                                        <span className="bg-gray-100 px-1.5 py-0.5 rounded">
                                            {group.isRequired ? 'Required' : 'Optional'}
                                        </span>
                                        <span>Min: {group.min_selections}</span>
                                        <span>Max: {group.max_selections}</span>
                                    </div>
                                </div>
                            ))}
                            {groups.length === 0 && (
                                <div className="text-center py-8 text-gray-400 text-sm px-4">
                                    No option groups. Click "Add Group" to start (e.g., "Size", "Sauce").
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Content: Options or Forms */}
                    <div className="flex-1 p-6 overflow-y-auto bg-white">
                        {showGroupForm ? (
                            <div className="max-w-md mx-auto">
                                <h3 className="text-lg font-bold mb-4">{editingGroup ? 'Edit Group' : 'New Option Group'}</h3>
                                <form onSubmit={handleGroupSubmit} className="space-y-4">
                                    <div>
                                        <label className="text-sm font-medium">Group Name</label>
                                        <Input
                                            required
                                            value={groupForm.name}
                                            onChange={e => setGroupForm({ ...groupForm, name: e.target.value })}
                                            placeholder="e.g., Pizza Size"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium">Description</label>
                                        <Input
                                            value={groupForm.description || ''}
                                            onChange={e => setGroupForm({ ...groupForm, description: e.target.value })}
                                            placeholder="Select one size"
                                        />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            id="isRequired"
                                            checked={groupForm.isRequired}
                                            onChange={e => setGroupForm({ ...groupForm, isRequired: e.target.checked })}
                                            className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                                        />
                                        <label htmlFor="isRequired" className="text-sm font-medium">Customer must select at least one?</label>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm font-medium">Min Selection</label>
                                            <Input
                                                type="number"
                                                min="0"
                                                value={groupForm.minSelect}
                                                onChange={e => setGroupForm({ ...groupForm, minSelect: parseInt(e.target.value) })}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium">Max Selection</label>
                                            <Input
                                                type="number"
                                                min="1"
                                                value={groupForm.maxSelect}
                                                onChange={e => setGroupForm({ ...groupForm, maxSelect: parseInt(e.target.value) })}
                                            />
                                        </div>
                                    </div>
                                    <div className="flex gap-2 pt-4">
                                        <Button type="submit" className="flex-1 bg-purple-600 hover:bg-purple-700">Save Group</Button>
                                        <Button type="button" variant="outline" onClick={() => setShowGroupForm(false)}>Cancel</Button>
                                    </div>
                                </form>
                            </div>
                        ) : selectedGroup ? (
                            <div>
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900">{selectedGroup.name} Options</h3>
                                        <p className="text-sm text-gray-500">Manage choices available in this group</p>
                                    </div>
                                    <Button
                                        size="sm"
                                        onClick={() => {
                                            setEditingOption(null);
                                            setOptionForm({ name: '', priceAdjustment: 0, groupId: selectedGroup.id });
                                            setShowOptionForm(true);
                                        }}
                                        className="bg-purple-600 hover:bg-purple-700"
                                    >
                                        <Plus className="h-4 w-4 mr-2" /> Add Option
                                    </Button>
                                </div>

                                {showOptionForm && (
                                    <Card className="mb-6 border-purple-100 bg-purple-50">
                                        <CardContent className="pt-6">
                                            <form onSubmit={handleOptionSubmit} className="flex gap-4 items-end">
                                                <div className="flex-1">
                                                    <label className="text-xs font-medium mb-1 block">Option Name</label>
                                                    <Input
                                                        required
                                                        value={optionForm.name}
                                                        onChange={e => setOptionForm({ ...optionForm, name: e.target.value })}
                                                        placeholder="e.g., Extra Cheese"
                                                        className="bg-white"
                                                    />
                                                </div>
                                                <div className="w-32">
                                                    <label className="text-xs font-medium mb-1 block">Price (+DZD)</label>
                                                    <Input
                                                        type="number"
                                                        step="0.01"
                                                        value={optionForm.priceAdjustment}
                                                        onChange={e => setOptionForm({ ...optionForm, priceAdjustment: parseFloat(e.target.value) })}
                                                        placeholder="0.00"
                                                        className="bg-white"
                                                    />
                                                </div>
                                                <Button type="submit" className="bg-purple-600">Save</Button>
                                                <Button type="button" variant="ghost" onClick={() => setShowOptionForm(false)}>Cancel</Button>
                                            </form>
                                        </CardContent>
                                    </Card>
                                )}

                                <div className="space-y-2">
                                    {options.length === 0 && !showOptionForm ? (
                                        <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed">
                                            <p className="text-gray-500">No options in this group yet.</p>
                                        </div>
                                    ) : (
                                        options.map(option => (
                                            <div key={option.id} className="flex items-center justify-between p-3 bg-white border rounded-lg hover:shadow-sm">
                                                <span className="font-medium text-gray-800">{option.name}</span>
                                                <div className="flex items-center gap-4">
                                                    <span className={`text-sm font-semibold ${option.priceAdjustment > 0 ? 'text-green-600' : 'text-gray-400'}`}>
                                                        {option.priceAdjustment > 0 ? `+${option.priceAdjustment.toFixed(2)} DZD` : 'Free'}
                                                    </span>
                                                    <div className="flex gap-1">
                                                        <Button size="icon" variant="ghost" className="h-8 w-8 text-gray-500" onClick={() => handleEditOption(option)}>
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                        <Button size="icon" variant="ghost" className="h-8 w-8 text-red-400 hover:text-red-500 hover:bg-red-50" onClick={() => handleDeleteOption(option.id)}>
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-center text-gray-400">
                                <Settings2 className="h-16 w-16 mb-4 text-gray-200" />
                                <p className="text-lg font-medium text-gray-500">Select a group to manage options</p>
                                <p className="text-sm mt-1">Or create a new group from the left sidebar</p>
                            </div>
                        )}
                    </div>
                </div>
            </Card>
        </div>
    );
};
