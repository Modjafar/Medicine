import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
    Pill,
    AlertTriangle,
    CheckCircle,
    Package,
    Clock,
    ChevronRight,
    Plus,
} from 'lucide-react';
import api from '../services/api';
import useReminder from '../hooks/useReminder';
import MedicineCard from '../components/MedicineCard';
import ReminderAlert from '../components/ReminderAlert';

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [lowStockMedicines, setLowStockMedicines] = useState([]);
    const [loading, setLoading] = useState(true);
    const { reminders, markAsTaken, snoozeReminder, dismissReminder } = useReminder();

    useEffect(() => {
        fetchDashboardData();
        requestNotificationPermission();
    }, []);

    const requestNotificationPermission = async () => {
        if ('Notification' in window && Notification.permission === 'default') {
            await Notification.requestPermission();
        }
    };

    const fetchDashboardData = async () => {
        try {
            const [statsRes, lowStockRes] = await Promise.all([
                api.get('/medicines/stats'),
                api.get('/medicines/low-stock'),
            ]);
            setStats(statsRes.data);
            setLowStockMedicines(lowStockRes.data);
        } catch (error) {
            toast.error('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    const handleMarkTaken = async (medicineId) => {
        try {
            const response = await api.post(`/medicines/${medicineId}/take`);
            toast.success(response.data.message);
            if (response.data.lowStock) {
                toast.warning(`Low stock alert: ${response.data.daysRemaining} days remaining!`);
            }
            fetchDashboardData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to mark as taken');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    const statCards = [
        {
            title: 'Total Medicines',
            value: stats?.totalMedicines || 0,
            icon: Pill,
            color: 'bg-primary-50 text-primary-600',
        },
        {
            title: "Today's Doses",
            value: stats?.todaysDoses || 0,
            icon: CheckCircle,
            color: 'bg-success-50 text-success-600',
        },
        {
            title: 'Low Stock',
            value: stats?.lowStockCount || 0,
            icon: AlertTriangle,
            color: 'bg-warning-50 text-warning-600',
        },
        {
            title: 'Out of Stock',
            value: stats?.outOfStock || 0,
            icon: Package,
            color: 'bg-danger-50 text-danger-600',
        },
    ];

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                    <p className="text-gray-600 mt-1">Overview of your medicine management</p>
                </div>
                <Link
                    to="/medicines/add"
                    className="btn-primary flex items-center gap-2"
                >
                    <Plus size={18} />
                    <span className="hidden sm:inline">Add Medicine</span>
                </Link>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <div key={stat.title} className="card p-4">
                            <div className="flex items-center justify-between mb-2">
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.color}`}>
                                    <Icon size={20} />
                                </div>
                            </div>
                            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                            <p className="text-sm text-gray-500">{stat.title}</p>
                        </div>
                    );
                })}
            </div>

            {reminders.length > 0 && (
                <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">🔔 Active Reminders</h2>
                    <ReminderAlert
                        reminders={reminders}
                        onDismiss={dismissReminder}
                        onSnooze={snoozeReminder}
                        onTaken={markAsTaken}
                    />
                </div>
            )}

            {lowStockMedicines.length > 0 && (
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-gray-900">Low Stock Alerts</h2>
                        <Link
                            to="/medicines"
                            className="text-sm text-primary-600 font-medium hover:underline flex items-center gap-1"
                        >
                            View all <ChevronRight size={16} />
                        </Link>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {lowStockMedicines.map((medicine) => (
                            <MedicineCard
                                key={medicine._id}
                                medicine={medicine}
                                onMarkTaken={handleMarkTaken}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;

