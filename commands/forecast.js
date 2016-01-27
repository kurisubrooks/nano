const YQL = require('YQL');
const path = require('path');
const core = require(path.join(__dirname, "../", "core.js"));
const keychain = require(path.join(__dirname, "../", "keychain.js"));

exports.main = (slack, channel, user, args, ts, config) => {
    try {
        var query = new YQL('select * from weather.forecast where woeid in (select woeid from geo.places(1) where text="' + args.join(" ") + '") and u="c"');

        query.exec(function(error, data) {
            if (error) channel.send(core.errno + '```' + error + '```');
            else {
                if (data.query.results === null) channel.send('*Error*: Your query returned no results.');
                else if (data.query.results !== null) {
                    var condition = data.query.results.channel.item.condition;
                    var location = data.query.results.channel.location;
                    var forecast = data.query.results.channel.item.forecast;
                    var forecast_text = '';

                    for (var i = 0; i < 5; i++) {
                        forecast_text += '*' + forecast[i].day + '*, ' + forecast[i].date + '\n' +
                        forecast[i].text + ', Min: ' + forecast[i].low + 'º, Max: ' + forecast[i].high + 'º' + '\n\n';
                    }

                    var attachments = [{
                        'color': core.info,
                        'fallback': 'Here\'s the forecast for ' + location.city + '.',
                        'title': emoji_type(condition.code) + ' ' + location.city + ', ' + location.region + ' ' + location.country,
                        'mrkdwn_in': ['text'],
                        'text': forecast_text
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
