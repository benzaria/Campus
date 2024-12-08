import pkg from 'electron';
import { schedule as cronSchedule } from 'node-cron';
import path from 'path';
import fs from 'fs';

const { Notification } = pkg;

const __dirname = import.meta.dirname;

const SCHEDULE_FILE = path.join(__dirname, 'schedules.json');

/**
 * 
 * @param {Boolean} fail 
 * @returns {Promise<JSON>} Object
 */
async function readSchedules(fail = false) {
    if (fs.existsSync(SCHEDULE_FILE)) {
        const data = fs.readFileSync(SCHEDULE_FILE, 'utf8');
        try {
            return JSON.parse(data);
        } catch (error) {
            console.error(`fail`);
            return !fail ? await readSchedules(true) : {};
        }
    }
    return {};
}

async function scheduleNotifications() {
    const schedules = await readSchedules();
    //console.log(new Date('2024-12-03T15:08:01.054Z').getTime());

    for (const key in schedules) {
        schedules[key].forEach((schedule) => {

            if (schedule.notified) {
                return delete schedules[key];
            }

            //if (!schedule.notified) {
            //const scheduleTime = new Date(+key);
            const scheduleTime = key.split('|');

            // Convert UTC time to local time
            //const _scheduleTime = new Date(scheduleTime.toLocaleString("en-US", { timeZone: "Africa/Casablanca" }));

            const cronExpression = `${scheduleTime[0]} ${scheduleTime[1]} ${scheduleTime[2]} ${scheduleTime[3]} *`;

            //console.log('Schedule time:', scheduleTime);

            cronSchedule(cronExpression, () => {
                new Notification({
                    //toastXml,
                    body: 'sheeeesh',
                    icon: 'C:\\Users\\benz\\Node js\\Electron.js\\assets\\icon.png',
                }).show();

                // Mark as notified
                console.log('in cron');
                schedule.notified = true;
                //delete schedules[key];
                fs.writeFileSync(SCHEDULE_FILE, JSON.stringify(schedules, null, 2));
            }, {
                scheduled: true,
                timezone: "Africa/Casablanca"
            });
            //}
        });
    }
    console.log(schedules);
}

(function startSupervisor() {
    // Initial scheduling
    scheduleNotifications().then(() => {
        // Watch for changes in the schedule file
        fs.watch(SCHEDULE_FILE, (eventType, filename) => {
            if (eventType === 'change') {
                console.log('Schedules file changed. Rescheduling notifications...');
                scheduleNotifications();
            }
        });
    })

    console.log('Notification supervisor started');
})();

//startSupervisor();
