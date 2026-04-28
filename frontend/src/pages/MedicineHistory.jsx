import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Calendar, Pill, TrendingUp, Package } from 'lucide-react';
import api from '../services/api';

const MedicineHistory = () => {
    const [history, setHistory] = useState([]);
    const [medicines, setMedicines] = useState([]);
    const [stats, setStats] = useState(null);
    const [filters, setFilters] = useState({
        medicine: '',
        startDate: '',
        endDate: '',
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMedicines();
        fetchHistory();
        fetchStats();
    }, []);

    const fetchMedicines = async () => {
        try {
            const response = await api.get('/medicines');
            setMedicines(response.data);
        } catch (error) {
            console.error('Failed to fetch medicines');
        }
    };

    const fetchHistory = async () => {
        try {
            const params = {};
            if (filters.medicine) params.medicine = filters.medicine;
            if (filters.startDate) params.startDate = filters.startDate;
            if (filters.endDate) params.endDate = filters.endDate;

            const response = await api.get('/history', { params });
            setHistory(response.data);
        } catch (error) {
            toast.error('Failed to load history');
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const params = {};
            if (filters.medicine) params.medicine = filters.medicine;
            const response = await api.get('/history/stats', { params });
            setStats(response.data);
        } catch (error) {
            console.error('Failed to fetch stats');
        }
    };

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    const applyFilters = () => {
        setLoading(true);
        fetchHistory();
        fetchStats();
    };

    const clearFilters = () => {
        setFilters({ medicine: '', startDate: '', endDate: '' });
        setTimeout(() => {
            fetchHistory();
            fetchStats();
        }, 0);
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
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Medicine History</h1>
                <p className="text-gray-600 mt-1">Track your medicine intake history</p>
            </div>

            {stats && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="card p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                                <Package size={20} className="text-primary-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{stats.totalTaken}</p>
                                <p className="text-sm text-gray-500">Total Doses</p>
                            </div>
                        </div>
                    </div>
                    <div className="card p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-success-100 rounded-lg flex items-center justify-center">
                                <TrendingUp size={20} className="text-success-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{stats.last7Days}</p>
                                <p className="text-sm text-gray-500">Last 7 Days</p>
                            </div>
                        </div>
                    </div>
                    <div className="card p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-warning-100 rounded-lg flex items-center justify-center">
                                <Calendar size={20} className="text-warning-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{stats.last30Days}</p>
                                <p className="text-sm text-gray-500">Last 30 Days</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="card">
                <div className="flex flex-col sm:flex-row gap-3 mb-4">
                    <select
                        name="medicine"
                        value={filters.medicine}
                        onChange={handleFilterChange}
                        className="input-field"
                    >
                        <option value="">All Medicines</option>
                        {medicines.map((m) => (
                            <option key={m._id} value={m._id}>
                                {m.name}
                            </option>
                        ))}
                    </select>
                    <input
                        type="date"
                        name="startDate"
                        value={filters.startDate}
                        onChange={handleFilterChange}
                        className="input-field"
                        placeholder="Start Date"
                    />
                    <input
                        type="date"
                        name="endDate"
                        value={filters.endDate}
                        onChange={handleFilterChange}
                        className="input-field"
                        placeholder="End Date"
                    />
                    <button onClick={applyFilters} className="btn-primary">
                        Filter
                    </button>
                    <button onClick={clearFilters} className="btn-secondary">
                        Clear
                    </button>
                </div>

                {history.length === 0 ? (
                    <div className="text-center py-8">
                        <Pill size={32} className="text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">No history records found</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-200">
                                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Medicine</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Qty Before</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Qty After</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Dosage</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Taken At</th>
                                </tr>
                            </thead>
                            <tbody>
                                {history.map((record) => (
                                    <tr key={record._id} className="border-b border-gray-100 hover:bg-gray-50">
                                        <td className="py-3 px-4 font-medium text-gray-900">{record.medicineName}</td>
                                        <td className="py-3 px-4 text-gray-600">{record.quantityBefore}</td>
                                        <td className="py-3 px-4 text-gray-600">{record.quantityAfter}</td>
                                        <td className="py-3 px-4 text-gray-600">{record.dosageTaken}</td>
                                        <td className="py-3 px-4 text-gray-600">
                                            {new Date(record.takenAt).toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MedicineHistory;

