var Twitter = require('twitter');
var Slack = require('slack-client');
var fs = require('fs');

var keys = require('./keys.js');
var trans = require('./lib/eew/epicenter.json');

var twitID1 = '3313238022'; //test
var twitID2 = '214358709'; //eew
var twitter = new Twitter({
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
    console.log('> Connected to Slack');

    slack._apiCall('chat.postMessage', {
        as_user: true,
        channel: '#general',
        text: 'ただいま〜'
    });
});

twitter.stream('statuses/filter', {follow: twitID1}, function(stream) {
    console.log('[*] Connecting to test..');
    stream.on('data', function(tweet) {
        if (tweet.delete !== undefined) return;
        if (tweet.user.id_str == twitID1) {
            console.log('[>] ' + tweet.text);
            newQuake(tweet.text);
        }
    });

    stream.on('error', function(error) {
    	slack._apiCall('chat.postMessage', {as_user: true,channel: '#general',text: '*Error:* There was a problem with "testbot": ```' + error.source + '```'});
        console.error('[!] ERROR - ' + error.source);
    });
});

twitter.stream('statuses/filter', {follow: twitID2}, function(stream) {
    console.log('[*] Connecting to eew..');
    stream.on('data', function(tweet) {
        if (tweet.delete !== undefined) return;
        if (tweet.user.id_str == twitID2) {
            console.log('[>] ' + tweet.text);
            newQuake(tweet.text);
        }
    });

    stream.on('error', function(error) {
    	slack._apiCall('chat.postMessage', {as_user: true,channel: '#general',text: '*Error:* There was a problem with "eew": ```' + error.source + '```'});
        console.error('[!] ERROR - ' + error.source);
    });
});

function newQuake(inputData) {
    var parsedInput = inputData.split(',');

    var i, item, j, len, ref;
    ref = ['type', 'training_mode', 'announce_time', 'situation', 'revision', 'earthquake_id', 'earthquake_time', 'latitude', 'longitude', 'epicenter', 'depth', 'magnitude', 'seismic', 'geography', 'alarm'];

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

    if (situation == 9){var situationString = 'Final';}
    else {var situationString = '#' + (Number(revision) - 1);}

    if (seismic == '不明') {var seismicLocale = 'Unknown';}
    else {var seismicLocale = seismic;}

    if (training_mode == 01) {var trainingString = '#FFE200';}
    else {var trainingString = 'danger';}

    var titleString =
        earthquake_time + ' - ' + epicenterEN;
    var messageString =
        'Update ' + situationString +
        ', Magnitude: ' + magnitude +
        ', Seismic: ' + seismicLocale;

    console.log(titleString);
    console.log(messageString);

    if (revision == 1) {
        var quakeTitle = 'An Earthquake has Occurred.';
        var quakeText = titleString + '\n' + messageString;
    } else {
        var quakeTitle = '';
        var quakeText = messageString;
    }

    if (revision == 1) {
        var messageAttachments = [{
            'color': trainingString,
            'fallback': 'Earthquake - ' + epicenterEN + ', Seismic '    + seismicLocale,
            'text': 'Epicenter: ' + epicenterEN + '\nMagnitude: ' + magnitude + ', Seismic: ' + seismicLocale + ', Depth: ' + depth + 'km',
            'title': ':quake: An Earthquake has Occurred.'
        }];
    }

    else if (situation == 9) {
        var messageAttachments = [{
            'color': trainingString,
            'fallback': 'Earthquake - ' + epicenterEN + ', Seismic '    + seismicLocale,
            'text': 'Epicenter: ' + epicenterEN + '\nMagnitude: ' + magnitude + ', Seismic: ' + seismicLocale + ', Depth: ' + depth + 'km',
            'title': 'Update ' + situationString,
            'image_url': 'http://images.zish.in/' + earthquake_id.replace('ND', '') + '.png'
        }];
    }

    else {
        var messageAttachments = [{
            'color': trainingString,
            'fallback': 'Earthquake - ' + epicenterEN + ', Seismic '    + seismicLocale,
            'text': 'Epicenter: ' + epicenterEN + '\nMagnitude: ' + magnitude + ', Seismic: ' + seismicLocale + ', Depth: ' + depth + 'km',
            'title': 'Update ' + situationString
        }];
    }

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
    if (text === null) return;

    String.prototype.startsWith = function(str) {
        return this.indexOf(str) == 0;
    };

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
        ];

        function calc(input) {return input[Math.floor(Math.random() * input.length)];}
        return calc(ok) + '、 _' + calc(wait) + '_';
    }

    if (type == 'message' && text !== undefined) {
        // Help Command
        if (user != slack.getUserByID('U09218631') && text == '.help') {
            channel.send(
                '`.search %query` - Search Google with %query' + '\n' +
                '`.weather %place` - Get the Weather for %place' + '\n' +
                '`.shrug`, `.kawaii`, `.close`, `.nya`, `.flip`, `.lenny`, `.cries`, `.meep`, `.nbc`, `.facepalm`, `.no`, `.why`');
        }

        // Weather
        if (text.startsWith('.weather')) eval(fs.readFileSync('./inc/weather.js') + '');

        // Google / Search
        if (text.startsWith('.search')) eval(fs.readFileSync('./inc/search.js') + '');

        // Manually Push Quake
        if (text.startsWith('.quake')) newQuake(text.replace('.quake ', ''));

        // Trigger Test Quake
        if (user === (slack.getUserByID('U07RLJWDC')) && text == '.newquake') {
                newQuake('37,01,2011/03/11 14:46:02,0,1,ND20110311144602,2011/03/11 14:46:02,38.0,142.9,三陸沖,10,7.9,6,1,1');

            setTimeout(function(){
                newQuake('37,01,2011/03/11 14:46:02,0,3,ND20110311144602,2011/03/11 14:46:02,38.0,142.9,三陸沖,10,8.2,7,1,1');
            }, 1000);

            setTimeout(function(){
                newQuake('37,01,2011/03/11 14:46:02,0,4,ND20110311144602,2011/03/11 14:46:02,38.0,142.9,三陸沖,10,9.0,7,1,1');
            }, 1100);

            setTimeout(function(){
                newQuake('37,01,2011/03/11 14:46:02,9,5,ND20110311144602,2011/03/11 14:46:02,38.0,142.9,三陸沖,10,9.0,7,1,1');
            }, 1200);
        }

        // Nano Mention
        if (text == 'nano') channel.send('何？');

        // Rioka Greetings
        if (user == slack.getUserByID('U08C6H4JV')) {
            if (text.indexOf('tadaima') >= 0) channel.send('おかえり、先輩 :sparkling_heart:');
            if (text.indexOf('leaving') >= 0) channel.send('え？ 先輩、どこですか？ どこに行くの？ 先輩！？ :sob:');
            if (text.indexOf('crashing') >= 0) channel.send('え？ 大丈夫、先輩？ 大丈夫か！？');
            if (text.indexOf('crashed') >= 0) channel.send('ああいや、ない再び！ 私は薬を取得しますよ..');
        }

        // Kaori Greetings
        if (user == slack.getUserByID('U07RM885B')) {
            if (text.indexOf('leaving') >= 0) channel.send('え、かおりさま？ 行かないで！あっ.. 愛してる！');
            if (text.indexOf('tadaima') >= 0) channel.send('先輩、あなたが死んでから戻って！〜 :sparkling_heart:');
        }

        // Remote Crash
        if (user == (slack.getUserByID('U07RLJWDC')) && text == '.exit') {
            channel.send('あなたは私が行ってしたいですか？\nそうですか、あの... 私はあなたを失敗して申し訳ありません。\n私は今去ることになります。 さようなら :disappointed:');
            console.log('> Closed due to request from ' + slack.getUserByID(message.user));
            process.exit(0);
        }

        // Say as Nano
        if (user == slack.getUserByID('U07RLJWDC') && text.startsWith('.say ')) {
            var sayMsg = message.text;
            var sayOut = sayMsg.replace('.say ', '');

            slack._apiCall('chat.postMessage', {
                as_user: true,
                channel: '#general',
                text: sayOut
            });
        }

        // Random Cat Image
        if (text.indexOf('.nya')>=0){
            var catAttach = [{
                'fallback': 'Aw, look at this adorable doofus',
                'pretext': '(=^･ω･^=)',
                'image_url': 'http://thecatapi.com/api/images/get?format=src&type=gif'
            }];

            slack._apiCall('chat.postMessage', {
                'as_user': true,
                'channel': '#' + channel.name,
                'attachments': JSON.stringify(catAttach)
            });
        }

        // Basic Commands
        if (user != slack.getUserByID('U09218631')) {
            if (text.indexOf('bae') >= 0) channel.send('Did you mean; "Nano"?');
            if (text == 'eeheehee') channel.send('おっ、せーせんぱい？ ( ͡° ͜ʖ ͡°)');
            if (text.indexOf('.shrug') >= 0) channel.send('¯\\_(ツ)_/¯');
            if (text.indexOf('.kawaii') >= 0) channel.send('(ﾉ◕ヮ◕)ﾉ*:・ﾟ✧');
            if (text.indexOf('.flip') >= 0) channel.send('(╯°□°）╯︵ ┻━┻)');
            if (text.indexOf('.lenny') >= 0) channel.send('( ͡° ͜ʖ ͡°)');
            if (text.indexOf('.cries') >= 0) channel.send('(;´∩`;)');
            if (text.indexOf('.nbc') >= 0) channel.send(':stars: *NBC*\n_the more you know_');
            if (text.indexOf('.close') >= 0) channel.send('You were so close...');
            if (text.indexOf('.meep') >= 0) channel.send('°ਉ°');
            if (text.indexOf('.facepalm') >= 0) {
                var facepalmAttach = [{'fallback': '*facepalm*','image_url': 'http://replygif.net/i/1370.gif'}]
                    slack._apiCall('chat.postMessage', {'as_user': true,'channel': '#general','attachments': JSON.stringify(facepalmAttach)});
            }

            if (text.indexOf('.no') >= 0) {
                var noAttach = [{'fallback': 'no.','image_url': 'http://media0.giphy.com/media/rsBVkMZABjup2/giphy.gif'}]
                slack._apiCall('chat.postMessage', {'as_user': true,'channel': '#general','attachments': JSON.stringify(noAttach)});
            }

            if (text.indexOf('.why') >= 0) {
                var whyAttach = [{'fallback': 'but why..?','image_url': 'http://media.giphy.com/media/YA7LXKMnPHR96/giphy.gif'}]
                slack._apiCall('chat.postMessage', {'as_user': true,'channel': '#general','attachments': JSON.stringify(whyAttach)});
            }
        }
    }
});

slack.on('error', function(error) {
    channel.send('*Error:* There was an error with Slack: ```' + error + '```')
    return console.error('Error: ' + error);
});

slack.login();
