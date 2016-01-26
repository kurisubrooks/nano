const path = require('path');
const core = require(path.join(__dirname, "../", "core.js"));

exports.main = (slack, channel, user, text, ts, config) => {
    console.log(channel.id);
    console.log(ts);
    
    slack._apiCall('chat.postMessage', {
        'as_user': true,
        'channel': channel.id,
        'attachments': JSON.stringify([{
            'fallback': 'brb',
            'image_url': 'http://i.imgur.com/kiKRmYY.gif'
        }])
    }, () => {
        core.delMsg(channel.id, ts);
        setTimeout(function(){process.exit(0);}, 2000);
    });
};