var twitter = require("twitter");
var Slack = require('slack-client');
var quake = require("./lib/eew");

// Slack Token
var token = '';
var autoReconnect = true;
var autoMark = true;

var slack = new Slack(token, autoReconnect, autoMark);

slack.on('open', function() {
    console.log("> Connected to Slack");
});

// EEW
var client = new twitter({
    consumer_key: '',
    consumer_secret: '',
    access_token_key: '',
    access_token_secret: ''
});

var userID = 214358709; // eewbot
//var userID = 3313238022; // LighterBot1
client.stream('statuses/filter', {follow: userID}, function(stream) {
    stream.on('data', function(tweet) {
        //if (tweet.delete != undefined) {return;}
        //if (tweet.user.id_str == userID) {
            newQuake(tweet.text);
        //}
    });

    stream.on('error', function(error) {
        throw error;
    });
});

function newQuake(input) {
    quakeData = quake.dataParse(input);

    var titleString =
        quakeData.earthquake_time + " - " + quakeData.epicenterEN;
    var messageString =
        "Update " + quakeData.situationString + ", Magnitude: " + quakeData.magnitude + ", Seismic: " + quakeData.seismicLocale;

    console.log(quakeData);
    console.log(titleString);
    console.log(messageString);

    slack._apiCall('chat.postMessage', {
        as_user: true,
        channel: '#general',
        text: titleString + "\n" + messageString
    });
}

slack.on('message', function(message) {
    var channel = slack.getChannelGroupOrDMByID(message.channel);
    var user = slack.getUserByID(message.user);
    var response = '';
    var type = message.type, ts = message.ts, text = message.text;
    var channelName = (channel != null ? channel.is_channel : void 0) ? '#' : '';
    var channelName = channelName + (channel ? channel.name : 'UNKNOWN_CHANNEL');
    var userName = (user != null ? user.name : void 0) != null ? "@" + user.name : "UNKNOWN_USER";

    if (type === 'message' && (text == 'eeheehee')) {
        channel.send("Don't touch me there senpai ( ͡° ͜ʖ ͡°)");
    }

    /*
    if (type === 'message' && (text != null) && (channel != null)) {
        response = text.split('').reverse().join('');
        channel.send(response);
        return console.log("@" + slack.self.name + " responded with \"" + response + "\"");
    } else {
        typeError = type !== 'message' ? "unexpected type " + type + "." : null;
        textError = text == null ? 'text was undefined.' : null;
        channelError = channel == null ? 'channel was undefined.' : null;
        errors = [typeError, textError, channelError].filter(function(element) {
          return element !== null;
        }).join(' ');
        return console.log("@" + slack.self.name + " could not respond. " + errors);
    }
    */
});

slack.on('error', function(error) {
    return console.error("Error: " + error);
});

slack.login();
