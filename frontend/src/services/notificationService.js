import api from './api';
import { toast } from 'react-toastify';

let pollInterval = null;

/**
 * Start polling for reminders
 */
export const startNotificationPolling = (callback) => {
    if (pollInterval) clearInterval(pollInterval);

    pollInterval = setInterval(async () => {
        try {
            const response = await api.get('/reminders/upcoming');
            callback(response.data);
        } catch (error) {
            console.error('Notification polling error:', error);
        }
    }, 30000); // 30 seconds
};

/**
 * Stop polling
 */
export const stopNotificationPolling = () => {
    if (pollInterval) {
        clearInterval(pollInterval);
        pollInterval = null;
    }
};

/**
 * Show browser notification (requires permission)
 */
export const showBrowserNotification = (title, options = {}) => {
    if (!('Notification' in window)) {
        console.warn('Browser does not support notifications');
        return;
    }

    if (Notification.permission === 'granted') {
        const notification = new Notification(title, {
            icon: '/logo192.png',
            badge: '/favicon.ico',
            tag: 'medicine-reminder',
            requireInteraction: false,
            ...options,
        });

        return notification;
    }
};

/**
 * Request notification permission
 */
export const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
        const permission = await Notification.requestPermission();
        return permission === 'granted';
    }
    return 'Notification' in window && Notification.permission === 'granted';
};

/**
 * Show medicine reminder notification
 */
export const showMedicineReminder = (medicineName, time, message = '') => {
    const title = `💊 Time to Take ${medicineName}`;
    const body = message || `Scheduled at ${time}`;

    showBrowserNotification(title, {
        body,
        tag: `medicine-${medicineName}-${Date.now()}`,
        requireInteraction: true,
    });

    // Also show toast
    toast.info(
        <div>
            <strong>{medicineName}</strong>
            <p className="text-sm">{body}</p>
        </div>,
        {
            position: 'top-right',
            autoClose: 5000,
        }
    );
};

/**
 * Show toast notification
 */
export const showToast = (message, type = 'info', options = {}) => {
    const baseOptions = {
        position: 'top-right',
        autoClose: 3000,
        ...options,
    };

    switch (type) {
        case 'success':
            return toast.success(message, baseOptions);
        case 'error':
            return toast.error(message, baseOptions);
        case 'warning':
            return toast.warning(message, baseOptions);
        case 'info':
        default:
            return toast.info(message, baseOptions);
    }
};

/**
 * Show taken confirmation
 */
export const showTakenConfirmation = (medicineName) => {
    showToast(`✅ ${medicineName} marked as taken!`, 'success', {
        autoClose: 2000,
    });
};

/**
 * Show snooze confirmation  
 */
export const showSnoozeConfirmation = (minutes) => {
    showToast(`🔔 Reminder snoozed for ${minutes} minutes`, 'info', {
        autoClose: 2000,
    });
};

/**
 * Show error
 */
export const showError = (message) => {
    showToast(`❌ ${message}`, 'error', { autoClose: 4000 });
};

/**
 * Show low stock warning
 */
export const showLowStockWarning = (medicineName, daysRemaining) => {
    showToast(
        `⚠️ Low stock: ${medicineName} - ${daysRemaining} days remaining`,
        'warning'
    );
};

export default {
    startNotificationPolling,
    stopNotificationPolling,
    showBrowserNotification,
    requestNotificationPermission,
    showMedicineReminder,
    showToast,
    showTakenConfirmation,
    showSnoozeConfirmation,
    showError,
    showLowStockWarning,
};

