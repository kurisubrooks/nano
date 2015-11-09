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
    logger.success('Successfully connected to Slack.');
});

slack.on('error', function(err){
    logger.error('Slack > ' + err);
});

slack.on('team_migration_started', function(){
    logger.error('Slack > Migrating Servers, Restarting...');

    slack._apiCall('chat.postMessage', {
        as_user: true,
        channel: '#general',
        text: '*Notice*: Slack is migrating servers. Rioka & I will be back soon!'
    });
});

// Earthquake Socket
socket.on('connect', function(){
	logger.success('Successfully connected to Shake.');

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

// Parse Slack Messages
slack.on('message', function(message){
    var channel = slack.getChannelGroupOrDMByID(message.channel);
    var user = slack.getUserByID(message.user);
    var chan = message.channel;
    var type = message.type;
    var text = message.text;
	var time = message.ts;

    // Fixes Crash on Message Deletion
    if (user === undefined) return;
    if (text === null) return;

    // Outputs + Logs Chat
	logger.debug('Chat > ' + message);

    if (type == 'message') {
        // Commands
        if (text.contains('.')) {
            if (text.startsWith('.search')) {
                if (text.split(' ').length > 1) search.run(slack, text, time, chan, channel, user);
                else channel.send('Sorry ' + user.name + ', but what am I supposed to search for?');
            } else if (text.startsWith('.weather')) {
                if (text.split(' ').length > 1) weather.run(slack, text, time, chan, channel, user);
                else channel.send('Sorry ' + user.name + ', but where am I supposed to get the weather for?');
            } else {
                commands.run(slack, text, time, chan, channel, user);
            }
        }

        // Earthquake Debugging
		else if (text == '.quakepls' && user == slack.getUserByID('U0E4ZL97H')) {
            quake.run(slack, '{"type":"0","drill":false,"announce_time":"2015/10/24 13:27:37","earthquake_time":"2015/10/24 13:26:35","earthquake_id":"20151024132650","situation":"1","revision":"3","latitude":"42.8","longitude":"143.2","depth":"110km","epicenter_en":"Central Tokachi Subprefecture","epicenter_ja":"十勝地方中部","magnitude":"3.7","seismic_en":"2","seismic_ja":"2","geography":"land","alarm":"0"}');
			core.delMsg(slack, chan, time);
		}
    }
});

slack.login();
