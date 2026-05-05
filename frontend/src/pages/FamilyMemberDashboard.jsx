import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import {
    Pill,
    Clock,
    CheckCircle,
    AlertTriangle,
    Package,
} from 'lucide-react';
import api from '../services/api';
import useReminder from '../hooks/useReminder';
import MedicineCard from '../components/MedicineCard';
import ReminderAlert from '../components/ReminderAlert';

const FamilyMemberDashboard = () => {
    const [medicines, setMedicines] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const { reminders, markAsTaken, snoozeReminder, dismissReminder } = useReminder();

    useEffect(() => {
        fetchData();
        requestNotificationPermission();
    }, []);

    const requestNotificationPermission = async () => {
        if ('Notification' in window && Notification.permission === 'default') {
            await Notification.requestPermission();
        }
    };

    const fetchData = async () => {
        try {
            const response = await api.get('/medicines');
            const medicinesData = response.data?.data || response.data;
            setMedicines(Array.isArray(medicinesData) ? medicinesData : []);

            // Calculate simple stats
            const totalMedicines = medicinesData.length;
            const todaysDoses = medicinesData.reduce((sum, med) => sum + med.dosagePerDay, 0);

            setStats({
                totalMedicines,
                todaysDoses,
                assignedMedicines: totalMedicines,
            });
        } catch (error) {
            toast.error('Failed to load medicines');
        } finally {
            setLoading(false);
        }
    };

    const handleMarkTaken = async (medicineId) => {
        try {
            const response = await api.post(`/medicines/${medicineId}/take`);
            toast.success('Marked as taken!');
            fetchData();
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
            title: 'Assigned Medicines',
            value: stats?.assignedMedicines || 0,
            icon: Pill,
            color: 'bg-primary-50 text-primary-600',
        },
        {
            title: "Today's Doses",
            value: stats?.todaysDoses || 0,
            icon: CheckCircle,
            color: 'bg-success-50 text-success-600',
        },
    ];

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">My Medicines</h1>
                    <p className="text-gray-600 mt-2">View and manage your assigned medicines</p>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {statCards.map((stat, idx) => {
                    const Icon = stat.icon;
                    return (
                        <div key={idx} className="bg-white rounded-lg shadow-md p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-600 text-sm font-medium">{stat.title}</p>
                                    <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                                </div>
                                <div className={`${stat.color} p-4 rounded-lg`}>
                                    <Icon size={24} />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Reminders Alert */}
            {reminders.length > 0 && (
                <div className="space-y-4">
                    {reminders.map((reminder) => (
                        <ReminderAlert
                            key={reminder.id}
                            reminder={reminder}
                            onTake={() => handleMarkTaken(reminder.medicineId)}
                            onSnooze={() => snoozeReminder(reminder.id)}
                            onDismiss={() => dismissReminder(reminder.id)}
                        />
                    ))}
                </div>
            )}

            {/* Medicines List */}
            <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Medicines</h2>
                {medicines.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-lg">
                        <Pill size={48} className="mx-auto text-gray-400 mb-4" />
                        <p className="text-gray-600">No medicines have been assigned to you yet.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {medicines.map((medicine) => (
                            <MedicineCard
                                key={medicine._id}
                                medicine={medicine}
                                onTake={() => handleMarkTaken(medicine._id)}
                                readOnly={true}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default FamilyMemberDashboard;
