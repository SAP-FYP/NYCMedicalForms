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

                const htmlString = `<!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1">
                    <title>Reminder: Important Medical Updates</title>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            padding: 20px;
                            background-color: #f5f5f5;
                        }
                
                        .container {
                            max-width: 600px;
                            margin: 0 auto;
                            background-color: #fff;
                            padding: 20px;
                            border-radius: 5px;
                            box-shadow: 0 2px 5px rgba(0, 0, 0, .1);
                        }
                
                        .logo {
                            text-align: left;
                            margin-bottom: 40px;
                        }
                
                        .logo img {
                            max-width: 300px;
                        }
                
                        .message {
                            margin-bottom: 20px;
                            font-size: 16px;
                        }
                
                        .footer {
                            text-align: center;
                            color: #888;
                            font-size: 14px;
                            margin-top: 20px;
                            border-top: 1px solid #ccc;
                            padding-top: 20px;
                        }
                
                        .footer hr {
                            margin-bottom: 10px;
                        }
                
                        .footer p {
                            margin-bottom: 10px;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="logo">
                            <img src="https://res.cloudinary.com/sp-esde-2100030/image/upload/v1688051640/obs-logo_pi70gy.png" alt="Logo">
                        </div>
                        <div class="message">
                            <p>Dear Parent,</p>
                            <p>We hope this email finds you well. We would like to remind you that we have recently made important updates to your child's medical records, but we have not yet received your acknowledgment of these updates.</p>
                            <p>Your prompt acknowledgment is crucial for us to ensure the well-being of your child.</p>
                            <p>If you have already acknowledged the updates, please accept our apologies for this reminder.</p>
                            <p>Thank you for your attention to this matter.</p>
                            <p>Warm regards,</p>
                            <p>National Youth Council in affiliation with Outward Bound Singapore</p>
                        </div>
                        <div class="footer">
                            <p>This email was sent to you by the Administrative Team. If you have any questions, please contact our support team.</p>
                            <p>© National Youth Council | Outward Bound Singapore.</p>
                        </div>
                    </div>
                </body>
                </html>
                `
                
                // Send email
                const emailParams = {
                    to: email,
                    subject: "Reminder: Require Parent's Acknowledgement: New Changes in Your Child's Medical Condition",
                    from: 'sg.outwardbound@gmail.com',
                    body: htmlString
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