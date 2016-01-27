exports.main = (slack, channel, user, args, ts, config) => {
    // Do not say if user is not part of masters in config.
    if(config.masters.indexOf(user.id) === -1) return;
    // Check if the first argument is in the <#?????????> format
    if(args[0].startsWith("<") && args[0].endsWith(">") && args.length > 1) {
        // If it is, set toChannel to channel name.
        var toChannel = args[0].substring(2, args[0].length - 1);
        // Remove channel name from text.
        args.splice(0, 1);
        // If channel is DM, open channel first, then set toChannel to resulting DM channel.
        if(toChannel.charAt(0) == "U") slack._apiCall('im.open', { "user": toChannel }, function(uData) { toChannel = uData.channel.id; });
        // Set channel to channel object of toChannel.
        channel = slack.getChannelGroupOrDMByID(toChannel);
    }
    channel.send(args.join(" "));
};
