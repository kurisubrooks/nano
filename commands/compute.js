const path = require("path");
const core = require(path.join(__dirname, "../", "core.js"));
const keychain = require(path.join(__dirname, "../", "keychain.js"));
const wolfram = require('wolfram').createClient(keychain.wolfram);

const print = console.log;

exports.main = (slack, channel, user, args, ts, config) => {
    wolfram.query(args.join(' '), (e, r) => {
        if (e) {
            channel.send("*Error:* An error occurred within `compute.js`:\n```" + e + "```");
            return;
        }

        print(r);
    });
};
