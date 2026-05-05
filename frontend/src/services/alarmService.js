/**
 * Audio Alarm Service
 * Manages alarm sounds for medicine reminders
 * Includes fallback to programmatic tone generation
 */

class AlarmService {
    constructor() {
        this.alarmAudio = null;
        this.isPlaying = false;
        this.audioContext = null;
        this.oscillator = null;
        this.gainNode = null;
    }

    /**
     * Initialize audio element
     */
    init() {
        if (!this.alarmAudio) {
            this.alarmAudio = new Audio();
            this.alarmAudio.loop = true;
            this.alarmAudio.volume = 0.7;
        }
    }

    /**
     * Play alarm sound with fallback to programmatic generation
     * @param {string} soundPath - Path to alarm sound file
     */
    play(soundPath = '/sounds/medicine-alarm.mp3') {
        try {
            this.init();
            this.alarmAudio.src = soundPath;

            this.alarmAudio.play()
                .then(() => {
                    console.log('✅ Alarm playing from file:', soundPath);
                    this.isPlaying = true;
                })
                .catch((error) => {
                    console.warn('⚠️ File alarm failed:', error.message);
                    console.log('🔊 Attempting fallback: programmatic tone generation...');
                    this.playProgrammaticAlarm();
                });
        } catch (error) {
            console.error('❌ Error initializing alarm:', error);
            this.playProgrammaticAlarm();
        }
    }

    /**
     * Generate and play alarm sound using Web Audio API (fallback)
     */
    playProgrammaticAlarm() {
        try {
            // Use existing context or create new one
            if (!this.audioContext) {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            }

            const ctx = this.audioContext;

            // Stop any existing oscillator
            if (this.oscillator) {
                this.oscillator.stop();
                this.gainNode.disconnect();
            }

            // Create oscillator for alarm sound
            this.oscillator = ctx.createOscillator();
            this.gainNode = ctx.createGain();

            // Frequency for alarm (900 Hz)
            this.oscillator.frequency.setValueAtTime(900, ctx.currentTime);
            this.oscillator.type = 'sine';

            // Set volume
            this.gainNode.gain.setValueAtTime(0.3, ctx.currentTime);

            // Connect nodes
            this.oscillator.connect(this.gainNode);
            this.gainNode.connect(ctx.destination);

            // Start sound
            this.oscillator.start();

            // Pulse effect: turn off and on every 500ms
            const pulseInterval = setInterval(() => {
                if (!this.isPlaying) {
                    clearInterval(pulseInterval);
                    return;
                }
                this.gainNode.gain.setValueAtTime(0, ctx.currentTime);
                setTimeout(() => {
                    if (this.isPlaying) {
                        this.gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
                    }
                }, 100);
            }, 500);

            this.isPlaying = true;
            console.log('✅ Programmatic alarm playing (900 Hz tone)');

        } catch (error) {
            console.error('❌ Programmatic alarm failed:', error);
            // Last resort: visual alert
            this.visualAlert();
        }
    }

    /**
     * Visual alert fallback (last resort)
     */
    visualAlert() {
        console.warn('🎨 Using visual alert (audio not available)');
        // Flash browser title or show visual notification
        let flashCount = 0;
        const originalTitle = document.title;

        const flashInterval = setInterval(() => {
            flashCount++;
            document.title = flashCount % 2 === 0 ? '🔴 Medicine Reminder!' : originalTitle;

            if (flashCount >= 20 || !this.isPlaying) {
                clearInterval(flashInterval);
                document.title = originalTitle;
            }
        }, 500);

        this.isPlaying = true;
    }

    /**
     * Stop alarm sound
     */
    stop() {
        try {
            // Stop file-based audio
            if (this.alarmAudio) {
                this.alarmAudio.pause();
                this.alarmAudio.currentTime = 0;
            }

            // Stop programmatic audio
            if (this.oscillator) {
                try {
                    this.oscillator.stop();
                    if (this.gainNode) {
                        this.gainNode.disconnect();
                    }
                } catch (e) {
                    console.warn('Oscillator already stopped');
                }
                this.oscillator = null;
                this.gainNode = null;
            }

            this.isPlaying = false;
            console.log('⏹️ Alarm stopped');
        } catch (error) {
            console.error('Error stopping alarm:', error);
        }
    }

    /**
     * Set volume
     * @param {number} volume - Volume level (0-1)
     */
    setVolume(volume) {
        if (this.alarmAudio) {
            this.alarmAudio.volume = Math.max(0, Math.min(1, volume));
        }
        if (this.gainNode) {
            this.gainNode.gain.setValueAtTime(volume * 0.3, this.audioContext.currentTime);
        }
    }

    /**
     * Schedule audio play on user interaction
     * (Some browsers don't allow autoplay without user action)
     */
    schedulePlayOnUserInteraction() {
        const playAudio = () => {
            console.log('🎯 User interaction detected, retrying audio...');
            if (this.alarmAudio && !this.isPlaying) {
                this.alarmAudio.play()
                    .then(() => {
                        this.isPlaying = true;
                        console.log('✅ Audio resumed after user interaction');
                    })
                    .catch(e => {
                        console.warn('Still failed after user interaction:', e);
                        this.playProgrammaticAlarm();
                    });
            }
            document.removeEventListener('click', playAudio);
            document.removeEventListener('keydown', playAudio);
            document.removeEventListener('touchstart', playAudio);
        };

        document.addEventListener('click', playAudio);
        document.addEventListener('keydown', playAudio);
        document.addEventListener('touchstart', playAudio);
    }

    /**
     * Test alarm (plays brief sound)
     */
    test() {
        try {
            console.log('🧪 Testing alarm...');
            this.init();
            this.alarmAudio.src = '/sounds/medicine-alarm.mp3';
            this.alarmAudio.loop = false;

            this.alarmAudio.play()
                .then(() => {
                    console.log('✅ Test alarm playing');
                })
                .catch((error) => {
                    console.warn('⚠️ Test alarm file failed, using tone:', error.message);
                    this.playProgrammaticAlarm();
                });

            // Reset loop after test
            setTimeout(() => {
                if (this.alarmAudio) {
                    this.alarmAudio.loop = true;
                }
            }, 2000);
        } catch (error) {
            console.error('Error testing alarm:', error);
            this.playProgrammaticAlarm();
        }
    }

    /**
     * Check if alarm is currently playing
     */
    isActive() {
        const fileActive = this.alarmAudio && !this.alarmAudio.paused;
        const toneActive = this.isPlaying && this.oscillator;
        return this.isPlaying && (fileActive || toneActive);
    }

    /**
     * Cleanup
     */
    cleanup() {
        this.stop();
        if (this.alarmAudio) {
            this.alarmAudio = null;
        }
        if (this.audioContext) {
            this.audioContext.close().catch(() => {
                // Context already closed
            });
            this.audioContext = null;
        }
    }
}

export default new AlarmService();
