try {
	// Remote Crash
	if (user.name == 'kurisu' && text == '.exit') {
		process.exit(0);
	}

	// Help Command
	if (text == '.help') {
		channel.send(
			'`.search %query` - Search Google with %query' + '\n' +
			'`.weather %place` - Get the Weather for %place' + '\n' +
			'`.shrug`, `.kawaii`, `.close`, `.nya`, `.flip`, `.lenny`, `.cries`, `.meep`, `.nbc`, `.facepalm`, `.no`, `.why`');
	}

	// Say as Nano
	if (user.name == 'kurisu' && text.startsWith('.say ')) {
		var input = message.text;
		var channel_out = input.split(' ')[1].replace('[<\#>]','');
		var say_temp = input.substring(input.indexOf(" ") + 1);
		var say_out = say_temp.substring(say_temp.indexOf(" ") + 1);

		//channel.send(channel_out + ' & ' + say_out)

		slack._apiCall('chat.postMessage', {
			as_user: true,
			channel: channel_out,
			'text': 'hi'
		});

		channel.send(slack.getChannelGroupOrDMByID(channel_out));
		channel.send(chan);

		slack._apiCall('chat.postMessage', {
			as_user: true,
			channel: chan,
			text: 'text'
		});
	}
}

catch(error) {
	channel.send('*Error:* There was a problem with your request: ```' + error + '```');
}
