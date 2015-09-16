try {
	var request = require('request');
	var http = require('https');
	var input = text.replace('.translate ', '');
	var api_key = 'trnsl.1.1.20150915T045431Z.a7349809ebd138f9.cf667dfb9c185c0415e35b31c2923996e12e08ec';
	var lang_key = 'ja-en';
	var url = 'https://translate.yandex.net/api/v1.5/tr.json/translate?key=' + api_key + '&lang=' + lang_key + '&text=' + encodeURI(input) + '&format=html';

	http.get(url, function(res) {
		if (res.statusCode != 200) channel.send(res.statusCode);
		if (res.statusCode == 200) {
			var data = '';

			res.on('data', function(chunk) {data += chunk;});
			res.on('end', function() {
				var result = JSON.parse(data);
				channel.send(JSON.stringify(result.text));
			});
		}
	});

	/*
	request(url, function(error, response, body) {
		if (error) channel.send('*Error:* There was a problem with your request: ```' + error + '```');
		if (response.statusCode == 200) {
			//var data = JSON.parse(response.body);
			//channel.send(JSON.stringify(data.text));
			channel.send(body);
		}
	});
	*/
}

catch(error) {
	channel.send('*Error:* There was a problem with your request: ```' + error + '```');
}
