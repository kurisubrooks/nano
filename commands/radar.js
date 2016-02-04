var path = require("path");
var core = require(path.join(__dirname, "..", "core.js"));
var keychain = require(path.join(__dirname, "..", "keychain.js"));

exports.main = (slack, channel, user, args, ts, config) => {
    slack._apiCall("chat.postMessage", {
        as_user: true,
        channel: channel.id,
        attachments: JSON.stringify([{
            "author_name": config.trigger.name,
            "author_icon": config.trigger.icon,
            "color": core.info,
            "fallback": "Here's the radar for Penrith, AU.",
            "title": ":loud_sound: Here's the radar for Penrith, AU.",
            "mrkdwn_in": ["text"],
            "image_url": "http://api.wunderground.com/api/" + keychain.wunderground + "/animatedradar/animatedsatellite/q/au/penrith.gif?num=8&rad.timelabel=1&rad.timelabel.x=5&rad.timelabel.y=17&delay=75&rad.width=500&sat.width=500&rad.height=500&sat.height=500&rad.rainsnow=1&rad.noclutter=1&sat.borders=1"
        }])
    });
};
