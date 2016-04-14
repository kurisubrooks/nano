const path = require("path");
const core = require(path.join(__dirname, "../", "core.js"));
const keychain = require(path.join(__dirname, "../", "keychain.js"));
const kuroshiro = require("kuroshiro");

exports.main = (slack, channel, user, args, ts, config) => {
    kuroshiro.init(function (err) {
        var result = kuroshiro.convert(args.join(''), { mode: 'spaced', to: 'romaji' });

        slack._apiCall("chat.postMessage", {
            as_user: true,
            channel: channel.id,
            attachments: JSON.stringify([{
                "author_name": config.trigger.name + ': ' + args.join(''),
                "author_icon": config.trigger.icon,
                "fallback": "Here\'s your translation:",
                "color": core.info,
                "text": result
            }])
        }, core.delMsg(channel.id, ts));
    });
};
