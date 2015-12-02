var core = require('./modules/core');
var keys = require('./keys');

var Slack = require('slack-client');
var logger = require('lumios-toolkit');
var socket = require('socket.io-client')(keys.socket);

var commands = require('./modules/commands');
var search = require('./modules/search');
var weather = require('./modules/weather');
var quake = require('./modules/quake');

// Slack Socket
var slackToken = keys.slack,
    autoReconnect = true,
    autoMark = true;

var slack = new Slack(slackToken, autoReconnect, autoMark);

slack.on('open', function(){
    logger.success('Connected to Slack.');
});

slack.on('error', function(err){
    logger.error('Slack > ' + err);
});

slack.on('team_migration_started', function(){
    logger.error('Slack > Migrating Servers');

    setTimeout(function(){
        process.exit(0);
    }, 10000);
});

// Earthquake Socket
socket.on('connect', function(){
	logger.success('Connected to Shake.');

    if (!core.debug) {
        slack._apiCall('chat.postMessage', {
    		as_user: true,
    		channel: '#general',
    		text: 'Connected to Shake.'
    	});
    }
});

socket.on('data', function(data){
	quake.run(slack, data);
});

socket.on('reconnect', function(){
    logger.warn('Disconnected from Shake, reconnecting...');

    slack._apiCall('chat.postMessage', {
		as_user: true,
		channel: '#general',
		text: '*Notice*: Disconnected from Shake, reconnecting...'
	});
});

socket.on('error', function(err){
    logger.error('Shake > ' + err);

    slack._apiCall('chat.postMessage', {
		as_user: true,
		channel: '#general',
		text: '*Error*: Encountered a problem while connecting to Shake: ```' + err + '```'
	});
});

socket.on('disconnect', function(){
    logger.error('Shake > Connection lost!');

	slack._apiCall('chat.postMessage', {
		as_user: true,
		channel: '#general',
		text: '*Error*: Connection to Shake Server was lost!'
	});
});

// NSW RFS Alerts Feed
var fs = require('fs'),
    xml2js = require('xml2js'),
    parser = new xml2js.Parser(),
    request = require('request');

var storedxml = [];
getxml();

setInterval(function(){
    getxml();
}, 120000);

function getxml() {
    /*fs.readFile(__dirname + '/test.xml', function(err, data){
        parser.parseString(data, function(err, result){ });
    });*/

    request('http://www.rfs.nsw.gov.au/feeds/major-Fire-Updates.xml', function(error,response,output){
        if (!error && response.statusCode == 200) {
            parser.parseString(output, function(err, result){
                // If Cache is empty, fill with result xml
                if (storedxml.length === 0) storedxml = result;

                // If Cache is the same as the retrieved XML
                else if (storedxml.rss.channel[0].item[0].description[0] == result.rss.channel[0].item[0].description[0] && storedxml.rss.channel[0].item[0].title[0] == result.rss.channel[0].item[0].title[0]) return;

                // If Cache is different to retrieved XML
                else {
                    // Store the new XML
                    storedxml = result;

                    var attachments = [{
                        'color': core.error,
                        'mrkdwn_in': ['text'],
                        'fallback': 'A NSW Fire Alert has been issued!',
                        'title': ':fire: NSW Fire Alert',
                        'text': '*' + result.rss.channel[0].item[0].title[0] + '*\n' + result.rss.channel[0].item[0].description[0] + '\n' + 'http://www.rfs.nsw.gov.au/fire-information/fires-near-me'
                    }];

                    slack._apiCall('chat.postMessage', {
                        as_user: true,
                        channel: '#general',
                        attachments: JSON.stringify(attachments)
                    });
                }
            });
        }
    });
}

// Parse Slack Messages
slack.on('message', function(message){
    var channel = slack.getChannelGroupOrDMByID(message.channel);
    var user = slack.getUserByID(message.user);
    var chan = message.channel;
    var type = message.type;
    var text = message.text;
	var time = message.ts;

    // Fixes Slack Bug
    if (user === undefined) return;
    if (text === null) return;

    // Logs Chat
	logger.info('Chat > ' + message);

    if (type === 'message') {
        // Commands
        if (text.contains('.')) {
            if (text.startsWith('.search')) {
                if (text.split(' ').length > 1) search.run(slack, text, time, chan, channel, user);
                else channel.send('Sorry ' + user.name + ', but what am I supposed to search for?');
            } else if (text.startsWith('.weather')) {
                if (text.split(' ').length > 1) weather.current(slack, text, time, chan, channel, user);
                else weather.current(slack, 'penrith nsw australia', time, chan, channel, user);
            } else if (text.startsWith('.forecast')) {
                if (text.split(' ').length > 1) weather.forecast(slack, text, time, chan, channel, user);
                else weather.forecast(slack, 'penrith nsw australia', time, chan, channel, user);
            } else {
                commands.run(slack, text, time, chan, channel, user);
            }
        }

        // Earthquake Debugging
		if (text === '.shake' && slack.getUserByID(core.kurisu)) {
            quake.run(slack, '{"type":"0","drill":false,"announce_time":"2015/10/24 13:27:37","earthquake_time":"2015/10/24 13:26:35","earthquake_id":"20151024132650","situation":"0","revision":"1","latitude":"42.8","longitude":"143.2","depth":"110km","epicenter_en":"Central Tokachi Subprefecture","epicenter_ja":"十勝地方中部","magnitude":"3.7","seismic_en":"2","seismic_ja":"2","geography":"land","alarm":"0"}');

            /*
            setTimeout(function(){
                quake.run(slack, '{"type":"0","drill":false,"announce_time":"2015/10/24 13:27:37","earthquake_time":"2015/10/24 13:26:35","earthquake_id":"20151024132650","situation":"0","revision":"2","latitude":"42.8","longitude":"143.2","depth":"110km","epicenter_en":"Central Tokachi Subprefecture","epicenter_ja":"十勝地方中部","magnitude":"3.7","seismic_en":"2","seismic_ja":"2","geography":"land","alarm":"0"}');
            }, 2000);

            setTimeout(function(){
                quake.run(slack, '{"type":"0","drill":false,"announce_time":"2015/10/24 13:27:37","earthquake_time":"2015/10/24 13:26:35","earthquake_id":"20151024132650","situation":"1","revision":"3","latitude":"42.8","longitude":"143.2","depth":"110km","epicenter_en":"Central Tokachi Subprefecture","epicenter_ja":"十勝地方中部","magnitude":"3.7","seismic_en":"2","seismic_ja":"2","geography":"land","alarm":"0"}');
            }, 4000);
            */

			core.delMsg(slack, chan, time);
		}
    }
});

slack.login();
