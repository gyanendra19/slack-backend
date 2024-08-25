const express = require('express')
const bodyParser = require('body-parser')
const dotenv = require('dotenv')
const axios = require('axios')
dotenv.config({ path: '.env' })

const app = express()
app.use(bodyParser.urlencoded({ extended: true }));
console.log(process.env.SLACK_BOT_TOKEN);

app.post('/slack/interact', async (req, res) => {
    console.log(req.body);
    const payload = JSON.parse(req.body.payload);
    res.status(200).send('');

    if (payload.type === 'dialog_submission' && payload.callback_id === 'select_user') {
        const selectedUser = payload.submission.user_select;
        const message = payload.submission.message;

        try {
            const response = await axios.post('https://slack.com/api/chat.postMessage', {
                channel: selectedUser,
                text: message,
            }, {
                headers: {
                    Authorization: `Bearer ${process.env.SLACK_BOT_TOKEN}`
                }
            });

            if (response.data.ok) {
                console.log('Message sent successfully!');
            } else {
                console.error('Error sending message:', response.data.error);
            }

        } catch (error) {
            console.error('Error making Slack API call:', error);
        }
    }



    if (payload.type === 'shortcut') {
        try {
            const dialog = {
                trigger_id: payload.trigger_id,
                dialog: {
                    callback_id: 'select_user',
                    title: 'Send a Message',
                    submit_label: 'Send',
                    elements: [
                        {
                            type: 'select',
                            label: 'Pick a user',
                            name: 'user_select',
                            data_source: 'users'
                        },
                        {
                            type: 'textarea',
                            label: 'Message',
                            name: 'message'
                        }
                    ]
                }
            };

            const response = await axios.post('https://slack.com/api/dialog.open', dialog, {
                headers: {
                    'Authorization': `Bearer ${process.env.SLACK_BOT_TOKEN}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.statusText === 'OK') {
                console.log('Dialog opened in slack');
            } else {
                console.log('Error opening Dialog');

            }

        } catch (error) {
            console.error('Error making Slack API call:', error);
        }
    }
});

app.listen('3555', () => {
    console.log('Listening on port 3555');

})