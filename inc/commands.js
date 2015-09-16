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
		var channelOut = sayMsg.split(" ")[1];
		var sayTemp = sayMsg.substring(sayMsg.indexOf(" ") + 1);
		var sayOut = sayTemp.substring(sayTemp.indexOf(" ") + 1);

		slack._apiCall('chat.postMessage', {
			as_user: true,
			channel: channelOut,
			text: sayOut
		});
	}
}

catch(error) {
	channel.send('*Error:* There was a problem with your request: ```' + error + '```');
}
