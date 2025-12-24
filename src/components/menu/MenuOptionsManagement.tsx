import React, { useEffect, useState } from 'react';
import { menuApi } from '@/api/menu';
import type { MenuItem, MenuOptionGroup, MenuOption, MenuOptionGroupFormData, MenuOptionFormData } from '@/types/menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Plus, X, Trash2, Edit, Check, ChevronRight, Settings2, Info, ListTree, PackagePlus, MousePointerClick } from 'lucide-react';

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
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <Card className="w-full max-w-5xl h-[90vh] flex flex-col shadow-2xl border-none animate-in fade-in zoom-in-95 duration-200 bg-white rounded-[2rem] overflow-hidden">
                {/* Header */}
                <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-gray-50/50 flex-shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-orange-500 rounded-2xl shadow-lg shadow-orange-100 text-white">
                            <Settings2 className="h-6 w-6" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-gray-900 tracking-tight">Manage Options</h3>
                            <p className="text-sm text-gray-500 font-medium mt-0.5">Configuring: <span className="text-orange-600 font-bold">{menuItem.name}</span></p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-3 hover:bg-white rounded-2xl transition-all shadow-sm border border-transparent hover:border-gray-100 text-gray-400 hover:text-gray-600"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                <div className="flex flex-1 overflow-hidden">
                    {/* Left Sidebar: Groups */}
                    <div className="w-80 border-r border-gray-100 bg-gray-50/30 flex flex-col overflow-y-auto">
                        <div className="p-6 flex-shrink-0">
                            <Button
                                className="w-full h-12 bg-white text-orange-600 border-2 border-orange-100 hover:bg-orange-500 hover:text-white hover:border-orange-500 transition-all font-bold rounded-xl shadow-sm"
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
                                <Plus className="h-5 w-5 mr-2" /> Add Option Group
                            </Button>
                        </div>
                        <div className="px-4 pb-6 space-y-3 pb-20">
                            <div className="px-2 mb-2">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-left">Option Groups</span>
                            </div>
                            {groups.map(group => (
                                <div
                                    key={group.id}
                                    onClick={() => setSelectedGroup(group)}
                                    className={`
                                        p-4 rounded-2xl cursor-pointer transition-all border group
                                        ${selectedGroup?.id === group.id
                                            ? 'bg-orange-500 border-orange-500 text-white shadow-xl shadow-orange-100'
                                            : 'bg-white border-gray-100 text-gray-700 hover:bg-gray-50 hover:border-orange-200 shadow-sm'
                                        }
                                    `}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="font-bold tracking-tight truncate pr-2">
                                            {group.name}
                                        </h4>
                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleEditGroup(group); }}
                                                className={`p-1.5 rounded-lg transition-colors ${selectedGroup?.id === group.id ? 'hover:bg-orange-400' : 'hover:bg-orange-50 text-orange-500'}`}
                                            >
                                                <Edit className="h-3 w-3" />
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleDeleteGroup(group); }}
                                                className={`p-1.5 rounded-lg transition-colors ${selectedGroup?.id === group.id ? 'hover:bg-red-400' : 'hover:bg-red-50 text-red-500'}`}
                                            >
                                                <Trash2 className="h-3 w-3" />
                                            </button>
                                        </div>
                                    </div>
                                    <p className={`text-[10px] leading-relaxed line-clamp-2 mb-3 ${selectedGroup?.id === group.id ? 'text-orange-100' : 'text-gray-500'}`}>
                                        {group.description || 'No description provided.'}
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-widest ${selectedGroup?.id === group.id ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>
                                            {group.isRequired ? 'Required' : 'Optional'}
                                        </span>
                                        <span className={`text-[10px] font-bold ${selectedGroup?.id === group.id ? 'text-orange-100' : 'text-gray-400'}`}>
                                            {group.min_selections}-{group.max_selections} picks
                                        </span>
                                    </div>
                                </div>
                            ))}
                            {groups.length === 0 && (
                                <div className="text-center py-12 px-6">
                                    <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-gray-300">
                                        <ListTree className="h-6 w-6" />
                                    </div>
                                    <p className="text-xs text-gray-500 font-medium">No groups created yet. Start by adding one!</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Content: Options or Forms */}
                    <div className="flex-1 p-8 overflow-y-auto bg-white custom-scrollbar">
                        {showGroupForm ? (
                            <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
                                <div className="flex items-center gap-4 border-b border-gray-100 pb-6">
                                    <div className="p-3 bg-gray-900 rounded-2xl text-white">
                                        <PackagePlus className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-gray-900">{editingGroup ? 'Update Group' : 'New Option Group'}</h3>
                                        <p className="text-sm text-gray-500 font-medium">Define selection rules for your customers</p>
                                    </div>
                                </div>

                                <form onSubmit={handleGroupSubmit} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2 md:col-span-2">
                                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Group Label</label>
                                            <Input
                                                required
                                                value={groupForm.name}
                                                onChange={e => setGroupForm({ ...groupForm, name: e.target.value })}
                                                placeholder="e.g. Choose your Pizza Size"
                                                className="h-12 bg-gray-50/50 border-gray-100 rounded-xl font-semibold"
                                            />
                                        </div>
                                        <div className="space-y-2 md:col-span-2">
                                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Description (Internal or Customer Hint)</label>
                                            <Input
                                                value={groupForm.description || ''}
                                                onChange={e => setGroupForm({ ...groupForm, description: e.target.value })}
                                                placeholder="e.g. You can select only one size for this pizza"
                                                className="h-12 bg-gray-50/50 border-gray-100 rounded-xl"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Min. Selections</label>
                                            <Input
                                                type="number"
                                                min="0"
                                                value={groupForm.minSelect}
                                                onChange={e => setGroupForm({ ...groupForm, minSelect: parseInt(e.target.value) })}
                                                className="h-12 bg-gray-50/50 border-gray-100 rounded-xl font-bold"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Max. Selections</label>
                                            <Input
                                                type="number"
                                                min="1"
                                                value={groupForm.maxSelect}
                                                onChange={e => setGroupForm({ ...groupForm, maxSelect: parseInt(e.target.value) })}
                                                className="h-12 bg-gray-50/50 border-gray-100 rounded-xl font-bold"
                                            />
                                        </div>
                                    </div>

                                    <div className="p-4 bg-orange-50/50 border border-orange-100 rounded-2xl">
                                        <label className="flex items-center gap-3 cursor-pointer group">
                                            <div className="relative">
                                                <input
                                                    type="checkbox"
                                                    checked={groupForm.isRequired}
                                                    onChange={e => setGroupForm({ ...groupForm, isRequired: e.target.checked })}
                                                    className="sr-only"
                                                />
                                                <div className={`w-12 h-6 rounded-full transition-colors ${groupForm.isRequired ? 'bg-orange-500' : 'bg-gray-200'}`}></div>
                                                <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${groupForm.isRequired ? 'translate-x-6' : 'translate-x-0'}`}></div>
                                            </div>
                                            <div className="flex-1">
                                                <span className="text-sm font-bold text-gray-700 group-hover:text-orange-500 transition-colors">Mandatory Selection</span>
                                                <p className="text-[10px] text-gray-500 font-medium">Customer cannot checkout without selecting an option</p>
                                            </div>
                                        </label>
                                    </div>

                                    <div className="flex gap-4 pt-4 border-t border-gray-100">
                                        <Button type="button" variant="ghost" onClick={() => setShowGroupForm(false)} className="flex-1 h-12 font-bold text-gray-500 rounded-xl">Discard</Button>
                                        <Button type="submit" className="flex-2 h-12 bg-gray-900 hover:bg-orange-600 text-white font-bold transition-all rounded-xl shadow-lg shadow-gray-200 px-12">
                                            Save Group Configuration
                                        </Button>
                                    </div>
                                </form>
                            </div>
                        ) : selectedGroup ? (
                            <div className="animate-in fade-in duration-500">
                                <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-100">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-orange-50 text-orange-600 rounded-2xl">
                                            <MousePointerClick className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-black text-gray-900 tracking-tight">{selectedGroup.name}</h3>
                                            <p className="text-sm text-gray-500 font-medium">Available choices within this category</p>
                                        </div>
                                    </div>
                                    <Button
                                        size="sm"
                                        onClick={() => {
                                            setEditingOption(null);
                                            setOptionForm({ name: '', priceAdjustment: 0, groupId: selectedGroup.id });
                                            setShowOptionForm(true);
                                        }}
                                        className="h-11 px-6 bg-gray-900 hover:bg-orange-600 text-white shadow-xl shadow-gray-100 transition-all font-bold rounded-xl"
                                    >
                                        <Plus className="h-5 w-5 mr-2" /> Add Selection
                                    </Button>
                                </div>

                                {showOptionForm && (
                                    <div className="mb-8 p-6 bg-gray-50 border border-gray-100 rounded-3xl animate-in zoom-in-95 duration-200">
                                        <div className="flex items-center justify-between mb-4">
                                            <h4 className="text-sm font-bold text-gray-900">Add New Option</h4>
                                            <button onClick={() => setShowOptionForm(false)} className="text-gray-400 hover:text-gray-600"><X className="h-4 w-4" /></button>
                                        </div>
                                        <form onSubmit={handleOptionSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div className="md:col-span-2">
                                                <Input
                                                    required
                                                    value={optionForm.name}
                                                    onChange={e => setOptionForm({ ...optionForm, name: e.target.value })}
                                                    placeholder="Option Name (e.g. Extra Cheese)"
                                                    className="h-12 bg-white border-gray-100 rounded-xl shadow-sm"
                                                />
                                            </div>
                                            <div>
                                                <Input
                                                    type="number"
                                                    step="0.01"
                                                    value={optionForm.priceAdjustment}
                                                    onChange={e => setOptionForm({ ...optionForm, priceAdjustment: parseFloat(e.target.value) })}
                                                    placeholder="Price +DZD"
                                                    className="h-12 bg-white border-gray-100 rounded-xl shadow-sm font-bold"
                                                />
                                            </div>
                                            <div className="md:col-span-3 flex justify-end gap-3 mt-2">
                                                <Button type="button" variant="ghost" onClick={() => setShowOptionForm(false)} className="h-10 text-xs font-bold text-gray-500">Cancel</Button>
                                                <Button type="submit" className="h-10 px-8 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl shadow-lg shadow-orange-100 transition-all">
                                                    Save Option
                                                </Button>
                                            </div>
                                        </form>
                                    </div>
                                )}

                                <div className="space-y-4">
                                    {options.length === 0 && !showOptionForm ? (
                                        <div className="py-20 text-center bg-gray-50/50 rounded-[2rem] border-2 border-dashed border-gray-200">
                                            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 text-gray-200 shadow-sm">
                                                <PackagePlus className="h-8 w-8" />
                                            </div>
                                            <p className="text-gray-500 font-bold">No options added yet</p>
                                            <p className="text-xs text-gray-400 mt-1">Start adding choices for your customers to select.</p>
                                        </div>
                                    ) : (
                                        options.map(option => (
                                            <div key={option.id} className="group p-5 bg-white border border-gray-100 rounded-2xl flex items-center justify-between hover:border-orange-200 hover:shadow-xl hover:shadow-gray-100 hover:-translate-y-0.5 transition-all duration-300">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-xl bg-gray-50 text-gray-400 flex items-center justify-center font-bold text-sm group-hover:bg-orange-50 group-hover:text-orange-500 transition-colors">
                                                        <Check className="h-5 w-5" />
                                                    </div>
                                                    <div>
                                                        <span className="font-bold text-gray-900 block group-hover:text-orange-600 transition-colors">{option.name}</span>
                                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{selectedGroup.name} Item</span>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-6">
                                                    <div className="text-right">
                                                        <span className={`text-lg font-black ${option.priceAdjustment > 0 ? 'text-emerald-600' : 'text-gray-400'}`}>
                                                            {option.priceAdjustment > 0 ? `+${option.priceAdjustment.toFixed(2)}` : '0.00'}<small className="text-[10px] ml-1 opacity-50">DZD</small>
                                                        </span>
                                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">Price Adjustment</p>
                                                    </div>

                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => handleEditOption(option)}
                                                            className="p-2.5 bg-gray-50 hover:bg-orange-50 text-gray-400 hover:text-orange-600 rounded-xl transition-all"
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteOption(option.id)}
                                                            className="p-2.5 bg-gray-50 hover:bg-red-50 text-gray-400 hover:text-red-600 rounded-xl transition-all"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-center py-20 animate-in fade-in zoom-in-95 duration-500">
                                <div className="w-24 h-24 bg-gray-50 rounded-[2.5rem] flex items-center justify-center mb-8 text-gray-200">
                                    <ListTree className="h-12 w-12" />
                                </div>
                                <h4 className="text-2xl font-black text-gray-900 tracking-tight">Select an Option Category</h4>
                                <p className="text-gray-500 mt-2 max-w-sm mx-auto font-medium">Please pick a group from the left sidebar to manage available choices or create a new one.</p>
                                <div className="mt-8 flex gap-3">
                                    <div className="flex items-center gap-2 px-4 py-2 bg-orange-50 rounded-xl text-orange-600 text-xs font-bold">
                                        <Info className="h-4 w-4" /> Hot Tip: Required categories help upsells
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </Card>
        </div>
    );
};

