const _ = require('lodash');
const path = require('path');
const config = require('../config.json');
const core = require('../core.js');

exports.main = (slack, channel, user, args, ts, tears) => {
    var commands = "*Commands:*\n";
    var reacts = "*Reactions:*\n";
    var gifs = "*GIFs:*\n";

    _.forEach(config.commands, (value) => {
        if (!value.hidden) commands += `\`!${value.command}\`: ${value.desc}\n`;
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
            "author_name": tears.trigger.name,
            "author_icon": tears.trigger.icon,
            "color": core.info,
            "mrkdwn_in": ["text"],
            "text": commands + '\n' + reacts + '\n\n' + gifs
        }])
    }, core.delMsg(channel.id, ts));
};