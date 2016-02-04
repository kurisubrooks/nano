const _ = require("lodash");
const path = require("path");
const request = require("request");
const core = require(path.join(__dirname, "../", "core.js"));
const keychain = require(path.join(__dirname, "../", "keychain.js"));

const util = require("util");

// Do not change this to ES6, does not work then.
String.prototype.toUpperLowerCase = function() {
    var string = this.split("");
    string[0] = string[0].toUpperCase();
    return string.join("");
};

exports.main = (slack, channel, user, args, ts, config) => {
    request.get({url: "https://api.wunderground.com/api/" + keychain.wunderground + "/conditions/q/" + encodeURIComponent(args.join(" ")) + ".json"}, (error, response) => {
        if (error) {
            channel.send("*Error:* Cannot connect to Wunderground servers.");
            return;
        }
        var body = JSON.parse(response.body);
        if (body.response.error) {
            channel.send("*Wunderground Error:* " + (body.response.error.description).toUpperLowerCase() + ".");
            return;
        }
        if (body.response.results && body.response.results.length > 1) {
            var places = [];
            _.each(body.response.results, (v) => {
                var place = "_";
                if (v.name === v.city) place += v.name;
                else place = v.name + ", " + v.city;
                if (v.state) place += ", " + v.state;
                if (v.country_name) place += ", " + v.country_name;
                place += "_";
                places.push(place);
            });
            var lastPlace = places.pop();

            if (places.length > 2) {
                var newPlaces = places.slice(0, 2);
                lastPlace = (places.length - newPlaces.length) + " others";
                place = newPlaces;
            }

            channel.send("*Wunderground Error:* Did you mean " + places.join(", ") + " or " + lastPlace + ".");
            return;
        }
        var location = body.current_observation.display_location.full;
        slack._apiCall("chat.postMessage", {
            "as_user": true,
            "channel": channel.id,
            "attachments": JSON.stringify([{
                "author_name": config.trigger.name,
                "author_icon": config.trigger.icon,
                "color": core.info,
                "fallback": "Here's the weather for " + location + ".",
                "title": location,
                "thumb_url": body.current_observation.icon_url,
                "mrkdwn_in": ["text"],
                "text":
                    "*Temperature:* " + body.current_observation.temp_c + "º\n" +
                    "*Humidity:* " + body.current_observation.relative_humidity + "\n" +
                    "*Wind Speed:* " + body.current_observation.wind_kph + "km/h"
            }])
        }, core.delMsg(channel.id, ts));
    });
};
