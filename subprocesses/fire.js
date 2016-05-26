const path = require("path");
const request = require("request");
const _ = require("lodash");
const XML = require("xml2js");
const parser = new XML.Parser();

var cache = [];

exports.main = (slack, config, botdir) => {
    const core = require(path.join(botdir, "core.js"));
    const url = "http://www.rfs.nsw.gov.au/feeds/major-Fire-Updates.xml";
    const interval = 120000;

    function error(from, message) {
        slack._apiCall("chat.postMessage", {
            "as_user": true,
            "channel": "G0KDNTCF3", // #Ministry
            "attachments": JSON.stringify([{
                "color": core.danger,
                "mrkdwn_in": ["text"],
                "title": "An fire has occurred in subprocess 'fire':",
                "fallback": "<Error>",
                "text": core.error(from, message)
            }])
        });

        throw(message);
    }

    function check() {
        request(url, function (err, res, out) {
            if (err) {
                error("request", err);
            } else if (out === undefined) {
                error("request", "Response:\n" + out + "\n\nStatus Code: " + res.statusCode);
            } else {
                parser.parseString(out, (error, response) => {
                    if (error) error("parser.parseString", error);
                    if (response === undefined || res.statusCode !== 200)
                        error("parser.parseString", "Response:\n" + out + "\n\nStatus Code: " + res.statusCode);
                    if (cache.length === 0) cache = response;

                    for (i = 0; i < response.rss.channel[0].item.length; i++) {
                        if (cache.rss.channel[0].item[i].guid[0]._ === response.rss.channel[0].item[i].guid[0]._) return;
                        cache = response;

                        slack._apiCall("chat.postMessage", {
                            "as_user": true,
                            "channel": "C16MCPJ23", // #Bots
                            "attachments": JSON.stringify([{
                                "color": core.danger,
                                "mrkdwn_in": ["text"],
                                "title": ":fire: NSW RFS Alert",
                                "fallback": "An RFS Fire Alert has been issued.",
                                "text": `*${response.rss.channel[0].item[i].title[0]}*\n${response.rss.channel[0].item[i].description[0]}`
                            }])
                        });
                    }
                });
            }
        });
    }

    setTimeout(function() {
        setInterval(check, interval);
        check();
    }, 3000);
};
