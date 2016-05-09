const path = require("path");
const Twitter = require("node-tweet-stream");

const account = "3124125244"; // @shibesbot
const channel = "C179ZSRH7"; // #shibe

exports.main = (slack, config, botdir) => {
    const keychain = require(path.join(botdir, "keychain.js"));
    const twitter = new Twitter(keychain.twitter);

    twitter.follow(account);
    twitter.on("tweet", (tweet) => {
        if (tweet.delete !== undefined || tweet.user.id_str != account) return;
        if (tweet.entities && tweet.entities.media && tweet.entities.media.length > 0) {
            slack._apiCall("chat.postMessage", {
                "as_user": false,
                "username": "shibe",
                "icon_url": "http://i.imgur.com/hndQsEI.png",
                "channel": channel,
                "attachments": JSON.stringify([{
                    "fallback": `<wow. cute shibe. very kawaii>`,
                    "image_url": tweet.entities.media[0].media_url,
                    "text": tweet.text
                }])
            });
        }
    });
};
