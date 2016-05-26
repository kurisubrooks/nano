const request = require("request");
const path = require("path");
const core = require(path.join(__dirname, "../", "core.js"));
const keychain = require(path.join(__dirname, "../", "keychain.js"));

exports.main = (slack, channel, user, args, ts, config) => {
    var url = "https://www.googleapis.com/customsearch/v1?key=" + keychain.google + "&num=1&cx=006735756282586657842:s7i_4ej9amu&q=" + encodeURIComponent(args.join(" "));

    request(url, function(err, res, body) {
        if (err) {
            channel.send(core.error("search", err));
            return;
        } else if (res.statusCode == 200) {
            var data = (typeof data === "object") ? body : JSON.parse(body);

            if (data.searchInformation.totalResults !== "0") {
                var result = data.items[0];

                slack._apiCall("chat.postMessage", {
                    "as_user": true,
                    "channel": channel.id,
                    "unfurl_links": false,
                    "unfurl_media": false,
                    "attachments": JSON.stringify([{
                        "author_name": config.trigger.real_name,
                        "author_icon": config.trigger.icon,
                        "fallback": config.trigger.username + ": Here\'s the result of your search",
                        "color": core.info,
                        "title": result.title,
                        "title_link": result.link,
                        "text": result.snippet + "\n" + "<" + decodeURIComponent(result.link) + ">",
                        "thumb_url": (result.pagemap && result.pagemap.cse_thumbnail) ? result.pagemap.cse_thumbnail[0].src : ""
                    }])
                }, core.delMsg(channel.id, ts));
            }
        } else if (res.statusCode != 200){
            if (res.statusCode == 403) {
                channel.send(core.error("search", "Exceeded Maximum Daily API Call Limit"));
            } else if (res.statusCode == 500) {
                channel.send(core.error("search", "Unknown Error Occurred"));
            } else {
                channel.send(core.error("search", "Unknown Error Occurred - " + res.statusCode));
            }
        }
    });
};
