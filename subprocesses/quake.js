const path = require("path");
const crimson = require("crimson");

last_ts = "";
last_quake = "";

exports.main = (slack, config, botdir) => {
    const core = require(path.join(botdir, "core.js"));
    const keychain = require(path.join(botdir, "keychain.js"));
    const socket = require("socket.io-client")(keychain.shake);

    var channel = "C0E50GQDQ"; // General

    function TO_SLACK(text) {
        slack._apiCall("chat.postMessage", {
            "as_user": true,
            "channel": "G0KDNTCF3", // Ministry
            "text": text
        });
    }

    socket.on("connect", () => socket.emit("open", { version: 2 }));
    socket.on("message", (data) => TO_SLACK("Shake > Message from Server: ```" + JSON.stringify(data) + "```"));

    socket.on("auth", (data) => {
        if (data.ok) {
            crimson.success("Shake > Connected");
            TO_SLACK("Shake > Connected");
        } else {
            TO_SLACK("Shake > Connection Refused\n```" + data.message + "```");
            crimson.fatal("Shake > Connection Refused: " + data.message);
        }
    });

    socket.on("quake.eew", (data) => eew(data));
    socket.on("reconnect", () => crimson.warn("Shake > Reconnecting"));
    socket.on("disconnect", () => {
        crimson.error("Shake > Connection Lost");
        TO_SLACK("Shake > Connection Lost");
    });

    function eew(data) {
        var update;
        var template = (data.alarm) ? ":bell: Emergency Earthquake Warning" : ":shake: Earthquake Information";
            data = (typeof data === "object") ? data : JSON.parse(data);

        if (data.situation === 1) update = "Final";
        else if (data.situation === 2) update = "Cancelled";
        else update = "#" + data.revision;

        var attachments = [{
            "color": core.danger,
            "mrkdwn_in": ["text"],
            "fallback": `<Earthquake: ${data.details.epicenter.en}>`,
            "title": `${template} (${update})`,
            "text": `*Epicenter:* ${data.details.epicenter.en}\n*Magnitude:* ${data.details.magnitude}, *Max. Seismic:* ${data.details.seismic.en}, *Depth:* ${data.details.geography.depth}km`
        }];

        if (data.alarm) attachments.text += "\n*Alert:* <@kurisu> <@justin> <@kaori>";

        if (last_quake != data.id) {
            last_quake = data.id;
            setTimeout(function() {
                post(attachments);
            }, 10);
        } else if (data.situation === 1) {
            attachments.image_url = `https://maps.googleapis.com/maps/api/statucmap?center=${data.details.geography.lat},${data.details.geography.long}&zoom=6&size=400x300&format=png&markers=${data.details.geography.lat},${data.details.geography.long}&maptype=roadmap&style=feature:landscape.natural.terrain|hue:0x00ff09|visibility:off&style=feature:transit.line|visibility:off&style=feature:road.highway|visibility:simplified&style=feature:poi|visibility:off&style=feature:administrative.country|visibility:off&style=feature:road|visibility:off`;
            setTimeout(function() {
                update(attachments);
            }, 100);
        } else if (data.situation === 2) {
            attachments.title = "Earthquake Warning Cancelled";
            attachments.text = "This warning has been cancelled.";
            setTimeout(function() {
                update(attachments);
            }, 100);
        } else {
            setTimeout(function() {
                update(attachments);
            }, 100);
        }
    }

    function post(attachments) {
        slack._apiCall("chat.postMessage", {
            "as_user": true,
            "channel": channel,
            "text": " ",
            "attachments": JSON.stringify(attachments)
        }, (data) => last_ts = data.ts);
    }

    function update(attachments) {
        slack._apiCall("chat.update", {
            "ts": last_ts,
            "channel": channel,
            "text": " ",
            "attachments": JSON.stringify(attachments)
        }, (data) => last_ts = data.ts);
    }
};
