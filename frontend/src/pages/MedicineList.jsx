import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Plus, Search, Filter } from 'lucide-react';
import api from '../services/api';
import MedicineCard from '../components/MedicineCard';

const MedicineList = () => {
    const [medicines, setMedicines] = useState([]);
    const [filteredMedicines, setFilteredMedicines] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMedicines();
    }, []);

    useEffect(() => {
        let filtered = medicines;

        if (searchQuery) {
            filtered = filtered.filter((m) =>
                m.name.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        if (filterStatus === 'low') {
            filtered = filtered.filter((m) => m.daysRemaining <= 3 && m.quantity > 0);
        } else if (filterStatus === 'out') {
            filtered = filtered.filter((m) => m.quantity <= 0);
        } else if (filterStatus === 'active') {
            filtered = filtered.filter((m) => m.isActive && m.quantity > 0);
        }

        setFilteredMedicines(filtered);
    }, [medicines, searchQuery, filterStatus]);

    const fetchMedicines = async () => {
        try {
            const response = await api.get('/medicines');
            setMedicines(response.data);
            setFilteredMedicines(response.data);
        } catch (error) {
            toast.error('Failed to load medicines');
        } finally {
            setLoading(false);
        }
    };

    const handleMarkTaken = async (medicineId) => {
        try {
            const response = await api.post(`/medicines/${medicineId}/take`);
            toast.success(response.data.message);
            if (response.data.lowStock) {
                toast.warning(`Low stock: ${response.data.daysRemaining} days remaining!`);
            }
            fetchMedicines();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to mark as taken');
        }
    };

    const handleDelete = async (medicineId) => {
        if (!window.confirm('Are you sure you want to delete this medicine?')) return;
        try {
            await api.delete(`/medicines/${medicineId}`);
            toast.success('Medicine deleted');
            fetchMedicines();
        } catch (error) {
            toast.error('Failed to delete medicine');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Medicines</h1>
                    <p className="text-gray-600 mt-1">Manage your medicine inventory</p>
                </div>
                <Link to="/medicines/add" className="btn-primary flex items-center justify-center gap-2">
                    <Plus size={18} />
                    Add Medicine
                </Link>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search medicines..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="input-field pl-10"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Filter size={18} className="text-gray-400" />
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="input-field w-auto"
                    >
                        <option value="all">All Medicines</option>
                        <option value="active">Active</option>
                        <option value="low">Low Stock</option>
                        <option value="out">Out of Stock</option>
                    </select>
                </div>
            </div>

            {filteredMedicines.length === 0 ? (
                <div className="text-center py-16">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Search size={24} className="text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">No medicines found</h3>
                    <p className="text-gray-500 mt-1">
                        {searchQuery || filterStatus !== 'all'
                            ? 'Try adjusting your search or filters'
                            : 'Add your first medicine to get started'}
                    </p>
                    {!searchQuery && filterStatus === 'all' && (
                        <Link to="/medicines/add" className="btn-primary mt-4 inline-flex items-center gap-2">
                            <Plus size={18} />
                            Add Medicine
                        </Link>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredMedicines.map((medicine) => (
                        <MedicineCard
                            key={medicine._id}
                            medicine={medicine}
                            onMarkTaken={handleMarkTaken}
                            onDelete={handleDelete}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default MedicineList;

