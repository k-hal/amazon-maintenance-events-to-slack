console.log('Loading function');

const https = require('https');
const url = require('url');
const slack_url = process.env.SLACK_URL;
const slack_req_opts = url.parse(slack_url);
slack_req_opts.method = 'POST';
slack_req_opts.headers = {
    'Content-Type': 'application/json'
};

exports.handler = function(event, context) {
    const message = event;
    var slack_message;

    var req = https.request(slack_req_opts, function(res) {
        if (res.statusCode === 200) {
            context.succeed('posted to slack');
        } else {
            context.fail('status code: ' + res.statusCode);
        }
    });

    req.on('error', function(e) {
        console.log('problem with request: ' + e.message);
        context.fail(e.message);
    });

    slack_message = {
        username: 'AWS Health Event Notification',
        text: 'AWS Health',
        icon_emoji: ':warning:',
        attachments: [
            {
                fallback: 'AWS Health Event Description.',
                color: 'warning',
                title: event['detail']['eventTypeCode'],
                title_link: 'https://phd.aws.amazon.com/phd/home',
                fields: [
                    {
                        title: 'Account ID',
                        value: message.account,
                        short: true
                    },
                    {
                        title: 'Region',
                        value: message.region,
                        short: true
                    },
                    {
                        title: 'Service',
                        value: message.detail.service,
                        short: true
                    },
                    {
                        title: 'Start Time',
                        value: message.detail.startTime,
                        short: true
                    },
                    {
                        title: 'Description',
                        value: message.detail.eventDescription[0].latestDescription,
                        short: false
                    }

                ]
            }
        ]
    }

    req.write(JSON.stringify(slack_message));

    req.end();
};
