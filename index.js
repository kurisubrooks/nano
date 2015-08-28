var twitter = require("twitter");
var Slack = require('slack-client');
var http = require("https");
var YQL = require('yql');

var keys = require("./keys.js");
var trans = require("./lib/eew/epicenter.json");

var twitID = "214358709";
var client = new twitter({
    consumer_key: keys.twit_conkey,
    consumer_secret: keys.twit_consec,
    access_token_key: keys.twit_acckey,
    access_token_secret: keys.twit_accsec
});

var googleToken = keys.googl_token;
var slackToken = keys.slack_token;
var autoReconnect = true;
var autoMark = true;

var slack = new Slack(slackToken, autoReconnect, autoMark);

slack.on('open', function() {
    console.log("> Connected to Slack");

    slack._apiCall('chat.postMessage', {
        as_user: true,
        channel: '#general',
        text: 'ただいま〜'
    });
});

client.stream('statuses/filter', {follow: twitID}, function(stream) {
    stream.on('data', function(tweet) {
        if (tweet.delete != 'undefined') return;
        if (tweet.user.id_str == twitID) {
        console.log(tweet.text);
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

    var translationNotFound = true;
    for (var i = 0; i < trans.length; i++) {
        var item = trans[i];

        if (item.jp == epicenter) {
            translationNotFound = false;
            var epicenterJP = item.jp;
            var epicenterEN = item.en;
        }
    }

    if (translationNotFound) {
        var epicenterJP = epicenter;
        var epicenterEN = epicenter;
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
    }

    else if (situation == 9) {
        var messageAttachments = [{
            'color': trainingString,
            'fallback': 'Earthquake - ' + epicenterEN + ", Seismic "  + seismicLocale,
            'text': "Epicenter: " + epicenterEN + "\nMagnitude: " + magnitude + ", Seismic: " + seismicLocale + ", Depth: " + depth + "km",
            'title': "Update " + situationString,
            "image_url": "http://images.zish.in/" + earthquake_id.replace("ND", "") + ".png"
        }];
    }

    else {
        var messageAttachments = [{
            'color': trainingString,
            'fallback': 'Earthquake - ' + epicenterEN + ", Seismic "  + seismicLocale,
            'text': "Epicenter: " + epicenterEN + "\nMagnitude: " + magnitude + ", Seismic: " + seismicLocale + ", Depth: " + depth + "km",
            'title': "Update " + situationString
        }];
    }

    /*
    var quakeIndex = 1;
    var quakeArray = new Array();

    if (revision == quakeIndex || situation == '9') {
        // push quake
        quakeIndex++
    }

    for (i = 0; i < quakeArray.length; i++) {
        if (quakeArray[i].revision == quakeIndex) {
            // push quake
            break;
        }
    }
    */

    slack._apiCall('chat.postMessage', {
        'as_user': true,
        'channel': '#general',
        'attachments': JSON.stringify(messageAttachments)
    });
}

slack.on('message', function(message) {
    var channel = slack.getChannelGroupOrDMByID(message.channel);
    var user = slack.getUserByID(message.user);
    var type = message.type;
    var text = message.text;
    if (text == null) return;

    function random() {
        var ok = [
            'はい',
            '分かりました',
            'それを得ました',
            '了解しました',
            'ニャ〜',
            'ロジャー'
        ];

        var wait = [
            'ちょっと待って...',
            '待ってください！',
            'あの..',
            'ええと...'
        ]

        function calc(input) {return input[Math.floor(Math.random() * input.length)];}
        return calc(ok) + "、 _" + calc(wait) + "_";
    }

    /*
    // Weather
    */
    if (type == 'message' && text.startsWith('.weather')) {
        channel.send(random());
        var weatherIN = message.text;
        var weatherOUT = weatherIN.replace(".weather ", "");

        var query = new YQL('select * from weather.forecast where woeid in (select woeid from geo.places(1) where text="' + encodeURIComponent(weatherOUT) + '") and u="c"');

        query.exec(function(err, data) {
            if (err) throw err;
            if (data.query.results == null) {
                channel.send("Error: _Place not found._");
            } else if (data.query.results != null) {
                var weather = data.query.results.channel;
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
                        "*Temperature*: " + condition.temp + "º" + weather.units.temperature + "\n" +
                        "*Condition*: " + condition.text + "\n" +
                        "*Humidity*: " + weather.atmosphere.humidity + "%\n" +
                        "*Wind Speed*: " + weather.wind.speed + weather.units.speed + "\n" +
                        "*Pressure*: " + weather.atmosphere.pressure + weather.units.pressure + "\n\n" +
                        "*Weekly Forecast*: \n" +
                            emojiType(forecast[0].text) + " *" + forecast[0].day + "*, " + forecast[0].date + "\n" +
                            forecast[0].text + ", Min: " + forecast[0].low + "º" + weather.units.temperature + ", Max: " + forecast[0].high + "º" + weather.units.temperature + "\n\n" +

                            emojiType(forecast[1].text) + " *" + forecast[1].day + "*, " + forecast[1].date + "\n" +
                            forecast[1].text + ", Min: " + forecast[1].low + "º" + weather.units.temperature + ", Max: " + forecast[1].high + "º" + weather.units.temperature + "\n\n" +

                            emojiType(forecast[2].text) + " *" + forecast[2].day + "*, " + forecast[2].date + "\n" +
                            forecast[2].text + ", Min: " + forecast[2].low + "º" + weather.units.temperature + ", Max: " + forecast[2].high + "º" + weather.units.temperature + "\n\n" +

                            emojiType(forecast[3].text) + " *" + forecast[3].day + "*, " + forecast[3].date + "\n" +
                            forecast[3].text + ", Min: " + forecast[3].low + "º" + weather.units.temperature + ", Max: " + forecast[3].high + "º" + weather.units.temperature + "\n\n" +

                            emojiType(forecast[4].text) + " *" + forecast[4].day + "*, " + forecast[4].date + "\n" +
                            forecast[4].text + ", Min: " + forecast[4].low + "º" + weather.units.temperature + ", Max: " + forecast[4].high + "º" + weather.units.temperature
                }];

                slack._apiCall('chat.postMessage', {
                    'as_user': true,
                    'channel': '#' + channel.name,
                    'attachments': JSON.stringify(weatherAttach)
                });
            }
        });
    }

    /*
    // Google / Search
    */
    if (text.startsWith(".search")) {
        var searchMessage = message.text;
        var searchText = searchMessage.substring(8, searchMessage.length).replace(/\s+/g, "+");
        var url = "https://www.googleapis.com/customsearch/v1?key=" + googleToken + "&num=1&cx=006735756282586657842:s7i_4ej9amu&q=" + encodeURIComponent(searchText);

        channel.send(random());

        http.get(url, function(res) {
            if (res.statusCode == 200) {
                var data = '';

                res.on("data", function(chunk) {
                    data += chunk;
                });

                res.on("end", function() {
                    var result = JSON.parse(data);
                    //channel.send(JSON.stringify(result));

                    if (result["searchInformation"]["totalResults"] != "0") {
                        var search1 = "<@" + user.name + ">";
                        var search2 = result["items"][0]["link"];
                        var search3 = result["items"][0]["snippet"];

                        if ("pagemap" in result["items"][0] && "cse_thumbnail" in result["items"][0]["pagemap"]) {
                            var thumbURL = result["items"][0]["pagemap"]["cse_thumbnail"][0]["src"];
                        } else {
                            var thumbURL = "";
                        }

                        var searchAttachments = [{
                            "fallback": "Here are the results of your search:",
                            "color": "#2F84E0",
                            "title": result["items"][0]["title"],
                            "title_link": result["items"][0]["link"],
                            "text": result["items"][0]["snippet"] + "\n" + "<" + decodeURIComponent(result["items"][0]["link"]) + ">",
                            "thumb_url": thumbURL
                        }]

                        slack._apiCall('chat.postMessage', {
                            as_user: true,
                            unfurl_links: "false",
                            unfurl_media: "false",
                            channel: "#" + channel.name,
                            attachments: JSON.stringify(searchAttachments)
                        });
                    } else {
                        channel.send("Error: _Couldn't find any results for:_ '" + searchText + "'");
                    }
                });
            }

            else if (res.statusCode != 200) {
                if (res.statusCode == 400) channel.send("Error: _Bad Request_ " + res.statusCode)
                else if (res.statusCode == 403) channel.send("Error: _Daily Limit Exceeded_ " + res.statusCode)
                else if (res.statusCode == 500) channel.send("Error: _Internal Server Error_ " + res.statusCode)
                else channel.send("Error: " + res.statusCode)
            }
        }).on('error', function(e) {
            console.error(e);
        });
    }

    /*
    // Manually Push Quake
    */
    if (type == 'message' && text.startsWith(".quake")) {
        newQuake(text.replace(".quake ", ""));
    }

    if (type == 'message') {
        /*
        // Trigger New Quake
        */
        if (user === (slack.getUserByID("U07RLJWDC")) && text == '.newquake') {
                newQuake("37,01,2015/08/27 12:23:40,9,1,ND20150827122332,2015/08/27 12:23:12,42.7,142.1,胆振地方中東部,150,4.0,不明,0,0");

            /*
            setTimeout(function(){
                newQuake("37,00,2015/08/27 12:23:43,0,2,ND20150827122332,2015/08/27 12:23:13,42.7,142.1,胆振地方中東部,140,3.9,2,0,0");
            }, 1000);

            setTimeout(function(){
                newQuake("37,00,2015/08/27 12:23:53,0,3,ND20150827122332,2015/08/27 12:23:13,42.7,142.1,胆振地方中東部,140,3.9,2,0,0");
            }, 2000);

            setTimeout(function(){
                newQuake("37,00,2015/08/27 12:24:02,0,4,ND20150827122332,2015/08/27 12:23:13,42.7,142.1,胆振地方中東部,140,4.3,2,0,0");
            }, 3000);

            setTimeout(function(){
                newQuake("37,00,2015/08/27 12:24:22,0,5,ND20150827122332,2015/08/27 12:23:13,42.7,142.2,日高地方西部,140,4.3,2,0,0");
            }, 4000);

            setTimeout(function(){
                newQuake("37,00,2015/08/27 12:24:22,9,6,ND20150827122332,2015/08/27 12:23:13,42.7,142.2,日高地方西部,140,4.3,2,0,0");
            }, 4000);*/
        }

        /*
        // Help command
        */
        if (user != (slack.getUserByID("U09218631")) && text == '.commands' || text == '.help' || text == '.halp') {
            channel.send(
                "`.search %query` - Search Google with %query" + "\n" +
                "`.weather %place` - Get the Weather for %place" + "\n" +
                "`.shrug`, `.kawaii`, `.close`, `.nya`, `.flip`, `.lenny`, `.cries`, `.meep`, `.nbc`, `.facepalm`, `.no`, `.why`")
        }

        /*
        // Nano mention
        */
        if (text == 'nano') {
            channel.send("何？");}

        /*
        // Rioka Greetings
        */
        if (user == slack.getUserByID("U08C6H4JV")) {
            if (text.indexOf("tadaima") >= 0) channel.send("おかえり、先輩 :sparkling_heart:");
            if (text.indexOf("leaving") >= 0) channel.send("え？ 先輩、どこですか？ どこに行くの？ 先輩！？ :sob:");
            if (text.indexOf("crashing") >= 0) channel.send("え？ 大丈夫、先輩？ 大丈夫か！？");
            if (text.indexOf("crashed") >= 0) channel.send("ああいや、ない再び！ 私は薬を取得しますよ..");
        }

        /*
        // Kaori Greetings
        */
        if (user == slack.getUserByID("U07RM885B")) {
            if (text.indexOf("leaving") >= 0) channel.send("え、かおりさま？ 行かないで！あっ.. 愛してる！");
            if (text.indexOf("tadaima") >= 0) channel.send("先輩、あなたが死んでから戻って！〜 :sparkling_heart:");
        }

        /*
        // Close Nano
        */
        if (user === (slack.getUserByID("U07RLJWDC")) && text == ".exit" || text == ".gtfo" || text == ".leave") {
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
        // Random Cat Image
        */
        if (text.indexOf('.nya')>=0){
            var catAttach = [{
                'fallback': 'Aw, look at this adorable doofus',
                'pretext': '(=^･ω･^=)',
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
        if (text == '.test') {
            channel.send(random());
        }

        if (text.indexOf('bae') >= 0) {
            channel.send("Did you mean; 'Nano'?")}
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
