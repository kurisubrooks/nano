const path = require("path");
const crimson = require("crimson");
const request = require("request");
const XML = require("xml2js");
const parser = new XML.Parser();

var cache = [];

exports.main = (slack, config, botdir) => {
    const core = require(path.join(botdir, "core.js"));
    const url = "http://www.rfs.nsw.gov.au/feeds/major-Fire-Updates.xml";
    const icon = "https://i.imgur.com/y9ZkIld.png";
    const interval = 2500;

    function check() {
        request(url, function (error, response, output) {
            if (error) crimson.error(error);
            else if (output === undefined) crimson.error("Output was undefined. Source may be down.");

            parser.parseString(output, function (error, response) {
                if (error) logger.error(error);
                if (response === undefined) crimson.error("Parsed XML was undefined. Source may be down.");
                if (cache.length === 0) cache = response;

                for (i = 0; i < response.rss.channel[0].item.length; i++) {
                    if (cache.rss.channel[0].item[i].guid[0] === response.rss.channel[0].item[i].guid[0]) return;
                    else {
                        cache = response;

                        slack._apiCall("chat.postMessage", {
                            "as_user": false,
                            "username": "kasai",
                            "icon_url": icon,
                            "channel": "#general",
                            "attachments": [{
                                "color": "#792C2C",
                                "mrkdwn_in": ['text'],
                                "title": response.rss.channel[0].item[i].title[0],
                                "fallback": "An RFS Fire Alert has been issued.",
                                "text": '*' + response.rss.channel[0].item[i].title[0] + '*\n' +
                                              response.rss.channel[0].item[i].description[0]
                            }]
                        });
                    }
                }

                //crimson.info(response);
            });
        });
    }

    setInterval(() => {
        try {
            check();
        } catch (error) {
            crimson.error("lol oops missed this one: " + error);
        }
    }, interval);

    check();
};
