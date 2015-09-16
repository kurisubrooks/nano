var socket = require('socket.io-client')('http://eew.kurisubrooks.com:3080');
var Slack  = require('slack-client');
var colors = require('colors');
var fs = require('fs');

var keys = require('./keys.js');
var googleToken = keys.googl_token;
var slackToken = keys.slack_token;
var autoReconnect = true;
var autoMark = true;

var slack = new Slack(slackToken, autoReconnect, autoMark);
colors.setTheme({tweet: 'cyan', success: 'green', error: ['red', 'bold'], warn: 'yellow', info: 'blue'});

slack.on('open', function() {
	console.log(('[*] Connected to Slack').success);
});

socket.on('connect', function() {
	console.log(('[*] Connected to Socket').success);
});

socket.on('data', function(data) {
	new_quake(data);
});

socket.on('disconnect', function() {
	console.log(('[!] Socket Dropped').error);

	slack._apiCall('chat.postMessage', {
		as_user: true,
		channel: '#general',
		text: '*Error:* Connection to Socket dropped.'
	});
});

function new_quake(input) {
	var data = JSON.parse(input);

	if (data.situation == 1) var situation_string = 'Final';
	else var situation_string = '#' + (Number(data.revision) - 1);

	if (data.drill == true) var drill_colour = '#FFE200';
	else var drill_colour = 'danger';

	var title_string =
		data.earthquake_time + ' - ' + data.epicenter_en;
	var message_string =
		'Update ' + situation_string +
		', Magnitude: ' + data.magnitude +
		', Seismic: ' + data.seismic_en;

	if (data.revision == 1) {
		var quakeTitle = 'An Earthquake has Occurred.';
		var quakeText = title_string + '\n' + message_string;
	} else {
		var quakeTitle = '';
		var quakeText = message_string;
	}

	if (data.revision == 1) {
		var message_attach = [{
			'color': drill_colour,
			'fallback': 'Earthquake - ' + data.epicenter_en + ', Seismic '	+ data.seismic_en,
			'text': 'Epicenter: ' + data.epicenter_en + '\nMagnitude: ' + data.magnitude + ', Seismic: ' + data.seismic_en + ', Depth: ' + data.depth,
			'title': ':quake: An Earthquake has Occurred.'
		}];
	}

	else if (data.situation == 1) {
		var message_attach = [{
			'color': drill_colour,
			'fallback': 'Earthquake - ' + data.epicenter_en + ', Seismic '	+ data.seismic_en,
			'text': 'Epicenter: ' + data.epicenter_en + '\nMagnitude: ' + data.magnitude + ', Seismic: ' + data.seismic_en + ', Depth: ' + data.depth,
			'title': 'Update ' + situation_string,
			'image_url': 'http://images.zish.in/' + data.earthquake_id.replace('ND', '') + '.png'
		}];
	}

	else {
		var message_attach = [{
			'color': drill_colour,
			'fallback': 'Earthquake - ' + data.epicenter_en + ', Seismic '	+ data.seismic_en,
			'text': 'Epicenter: ' + data.epicenter_en + '\nMagnitude: ' + data.magnitude + ', Seismic: ' + data.seismic_en + ', Depth: ' + data.depth,
			'title': 'Update ' + situation_string
		}];
	}

	console.log(('[>] ' + data.earthquake_time + ' ' + data.epicenter_en).info);
	console.log(('[>] ' + 'Magnitude ' + data.magnitude + ', Seismic ' + data.seismic_en + ', Depth ' + data.depth).info);

	slack._apiCall('chat.postMessage', {
		'as_user': true,
		'channel': '#general',
		'attachments': JSON.stringify(message_attach)
	});
}

slack.on('message', function(message) {
	var channel = slack.getChannelGroupOrDMByID(message.channel);
	var user = slack.getUserByID(message.user);
	var chan = message.channel;
	var type = message.type;
	var text = message.text;
	if (user === undefined) return;
	if (text === null) return;

	String.prototype.startsWith = function(str) {return this.indexOf(str) === 0;};
	String.prototype.contains = function(str) {return this.indexOf(str) >= 0;};
	String.prototype.remove = function(from,to) {return this.substring(from,to);};

	function random() {
		var ok = ['はい','分かりました','それを得ました','了解しました','ニャ〜','ロジャー'];
		var wait = ['ちょっと待って...','待ってください！','あの..','ええと...'];

		function calc(input){return input[Math.floor(Math.random() * input.length)];}
		return calc(ok) + '、 _' + calc(wait) + '_';
	}

	if (type == 'message') {
		if (text.contains('.')) eval(fs.readFileSync('./inc/mentions.js') + '');
		if (text.startsWith('.')) {
			// Basic Commands
			eval(fs.readFileSync('./inc/commands.js') + '');

			// Weather
			if (text.startsWith('.weather ')) eval(fs.readFileSync('./inc/weather.js') + '');
			if (text == '.weather') channel.send('Where do you want me to get the weather for?');

			// Google
			if (text.startsWith('.search ')) eval(fs.readFileSync('./inc/search.js') + '');
			if (text == '.search') channel.send('I don\'t know what you want me to search!');

			// Translate
			if (text.startsWith('.translate ')) eval(fs.readFileSync('./inc/translate.js') + '');
			if (text == '.translate') channel.send('I don\'t know what you want me to translate!');
		} else {
			// Nano Mention
			if (text == 'nano') channel.send('はい、何？');

			// Rioka Greetings
			if (user.name == 'rioka' && text.contains('crashed')) channel.send('ああいや、ない再び！ 私は薬を取得しますよ..');
		}
	}
});

slack.on('error', function(error) {
	return console.log(('[!] Error: ' + error).error);
});

slack.login();
