const request = require("request");
const crimson = require("crimson");
const path = require("path");
const keychain = require(path.join(__dirname, "keychain.js"));

exports.success = '#52C652';
exports.error = '#E93F3C';
exports.warn = '#F5AD1E';
exports.info = '#52B7D6';
exports.debug = false;
exports.kurisu = 'U0E4ZL97H';
exports.errno = '*Nano.js has encountered an error!* ';

exports.delMsg = function(channel, timestamp) {
    request.post("https://slack.com/api/chat.delete", {form: {token: keychain.user, ts: timestamp, channel: channel}}, (error, response, body) => {
        if (error) crimson.error(error);
    });
};
