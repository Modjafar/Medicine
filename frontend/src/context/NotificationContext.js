import React, { createContext, useState, useEffect, useContext } from 'react';
import { startNotificationPolling, stopNotificationPolling } from '../services/notificationService';
import { useAuth } from './AuthContext';
import { toast } from 'react-toastify';
import api from '../services/api';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
    const [reminders, setReminders] = useState([]);
    const { user } = useAuth();

    useEffect(() => {
        if (user) {
            startNotificationPolling((data) => {
                setReminders(data);
                // Show browser notification if permission granted
                if (data.length > 0 && Notification.permission === 'granted') {
                    const reminder = data[0];
                    new Notification(`Time for ${reminder.medicineName}`, {
                        body: `Dosage: ${reminder.dosage}`,
                        icon: '/favicon.ico',
                    });
                }
            });

            return () => stopNotificationPolling();
        } else {
            setReminders([]);
            stopNotificationPolling();
        }
    }, [user]);

    const snoozeReminder = async (id) => {
        try {
            await api.post(`/reminders/${id}/snooze`, { minutes: 10 });
            toast.success('Reminder snoozed for 10 minutes');
        } catch (error) {
            toast.error('Failed to snooze reminder');
        }
    };

    const dismissReminder = async (id) => {
        try {
            await api.post(`/reminders/${id}/dismiss`);
            toast.success('Reminder dismissed');
        } catch (error) {
            toast.error('Failed to dismiss reminder');
        }
    };

    return (
        <NotificationContext.Provider value={{ reminders, snoozeReminder, dismissReminder }}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => useContext(NotificationContext);

