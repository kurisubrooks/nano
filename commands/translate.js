const path = require('path');
const core = require(path.join(__dirname, "../", "core.js"));
const request = require('request');
const qs = require('qs');
const keychain = require(path.join(__dirname, "../", "keychain.js"));
const url = keychain.translate;

exports.main = (slack, channel, user, args, ts, config) => {
  var lang = args[0].split(',');
  var translate = args.slice(1).join(' ');
  var tolang = lang[0];
  var frlang = lang.length > 1 ? lang[1] : 'auto';

  const options = {
    headers: { 'User-Agent': 'Mozilla/5.0' },
    url: url + qs.stringify({sl: frlang, tl: tolang, q: translate})
  };

  request.get(options, (e, r, b) => {
    if (e || r.statusCode !== 200 || b.startsWith(',', 1)) return;
    var t = JSON.parse(b.replace(/\,+/g, ','));
    var t_text = t[0][0][0];
    var t_lang = frlang === "auto" ? t[1] : frlang;
    var t_out = t_lang + " > " + tolang + ": " + t_text;

    slack._apiCall("chat.postMessage", {
      as_user: true,
      channel: channel.id,
      attachments: JSON.stringify([{
        "author_name": config.trigger.name + ': ' + translate,
        "author_icon": config.trigger.icon,
        "fallback": "Here\'s your translation:",
        "color": core.info,
        "text": t_out
      }])
    }, core.delMsg(channel.id, ts));
  });
};
