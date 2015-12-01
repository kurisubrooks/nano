var core = require('./core');
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
			'mrkdwn_in': ['text'],
			'fallback': 'Earthquake - ' + data.epicenter_en + ', Magnitude ' + data.magnitude,
			'text': '*Epicenter:* ' + data.epicenter_en + '\n*Magnitude:* ' + data.magnitude + ', *Seismic:* ' + data.seismic_en + ', *Depth:* ' + data.depth,
			'title': ':shake:  Earthquake Early Warning'
		}];
	}

	else if (data.situation == 1) {
		attachments = [{
			'color': core.error,
			'mrkdwn_in': ['text'],
			'fallback': 'Earthquake - ' + data.epicenter_en + ', Magnitude ' + data.magnitude,
			'text': '*Epicenter:* ' + data.epicenter_en + '\n*Magnitude:* ' + data.magnitude + ', *Seismic:* ' + data.seismic_en + ', *Depth:* ' + data.depth,
			'title': 'Update ' + situation_string,
			'image_url': 'https://maps.googleapis.com/maps/api/staticmap?center=' + data.latitude + ',' + data.longitude + '&zoom=6&size=400x300&format=png&markers=' + data.latitude + ',' + data.longitude + '&maptype=roadmap&style=feature:landscape.natural.terrain|hue:0x00ff09|visibility:off&style=feature:transit.line|visibility:off&style=feature:road.highway|visibility:simplified&style=feature:poi|visibility:off&style=feature:administrative.country|visibility:off&style=feature:road|visibility:off'
		}];
	}

	else {
		attachments = [{
			'color': core.error,
			'mrkdwn_in': ['text'],
			'fallback': 'Earthquake - ' + data.epicenter_en + ', Magnitude ' + data.magnitude,
			'text': '*Update ' + situation_string + '*: ' + data.epicenter_en + '\n*Magnitude:* ' + data.magnitude + ', *Seismic:* ' + data.seismic_en + ', *Depth:* ' + data.depth
		}];
	}

	logger.debug('Shake > Triggering #' + data.earthquake_id);

	slack._apiCall('chat.postMessage', {
		'as_user': true,
		'channel': '#general',
		'attachments': JSON.stringify(attachments)
	});
};
