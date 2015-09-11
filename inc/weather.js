var YQL = require('yql');

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

try {
    channel.send(random());
    var weatherOUT = message.text.replace('.weather ', '');
    var query = new YQL('select * from weather.forecast where woeid in (select woeid from geo.places(1) where text="' + weatherOUT + '") and u="c"');

    query.exec(function(err, data) {
        if (err) channel.send('*Error:* There was a problem with your request.');
        else {
            if (data.query.results === null) channel.send('*Error:* Place not found.');
            else if (data.query.results !== null) {
                var weather = data.query.results.channel;
                var location = data.query.results.channel.location;
                var condition = data.query.results.channel.item.condition;
                var forecast = data.query.results.channel.item.forecast;

                var forecastText = "";
                for (var i = 0; i < 5; i++) {
                    forecastText += emojiType(forecast[i].text) + ' *' + forecast[i].day + '*, ' + forecast[i].date + '\n' +
                    forecast[i].text + ', Min: ' + forecast[i].low + 'º' + weather.units.temperature + ', Max: ' + forecast[i].high + 'º' + weather.units.temperature + '\n\n';
                }

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
                        '*Weekly Forecast*: \n' + forecastText
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

catch(error) {
    channel.send('*Error:* There was a problem with your request: ```' + error + '```');
}
