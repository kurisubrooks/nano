var core = require('./core.js');
var keys = require('./keys.js');

var Slack = require('slack-client');
var logger = require('lumios-toolkit');
var socket = require('socket.io-client')(keys.socket);

var commands = require('./modules/commands.js');
var search = require('./modules/search.js');
var weather = require('./modules/weather.js');
var quake = require('./modules/quake.js');

var slackToken = keys.slack,
    autoReconnect = true,
    autoMark = true;

var slack = new Slack(slackToken, autoReconnect, autoMark);

slack.on('open', function(){
    logger.success('Connected to Slack.');
});

slack.on('error', function(err){
    logger.error('Slack threw an error: ' + err);
});

socket.on('connect', function(){
	logger.success('Connected to Shake Server.');

    slack._apiCall('chat.postMessage', {
		as_user: true,
		channel: '#general',
		text: 'Connected to Shake Server.'
	});
});

socket.on('data', function(data){
	new_quake(data);
});

socket.on('reconnect', function(){
    logger.warn('Attempting to reconnect...');

    slack._apiCall('chat.postMessage', {
		as_user: true,
		channel: '#general',
		text: 'Attempting to reconnect to server...'
	});
});

socket.on('error', function(err){
    logger.error('Error connecting to Shake Server: ' + err);

    slack._apiCall('chat.postMessage', {
		as_user: true,
		channel: '#general',
		text: '*Error:* There was an error connecting to Shake Server: ```' + err + '```'
	});
});

socket.on('disconnect', function(){
    logger.error('Connection to Shake Server was lost!');

	slack._apiCall('chat.postMessage', {
		as_user: true,
		channel: '#general',
		text: '*Error:* Connection to Shake Server was lost!'
	});
});

slack.on('message', function(message){
    var channel = slack.getChannelGroupOrDMByID(message.channel);
    var user = slack.getUserByID(message.user);
    var chan = message.channel;
    var type = message.type;
    var text = message.text;

    if (user === undefined) return;
    if (text === null) return;

	logger.debug('Chat: ' + message);

	function new_quake(data){
        quake.run(slack, data);
    }

    if (type == 'message') {
		/*if (text == '.quakepls') {
			new_quake('{"type":"0","drill":false,"announce_time":"2015/10/24 13:27:37","earthquake_time":"2015/10/24 13:26:35","earthquake_id":"20151024132650","situation":"1","revision":"3","latitude":"42.8","longitude":"143.2","depth":"110km","epicenter_en":"Central Tokachi Subprefecture","epicenter_ja":"十勝地方中部","magnitude":"3.7","seismic_en":"2","seismic_ja":"2","geography":"land","alarm":"0"}');
		}*/

        if (text.contains('.')) {
            if (text.startsWith('.search')) {
                if (text.join(" ").length > 1) search.run(slack, text, chan, channel, user);
                else channel.send("What am I supposed to look for?");
            } else if (text.startsWith('.weather')) {
                if (text.join(" ").length > 1) weather.run(slack, text, chan, channel, user);
                else channel.send('Where am I supposed to look for?');
            } else {
                commands.run(slack, text, chan, channel, user);
            }
        }
    }
});

slack.login();
