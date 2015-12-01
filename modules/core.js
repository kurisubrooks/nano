var https = require('https');
var logger = require('lumios-toolkit');
var keys = require('../keys');

exports.success = '#52C652';
exports.error = '#E93F3C';
exports.warn = '#F5AD1E';
exports.info = '#52B7D6';
exports.debug = false;
exports.kurisu = 'U0E4ZL97H';

exports.errno = '*Error*: There was a problem with your request: ';

exports.delMsg = function(slack, channel, timestamp) {
	var query = '?token=' + keys.user + '&ts=' + timestamp + '&channel=' + channel;

	https.get('https://slack.com/api/chat.delete' + query, function(res) {
		var body = '';
		res.on('data', function(data) {
			body += data;
		});
	}).on('error', function(error) {logger.error(error);});
};
