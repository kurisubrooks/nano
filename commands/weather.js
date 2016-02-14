const _ = require("lodash");
const path = require("path");
const util = require("util");
const request = require("request");
const moment = require("moment");
const core = require(path.join(__dirname, "../", "core.js"));
const keychain = require(path.join(__dirname, "../", "keychain.js"));

String.prototype.toUpperLowerCase = function() {
    var string = this.split("");
    string[0] = string[0].toUpperCase();
    return string.join("");
};

exports.main = (slack, channel, user, args, ts, config) => {
    request.get({url: "https://api.wunderground.com/api/" + keychain.wunderground + "/conditions/q/" + encodeURIComponent(args.join(" ")) + ".json"}, (error, response) => {
        if (error) {
            channel.send("*Error:* Cannot connect to Wunderground API");
            return;
        }

        var body = JSON.parse(response.body);
        if (body.response.error) {
            channel.send("*Error:* " + (body.response.error.description).toUpperLowerCase() + ".");
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

            channel.send("*Error:* Did you mean " + places.join(", ") + " or " + lastPlace + ".");
            return;
        }

        var location = body.current_observation.display_location.city + ', ' + body.current_observation.display_location.state_name;
        var offset = body.current_observation.local_tz_offset;
        var localtime = moment().utcOffset(offset).format('hh:mm a');

        slack._apiCall("chat.postMessage", {
            "as_user": true,
            "channel": channel.id,
            "attachments": JSON.stringify([{
                "color": core.info,
                "fallback": "Here's the weather for " + location,
                "title": location + ' (' + localtime + ')',
                "thumb_url": 'https://kurisubrooks.com/static/nano/weather/light/' + image((body.current_observation.weather).toLowerCase(), cycle(offset)) + '.png',
                "mrkdwn_in": ["text"],
                "text":
                    "*Temperature:* " + body.current_observation.temp_c + "º (" + body.current_observation.feelslike_c + "º)\n" +
                    "*Condition:* " + body.current_observation.weather + "\n" +
                    "*Humidity:* " + body.current_observation.relative_humidity + "\n" +
                    "*Wind Speed:* " + body.current_observation.wind_kph + "km/h"
            }])
        }, core.delMsg(channel.id, ts));
        console.log(body.current_observation.weather);
    });
};

function cycle(o) {
    var time = moment().utcOffset(o).format('HH');

    if (time <= 06 || time >= 19) {
        return 'night';
    } else {
        return 'day';
    }
}

function image(c, t) {
    if (t == 'night') {
        if (c == 'cloudy' || c == 'overcast') {
            return 'cloudy';
        } else if (c == 'smoke' || c == 'fog' || c == 'haze' || c == 'mist') {
            return 'fog';
        } else if (c == 'mostly cloudy') {
            return 'mostly_cloudy_night';
        } else if (c == 'mostly sunny') {
            return 'mostly_sunny';
        } else if (c == 'partly cloudy' || c == 'scattered clouds') {
            return 'partly_cloudy_night';
        } else if (c == 'change of rain' || c == 'rain' || c == 'showers') {
            return 'showers_night';
        } else if (c == 'chance of a thunderstorm') {
            return 'thunderstorm_night';
        } else if (c == 'light rain showers' || c == 'light rain') {
            return 'drizzle';
        } else if (c == 'sunny' || c == 'clear') {
            return 'clear_night';
        } else if (c == 'snow') {
            return 'snow_showers_night';
        } else if (c == 'light snow showers' || c == 'light snow') {
            return 'snow_flurry';
        } else if (c == 'snow and rain' || c == 'rain and snow') {
            return 'sleet';
        } else {
            return 'unknown';
        }
    } else {
        if (c == 'cloudy' || c == 'overcast') {
            return 'cloudy';
        } else if (c == 'smoke' || c == 'fog' || c == 'haze' || c == 'mist') {
            return 'fog';
        } else if (c == 'mostly cloudy') {
            return 'mostly_cloudy_day';
        } else if (c == 'mostly sunny') {
            return 'mostly_sunny';
        } else if (c == 'partly cloudy' || c == 'scattered clouds') {
            return 'partly_cloudy';
        } else if (c == 'change of rain' || c == 'rain' || c == 'showers') {
            return 'showers_day';
        } else if (c == 'chance of a thunderstorm') {
            return 'thunderstorm_day';
        } else if (c == 'light rain showers' || c == 'light rain') {
            return 'drizzle';
        } else if (c == 'sunny' || c == 'clear') {
            return 'sunny';
        } else if (c == 'snow') {
            return 'snow_showers_day';
        } else if (c == 'light snow showers' || c == 'light snow') {
               return 'snow_flurry';
        } else if (c == 'snow and rain' || c == 'rain and snow') {
            return 'sleet';
        } else {
            return 'unknown';
        }
    }
}
