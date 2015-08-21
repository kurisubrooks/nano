var twitter = require("twitter");
var Slack = require('slack-client');
var weather = require('weather-js');

var trans = require("./lib/eew/epicenter.json");

// Slack Token
var token = '';
var autoReconnect = true;
var autoMark = true;

var slack = new Slack(token, autoReconnect, autoMark);

slack.on('open', function() {
    console.log("> Connected to Slack");
    slack._apiCall('chat.postMessage', {
        as_user: true,
        channel: '#general',
        text: 'ただいま〜'
    });
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
        if (tweet.delete != undefined) {return;}

        if (tweet.user.id_str == userID) {
            newQuake(tweet.text);
        }
    });

    stream.on('error', function(error) {
        throw error;
    });
});

function newQuake(inputData) {
    var parsedInput = inputData.split(',');

    var i, item, j, len, ref;
    ref = ["type", "training_mode", "announce_time", "situation", "revision", "earthquake_id", "earthquake_time", "latitude", "longitude", "epicenter", "depth", "magnitude", "seismic", "geography", "alarm"];

    for (i = j = 0, len = ref.length; j < len; i = ++j) {
        item = ref[i];
        global[item] = parsedInput[i];
    }

    for (var i = 0; i < trans.length; i++) {
        var item =  trans[i];
        if (item.jp == epicenter){
             epicenterJP = item.jp;
             epicenterEN = item.en;
        }
    }

    if (situation == 9){var situationString = "Final";}
    else {var situationString = "#" + revision;}

    if (seismic == '不明') {var seismicLocale = "Unknown";}
    else {var seismicLocale = seismic;}

    if (training_mode == 01) {var trainingString = ":o: ";}
    else {var trainingString = ":x: ";}

    var titleString =
        earthquake_time + " - " + epicenterEN;
    var messageString =
        "Update " + situationString +
        ", Magnitude: " + magnitude +
        ", Seismic: " + seismicLocale;

    if (revision == 1) {
        var output =
        trainingString + "*An Earthquake has Occurred.*" + "\n" +
        titleString + "\n" + messageString;}
    else {var output = messageString;}

    console.log(titleString);
    console.log(messageString);

    slack._apiCall('chat.postMessage', {
        as_user: true,
        channel: '#general',
        text: output
    });
}

slack.on('message', function(message) {
    var channel = slack.getChannelGroupOrDMByID(message.channel);
    var user = slack.getUserByID(message.user);
    var type = message.type;
    var text = message.text;

    if (text == null) {
        return;
    }

    // Weather
    /*if (type == 'message' && text == '!weather') {
        weather.find({search: 'Penrith, NSW', degreeType: 'C'}, function(err, result) {
            if(err) console.log(err);

            //var weatherjson = JSON.stringify(result, null, 2);
            //var weatherout = json.parse(weatherjson);

            //function weatherdata(result) {
            //    weatherdata = JSON.stringify(result, null, 2);
            //}

            channel.send(result.temperature);
            //channel.send(JSON.stringify(result, null, 2));
        });
    }*/

    // Commands
    if (type == 'message') {
        if (text == '.commands' || text == '.help' || text == '.halp') {
            channel.send("`.shrug`, `.kawaii`, `.close`, `.nya`, `.flip`, `.lenny`, `.cries`, `.meep`, `.nbc`, `.facepalm`, `.no`, `.why`")
        }

        if (text == 'eeheehee') {
            channel.send("おっ、せーせんぱい？ ( ͡° ͜ʖ ͡°)");
        }

        if (text.indexOf('.shrug') >= 0)     {channel.send("¯\\_(ツ)_/¯");}
        if (text.indexOf('.kawaii') >= 0)   {channel.send("(ﾉ◕ヮ◕)ﾉ*:・ﾟ✧");}
        if (text.indexOf('.nya'||'.meow')>=0){channel.send("(=^･ω･^=)");}
        if (text.indexOf('.flip') >= 0)     {channel.send("(╯°□°）╯︵ ┻━┻)");}
        if (text.indexOf('.lenny') >= 0)    {channel.send("( ͡° ͜ʖ ͡°)");}
        if (text.indexOf('.cries') >= 0)    {channel.send("(;´∩`;)");}
        if (text.indexOf('.nbc') >= 0)      {channel.send(":stars: *NBC*\n_the more you know_");}
        if (text.indexOf('.close') >= 0)    {channel.send("You were so close...");}
        if (text.indexOf('.meep') >= 0)     {channel.send("°ਉ°");}

        if (text.indexOf('.facepalm') >= 0) {channel.send("http://replygif.net/i/1370.gif");}
        if (text.indexOf('.no') >= 0) {channel.send("http://media0.giphy.com/media/rsBVkMZABjup2/giphy.gif");}
        if (text.indexOf('.why') >= 0)  {channel.send("http://media.giphy.com/media/YA7LXKMnPHR96/giphy.gif");}

        if (text == 'nano') {
            channel.send("何？");
        }

        if (user == slack.getUserByID("U08C6H4JV") && text.indexOf('tadaima') >= 0) {
            channel.send("おかえり、先輩 :sparkling_heart:");
        }
    }
});

slack.on('error', function(error) {
    return console.error("Error: " + error);
});

slack.login();
