var trans = require("./epicenter.json");

function dataParse(inputData) {
    var parsedInput = inputData.split(',');
    var data = {};

    var i, item, j, len, ref;
    ref = ["type", "training_mode", "announce_time", "situation", "revision", "earthquake_id", "earthquake_time", "latitude", "longitude", "epicenter", "depth", "magnitude", "seismic", "geography", "alarm"];

    for (i = j = 0, len = ref.length; j < len; i = ++j) {
        item = ref[i];
        data[item] = parsedInput[i];
    }

    for (var i = 0; i < trans.length; i++) {
        var item =  trans[i];
        if (item.jp == data.epicenter){
             epicenterJP = item.jp;
             epicenterEN = item.en;
        }
    }

    if (data.situation == 9){var situationString = "Final";}
    else {var situationString = "#" + data.revision;}

    if (data.seismic == '不明') {var seismicLocale = "Unknown";}
    else {var seismicLocale = data.seismic;}

    return data;
}

module.exports.quakeData = dataParse;
