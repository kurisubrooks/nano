const request = require("request");
const crimson = require("crimson");
const path = require("path");
const keychain = require(path.join(__dirname, "keychain.js"));

exports.delMsg = function(channel, timestamp) {
    request.post("https://slack.com/api/chat.delete", {form: {token: keychain.user, ts: timestamp, channel: channel}}, function(error, response, body) {
        if(error) crimson.error(error);
    });
};
