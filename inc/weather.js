var YQL = require('yql');

try {
    channel.send(random());
    var weatherOUT = message.text.replace('.weather ', '');
    var query = new YQL('select * from weather.forecast where woeid in (select woeid from geo.places(1) where text="' + weatherOUT + '") and u="c"');

    function emojiType(condition) {
        if (condition == 'Tornado')                     return ':cyclone::dash:';
        else if (condition == 'Tropical Storm')         return ':cyclone::dash::sweat_drops:';
        else if (condition == 'Hurricane')              return ':cyclone::dash:';
        else if (condition == 'Mixed Rain and Snow')    return ':umbrella::snowflake:';
        else if (condition == 'Mixed Rain and Sleet')   return ':umbrella::snowflake:';
        else if (condition == 'Mixed Snow and Sleet')   return ':snowflake:';
        else if (condition == 'Drizzle')                return ':sweat_drops:';
        else if (condition == 'Blustery')               return ':leaves::dash:';
        else if (condition == 'Mixed Rain and Hail')    return ':umbrella::snowflake:';
        else if (condition == 'Snow Showers')           return ':snowflake::umbrella:';
        else if (condition == 'Hot')                    return ':sunny::sweat:';
        else if (condition == 'Cold')                   return ':snowflake::cold_sweat:';
        else if (condition == 'AM Showers')             return ':sunny: :umbrella:';
        else if (condition == 'PM Showers')             return ':crescent_moon: :umbrella:';
        else if (condition.indexOf('Freezing') >= 0)    return ':snowflake:';
        else if (condition.indexOf('Snow') >= 0)        return ':snowflake:';
        else if (condition.indexOf('Hail') >= 0)        return ':snowflake:';
        else if (condition.indexOf('Sleet') >= 0)       return ':snowflake:';
        else if (condition.indexOf('Dust') >= 0)        return ':dash:';
        else if (condition.indexOf('Fog') >= 0)         return ':dash:';
        else if (condition.indexOf('Haze') >= 0)        return ':dash:';
        else if (condition.indexOf('Smok') >= 0)        return ':fire::dash:';
        else if (condition.indexOf('Wind') >= 0)        return ':leaves::dash:';
        else if (condition.indexOf('Partly') >= 0)      return ':partly_sunny:';
        else if (condition.indexOf('Mostly') >= 0)      return ':partly_sunny:';
        else if (condition.indexOf('Cloudy') >= 0)      return ':cloud:';
        else if (condition.indexOf('Clear') >= 0)       return ':sunny:';
        else if (condition.indexOf('Sun') >= 0)         return ':sunny:';
        else if (condition.indexOf('Fair') >= 0)        return ':sunny:';
        else if (condition.indexOf('Thunder') >= 0)     return ':zap::umbrella:';
        else if (condition.indexOf('Showers') >= 0)     return ':umbrella:';
        else if (condition.indexOf('Rain') >= 0)        return ':umbrella:';
        else                                            return ':question:';
    }

    query.exec(function(err, data) {
        if (err) channel.send('*Error:* There was a problem with your request.');
        else {
            if (data.query.results === null) channel.send('*Error:* Place not found.');
            else if (data.query.results !== null) {
                var weather = data.query.results.channel;
                var location = data.query.results.channel.location;
                var condition = data.query.results.channel.item.condition;
                var forecast = data.query.results.channel.item.forecast;

                var weatherAttach = [{
                    'color': '#2F84E0',
                    'fallback': 'Weather Report for ' + location.city,
                    'title': emojiType(condition.text) + ' ' + location.city + ', ' + location.country,
                    'mrkdwn_in': ['text'],
                    'text':
                        '*Temperature*: ' + condition.temp + 'º' + weather.units.temperature + '\n' +
                        '*Condition*: ' + condition.text + '\n' +
                        '*Humidity*: ' + weather.atmosphere.humidity + '%\n' +
                        '*Wind Speed*: ' + weather.wind.speed + weather.units.speed + '\n' +
                        '*Pressure*: ' + weather.atmosphere.pressure + weather.units.pressure + '\n\n' +
                        '*Weekly Forecast*: \n' +
                            emojiType(forecast[0].text) + ' *' + forecast[0].day + '*, ' + forecast[0].date + '\n' +
                            forecast[0].text + ', Min: ' + forecast[0].low + 'º' + weather.units.temperature + ', Max: ' + forecast[0].high + 'º' + weather.units.temperature + '\n\n' +

                            emojiType(forecast[1].text) + ' *' + forecast[1].day + '*, ' + forecast[1].date + '\n' +
                            forecast[1].text + ', Min: ' + forecast[1].low + 'º' + weather.units.temperature + ', Max: ' + forecast[1].high + 'º' + weather.units.temperature + '\n\n' +

                            emojiType(forecast[2].text) + ' *' + forecast[2].day + '*, ' + forecast[2].date + '\n' +
                            forecast[2].text + ', Min: ' + forecast[2].low + 'º' + weather.units.temperature + ', Max: ' + forecast[2].high + 'º' + weather.units.temperature + '\n\n' +

                            emojiType(forecast[3].text) + ' *' + forecast[3].day + '*, ' + forecast[3].date + '\n' +
                            forecast[3].text + ', Min: ' + forecast[3].low + 'º' + weather.units.temperature + ', Max: ' + forecast[3].high + 'º' + weather.units.temperature + '\n\n' +

                            emojiType(forecast[4].text) + ' *' + forecast[4].day + '*, ' + forecast[4].date + '\n' +
                            forecast[4].text + ', Min: ' + forecast[4].low + 'º' + weather.units.temperature + ', Max: ' + forecast[4].high + 'º' + weather.units.temperature
                }];

                slack._apiCall('chat.postMessage', {
                    'as_user': true,
                    'channel': '#' + channel.name,
                    'attachments': JSON.stringify(weatherAttach)
                });
            }
        }
    });
}

catch(err) {
    channel.send('*Error:* There was a problem with your request: ```' + err.message + '```');
}
