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
var FeedMe = require('feedme');
var request = require('request');
var parser = new FeedMe();
var storedxml = [];

request('http://www.rfs.nsw.gov.au/feeds/major-Fire-Updates.xml').pipe(parser);

parser.on('item', function(xml) {
    if (xml === storedxml) return;
    else {
        storedxml.push(xml);

        var attachments = [{
            'color': core.error,
            'mrkdwn_in': ['text'],
            'fallback': 'A NSW Fire Alert has been issued!',
            'title': ':fire: NSW Fire Alert',
            'text': '*' + xml.title + '*\n' + xml.description
        }];

        slack._apiCall('chat.postMessage', {
            as_user: true,
            channel: '#general',
            attachments: JSON.stringify(attachments)
        });
    }
});

setInterval(function(){
    request('http://www.rfs.nsw.gov.au/feeds/major-Fire-Updates.xml').pipe(parser);
}, 120000);

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
