const core = require('./modules/core');
const keys = require('./keys');

const Slack = require('slack-client');
const logger = require('crimson');
const socket = require('socket.io-client')(keys.socket);

const commands = require('./modules/commands');
const search = require('./modules/search');
const weather = require('./modules/weather');
const quake = require('./modules/quake');

/*
// Slack
*/
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

slack.on('message', function(message){
    var channel = slack.getChannelGroupOrDMByID(message.channel);
    var user = slack.getUserByID(message.user);
    var chan = message.channel;
    var type = message.type;
    var text = message.text;
	var time = message.ts;

    // Slack's Bullshit
    if (user === undefined) return;
    if (text === null) return;

    // Chat Log
	logger.info('Chat > ' + message);

    if (type === 'message') {
        // Commands
        if (text.contains('.')) {
            if (text.startsWith('.search')) {
                if (text.split(' ').length > 1) search.run(slack, text, time, chan, channel, user);
                else channel.send('Sorry ' + user.name + ', but what am I supposed to search for?');
            } else if (text.startsWith('.w')) {
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

/*
// Shake 
*/
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
		text: '*Notice*: Connection to Shake was lost, reconnecting...'
	});
});

socket.on('error', function(err){
    logger.error('Shake > ' + err);

    slack._apiCall('chat.postMessage', {
		as_user: true,
		channel: '#general',
		text: '*Error*: Shake encountered a problem: ```' + err + '```'
	});
});

socket.on('disconnect', function(){
    logger.error('Shake > Connection lost!');

	slack._apiCall('chat.postMessage', {
		as_user: true,
		channel: '#general',
		text: '*Error*: Connection to Shake was lost!'
	});
});

slack.login();
