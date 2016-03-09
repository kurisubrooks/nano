const path = require('path');
const core = require(path.join(__dirname, "../", "core.js"));

exports.main = (slack, channel, user, args, ts, config) => {
    if (args[1]) channel.send('*Error:* Only 1 argument is allowed.');
    else {
        var text = '#just' + args[0].toLowerCase() + 'things';

        slack._apiCall("chat.postMessage", {
            "as_user": false,
            "username": config.trigger.name,
            "icon_url": config.trigger.icon,
            "channel": channel.id,
            "attachments": JSON.stringify([{
                "fallback": text,
                "text": text,
            }])
        }, () => core.delMsg(channel.id, ts));
    }
};
