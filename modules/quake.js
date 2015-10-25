var core = require('../core.js');
var logger = require('lumios-toolkit');

exports.run = function(slack, input){
	var data = JSON.parse(input);
	var situation_string = '';
	var attachments = [];

	if (data.situation == 1) situation_string = 'Final';
	else situation_string = '#' + (Number(data.revision) - 1);

	if (data.revision == 1) {
		attachments = [{
			'color': core.error,
			'fallback': 'Earthquake - ' + data.epicenter_en + ', Magnitude ' + data.magnitude,
			'text': 'Epicenter: ' + data.epicenter_en + '\nMagnitude: ' + data.magnitude + ', Seismic: ' + data.seismic_en + ', Depth: ' + data.depth,
			'title': ':quake: An Earthquake has Occurred.'
		}];
	}

	else if (data.situation == 1) {
		attachments = [{
			'color': core.error,
			'fallback': 'Earthquake - ' + data.epicenter_en + ', Magnitude ' + data.magnitude,
			'text': 'Epicenter: ' + data.epicenter_en + '\nMagnitude: ' + data.magnitude + ', Seismic: ' + data.seismic_en + ', Depth: ' + data.depth,
			'title': 'Update ' + situation_string,
			'image_url': 'http://maps.googleapis.com/maps/api/staticmap?center=' + data.latitude + ',' + data.longitude + '&zoom=6&scale=1&size=400x300&maptype=roadmap&format=png&visual_refresh=true&markers=icon:!%7Cshadow:true%7C' + data.latitude + ',' + data.longitude
		}];
	}

	else {
		attachments = [{
			'color': core.error,
			'mrkdwn_in': ['text'],
			'fallback': 'Earthquake - ' + data.epicenter_en + ', Magnitude ' + data.magnitude,
			'text': '*Update ' + situation_string + '*: ' + data.epicenter_en + '\nMagnitude: ' + data.magnitude + ', Seismic: ' + data.seismic_en + ', Depth: ' + data.depth
		}];
	}

	logger.debug('Earthquake: ' + data.earthquake_id + ' Triggered');

	slack._apiCall('chat.postMessage', {
		'as_user': true,
		'channel': '#general',
		'attachments': JSON.stringify(attachments)
	});
};
