try {
	// Basic Mentions
	if (user.name != 'nano') {
		if (text.contains('.shrug'))	channel.send('¯\\_(ツ)_/¯');
		if (text.contains('.kawaii'))   channel.send('(ﾉ◕ヮ◕)ﾉ*:・ﾟ✧');
		if (text.contains('.flip'))	    channel.send('(╯°□°）╯︵ ┻━┻)');
		if (text.contains('.lenny'))	channel.send('( ͡° ͜ʖ ͡°)');
		if (text.contains('.cries'))	channel.send('(;´∩`;)');
		if (text.contains('.nbc'))		channel.send(':stars: *NBC*\n_the more you know_');
		if (text.contains('.close'))	channel.send('You were so close...');
		if (text.contains('.magic'))	channel.send(':magic:');
		if (text.contains('.facepalm')) {
			var facepalmAttach = [{'fallback': '*facepalm*','image_url': 'http://replygif.net/i/1370.gif'}];
			slack._apiCall('chat.postMessage', {'as_user': true,'channel': chan,'attachments': JSON.stringify(facepalmAttach)});
		}

		if (text.contains('.no')) {
			var noAttach = [{'fallback': 'no.','image_url': 'http://media0.giphy.com/media/rsBVkMZABjup2/giphy.gif'}];
			slack._apiCall('chat.postMessage', {'as_user': true,'channel': chan,'attachments': JSON.stringify(noAttach)});
		}

		if (text.contains('.why')) {
			var whyAttach = [{'fallback': 'but why..?','image_url': 'http://media.giphy.com/media/YA7LXKMnPHR96/giphy.gif'}];
			slack._apiCall('chat.postMessage', {'as_user': true,'channel': chan,'attachments': JSON.stringify(whyAttach)});
		}

		// Random Cat Image
		if (text.contains('.nya')){
			var url = 'https://thecatapi.com/api/images/get?format=src&type=gif';

			var catAttach = [{
				'fallback': 'Aw, look at this adorable doofus',
				'pretext': '(=^･ω･^=)',
				'image_url': url
			}];

			slack._apiCall('chat.postMessage', {
				'as_user': true,
				'channel': chan,
				'attachments': JSON.stringify(catAttach)
			});
		}
	}
}

catch(error) {
	channel.send('*Error:* There was a problem with your request: ```' + error + '```');
}
