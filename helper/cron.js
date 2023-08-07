const cron = require("node-cron");
const cronModel = require("../model/cron")
const moment = require("moment");
const elasticEmail = require('elasticemail');

const elasticEmailClient = elasticEmail.createClient({ apiKey: process.env.elasticAPIKey });


// DATA RETENTION POLICY
module.exports.dataRetentionJob = function dataRetentionJob() {

    // EVERY 5 SECOND - TESTING PURPOSES
    // cron.schedule("*/2 * * * * *", async function () {
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

    // EVERY FIRST DAY OF THE MONTH AT 00:00 HRS
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

module.exports.remindParentJob = function remindParentJob() {
    cron.schedule("0 0 0 * * *", async function () {
        const today = moment().tz('Asia/Singapore').format('YYYY-MM-DD HH:mm:ss');
        const interval = '7 DAY';
        console.log(`CRON: Cron job executed at: SGT ${today}`)

        try {
            let result = await cronModel.cronSelectParentsToRemind(today, interval);

            result
                ? console.log(`CRON: Successfully selected ${result.length} parents`)
                : console.log(`CRON: No parents to select`)

            result = JSON.parse(JSON.stringify(result));
            // console.log(result);
            // Update lastNotified
            let updateResult = await cronModel.cronUpdateLastNotified(today, interval);

            updateResult
                ? console.log(`CRON: Successfully updated ${updateResult} parents`)
                : console.log(`CRON: No parents to update`)

            // Send email
            result.forEach(async (parent) => {
                const email = parent.parentEmail;

                // Send email
                const emailParams = {
                    to: email,
                    subject: "Reminder: Require Parent's Acknowledgement: New Changes in Your Child's Medical Condition",
                    from: 'sg.outwardbound@gmail.com',
                    body: `test`
                };
                // Send the email using Elastic Email SDK
                elasticEmailClient.mailer.send(emailParams, (err, result) => {
                    if (err) {
                        console.log(err);
                    }
                    else {
                        console.log(result);
                    }
                });

            });
        } catch (error) {
            console.log(`CRON: ${error}`);
        }
    });
}