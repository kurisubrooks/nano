try {
	// Basic Mentions
	if (user.name != 'nano') {
		if (text.contains('.shrug'))		channel.send('¯\\_(ツ)_/¯');
		else if (text.contains('.kawaii'))  channel.send('(ﾉ◕ヮ◕)ﾉ*:・ﾟ✧');
		else if (text.contains('.flip'))	channel.send('(╯°□°）╯︵ ┻━┻)');
		else if (text.contains('.lenny'))	channel.send('( ͡° ͜ʖ ͡°)');
		else if (text.contains('.cries'))	channel.send('(;´∩`;)');
		else if (text.contains('.nbc'))		channel.send(':stars: *NBC*\n_the more you know_');
		else if (text.contains('.close'))	channel.send('You were so close...');
		else if (text.contains('.magic'))	channel.send(':magic:');
	}
}

catch(error) {
	channel.send('*Error:* There was a problem with your request: ```' + error + '```');
}
