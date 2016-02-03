const path = require("path");
const crimson = require("crimson");

latestTS = "";
latestQuake = "";

exports.main = (slack, config, botdir) => {
    const core = require(path.join(botdir, "core.js"));
    const keychain = require(path.join(botdir, "keychain.js"));
    const shake = require("socket.io-client")(keychain.shake);

    function kurisu_pls(text) {
        slack._apiCall("chat.postMessage", {
            "as_user": false,
            "username": "shake",
            "icon_url": "http://i.imgur.com/taEr9cQ.png",
            "channel": "G0KDNTCF3",
            "text": text
        });
    }

    shake.on("connect", () => {
        crimson.success("Connected to Shake.");
        if (config.debug) kurisu_pls("Connected.");
    });

    shake.on("data", data =>
        run(slack, data));

    shake.on("reconnect", () => {
        crimson.warn("Connection to Shake was lost, reconnecting...");
        if (config.debug) kurisu_pls("Reconnecting...");
    });

    shake.on("disconnect", () => {
        crimson.error("Connection to Shake was lost!");
        kurisu_pls("*Error*: Disconnected!");
    });

    function run(slack, data) {
        data = JSON.parse(data);
        var update = "";

        if (Number(data.situation) === 1) update = "Update Final";
        else if (Number(data.revision) === 1) update = "Epicenter";
        else update = "Update #" + (Number(data.revision) - 1);

        var attachment = {
            "color": core.error,
            "mrkdwn_in": ["text"],
            "fallback": "Earthquake - " + data.epicenter_en + ", Magnitude " + data.magnitude,
            "title": ":shake: An Earthquake has Occured",
            "text": "*" + update + ":* " + data.epicenter_en + "\n*Magnitude:* " + data.magnitude + ", *Seismic:* " + data.seismic_en + ", *Depth:* " + data.depth
        };

        if (Number(data.situation) === 1) attachment.image_url = "https://maps.googleapis.com/maps/api/staticmap?center=" + data.latitude + "," + data.longitude + "&zoom=6&size=400x300&format=png&markers=" + data.latitude + "," + data.longitude + "&maptype=roadmap&style=feature:landscape.natural.terrain|hue:0x00ff09|visibility:off&style=feature:transit.line|visibility:off&style=feature:road.highway|visibility:simplified&style=feature:poi|visibility:off&style=feature:administrative.country|visibility:off&style=feature:road|visibility:off";

        if (latestQuake !== data.earthquake_id) {
            latestQuake = data.earthquake_id;
            slack._apiCall("chat.postMessage", {
                "as_user": false,
                "username": "shake",
                "icon_url": "http://i.imgur.com/taEr9cQ.png",
                "channel": "C0E50GQDQ",
                "attachments": JSON.stringify([attachment])
            }, (data) => latestTS = data.ts);
        } else {
            slack._apiCall("chat.update", {
                "ts": this.latestTS,
                "channel": "C0E50GQDQ",
                "text": " ",
                "attachments": JSON.stringify([attachment])
            }, (data) => latestTS = data.ts);
        }
    }
};
