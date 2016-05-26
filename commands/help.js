const _ = require("lodash");
const path = require("path");
const config = require("../config.json");
const core = require("../core.js");

exports.main = (slack, channel, user, args, ts, other) => {
    var commands = "*Commands:*\n";
    var reacts = "*Reactions:*\n";
    var gifs = "*GIFs:*\n";

    _.forEach(config.commands, (value) => {
        if (value.admin && other.masters.indexOf(other.trigger.id) > -1) commands += `\`!${value.command}\`: ${value.desc} *[ADMIN]*\n`;
        else if (!value.admin) commands += `\`!${value.command}\`: ${value.desc}\n`;
    });

    _.forEach(config.reacts, (value, key) => {
        reacts += `\`!${key}\` `;
    });

    _.forEach(config.gifs, (value, key) => {
        gifs += `\`!${key}\` `;
    });

    slack._apiCall("chat.postMessage", {
        "as_user": true,
        "channel": channel.id,
        "attachments": JSON.stringify([{
            "author_name": other.trigger.real_name,
            "author_icon": other.trigger.icon,
            "fallback": "You need help? What about me! *sobs*",
            "color": core.info,
            "mrkdwn_in": ["text"],
            "text": commands + "\n" + reacts + "\n\n" + gifs
        }])
    }, core.delMsg(channel.id, ts));
};
