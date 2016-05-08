const path = require("path");
const core = require(path.join(__dirname, "../", "core.js"));

exports.main = (slack, channel, user, args, ts, config) => {
    var text = "#just" + args.join("").toLowerCase() + "things";

    slack._apiCall("chat.postMessage", {
        "as_user": false,
        "username": config.trigger.username,
        "icon_url": config.trigger.icon,
        "channel": channel.id,
        "text": text
    }, () => core.delMsg(channel.id, ts));
};
