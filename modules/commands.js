const core = require('./core');
const logger = require('crimson');

exports.run = function(slack, text, time, chan, channel, user){
    function gif(url) {
        slack._apiCall('chat.postMessage', {
            'as_user': true,
            'channel': chan,
            'attachments': JSON.stringify([{
	            'fallback': '<gif>',
	            'image_url': url
	        }])
        });
    }

    function cheque(input) {
		if (input == text) core.delMsg(slack, chan, time);
        return text == input || text.contains(' ' + input);
    }

    try {
    	if (user != slack.getUserByID('U0E4WJNTX')) {
    		if      (cheque('.shrug'))   channel.send('¯\\_(ツ)_/¯');
    		else if (cheque('.kawaii'))  channel.send('(ﾉ◕ヮ◕)ﾉ*:・ﾟ✧');
    		else if (cheque('.flip'))	 channel.send('(╯°□°）╯︵ ┻━┻)');
    		else if (cheque('.lenny'))	 channel.send('( ͡° ͜ʖ ͡°)');
    		else if (cheque('.cries'))	 channel.send('(;´∩`;)');
    		else if (cheque('.nbc'))	 channel.send(':stars: *NBC*\n_the more you know_');
    		else if (cheque('.close'))	 channel.send('You were so close...');
    		else if (cheque('.magic'))	 channel.send(':magic:');

            else if (cheque('.facepalm'))gif('https://media.giphy.com/media/8BYLSNmnJYQxy/giphy.gif');
            else if (cheque('.mindblown'))gif('https://media.giphy.com/media/oXp54qyqKGzzG/giphy.gif');
            else if (cheque('.pantsu'))  gif('https://media.giphy.com/media/79kGG4pjwlFh6/giphy.gif');
            else if (cheque('.no'))		 gif('https://media0.giphy.com/media/XMl7bkguaL4PK/200.gif');
            else if (cheque('.nya'))	 gif('https://thecatapi.com/api/images/get?format=src&type=gif');
            else if (cheque('.crash'))	 gif('http://i.imgur.com/kiKRmYY.gif');
            else if (cheque('.joke'))	 gif('http://i.imgur.com/v4NsQhC.gif');
            else if (cheque('.baka'))    gif('https://media.giphy.com/media/bOCMPVgsVnRT2/giphy.gif');
            else if (cheque('.idiot'))	 gif('http://i.imgur.com/XUbzeIA.gif');
            else if (cheque('.wat'))	 gif('http://i.imgur.com/QB9lziN.gif');
            else if (cheque('.cri'))	 gif('http://i.imgur.com/ZVeCD53.gif');
            else if (cheque('.clap'))	 gif('http://i.imgur.com/cxPP56N.gif');
            else if (cheque('.sleep'))   gif('http://i.imgur.com/NP0JjB0.gif');
            else if (cheque('.deal'))	 gif('https://media.giphy.com/media/cQwaKZ3oNqptm/giphy.gif');
            else if (cheque('.uso'))	 gif('http://i.imgur.com/fCxDtYy.gif');
            else if (cheque('.wow'))	 gif('http://i1.kym-cdn.com/photos/images/facebook/000/612/917/02d.gif');
            else if (cheque('.soon'))	 gif('http://1.bp.blogspot.com/-yRKdiyePiCI/U7Lp4r1J9VI/AAAAAAAABdU/zKIdHlpfODU/s1600/soon+cat.gif');
            else if (cheque('.soon1'))    gif('http://i.imgur.com/WRaSz.gif');
            else if (cheque('.fuck'))	 gif('http://i.imgur.com/HIDfKjd.gif');
            else if (cheque('.rekt'))    gif('http://i.imgur.com/z5FzTCb.gif');
            else if (cheque('.rin'))     gif('http://i.imgur.com/ElmaNHm.gif');
            else if (cheque('.shit'))    gif('http://i.imgur.com/tNgornS.gif');
            else if (cheque('.pan'))     gif('http://i.imgur.com/p6iCwo3.gif');
            else if (cheque('.akarin'))  gif('http://i.imgur.com/LnJw5El.gif');
            else if (cheque('.easy'))    gif('http://i.imgur.com/bEllCUv.gif');
            else if (cheque('.gg'))      gif('http://i.imgur.com/x8dlKT1.gif');
            else if (cheque('.tomato'))  gif('http://i.imgur.com/pWuliMj.gif');
            else if (cheque('.drool'))   gif('http://i.imgur.com/yGIyVCT.gif');
            else if (cheque('.yuri'))    gif('http://i.imgur.com/ipA20mn.gif');
            else if (cheque('.kawaii'))  gif('http://i.imgur.com/4fVVG8t.gif');
            else if (cheque('.oneechan'))gif('http://i.imgur.com/H3KKlHc.gif');

            else if (text == '.gifs') {
                channel.send('`.baka`, `.clap`, `.crash`, `.cri`, `.deal`, `.facepalm`, `.fuck`, `.idiot`, `.joke`, `.mindblown`, `.no`, `.nya`, `.pantsu`, `.sleep`, `.soon`, `.uso`, `.wat`, `.wow`');
				core.delMsg(slack, chan, time);
            }

            else if (user == slack.getUserByID(core.kurisu) && text == '.exit') {
        		slack._apiCall('chat.postMessage', {
        			'as_user': true,
        			'channel': chan,
        			'attachments': JSON.stringify([{
	        			'fallback': 'brb',
	        			'image_url': 'http://i.imgur.com/kiKRmYY.gif'
	        		}])
        		}, function(){
                    core.delMsg(slack, chan, time);
        			setTimeout(function(){process.exit(0);}, 2000);
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
	        					'`.weather %s` – Gets the Current Weather \n' +
                                '`.forecast %s` – Gets the Weather Forecast \n' +
	        					'`.gifs` – Lists all available gifs'
	        		}])
        		}, core.delMsg(slack, chan, time));
        	}

            else if (user == slack.getUserByID('U0E4ZL97H') && text.startsWith('.say ')) {
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
