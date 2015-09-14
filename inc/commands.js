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
		var sayMsg = message.text;
		var sayOut = sayMsg.replace('.say ', '');

		slack._apiCall('chat.postMessage', {
			as_user: true,
			channel: '#general',
			text: sayOut
		});
	}
}

catch(error) {
	channel.send('*Error:* There was a problem with your request: ```' + error + '```');
}
