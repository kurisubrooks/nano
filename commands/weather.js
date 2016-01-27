const YQL = require('YQL');
const path = require('path');
const core = require(path.join(__dirname, "../", "core.js"));
const keychain = require(path.join(__dirname, "../", "keychain.js"));

exports.main = (slack, channel, user, text, ts, config) => {
    try {
        var query = new YQL('select * from weather.forecast where woeid in (select woeid from geo.places(1) where text="' + text + '") and u="c"');

        query.exec(function(error, data) {
            if (error) channel.send(core.errno + '```' + error + '```');
            else {
                if (data.query.results === null) channel.send('*Error*: Your query returned no results.');
                else if (data.query.results !== null) {
                    var weather = data.query.results.channel;
                    var location = data.query.results.channel.location;
                    var condition = data.query.results.channel.item.condition;

                    var attachments = [{
                        'color': core.info,
                        'fallback': 'Here\'s the weather for ' + location.city + '.',
                        'title': emoji_type(condition.code) + ' ' + location.city + ', ' + location.region + ' ' + location.country,
                        'mrkdwn_in': ['text'],
                        'text':
                        '*Temperature:* ' + condition.temp + 'º\n' +
                        '*Humidity*: ' + weather.atmosphere.humidity + '%\n' +
                        '*Wind Speed*: ' + weather.wind.speed + weather.units.speed,
                        'thumb_url': 'https://ssl.gstatic.com/onebox/weather/256/' + weather_img(condition.code) + '.png'
                    }];

                    slack._apiCall('chat.postMessage', {
                        'as_user': true,
                        'channel': channel.id,
                        'attachments': JSON.stringify(attachments)
                    }, core.delMsg(channel.id, ts));
                }
            }
        });
    }

    catch (error){
        channel.send(core.errno + '```' + error + '```');
    }
};

function weather_img(code) {
    if (code == '0' || code == '1' || code == '2') {
        return 'windy';
    } else if (code == '3' || code == '4' || code == '37' || code == '38' || code == '39' || code == '45' || code == '47') {
        return 'thunderstorms';
    } else if (code == '5' || code == '6' || code == '7' || code == '35') {
        return 'snow_s_rain';
    } else if (code == '8' || code == '9' || code == '10' || code == '11' || code == '12') {
        return 'rain_light';
    } else if (code == '13' || code == '14' || code == '15') {
        return 'snow_light';
    } else if (code == '16' || code == '17' || code == '18' || code == '41' || code == '42' || code == '43' || code == '46') {
        return 'snow';
    } else if (code == '19' || code == '20' || code == '21' || code == '22' || code == '23') {
        return 'fog';
    } else if (code == '24') {
        return 'windy';
    } else if (code == '25' || code == '26') {
        return 'cloudy';
    } else if (code == '27' || code == '28' || code == '29' || code == '30' || code == '44' || code == '3200') {
        return 'partly_cloudy';
    } else if (code == '31' || code == '32' || code == '33' || code == '34' || code == '36') {
        return 'sunny';
    } else if (code == '40') {
        return 'rain';
    }
}

function emoji_type(code) {
    // https://developer.yahoo.com/weather/documentation.html
    if  (code == '0')   return ':cyclone: :dash:';
    else if (code == '1')   return ':cyclone: :dash: :leaves:';
    else if (code == '2')   return ':cyclone: :dash:';
    else if (code == '3')   return ':zap: :sweat_drops:';
    else if (code == '4')   return ':zap: :umbrella:';
    else if (code == '5')   return ':umbrella: :snowflake:';
    else if (code == '6')   return ':umbrella: :snowflake:';
    else if (code == '7')   return ':snowflake:';
    else if (code == '8')   return ':snowflake: :sweat_drops:';
    else if (code == '9')   return ':sweat_drops:';
    else if (code == '10')  return ':snowflake: :sweat_drops:';
    else if (code == '11')  return ':umbrella:';
    else if (code == '12')  return ':umbrella:';
    else if (code == '13')  return ':snowflake:';
    else if (code == '14')  return ':snowflake: :umbrella:';
    else if (code == '15')  return ':snowflake: :dash:';
    else if (code == '16')  return ':snowflake:';
    else if (code == '17')  return ':snowflake:';
    else if (code == '18')  return ':snowflake:';
    else if (code == '19')  return ':dash:';
    else if (code == '20')  return ':cloud:';
    else if (code == '21')  return ':cloud:';
    else if (code == '22')  return ':fire: :dash:';
    else if (code == '23')  return ':leaves: :dash:';
    else if (code == '24')  return ':leaves: :dash:';
    else if (code == '25')  return ':snowflake:';
    else if (code == '26')  return ':cloud:';
    else if (code == '27')  return ':cloud:';
    else if (code == '28')  return ':cloud:';
    else if (code == '29')  return ':partly_sunny:';
    else if (code == '30')  return ':partly_sunny:';
    else if (code == '31')  return ':sunny:';
    else if (code == '32')  return ':sunny:';
    else if (code == '33')  return ':partly_sunny:';
    else if (code == '34')  return ':partly_sunny:';
    else if (code == '35')  return ':umbrella: :snowflake:';
    else if (code == '36')  return ':sunny: :fire:';
    else if (code == '37')  return ':sunny:';
    else if (code == '38')  return ':zap: :umbrella:';
    else if (code == '39')  return ':zap: :umbrella:';
    else if (code == '40')  return ':cloud: :umbrella:';
    else if (code == '41')  return ':snowflake: :umbrella:';
    else if (code == '42')  return ':snowflake: :umbrella:';
    else if (code == '43')  return ':cloud: :snowflake:';
    else if (code == '44')  return ':partly_sunny:';
    else if (code == '45')  return ':zap: :umbrella:';
    else if (code == '46')  return ':snowflake: :umbrella:';
    else if (code == '47')  return ':zap: :cloud:';
    else if (code == '3200')return ':partly_sunny:';
    else return ':question:';
}
