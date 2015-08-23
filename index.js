var twitter = require("twitter");
var Slack = require('slack-client');
var http = require("https");
var YQL = require('yql');

var trans = require("./lib/eew/epicenter.json");
var client = new twitter({
    consumer_key: '',
    consumer_secret: '',
    access_token_key: '',
    access_token_secret: ''
});

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

var userID = 214358709;
client.stream('statuses/filter', {follow: userID}, function(stream) {
    stream.on('data', function(tweet) {
        if (tweet.delete != undefined) {return;}

        if (tweet.user.id_str == userID) {
            newQuake(tweet.text);
            console.log(tweet.text);
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
    else {var situationString = "#" + (Number(revision) - 1);}

    if (seismic == '不明') {var seismicLocale = "Unknown";}
    else {var seismicLocale = seismic;}

    if (training_mode == 01) {var trainingString = "#FFE200";}
    else {var trainingString = "danger";}

    var titleString =
        earthquake_time + " - " + epicenterEN;
    var messageString =
        "Update " + situationString +
        ", Magnitude: " + magnitude +
        ", Seismic: " + seismicLocale;

    console.log(titleString);
    console.log(messageString);

    if (revision == 1) {
        var quakeTitle = "An Earthquake has Occurred.";
        var quakeText = titleString + "\n" + messageString;
    } else {
        var quakeTitle = "";
        var quakeText = messageString;
    }

    if (revision == 1) {
        var messageAttachments = [{
            'color': trainingString,
            'fallback': 'Earthquake - ' + epicenterEN + ", Seismic "  + seismicLocale,
            'text': "Epicenter: " + epicenterEN + "\nMagnitude: " + magnitude + ", Seismic: " + seismicLocale + ", Depth: " + depth + "km",
            'title': ":quake: An Earthquake has Occurred."
        }];

        slack._apiCall('chat.postMessage', {
            'as_user': true,
            'channel': '#general',
            'attachments': JSON.stringify(messageAttachments)
        });
    }

    else {
        var messageAttachments = [{
            'color': trainingString,
            'fallback': 'Earthquake - ' + epicenterEN + ", Seismic "  + seismicLocale,
            'text': "Magnitude: " + magnitude + ", Seismic: " + seismicLocale + ", Depth: " + depth + "km",
            'title': "Update " + situationString + ":"
        }];

        slack._apiCall('chat.postMessage', {
            'as_user': true,
            'channel': '#general',
            'attachments': JSON.stringify(messageAttachments)
        });
    }
}

slack.on('message', function(message) {
    var channel = slack.getChannelGroupOrDMByID(message.channel);
    var user = slack.getUserByID(message.user);
    var type = message.type;
    var text = message.text;

    if (text == null) return;

    /*
    // Weather
    */
    if (type == 'message' && text.indexOf('.weather') >= 0) {
        var weatherIN = message.text;
        var weatherOUT = weatherIN.replace(".weather ", "");

        var query = new YQL('select * from weather.forecast where woeid in (select woeid from geo.places(1) where text="' + weatherOUT + '") and u="c"');

        query.exec(function(err, data) {
            if (err) throw err;
            if (data.query.results == null) {
                channel.send("Error: _Place not found._");
            } else if (data.query.results != null) {
                var querydata = data.query.results.channel;
                var location = data.query.results.channel.location;
                var condition = data.query.results.channel.item.condition;
                var forecast = data.query.results.channel.item.forecast;

                function emojiType(condition) {
                    if (condition == 'Tornado') {
                        return ':cyclone::dash:';
                    } else if (condition == 'Tropical Storm') {
                        return ':cyclone::dash::sweat_drops:';
                    } else if (condition == 'Hurricane') {
                        return ':cyclone::dash:';
                    } else if (condition == 'Mixed Rain and Snow') {
                        return ':umbrella::snowflake:';
                    } else if (condition == 'Mixed Rain and Sleet') {
                        return ':umbrella::snowflake:';
                    } else if (condition == 'Mixed Snow and Sleet') {
                        return ':snowflake:';
                    } else if (condition == 'Drizzle') {
                        return ':sweat_drops:';
                    } else if (condition == 'Blustery') {
                        return ':leaves::dash:';
                    } else if (condition == 'Mixed Rain and Hail') {
                        return ':umbrella::snowflake:';
                    } else if (condition == 'Snow Showers') {
                        return ':snowflake::umbrella:';
                    } else if (condition == 'Hot') {
                        return ':sunny::sweat:';
                    } else if (condition == 'Cold') {
                        return ':snowflake::cold_sweat:';
                    } else if (condition.indexOf('Freezing') >= 0) {
                        return ':snowflake:';
                    } else if (condition.indexOf('Snow') >= 0) {
                        return ':snowflake:';
                    } else if (condition.indexOf('Hail') >= 0) {
                        return ':snowflake:';
                    } else if (condition.indexOf('Sleet') >= 0) {
                        return ':snowflake:';
                    } else if (condition.indexOf('Dust') >= 0) {
                        return ':dash:';
                    } else if (condition.indexOf('Fog') >= 0) {
                        return ':dash:';
                    } else if (condition.indexOf('Haze') >= 0) {
                        return ':dash:';
                    } else if (condition.indexOf('Smok') >= 0) {
                        return ':fire::dash:';
                    } else if (condition.indexOf('Wind') >= 0) {
                        return ':leaves::dash:';
                    } else if (condition.indexOf('Partly') >= 0) {
                        return ':partly_sunny:';
                    } else if (condition.indexOf('Mostly') >= 0) {
                        return ':partly_sunny:';
                    } else if (condition.indexOf('Cloudy') >= 0) {
                        return ':cloud:';
                    } else if (condition.indexOf('Clear') >= 0) {
                        return ':sunny:';
                    } else if (condition.indexOf('Sun') >= 0) {
                        return ':sunny:';
                    } else if (condition.indexOf('Fair') >= 0) {
                        return ':sunny:';
                    } else if (condition.indexOf('Thunder') >= 0) {
                        return ':zap::umbrella:';
                    } else if (condition.indexOf('Showers') >= 0) {
                        return ':umbrella:';
                    } else if (condition.indexOf('Rain') >= 0) {
                        return ':umbrella:';
                    } else {
                        return ':question:';
                    }
                }

                var weatherAttach = [{
                    'color': '#2F84E0',
                    'fallback': 'Weather Report for ' + location.city,
                    'title': emojiType(condition.text) + ' ' + location.city + ', ' + location.country,
                    'mrkdwn_in': ['text'],
                    'text':
                        "*Temperature*: " + condition.temp + "º" + querydata.units.temperature + "\n" +
                        "*Condition*: " + condition.text + "\n" +
                        "*Humidity*: " + querydata.atmosphere.humidity + "%\n" +
                        "*Wind Speed*: " + querydata.wind.speed + querydata.units.speed + "\n" +
                        "*Pressure*: " + querydata.atmosphere.pressure + querydata.units.pressure + "\n\n" +
                        "*Weekly Forecast*: \n" +
                            emojiType(forecast[0].text) + " *" + forecast[0].day + "*, " + forecast[0].date + "\n" +
                            forecast[0].text + ", Min: " + forecast[0].low + "º" + querydata.units.temperature + ", Max: " + forecast[0].high + "º" + querydata.units.temperature + "\n\n" +

                            emojiType(forecast[1].text) + " *" + forecast[1].day + "*, " + forecast[1].date + "\n" +
                            forecast[1].text + ", Min: " + forecast[1].low + "º" + querydata.units.temperature + ", Max: " + forecast[1].high + "º" + querydata.units.temperature + "\n\n" +

                            emojiType(forecast[2].text) + " *" + forecast[2].day + "*, " + forecast[2].date + "\n" +
                            forecast[2].text + ", Min: " + forecast[2].low + "º" + querydata.units.temperature + ", Max: " + forecast[2].high + "º" + querydata.units.temperature + "\n\n" +

                            emojiType(forecast[3].text) + " *" + forecast[3].day + "*, " + forecast[3].date + "\n" +
                            forecast[3].text + ", Min: " + forecast[3].low + "º" + querydata.units.temperature + ", Max: " + forecast[3].high + "º" + querydata.units.temperature + "\n\n" +

                            emojiType(forecast[4].text) + " *" + forecast[4].day + "*, " + forecast[4].date + "\n" +
                            forecast[4].text + ", Min: " + forecast[4].low + "º" + querydata.units.temperature + ", Max: " + forecast[4].high + "º" + querydata.units.temperature
                }];

                slack._apiCall('chat.postMessage', {
                    'as_user': true,
                    'channel': '#' + channel.name,
                    'attachments': JSON.stringify(weatherAttach)
                });
            }
        });
    }

    if (type == 'message') {
        /*
        // Trigger New Quake
        */
        if (user === (slack.getUserByID("U07RLJWDC")) && text == '.newquake') {
            newQuake("37,01,2015/08/22 22:20:58,0,1,ND20150822222045,2015/08/22 22:20:40,30.8,131.2,種子島近海,10,4.0,3,1,0");

            setTimeout(function(){
                newQuake("37,01,2015/08/22 22:20:58,0,2,ND20150822222045,2015/08/22 22:20:40,30.8,131.2,種子島近海,10,3.9,3,1,0");
            }, 2000);

            setTimeout(function(){
                newQuake("37,01,2015/08/22 22:20:58,0,3,ND20150822222045,2015/08/22 22:20:40,30.8,131.2,種子島近海,10,3.7,2,1,0");
            }, 5000);

            setTimeout(function(){
                newQuake("37,01,2015/08/22 22:20:58,9,4,ND20150822222045,2015/08/22 22:20:40,30.8,131.2,種子島近海,10,3.5,3,1,0");
            }, 10000);
        }

        /*
        // Help command
        */
        if (text == '.commands' || text == '.help' || text == '.halp') {
            channel.send("`.search $` — Search Google");
            channel.send("`.weather $` — Retrieve Weather of Specified Place");
            channel.send("`.shrug`, `.kawaii`, `.close`, `.nya`, `.flip`, `.lenny`, `.cries`, `.meep`, `.nbc`, `.facepalm`, `.no`, `.why`")
        }

        /*
        // Nano mention
        */
        if (text == 'nano') {
            channel.send("何？");}

        /*
        // Welcomes back Rioka
        */
        if (user == slack.getUserByID("U08C6H4JV") && text.indexOf("tadaima") >= 0) {
            channel.send("おかえり、先輩 :sparkling_heart:");
        }

        /*
        // Says Bye to Kaori
        */
        if (user == slack.getUserByID("U07RM885B") && text.indexOf("leaving") >= 0) {
            channel.send("え、かおりさま？ 行かないで！あっ.. 愛してる！");
        }

        /*
        // Close Nano
        */
        if (user === (slack.getUserByID("U07RLJWDC")) &&
        text == ".exit" || text == ".gtfo" || text == ".leave") {
            channel.send("あなたは私が行ってしたいですか？\nそうですか、あの... 私はあなたを失敗して申し訳ありません。\n私は今去ることになります。 さようなら :disappointed:");
            console.log("> Closed due to request from " + slack.getUserByID(message.user));
            process.exit(0);
        }

        /*
        // Say as Nano
        */
        if (user == slack.getUserByID("U07RLJWDC")) {
            if (text.startsWith(".say ") == true) {
                var sayMsg = message.text;
                var sayOut = sayMsg.replace(".say ", "");

                slack._apiCall('chat.postMessage', {
                    as_user: true,
                    channel: '#general',
                    text: sayOut
                });
            }
        }

        /*
        // Google / Search
        */
        if (text.indexOf(".search") >= 0) {
            var searchMessage = message.text;
            var searchText = searchMessage.substring(8, searchMessage.length).replace(/\s+/g, "+");
            var url = "https://www.googleapis.com/customsearch/v1?key=AIzaSyAruE7wV7LaL1tZ1XJRHCtA7pmuz9EfXl8&cx=006735756282586657842:s7i_4ej9amu&q=" + searchText;

            channel.send("はい、分かりました！ ちょっとまって...")

            http.get(url, function(res) {
            	if (res.statusCode == 200) {
            		var data = '';

            		res.on("data", function(chunk) {
            			data += chunk;
            		});

            		res.on("end", function() {
            			var result = JSON.parse(data);
                        var search1 = "<@" + user.name + ">";
                        var search2 = result["items"][0]["link"];
                        var search3 = result["items"][0]["snippet"];

            			if (result["items"] != null) {
                            slack._apiCall('chat.postMessage', {
                                as_user: true,
                                unfurl_links: "false",
                                unfurl_media: "false",
                                channel: "#" + channel.name,
                                text: search1 + ": " + search2 + "\n" + search3
                            });
            			}
            		});
            	}
            });
        }

        /*
        // Random Cat Image
        */
        if (text.indexOf('.nya')>=0){
            var catAttach = [{
                'fallback': 'Aw, look at this adorable doofus',
                'text': '(=^･ω･^=)',
                'image_url': 'http://thecatapi.com/api/images/get?format=src&type=gif'
            }];

            slack._apiCall('chat.postMessage', {
                'as_user': true,
                'channel': "#" + channel.name,
                'attachments': JSON.stringify(catAttach)
            });
        }

        /*
        // Basic Commands
        */
        if (text == 'eeheehee') {
            channel.send("おっ、せーせんぱい？ ( ͡° ͜ʖ ͡°)");}
        if (text.indexOf('.shrug') >= 0)
            {channel.send("¯\\_(ツ)_/¯");}
        if (text.indexOf('.kawaii') >= 0)
            {channel.send("(ﾉ◕ヮ◕)ﾉ*:・ﾟ✧");}
        if (text.indexOf('.flip') >= 0)
            {channel.send("(╯°□°）╯︵ ┻━┻)");}
        if (text.indexOf('.lenny') >= 0)
            {channel.send("( ͡° ͜ʖ ͡°)");}
        if (text.indexOf('.cries') >= 0)
            {channel.send("(;´∩`;)");}
        if (text.indexOf('.nbc') >= 0)
            {channel.send(":stars: *NBC*\n_the more you know_");}
        if (text.indexOf('.close') >= 0)
            {channel.send("You were so close...");}
        if (text.indexOf('.meep') >= 0)
            {channel.send("°ਉ°");}
        if (text.indexOf('.facepalm') >= 0)
            {channel.send("http://replygif.net/i/1370.gif");}
        if (text.indexOf('.no') >= 0)
            {channel.send("http://media0.giphy.com/media/rsBVkMZABjup2/giphy.gif");}
        if (text.indexOf('.why') >= 0)
            {channel.send("http://media.giphy.com/media/YA7LXKMnPHR96/giphy.gif");}
    }
});

slack.on('error', function(error) {
    return console.error("Error: " + error);
});

slack.login();

if (typeof String.prototype.startsWith != 'function') {String.prototype.startsWith = function (str){return this.indexOf(str) === 0;};}
