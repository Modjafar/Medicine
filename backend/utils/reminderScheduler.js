const schedule = require('node-schedule');
const Reminder = require('../models/Reminder');
const Medicine = require('../models/Medicine');

const activeJobs = new Map();

const scheduleReminders = async (medicine, userId) => {
    await Reminder.deleteMany({ medicine: medicine._id, status: 'pending' });

    const now = new Date();
    const reminderTimes = medicine.reminderTimes || [];

    for (const timeStr of reminderTimes) {
        const [hours, minutes] = timeStr.split(':').map(Number);

        for (let i = 0; i < 7; i++) {
            const scheduledDate = new Date();
            scheduledDate.setDate(scheduledDate.getDate() + i);
            scheduledDate.setHours(hours, minutes, 0, 0);

            if (scheduledDate < now) continue;
            if (medicine.endDate && scheduledDate > new Date(medicine.endDate)) continue;

            const reminder = await Reminder.create({
                medicine: medicine._id,
                user: userId,
                scheduledTime: scheduledDate,
                status: 'pending',
            });

            const jobId = reminder._id.toString();
            if (activeJobs.has(jobId)) {
                activeJobs.get(jobId).cancel();
            }

            const job = schedule.scheduleJob(scheduledDate, async () => {
                try {
                    await Reminder.findByIdAndUpdate(reminder._id, { status: 'sent', sentAt: new Date() });
                    console.log(`Reminder sent for medicine: ${medicine.name} at ${scheduledDate}`);
                } catch (err) {
                    console.error('Reminder job error:', err);
                }
            });

            activeJobs.set(jobId, job);
        }
    }
};

const initReminderScheduler = () => {
    schedule.scheduleJob('* * * * *', async () => {
        try {
            const now = new Date();
            const fiveMinutesAgo = new Date(now.getTime() - 5 * 60000);

            const pendingReminders = await Reminder.find({
                status: 'pending',
                scheduledTime: { $lte: now, $gte: fiveMinutesAgo },
            }).populate('medicine', 'name dosagePerDay unit');

            for (const reminder of pendingReminders) {
                await Reminder.findByIdAndUpdate(reminder._id, { status: 'sent', sentAt: now });
            }
        } catch (err) {
            console.error('Scheduler error:', err);
        }
    });

    console.log('Reminder scheduler initialized');
};

const clearOldJobs = () => {
    for (const [id, job] of activeJobs.entries()) {
        job.cancel();
    }
    activeJobs.clear();
};

module.exports = {
    scheduleReminders,
    initReminderScheduler,
    clearOldJobs,
};

