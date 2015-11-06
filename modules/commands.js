var core = require('./core');
var logger = require('lumios-toolkit');

exports.run = function(slack, text, time, chan, channel, user){
    function gif(url) {
        slack._apiCall('chat.postMessage', {
            'as_user': true,
            'channel': chan,
            'attachments': JSON.stringify({
	            'fallback': 'Here\'s something to annoy Paul with:',
	            'image_url': url
	        })
        });
    }

    function checkText(input) {
		if (input == text) core.delMsg(slack, chan, time);
        return text == input || text.contains(' ' + input);
    }

    try {
    	if (user != slack.getUserByID('U09218631')) {
    		if      (checkText('.shrug'))   channel.send('¯\\_(ツ)_/¯');
    		else if (checkText('.kawaii'))  channel.send('(ﾉ◕ヮ◕)ﾉ*:・ﾟ✧');
    		else if (checkText('.flip'))	channel.send('(╯°□°）╯︵ ┻━┻)');
    		else if (checkText('.lenny'))	channel.send('( ͡° ͜ʖ ͡°)');
    		else if (checkText('.cries'))	channel.send('(;´∩`;)');
    		else if (checkText('.nbc'))	    channel.send(':stars: *NBC*\n_the more you know_');
    		else if (checkText('.close'))	channel.send('You were so close...');
    		else if (checkText('.magic'))	channel.send(':magic:');

            else if (checkText('.facepalm'))gif('https://media.giphy.com/media/8BYLSNmnJYQxy/giphy.gif');
            else if (checkText('.mindblown'))gif('https://media.giphy.com/media/oXp54qyqKGzzG/giphy.gif');
            else if (checkText('.pantsu'))  gif('https://media.giphy.com/media/79kGG4pjwlFh6/giphy.gif');
            else if (checkText('.no'))		gif('https://media0.giphy.com/media/XMl7bkguaL4PK/200.gif');
            else if (checkText('.nya'))	    gif('https://thecatapi.com/api/images/get?format=src&type=gif');
            else if (checkText('.crash'))	gif('http://i.imgur.com/kiKRmYY.gif');
            else if (checkText('.joke'))	gif('http://i.imgur.com/v4NsQhC.gif');
            else if (checkText('.baka'))    gif('https://media.giphy.com/media/bOCMPVgsVnRT2/giphy.gif');
            else if (checkText('.idiot'))	gif('http://i.imgur.com/XUbzeIA.gif');
            else if (checkText('.wat'))	    gif('http://i.imgur.com/QB9lziN.gif');
            else if (checkText('.cri'))	    gif('http://i.imgur.com/ZVeCD53.gif');
            else if (checkText('.clap'))	gif('http://i.imgur.com/cxPP56N.gif');
            else if (checkText('.sleep'))   gif('http://i.imgur.com/NP0JjB0.gif');
            else if (checkText('.deal'))	gif('https://media.giphy.com/media/cQwaKZ3oNqptm/giphy.gif');
            else if (checkText('.uso'))	    gif('http://1.bp.blogspot.com/-7aBesvnS7BM/Uo52S9PQSFI/AAAAAAAAPEg/WfQHOkmoi00/s1600/you-liar.gif');
            else if (checkText('.wow'))	    gif('http://i1.kym-cdn.com/photos/images/facebook/000/612/917/02d.gif');
            else if (checkText('.soon'))	gif('http://1.bp.blogspot.com/-yRKdiyePiCI/U7Lp4r1J9VI/AAAAAAAABdU/zKIdHlpfODU/s1600/soon+cat.gif');

            else if (text == '.gifs') {
                channel.send('`.baka`, `.clap`, `.crash`, `.cri`, `.deal`, `.facepalm`, `.idiot`, `.joke`, `.mindblown`, `.no`, `.nya`, `.pantsu`, `.sleep`, `.soon`, `.uso`, `.wat`, `.wow`');
				core.delMsg(slack, chan, time);
            }

            else if (user == slack.getUserByID('U07RLJWDC') && text == '.exit') {
        		slack._apiCall('chat.postMessage', {
        			'as_user': true,
        			'channel': chan,
        			'attachments': JSON.stringify([{
	        			'fallback': 'Restarting..',
	        			'image_url': 'http://i.imgur.com/kiKRmYY.gif'
	        		}])
        		}, function(){
        			process.exit(0);
        		});
        	}

            else if (text == '.help') {
        		slack._apiCall('chat.postMessage', {
        			'as_user': true,
        			'channel': chan,
        			'attachments': JSON.stringify([{
	        			'fallback': 'Query Results',
	        			'pretext': 'I can do the following:',
	        			'mrkdwn_in': ['text'],
	        			'text': '`.search  %s` – Search the Internet \n' +
	        					'`.weather %s` – Gets the Weather \n' +
	        					'`.gifs` – Lists all available gifs \n\n' +
	        					'Wanna translate some text? Ask my itoko, <@rioka>!'
	        		}])
        		}, core.delMsg(slack, chan, time));
        	}

            else if (user == slack.getUserByID('U07RLJWDC') && text.startsWith('.say ')) {
        		var input = text;
                var args = input.replace('.say ', '').split(' ');
                if (args[0].startsWith('<') && args[0].endsWith('>') && args.length > 1) {
                    var splitNumber = 3;
                    var toChannel = args[0].substring(splitNumber - 1, args[0].length - splitNumber);

                    var out = args.join(' ').replace(new RegExp('^' + args[0] + ' '), '');

					slack._apiCall('chat.postMessage', {
	        			'as_user': true,
	        			'channel': toChannel,
						'text': out
	        		}, core.delMsg(slack, chan, time));
                } else {
					slack._apiCall('chat.postMessage', {
	        			'as_user': true,
	        			'channel': chan,
						'text': args.join(' ')
	        		}, core.delMsg(slack, chan, time));
                }
        	}
        }
    }

    catch (error) {
    	channel.send(core.errno + '```' + error + '```');
    }
};
