import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { User, Mail, Bell, Save, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const Profile = () => {
    const { user, updateUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: user?.name || '',
        notificationEnabled: user?.notificationEnabled ?? true,
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await api.put('/auth/profile', formData);
            updateUser(response.data);
            toast.success('Profile updated successfully');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const requestNotificationPermission = async () => {
        if (!('Notification' in window)) {
            toast.error('Notifications not supported in this browser');
            return;
        }
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
            toast.success('Notifications enabled');
        } else {
            toast.warning('Please enable notifications in browser settings');
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
                <p className="text-gray-600 mt-1">Manage your account settings</p>
            </div>

            <div className="card">
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
                        <User size={32} className="text-primary-600" />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold">{user?.name}</h2>
                        <p className="text-gray-500 flex items-center gap-1">
                            <Mail size={14} />
                            {user?.email}
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="input-field"
                            required
                        />
                    </div>

                    <div className="flex items-center justify-between py-3 border-t border-gray-100">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center">
                                <Bell size={20} className="text-primary-600" />
                            </div>
                            <div>
                                <p className="font-medium text-gray-900">Push Notifications</p>
                                <p className="text-sm text-gray-500">Get reminded when it's time for medicine</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={requestNotificationPermission}
                                className="text-sm text-primary-600 font-medium hover:underline"
                            >
                                Test
                            </button>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="notificationEnabled"
                                    checked={formData.notificationEnabled}
                                    onChange={handleChange}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                            </label>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary flex items-center justify-center gap-2"
                    >
                        {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                        Save Changes
                    </button>
                </form>
            </div>

            <div className="card">
                <h3 className="font-semibold text-gray-900 mb-3">Account Information</h3>
                <div className="space-y-2 text-sm">
                    <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-500">Member Since</span>
                        <span className="text-gray-900">
                            {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                        </span>
                    </div>
                    <div className="flex justify-between py-2">
                        <span className="text-gray-500">User ID</span>
                        <span className="text-gray-900 font-mono text-xs">{user?._id}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;

