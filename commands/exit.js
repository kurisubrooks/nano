const path = require("path");
const core = require(path.join(__dirname, "../", "core.js"));

exports.main = (slack, channel, user, args, ts, config) => {
    if (config.masters.indexOf(user.id) >= 0) {
        slack._apiCall("chat.postMessage", {
            "as_user": true,
            "channel": channel.id,
            "attachments": JSON.stringify([{
                "author_name": config.trigger.real_name,
                "author_icon": config.trigger.icon,
                "fallback": "brb",
                "image_url": "http://i.imgur.com/kiKRmYY.gif"
            }])
        }, () => {
            core.delMsg(channel.id, ts);
            setTimeout(() => process.exit(0), 1000);
        });
    } else channel.send("Insufficient Permissions to use this command");
};
