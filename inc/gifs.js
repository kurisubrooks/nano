try {
	function gif(url, fallback) {
		var attach = [{
			'fallback': fallback,
			'image_url': url
		}];

		slack._apiCall('chat.postMessage', {
			'as_user': true,
			'channel': chan,
			'attachments': JSON.stringify(attach)
		});
	}

	if (user.name != 'nano') {
		if (text.contains('.facepalm')) 	gif('https://media.giphy.com/media/146wrc8zUb6aLS/giphy.gif', '...');
		else if (text.contains('.no')) 		gif('https://media0.giphy.com/media/XMl7bkguaL4PK/200.gif', 'nty');
		else if (text.contains('.nya')) 	gif('https://thecatapi.com/api/images/get?format=src&type=gif', 'wow, very cate, much kill');
		else if (text.contains('.crash')) 	gif('http://i.imgur.com/kiKRmYY.gif', 'shit');
		else if (text.contains('.why')) 	gif('http://i.imgur.com/FkCVg0j.gif', 'y');
		else if (text.contains('.gudenuf')) gif('http://i.imgur.com/OYYNv82.gif', 'gud enuf');
		else if (text.contains('.me')) 		gif('http://i.imgur.com/w7c8pDo.gif', 'me pls');
		else if (text.contains('.idgaf')) 	gif('http://i.imgur.com/YiCUeTP.gif', 'idgaf');
		else if (text.contains('.lisa')) 	gif('http://i.imgur.com/T4QoI4x.gif', 'fk u lisa');
		else if (text.contains('.lonely')) 	gif('http://i.imgur.com/u2Fy5VV.gif', 'cry evritym');
		else if (text.contains('.joke')) 	gif('http://i.imgur.com/v4NsQhC.gif', 'joke ^ head + calc');
		else if (text.contains('.nom')) 	gif('http://i.imgur.com/OpOynkt.gif', 'nomnomnom');
		else if (text.contains('.baka')) 	gif('http://i.imgur.com/XUbzeIA.gif', 'wot a baka');
		else if (text.contains('.stfu'))	gif('http://i.imgur.com/NvBcf1R.gif', 'shuddap');
		else if (text.contains('.wat')) 	gif('http://i.imgur.com/QB9lziN.gif', 'wat');
		else if (text.contains('.waiting'))	gif('http://i.imgur.com/GJsN1YS.gif', 'im waitin');
		else if (text.contains('.cri'))		gif('http://i.imgur.com/ZVeCD53.gif', 'cries');
		else if (text.contains('.grats'))	gif('http://i.imgur.com/cxPP56N.gif', 'gratsificateshun');
		else if (text.contains('.zzz'))		gif('http://i.imgur.com/NP0JjB0.gif', 'slep pls');

		else if (text.contains('.dealwithit')) 	gif('https://media.giphy.com/media/cQwaKZ3oNqptm/giphy.gif', 'deal with it');
		else if (text.contains('.feels')) 		gif('https://media.giphy.com/media/HP68mDARWZX20/giphy.gif', 'feels');
		else if (text.contains('.fab')) 		gif('https://media.giphy.com/media/huWUrrBko12Cc/giphy.gif', 'wow so fab');
		else if (text.contains('.cries')) 		gif('https://media.giphy.com/media/wzRfW1SV1DSec/giphy.gif', ':<');
		else if (text.contains('.hi'))			gif('https://media.giphy.com/media/ybstSlIgIEhQA/giphy.gif', 'hi pls');
		else if (text.contains('.uso'))			gif('http://i1.kym-cdn.com/entries/icons/original/000/018/847/e4a829e2-502a-42d4-898f-f3169442026b-bestSizeAvailable.png', 'y da fuk u lyin');
		else if (text.contains('.spoilers'))	gif('http://i.imgur.com/062kUsx.gif', 'ssh, spoilers');
		else if (text.contains('.wow'))			gif('http://i1.kym-cdn.com/photos/images/facebook/000/612/917/02d.gif', 'wow');
		else if (text.contains('.soon'))		gif('http://1.bp.blogspot.com/-yRKdiyePiCI/U7Lp4r1J9VI/AAAAAAAABdU/zKIdHlpfODU/s1600/soon+cat.gif', '#soon');
	}
}

catch(error) {
	channel.send('*Error:* There was a problem with your request: ```' + error + '```');
}
