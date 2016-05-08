const Slack = require("slack-client");
const _ = require("lodash");
const path = require("path");
const util = require("util");
const crimson = require("crimson");

const core = require(path.join(__dirname, "core.js"));
const keychain = require(path.join(__dirname, "keychain.js"));

const wrongType = (part, command, key) => crimson.fatal("Incorrect type for " + part + " in command " + command + " at key " + key + ".");

// Load Config
try {
    // Define config and bot.
    const config = require(path.join(__dirname, "config.json"));
    if (typeof config.sign !== "string" || typeof config.debug !== "boolean") crimson.fatal("Configuration of 'sign' and/or 'debug' is incorrect.");
    const commands = config.commands;
    if (!(commands instanceof Array)) crimson.fatal("Section `commands` should be an array.");

    _.each(commands, (command, key) => {
        if (typeof command.command !== "string") crimson.fatal("Missing command name ['command'] at key " + key + ".");
        if (typeof command.desc !== "string")   wrongType("description ['desc']", command.command, key);
        if (!(config.masters instanceof Array)) wrongType("masters ['masters']", command.command, key);
        if (!(command.args instanceof Array))   wrongType("alias ['alias']", command.command, key);
        if (!(command.args instanceof Array))   wrongType("arguments ['args']", command.command, key);
        _.each(config.subprocesses, (v, key) => {
            if (typeof v !== "string") wrongType("subprocess ['subprocess']", "subprocesses", key);
            if (v.startsWith(config.sign)) crimson.fatal("Commands cannot start with " + config.sign);
        });
        _.each(command.alias, (v, key) => { if (typeof v !== "string") wrongType("alias ['alias']", command.command, key); });
        _.each(command.args, (v, key) => { if (!(v instanceof Array)) wrongType("arguments ['args']", command.command, key); });
    });

} catch(e) {
    crimson.error("Failed to start. Either config.json is not present, corrupted or missing arguments.");
    crimson.fatal(e);
}

// Initialise Slack
const slack = new Slack(keychain.slack, true, true);

_.each(config.subprocesses, (v) => {
    try {
        var subprocess = require(path.join(__dirname, "subprocesses", v + ".js"));
        subprocess.main(slack, config, __dirname);
    } catch(e) {
        crimson.error("Failed to start subprocess '" + v + "'.");
        crimson.fatal(e);
    }
});

slack.on("loggedIn", (user, team) => {
    crimson.info("Logged in to team " + team.name + " (" + team.id + ") as " + user.name + " (" + user.id + ").");
});

slack.on("open", () => crimson.debug("Chat socket opened"));
slack.on("close", () => crimson.warn("Disconnected from Slack!"));
slack.on("error", (error) => crimson.fatal("A Slack error has occured: " + util.inspect(error)));

slack.on('team_migration_started', () => {
    crimson.warn('Servers Migrating, Restarting in 5 seconds...');
    setTimeout(process.exit(0), 5000);
});

slack.on("message", (data) => {
    if (data._client.self.id === data.id) return;
    if (typeof data.subtype !== "undefined" && ["me_message"].indexOf(data.subtype) === -1) return;

    var me = slack.self;
    var isMessage = typeof data.subtype === "undefined";
    var ts = data.ts;
    var profile = me._client.users[me.id].profile;
    var channel = slack.getChannelGroupOrDMByID(data.channel);
    var user = slack.getUserByID(data.user);
    var type = isMessage ? data.type : data.subtype;
    var text = data.text;
    var im = channel.is_im === true;

    if (text.length < 1) return;

    crimson.info("[" + type + "]<" + channel.name + "> " + user.name + ": " + text);

    if (text.startsWith(config.sign) || im) {
        var args = text.split(" ");
        var command = args.splice(0, 1)[0].toLowerCase();

        if (command.startsWith(config.sign)) command = command.slice(config.sign.length);

        try {
            // Matches alias from command, to get original command.
            var matchedAlias = _.map(_.filter(commands, {alias: [command]}), "command");
            // If there are matches, set first match to command.
            var originalCommand = command;
            if (matchedAlias.length > 0) command = matchedAlias[0];
            // If there are no command matches, do not continue.
            var matched = _.filter(commands, {command: command});

            if (matched.length > 0) {
                // Set matched command to first matched command.
                matched = matched[0];

                // Retrieves list of supported arguments count.
                var supportedArgs = [];
                _.each(matched.args, (v) => supportedArgs.push(v.length));

                // Continue if supported arguments count match argument count.
                if (matched.args.length === 0 || supportedArgs.indexOf(args.length) !== -1) {
                    // Runs command.
                    var module = require(path.join(__dirname, "commands", command + ".js"));
                    module.main(slack, channel, user, args, ts, {
                        config: config,
                        command: originalCommand,
                        masters: config.masters,
                        trigger: {
                            id: data.user,
                            username: user.name,
                            real_name: data._client.users[data.user].profile.real_name,
                            icon: data._client.users[data.user].profile.image_original
                        }
                    });

                    return;
                }
            }
        } catch(e) {
            channel.send("Failed to run command `" + command + "`. Here's what Na-nose: ```" + e + "```");
        }
    }

    var reactOrGifMatched = false;

    // For-each every part of the text.
    _.each(text.split(" "), (part) => {
        if (reactOrGifMatched) return false;
        if (part.startsWith(config.sign)) part = part.slice(config.sign.length).toLowerCase();
        else return;

        // Reactions
        if (typeof config.reacts[part] === "string") {
            slack._apiCall("chat.postMessage", {
                "as_user": false,
                "username": user.name,
                "icon_url": data._client.users[data.user].profile.image_original,
                "channel": channel.id,
                "text": config.reacts[part]
            });

            if (text === config.sign + part) core.delMsg(channel.id, ts);
            reactOrGifMatched = true;
        }

        // GIF Reactions
        else if (typeof config.gifs[part] === "string") {
            slack._apiCall("chat.postMessage", {
                "as_user": false,
                "username": user.name,
                "icon_url": data._client.users[data.user].profile.image_original,
                "channel": channel.id,
                "attachments": JSON.stringify([{
                    "fallback": "<gif>",
                    "image_url": config.gifs[part]
                }])
            });

            if (text === config.sign + part) core.delMsg(channel.id, ts);
            reactOrGifMatched = true;
        }
    });
});

// Starts Login Connection
slack.login();
