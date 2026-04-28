import React from 'react';
import { Bell, Clock, X, Pause } from 'lucide-react';

const ReminderAlert = ({ reminders, onDismiss, onSnooze }) => {
    if (!reminders || reminders.length === 0) return null;

    return (
        <div className="space-y-3">
            {reminders.map((reminder) => (
                <div
                    key={reminder._id}
                    className="bg-warning-50 border border-warning-200 rounded-xl p-4 flex items-center justify-between"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-warning-100 rounded-full flex items-center justify-center">
                            <Bell size={20} className="text-warning-600" />
                        </div>
                        <div>
                            <p className="font-medium text-gray-900">
                                Time to take {reminder.medicine?.name || 'medicine'}
                            </p>
                            <p className="text-sm text-gray-600 flex items-center gap-1">
                                <Clock size={14} />
                                {new Date(reminder.scheduledTime).toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                })}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => onSnooze?.(reminder._id)}
                            className="p-2 text-gray-600 hover:bg-white rounded-lg transition-colors"
                            title="Snooze 10 minutes"
                        >
                            <Pause size={18} />
                        </button>
                        <button
                            onClick={() => onDismiss?.(reminder._id)}
                            className="p-2 text-gray-600 hover:bg-white rounded-lg transition-colors"
                        >
                            <X size={18} />
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ReminderAlert;

