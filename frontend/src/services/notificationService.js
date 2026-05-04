import api from './api';

let pollInterval = null;

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

export const stopNotificationPolling = () => {
    if (pollInterval) {
        clearInterval(pollInterval);
        pollInterval = null;
    }
};

