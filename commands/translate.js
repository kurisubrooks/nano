const path = require("path");
const core = require(path.join(__dirname, "../", "core.js"));
const keychain = require(path.join(__dirname, "../", "keychain.js"));
const request = require("request");
const qs = require("qs");
const url = keychain.translate;

exports.main = (slack, channel, user, args, ts, config) => {
    var lang = args[0].split(",");
    var tolang = lang[0];
    var frlang = lang.length > 1 ? lang[1] : "auto";
    var translate = args.slice(1)
                        .join(" ")
                        .replace(/。/g, ". ")
                        .replace(/、/g, ", ")
                        .replace(/？/g, "? ")
                        .replace(/！/g, "! ")
                        .replace(/「/g, "\"")
                        .replace(/」/g, "\" ")
                        .replace(/　/g, " ");

    var options = {
        headers: { "User-Agent": "Mozilla/5.0" },
        url: url + qs.stringify({
            // sl: from language
            sl: frlang,
            // tl: to language
            tl: tolang,
            // q:  translation query
            q: translate
        })
    };

    request.get(options, (err, res, body) => {
        if (err || res.statusCode !== 200 || body.startsWith(",", 1)) return;
        var t = JSON.parse(body.replace(/\,+/g, ","));
        var t_text = t[0][0][0];
        var t_lang = frlang === "auto" ? t[1] : frlang;
        var t_out = "*" + t_lang + "*: " + translate + "\n*" + tolang + "*: " + t_text;

        slack._apiCall("chat.postMessage", {
            as_user: true,
            channel: channel.id,
            attachments: JSON.stringify([{
                "author_name": config.trigger.real_name,
                "author_icon": config.trigger.icon,
                "fallback": translate + " > " + t_text,
                "mrkdwn_in": ["text"],
                "color": core.info,
                "text": t_out
            }])
        }, core.delMsg(channel.id, ts));
    });
};
