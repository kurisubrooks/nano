// Defining things that should never be changed throughout runtime.
const Slack = require("slack-client");
const _ = require("lodash");
const path = require("path");
const util = require("util");
const crimson = require("crimson");
const core = require(path.join(__dirname, "core.js"));
const quake = require(path.join(__dirname, "quake.js"));
const keychain = require(path.join(__dirname, "keychain.js"));


// Shake
const shake = require("socket.io-client")(keychain.shake);

function shake_general(text) {
    slack._apiCall("chat.postMessage", {
        as_user: true,
        channel: "#general",
        text: text
    });
}

shake.on("connect", () => {
    crimson.success("Connected to Shake.");
    if (!config.debug) return;
    shake_general("Connected to Shake.");
});

shake.on("data", data => {
    require(path.join(__dirname, "quake.js")).run(slack, data);
});

shake.on("reconnect", () => {
    crimson.warn("Connection to Shake was lost, reconnecting...");
    shake_general("*Notice*: Connection to Shake was lost, reconnecting...");
});

shake.on("disconnect", () => {
    crimson.error("Connection to Shake was lost!");
    shake_general("*Error*: Connection to Shake was lost!");
});

// Implements crimson Fatal error.
crimson.fatalerror = (text) => { crimson.error("[FATAL] " + text); process.exit(1); };

// Debug mode.
var debug = false;
crimson.nicedebug = (text) => { if(debug) crimson.debug(text); };

const wrongType = (part, command, key) => crimson.fatal("Incorrect type for " + part + " in command " + command + " at key " + key + ".");

// Try to load config files.
try {
    // Define config and bot.
    const config = require(path.join(__dirname, "config.json"));
    if (typeof config.sign !== "string" || typeof config.debug !== "boolean") crimson.fatal("Configuration of 'sign' and/or 'debug' is incorrect.");
    const commands = config.commands;
    if (!(commands instanceof Array)) crimson.fatal("Section `commands` should be an array.");

    _.each(commands, (command, key) => {
        if (typeof command.command !== "string") crimson.fatal("Missing command name ['command'] at key " + key + ".");
        if (typeof command.desc !== "string") wrongType("description ['desc']", command.command, key);
        if (!(command.args instanceof Array)) wrongType("alias ['alias']", command.command, key);
        if (!(command.args instanceof Array)) wrongType("arguments ['args']", command.command, key);
        _.each(command.alias, (v) => { if (typeof v !== "string") wrongType("alias ['alias']", command.command, key); });
        _.each(command.args, (v) => { if (!(v instanceof Array)) wrongType("arguments ['args']", command.command, key); });
    });

} catch(e) {
    crimson.error("Failed to start. Either config.json is not present, corrupted or missing arguments.");
    crimson.fatal("Error: " + e);
}

// Initialise Slack and it's functions.
const slack = new Slack(keychain.slack, true, true);

// This fires when the client has authenticated with Slack servers.
slack.on("loggedIn", (user, team) => {
    // Enable debug mode if enabled in config or if bot name does not match logged in name.
    if (config.debug) debug = true;

    crimson.info("Logged in to team " + team.name + " (" + team.id + ") as " + user.name + " (" + user.id + ").");
    crimson.nicedebug("Please note that messages will not be received until the chat is opened.");
});

// This fires when the client has opened chat and can now receive messages.
slack.on("open", () => crimson.nicedebug("Chat has been opened, and messages can now be received."));

// Ouch. Disconnected from Slack!
slack.on("close", () => crimson.warn("Disconnected from Slack."));

// Noooooo!
slack.on("error", () => crimson.fatal("A Slack error has occured: " + util.inspect(error)));

slack.on("message", (data) => {
    // Do not continue if sender is self, or is not a message or a me_message.
    if (data._client.self.id === data.id) return;
    if (typeof data.subtype !== "undefined" && ["me_message"].indexOf(data.subtype) === -1) return;
    // Defines the bot user, and checks if it is a message, or a message with subtype.
    var me = slack.self, isMessage = typeof data.subtype === "undefined", ts = data.ts,
    // Gets bot user's profile, and defines the current channel.
    profile = me._client.users[me.id].profile, channel = slack.getChannelGroupOrDMByID(data.channel),
    // Defines the message-sending user and type of chat.
    user = slack.getUserByID(data.user), type = isMessage ? data.type : data.subtype,
    // Defines the message text, first checking if message has subtype, and defines whether it is an IM.
    text = data.text, im = channel.is_im === true;

    // If there are no text, do not continue.
    if (text.length < 1) return;

    // Indicate in console that we've got chat.
    crimson.info("Message: [" + type + "]<" + channel.name + "> " + user.name + ": " + text);

    // Define this so we can skip command parsing if Gifs or Reacts matched.
    var matchedReactOrGif = false;

    // Foreach every part of the text.
    _.each(text.split(" "), (part) => {
        // If the parts start with the sign, remove the sign and continue, otherwose do not continue.
        if (part.startsWith(config.sign)) part = part.slice(config.sign.length).toLowerCase();
        else return;

        // Reacts.
        // If part exists in Reacts object.
        if (typeof config.reacts[part] === "string") {
            // Send reaction.
            channel.send(config.reacts[part]);
            // If text is equals to part, delete message.
            if (text === config.sign + part) core.delMsg(channel.id, ts);
            // Sets gif or reacts matched to true.
            matchedReactOrGif = true;
            // Do not continue for gifs.
            return;
        }

        // Gifs.
        if (typeof config.gifs[part] === "string") {
            // Send Gif.
            slack._apiCall("chat.postMessage", {
                "as_user": true,
                "channel": channel.id,
                "attachments": JSON.stringify([{
                    "fallback": "<gif>",
                    "image_url": config.gifs[part]
                }])
            });
            // If text is equals to part, delete message.
            if (text === config.sign + part) core.delMsg(channel.id, ts);
            // Sets gif or reacts matched to true.
            matchedReactOrGif = true;
        }
    });

    if (matchedReactOrGif) return;

    // Begin command checks.
    if (text.startsWith(config.sign) || im) {
        // Define array containing arguments.
        var args = text.split(" "),
        // Define raw command, without command sign sliced.
        command = args.splice(0, 1)[0].toLowerCase();
        if (command.startsWith(config.sign)) command = command.slice(config.sign.length);

        if(command === "quake") {
            quake.run(slack, '{"type":"0","drill":false,"announce_time":"2015/10/24 13:27:37","earthquake_time":"2015/10/24 13:26:35","earthquake_id":"20151024132650","situation":"0","revision":"1","latitude":"42.8","longitude":"143.2","depth":"110km","epicenter_en":"Central Tokachi Subprefecture","epicenter_ja":"十勝地方中部","magnitude":"3.7","seismic_en":"2","seismic_ja":"2","geography":"land","alarm":"0"}');

            setTimeout(function() {
                quake.run(slack, '{"type":"0","drill":false,"announce_time":"2015/10/24 13:27:37","earthquake_time":"2015/10/24 13:26:35","earthquake_id":"20151024132650","situation":"0","revision":"2","latitude":"42.8","longitude":"143.2","depth":"110km","epicenter_en":"Central Tokachi Subprefecture","epicenter_ja":"十勝地方中部","magnitude":"3.7","seismic_en":"2","seismic_ja":"2","geography":"land","alarm":"0"}');
            }, 2000);

            setTimeout(function() {
                quake.run(slack, '{"type":"0","drill":false,"announce_time":"2015/10/24 13:27:37","earthquake_time":"2015/10/24 13:26:35","earthquake_id":"20151024132650","situation":"1","revision":"3","latitude":"42.8","longitude":"143.2","depth":"110km","epicenter_en":"Central Tokachi Subprefecture","epicenter_ja":"十勝地方中部","magnitude":"3.7","seismic_en":"2","seismic_ja":"2","geography":"land","alarm":"0"}');
            }, 4000);
            return;
        }

        try {
            // Matches alias from command, to get original command.
            var matchedAlias = _.map(_.filter(commands, {alias: [command]}), "command");

            // If there are matches, set first match to command.
            var originalCommand = command;
            if (matchedAlias.length > 0) command = matchedAlias[0];
            // If there are no command matches, do not continue.
            var matched = _.filter(commands, {command: command});
            if (matched.length < 1) return;
            // Set matched command to first matched command.
            else matched = matched[0];
            // Retrieves list of supported arguments count.
            var supportedArgs = [];
            _.each(matched.args, (v) => {
                supportedArgs.push(v.length);
            });
            // If supported arguments count don't match argument count, do not continue.
            if (matched.args.length !== 0 && supportedArgs.indexOf(args) === -1) return;
            // Runs command.
            var others = {config: config, command: originalCommand};
            var module = require(path.join(__dirname, "commands", command + ".js"));
            module.main(slack, channel, user, text, ts, others);

        } catch(e) {
            channel.send("Failed to run command `" + command + "`. Here's what Na-nose: ```" + e + "```");
        }
    }
});



slack.login();
