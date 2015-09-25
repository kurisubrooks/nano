try {
	// Remote Crash
	if (user == slack.getUserByID('U07RLJWDC') && text == '.exit') {
		var attach = [{
			'fallback': 'brb',
			'image_url': 'http://i.imgur.com/kiKRmYY.gif'
		}];

		slack._apiCall('chat.postMessage', {
			'as_user': true,
			'channel': chan,
			'attachments': JSON.stringify(attach)
		}, function(){
			process.exit(0);
		});
	}

	// Help Command
	else if (text == '.help') {
		channel.send(
			'`.search %query` - Search Google with %query' + '\n' +
			'`.weather %place` - Get the Weather for %place' + '\n' +
			'`.shrug`, `.kawaii`, `.close`, `.nya`, `.flip`, `.lenny`, `.cries`, `.meep`, `.nbc`, `.facepalm`, `.no`, `.why`');
	}

	// Say as Nano
	else if (user.name == 'kurisu' && text.startsWith('.say ')) {
		var input = message.text;
        var args = input.replace('.say ', '').split(' ');
        if(args[0].startsWith('<') && args[0].endsWith('>') && args.length > 1) {
            var splitNumber = 3;
            var toChannel = args[0].substr(splitNumber - 1, args[0].length - splitNumber);

            var text = args.join(' ').replace(new RegExp('^' + args[0] + ' '), '');
            slack.getChannelGroupOrDMByID(toChannel).send(text);
        } else {
            channel.send(args.join(' '));
        }
	}
}

catch(error) {
	channel.send('*Error:* There was a problem with your request: ```' + error + '```');
}
