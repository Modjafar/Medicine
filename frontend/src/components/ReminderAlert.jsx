import React, { useEffect, useRef, useState } from 'react';
import { generateAlarmToneToBlob } from '../utils/toneGenerator';
import { Bell, X, Clock, Volume2, VolumeX } from 'lucide-react';

const ReminderAlert = ({ reminders, onDismiss, onSnooze, onTaken }) => {
    const alarmRef = useRef(null);
    const timeoutRef = useRef([]);

    const [fallbackAudio, setFallbackAudio] = useState(null);

    useEffect(() => {
        console.log('🔔 ReminderAlert: reminders changed:', reminders);

        if (reminders && reminders.length > 0) {
            console.log('📢 Reminders found, starting alarm...');

            const playAlarm = async () => {
                // Try primary audio first
                if (!alarmRef.current) {
                    alarmRef.current = new Audio('/medicine-alarm.mp3');
                    alarmRef.current.loop = true;
                    alarmRef.current.volume = 0.7;
                }

                try {
                    await alarmRef.current.play();
                } catch (e) {
                    console.warn('⚠️ Primary alarm sound play failed:', e);
                    console.log('🔄 Using fallback tone generator...');

                    // Fallback: generate programmatic tone
                    if (!fallbackAudio) {
                        try {
                            const fallbackUrl = await generateAlarmToneToBlob(2000);
                            const fallback = new Audio(fallbackUrl);
                            fallback.loop = true;
                            fallback.volume = 0.5;
                            setFallbackAudio(fallback);
                            await fallback.play();
                        } catch (fallbackError) {
                            console.error('❌ Fallback tone generation failed:', fallbackError);
                        }
                    } else {
                        await fallbackAudio.play();
                    }
                }
            };

            playAlarm();

            // Auto-close reminder after 30 seconds if no action taken
            const timeout = setTimeout(() => {
                if (reminders.length > 0 && onDismiss) {
                    console.log('⏱️ Auto-dismissing reminder after 30 seconds');
                    onDismiss(reminders[0]._id);
                }
            }, 30000);

            timeoutRef.current.push(timeout);

            return () => {
                clearTimeout(timeout);
            };
        } else {
            // Stop alarm if no reminders
            console.log('🛑 No reminders, stopping alarm');
            if (alarmRef.current) {
                alarmRef.current.pause();
                alarmRef.current.currentTime = 0;
            }
            if (fallbackAudio) {
                fallbackAudio.pause();
                fallbackAudio.currentTime = 0;
            }
            // Clear all timeouts
            timeoutRef.current.forEach(timeout => clearTimeout(timeout));
            timeoutRef.current = [];
        }
    }, [reminders, onDismiss, fallbackAudio]);

    const handleTaken = (reminderId) => {
        // Stop both primary and fallback audio
        if (alarmRef.current) {
            alarmRef.current.pause();
            alarmRef.current.currentTime = 0;
        }
        if (fallbackAudio) {
            fallbackAudio.pause();
            fallbackAudio.currentTime = 0;
        }
        onTaken?.(reminderId);
    };

    const handleSnooze = (reminderId) => {
        // Stop both primary and fallback audio
        if (alarmRef.current) {
            alarmRef.current.pause();
            alarmRef.current.currentTime = 0;
        }
        if (fallbackAudio) {
            fallbackAudio.pause();
            fallbackAudio.currentTime = 0;
        }
        onSnooze?.(reminderId);
    };

    const handleDismiss = (reminderId) => {
        // Stop both primary and fallback audio
        if (alarmRef.current) {
            alarmRef.current.pause();
            alarmRef.current.currentTime = 0;
        }
        if (fallbackAudio) {
            fallbackAudio.pause();
            fallbackAudio.currentTime = 0;
        }
        onDismiss?.(reminderId);
    };

    const stopAlarm = () => {
        // Stop both primary and fallback audio
        if (alarmRef.current) {
            alarmRef.current.pause();
            alarmRef.current.currentTime = 0;
        }
        if (fallbackAudio) {
            fallbackAudio.pause();
            fallbackAudio.currentTime = 0;
        }
    };

    if (!reminders || reminders.length === 0) return null;

    return (
        <div className="fixed top-4 right-4 space-y-3 z-50">
            {reminders.map((reminder) => (
                <div
                    key={reminder._id}
                    className="bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-2xl p-6 shadow-2xl max-w-sm animate-bounce"
                >
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center animate-pulse">
                            <Bell size={28} className="text-white" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-xl font-bold">
                                ⏰ Medicine Time!
                            </h3>
                            <p className="font-semibold">
                                {reminder.medicine?.name || 'Medicine'}
                            </p>
                            <p className="text-white/80 text-sm">
                                Scheduled: {new Date(reminder.scheduledTime).toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                })}
                            </p>
                        </div>
                    </div>

                    {reminder.medicine?.instructions && (
                        <p className="text-white/90 text-sm mb-4 bg-white/10 p-2 rounded">
                            📝 {reminder.medicine.instructions}
                        </p>
                    )}

                    <div className="grid grid-cols-3 gap-2 mb-3">
                        <button
                            onClick={() => handleTaken(reminder._id)}
                            className="col-span-1 bg-green-500 hover:bg-green-600 px-3 py-2 rounded-lg font-medium transition-all text-sm"
                            title="Mark as taken"
                        >
                            ✅ Taken
                        </button>
                        <button
                            onClick={() => handleSnooze(reminder._id)}
                            className="col-span-1 bg-blue-500 hover:bg-blue-600 px-3 py-2 rounded-lg font-medium transition-all text-sm"
                            title="Snooze 5 minutes"
                        >
                            🔔 Snooze
                        </button>
                        <button
                            onClick={() => handleDismiss(reminder._id)}
                            className="col-span-1 bg-red-600 hover:bg-red-700 px-3 py-2 rounded-lg font-medium transition-all text-sm"
                            title="Dismiss"
                        >
                            ✕ Dismiss
                        </button>
                    </div>

                    <button
                        onClick={stopAlarm}
                        className="w-full bg-white/20 hover:bg-white/30 px-3 py-2 rounded-lg font-medium transition-all text-sm flex items-center justify-center gap-2"
                        title="Stop alarm sound"
                    >
                        <VolumeX size={16} /> Stop Sound
                    </button>
                </div>
            ))}
        </div>
    );
};

export default ReminderAlert;

