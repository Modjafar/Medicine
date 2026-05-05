import { useEffect, useState, useCallback, useRef } from 'react';
import api from '../services/api';
import alarmService from '../services/alarmService';
import { toast } from 'react-toastify';

/**
 * Custom hook for managing medicine reminders
 * Fetches pending reminders and triggers notifications
 */
export const useReminder = () => {
    const [reminders, setReminders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const checkIntervalRef = useRef(null);
    const fetchIntervalRef = useRef(null);
    const processedRemindersRef = useRef(new Set());

    /**
     * Fetch upcoming reminders from backend
     */
    const fetchReminders = useCallback(async () => {
        try {
            setLoading(true);
            const response = await api.get('/reminders/upcoming');
            const upcomingReminders = response.data || [];

            console.log('🔔 Fetched reminders:', upcomingReminders);

            // Filter reminders that should be shown:
            // 1. Status is 'sent' or 'snoozed'
            // 2. Current time is within reasonable range (within 5 minutes for better detection)
            const now = new Date();
            const activeReminders = upcomingReminders.filter((reminder) => {
                const reminderTime = new Date(reminder.scheduledTime);
                const timeDiff = Math.abs(now - reminderTime);
                const withinRange = timeDiff <= 300000; // 5 minute window (was 1 minute)

                console.log(`Reminder: ${reminder.medicine?.name}, Status: ${reminder.status}, Time: ${reminderTime}, Diff: ${timeDiff}ms, InRange: ${withinRange}`);

                return (
                    (reminder.status === 'sent' || reminder.status === 'snoozed') &&
                    withinRange
                );
            });

            console.log('✅ Active reminders to show:', activeReminders);
            setReminders(activeReminders);
            setError(null);

            // Play alarm for new reminders
            activeReminders.forEach((reminder) => {
                if (!processedRemindersRef.current.has(reminder._id)) {
                    console.log('🔊 Playing alarm for:', reminder.medicine?.name);
                    alarmService.play();
                    processedRemindersRef.current.add(reminder._id);
                }
            });
        } catch (err) {
            console.error('❌ Error fetching reminders:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Mark medicine as taken
     */
    const markAsTaken = useCallback(async (reminderId) => {
        try {
            const reminder = reminders.find((r) => r._id === reminderId);
            if (!reminder) return;

            // Update reminder status
            await api.post(`/reminders/${reminderId}/taken`, {});

            // Update medicine quantity
            await api.post(`/medicines/${reminder.medicine._id}/take`, {});

            // Remove from display
            setReminders((prev) => prev.filter((r) => r._id !== reminderId));
            processedRemindersRef.current.delete(reminderId);

            // Stop alarm
            alarmService.stop();

            // Show success message
            toast.success(`✅ ${reminder.medicine?.name} marked as taken!`, {
                position: 'top-right',
                autoClose: 3000,
            });

            // Refresh reminders
            fetchReminders();
        } catch (err) {
            toast.error('Failed to mark medicine as taken: ' + err.message);
            console.error('Error marking as taken:', err);
        }
    }, [reminders, fetchReminders]);

    /**
     * Snooze reminder (remind again after X minutes)
     */
    const snoozeReminder = useCallback(async (reminderId, minutes = 5) => {
        try {
            await api.post(`/reminders/${reminderId}/snooze`, { minutes });

            setReminders((prev) => prev.filter((r) => r._id !== reminderId));
            processedRemindersRef.current.delete(reminderId);

            alarmService.stop();

            toast.info(`🔔 Reminder snoozed for ${minutes} minutes`, {
                position: 'top-right',
                autoClose: 2000,
            });

            // Refresh reminders
            fetchReminders();
        } catch (err) {
            toast.error('Failed to snooze reminder: ' + err.message);
            console.error('Error snoozing reminder:', err);
        }
    }, [fetchReminders]);

    /**
     * Dismiss reminder (mark as missed)
     */
    const dismissReminder = useCallback(async (reminderId) => {
        try {
            await api.post(`/reminders/${reminderId}/dismiss`, {});

            setReminders((prev) => prev.filter((r) => r._id !== reminderId));
            processedRemindersRef.current.delete(reminderId);

            alarmService.stop();

            toast.warning('⏭️ Reminder dismissed', {
                position: 'top-right',
                autoClose: 2000,
            });

            // Refresh reminders
            fetchReminders();
        } catch (err) {
            toast.error('Failed to dismiss reminder: ' + err.message);
            console.error('Error dismissing reminder:', err);
        }
    }, [fetchReminders]);

    /**
     * Initialize reminder checking
     * - Fetch reminders every 10 seconds (more frequent for real-time feel)
     * - Check time every minute for local matching
     */
    useEffect(() => {
        // Initial fetch
        fetchReminders();

        // Fetch reminders every 10 seconds (was 30 seconds)
        fetchIntervalRef.current = setInterval(() => {
            fetchReminders();
        }, 10000); // 10 seconds

        // Cleanup
        return () => {
            if (fetchIntervalRef.current) {
                clearInterval(fetchIntervalRef.current);
            }
        };
    }, [fetchReminders]);

    /**
     * Cleanup on unmount
     */
    useEffect(() => {
        return () => {
            alarmService.stop();
            if (checkIntervalRef.current) {
                clearInterval(checkIntervalRef.current);
            }
            if (fetchIntervalRef.current) {
                clearInterval(fetchIntervalRef.current);
            }
        };
    }, []);

    return {
        reminders,
        loading,
        error,
        markAsTaken,
        snoozeReminder,
        dismissReminder,
        refetch: fetchReminders,
    };
};

export default useReminder;
