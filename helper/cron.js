const cron = require("node-cron");
const cronModel = require("../model/cron")
const moment = require("moment");

// DATA RETENTION POLICY
module.exports.dataRetentionJob = function dataRetentionJob() {

    // EVERY 5 SECOND - TESTING PURPOSES
    // cron.schedule("*/5 * * * * *", async function () {
    //     const today = moment().tz('Asia/Singapore').format('YYYY-MM-DD HH:mm:ss');
    //     const interval = '1 YEAR';
    //     console.log(`CRON: Cron job executed at: SGT ${today}`)

    //     try {
    //         let result = await cronModel.cronSelectUsers(today, interval);
    //         console.log(result);

    //         result
    //             ? console.log(`CRON: Successfully selected ${result.length} users`)
    //             : console.log(`CRON: No users to select`)

    //     } catch (error) {
    //         console.log(`CRON: ${error}`);
    //     }
    // });

    // EVERY DAY 1 OF THE MONTH AT 00:00 HRS
    cron.schedule("0 0 1 * *", async function () {
        const today = moment().tz('Asia/Singapore').format('YYYY-MM-DD HH:mm:ss');
        const interval = '1 YEAR';
        console.log(`CRON: Cron job executed at: SGT ${today}`)

        try {
            let result = await cronModel.cronDeleteUsers(today, interval);

            result
                ? console.log(`CRON: Successfully deleted ${result} users`)
                : console.log(`CRON: No users to delete`)

        } catch (error) {
            console.log(`CRON: ${error}`);
        }
    });
}