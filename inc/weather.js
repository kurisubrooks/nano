try {
	var YQL = require('yql');

	function emojiType(condition) {
		if	  (condition == 'Tornado')				return ':cyclone::dash:';
		else if (condition == 'Tropical Storm')		 return ':cyclone::dash::sweat_drops:';
		else if (condition == 'Hurricane')			  return ':cyclone::dash:';
		else if (condition == 'Mixed Rain and Snow')	return ':umbrella::snowflake:';
		else if (condition == 'Mixed Rain and Sleet')   return ':umbrella::snowflake:';
		else if (condition == 'Mixed Snow and Sleet')   return ':snowflake:';
		else if (condition == 'Drizzle')				return ':sweat_drops:';
		else if (condition == 'Blustery')			   return ':leaves::dash:';
		else if (condition == 'Mixed Rain and Hail')	return ':umbrella::snowflake:';
		else if (condition == 'Snow Showers')		   return ':snowflake::umbrella:';
		else if (condition == 'Hot')					return ':sunny::sweat:';
		else if (condition == 'Cold')				   return ':snowflake::cold_sweat:';
		else if (condition == 'AM Showers')			 return ':sunny: :umbrella:';
		else if (condition == 'PM Showers')			 return ':crescent_moon: :umbrella:';
		else if (condition.contains('Freezing'))		return ':snowflake:';
		else if (condition.contains('Snow'))			return ':snowflake:';
		else if (condition.contains('Hail'))			return ':snowflake:';
		else if (condition.contains('Sleet'))		   return ':snowflake:';
		else if (condition.contains('Dust'))			return ':dash:';
		else if (condition.contains('Fog'))			 return ':dash:';
		else if (condition.contains('Haze'))			return ':dash:';
		else if (condition.contains('Smok'))			return ':fire::dash:';
		else if (condition.contains('Wind'))			return ':leaves::dash:';
		else if (condition.contains('Partly'))		  return ':partly_sunny:';
		else if (condition.contains('Mostly'))		  return ':partly_sunny:';
		else if (condition.contains('Cloudy'))		  return ':cloud:';
		else if (condition.contains('Clear'))		   return ':sunny:';
		else if (condition.contains('Sun'))			 return ':sunny:';
		else if (condition.contains('Fair'))			return ':sunny:';
		else if (condition.contains('Thunder'))		 return ':zap::umbrella:';
		else if (condition.contains('Showers'))		 return ':umbrella:';
		else if (condition.contains('Rain'))			return ':umbrella:';
		else											return ':question:';
	}

	var weather_out = message.text.replace('.weather ', '');
	var query = new YQL('select * from weather.forecast where woeid in (select woeid from geo.places(1) where text="' + weather_out + '") and u="c"');

	channel.send(random());
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

				if (weather.atmosphere.pressure == '') var weather_pressure = 'Unknown';
				else var weather_pressure = weather.atmosphere.pressure + weather.units.pressure;

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
						'*Pressure*: ' + weather_pressure + '\n\n' +
						'*Weekly Forecast*: \n' + forecastText
				}];

				slack._apiCall('chat.postMessage', {
					'as_user': true,
					'channel': chan,
					'attachments': JSON.stringify(weatherAttach)
				});
			}
		}
	});
}

catch(error) {
	channel.send('*Error:* There was a problem with your request: ```' + error + '```');
}
