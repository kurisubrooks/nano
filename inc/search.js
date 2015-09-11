var http = require('https');

var searchMessage = message.text;
var searchText = searchMessage.substring(8, searchMessage.length).replace(/\s+/g, '+');
var url = 'https://www.googleapis.com/customsearch/v1?key=' + googleToken + '&num=1&cx=006735756282586657842:s7i_4ej9amu&q=' + encodeURIComponent(searchText);

try {
    channel.send(random());

    http.get(url, function(res) {
        if (res.statusCode == 200) {
            var data = '';

            res.on('data', function(chunk) {
                data += chunk;
            });

            res.on('end', function() {
                var result = JSON.parse(data);

                if (result.searchInformation.totalResults != '0') {
                    var search1 = '<@' + user.name + '>';
                    var search2 = result.items[0].link;
                    var search3 = result.items[0].snippet;

                    if ('pagemap' in result.items[0] && 'cse_thumbnail' in result.items[0].pagemap) var thumbURL = result.items[0].pagemap.cse_thumbnail[0].src;
                    else var thumbURL = '';

                    var searchAttachments = [{
                        'fallback': 'Here are the results of your search:',
                        'color': '#2F84E0',
                        'title': result.items[0].title,
                        'title_link': result.items[0].link,
                        'text': result.items[0].snippet + '\n' + '<' + decodeURIComponent(result.items[0].link) + '>',
                        'thumb_url': thumbURL
                    }];

                    slack._apiCall('chat.postMessage', {
                        as_user: true,
                        unfurl_links: 'false',
                        unfurl_media: 'false',
                        channel: '#' + channel.name,
                        attachments: JSON.stringify(searchAttachments)
                    });
                } else channel.send('*Error:* We couldn\'t find any results for: "' + searchText + '"');
            });
        }

        else if (res.statusCode != 200) {
            if (res.statusCode == 400) channel.send('*Error:* Bad Request');
            else if (res.statusCode == 403) channel.send('*Error:* Daily Limit Exceeded');
            else if (res.statusCode == 500) channel.send('*Error:* Internal Server Error');
            else channel.send('*Error:* Unknown Error ' + res.statusCode);
        }
    })

    .on('error', function(e) {
        channel.send('*Error:* There was a problem with your request: ```' + e + '```');
    });
}

catch(error) {
    channel.send('*Error:* There was a problem with your request: ```' + error + '```');
}
