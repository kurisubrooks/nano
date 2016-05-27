const path = require("path");
const core = require(path.join(__dirname, "../", "core.js"));
const keychain = require(path.join(__dirname, "../", "keychain.js"));
const request = require("request");
const wanakana = require("wanakana");
const qs = require("qs");
const _ = require("lodash");
const url = keychain.translate;

var langs = {
    // a
    "af": "Afrikaans",
    "ar": "Arabic",
    // b
    "bg": "Bulgarian",
    // c
    "cs": "Czech",
    // d
    "da": "Danish",
    "de": "German",
    // e
    "el": "Greek",
    "en": "English",
    "es": "Spanish",
    // f
    "fa": "Persian",
    "fi": "Finnish",
    "fj": "Fijian",
    "fr": "French",
    // g
    // h
    "he": "Hebrew",
    "hi": "Hindi",
    "hr": "Croatian",
    "hu": "Hungarian",
    "hy": "Armenian",
    // i
    "id": "Indonesian",
    "is": "Icelandic",
    "it": "Italian",
    // j
    "ja": "Japanese",
    // k
    "ka": "Georgian",
    "ko": "Korean",
    // l
    "la": "Latin",
    "lo": "Lao",
    "lt": "Lithuanian",
    // m
    "mi": "Māori",
    "mk": "Macedonian",
    "ms": "Malay",
    // n
    "nl": "Dutch",
    "no": "Norwegian",
    // o
    // p
    "pa": "Punjabi",
    "pl": "Polish",
    "pt": "Portuguese",
    // q
    // r
    "ro": "Romanian",
    "ru": "Russian",
    // s
    "sk": "Slovak",
    "sm": "Samoan",
    "sr": "Serbian",
    "sv": "Swedish",
    // t
    "ta": "Tamil",
    "th": "Thai",
    "tl": "Filipino",
    "to": "Tongan",
    "tr": "Turkish",
    // u
    "uk": "Ukranian",
    // v
    "vi": "Vietnamese",
    // w
    "cy": "Welsh",
    // x
    // y
    // z
    "zh": "Chinese (Traditional)",
    "zh-cn": "Chinese",
    "zh-tw": "Chinese (Traditional)",
    "zu": "Zulu"
};

function check_iso(lang) {
    lang = lang.toLowerCase();
    if (lang in langs) return langs[lang];
    else return lang;
}

exports.main = (slack, channel, user, args, ts, config) => {
    var lang = args[0].split(",");
    var tolang = (lang[0] == "zh") ? "zh-TW" : lang[0];
    var frlang = lang.length > 1 ? lang[1] : "auto";
    var translate = args.slice(1)
                        .join(" ")
                        .replace(/。/g, ". ")
                        .replace(/、/g, ", ")
                        .replace(/？/g, "? ")
                        .replace(/！/g, "! ")
                        .replace(/「/g, "\"")
                        .replace(/」/g, "\" ")
                        .replace(/　/g, " ");

    var fetch = {
        headers: { "User-Agent": "Mozilla/5.0" },
        url: url + qs.stringify({
            // sl: from language
            sl: frlang,
            // tl: to language
            tl: tolang,
            // q:  translation query
            q: translate
        })
    };

    request.get(fetch, (err, res, body) => {
        if (err) {
            channel.send(core.error("translate", err));
            return;
        } else if (res.statusCode !== 200) {
            channel.send(core.error("translate", "Status Code was not 200, saw " + res.statusCode + " instead"));
            return;
        } else if (body.startsWith(",", 1)) {
            console.log(body);
            channel.send(core.error("translate", "Malformed Response:\n" + body));
            return;
        }

        var response = JSON.parse(body.replace(/\,+/g, ","));
        var translation = response[0][0][0];
        var query       = (typeof response[0][0][1] === "string") ? response[0][0][1] : translate;
        var from_lang   = response[1];
        var to_lang     = tolang;

        var from_fancy = check_iso(from_lang);
        var to_fancy   = check_iso(to_lang);
        var other = "";

        if (response[3]) {
            if (response[3][0]) {
                _.each(response[3][0], function(value) {
                    other += check_iso(value);
                });
            }
        }

        /*
        console.log("Response: " + body.replace(/\,+/g, ","));
        console.log("Query: " + query);
        console.log("Translation: " + translation.firstUpper());
        console.log("From: " + from_fancy);
        console.log("To: " + to_fancy);
        console.log("Languages: " + other);
        console.log("Romaji1: " + wanakana.toRomaji(query));
        console.log("Romaji2: " + wanakana.toRomaji(translation));
        */

        var format = "";
        var format_roma = "";
        var format_from = `*${from_fancy}:* ${query}`;
        var format_to   = `*${to_fancy}:* ${translation.firstUpper()}`;

        if (from_lang === "ja") format_roma = `*Romaji:* ${wanakana.toRomaji(query)}`;
        else if (to_lang === "ja") format_roma = `*Romaji:* ${wanakana.toRomaji(translation)}`;

        if (from_lang === "ja") {
            format += format_from + "\n";
            format += format_roma + "\n";
            format += format_to;
        } else if (to_lang === "ja") {
            format += format_from + "\n";
            format += format_to + "\n";
            format += format_roma;
        } else {
            format += format_from + "\n";
            format += format_to;
        }

        slack._apiCall("chat.postMessage", {
            as_user: true,
            channel: channel.id,
            attachments: JSON.stringify([{
                "author_name": config.trigger.real_name,
                "author_icon": config.trigger.icon,
                "fallback": query + " > " + translation.toUpperLowerCase(),
                "mrkdwn_in": ["text"],
                "color": core.info,
                "text": format
            }])
        }, core.delMsg(channel.id, ts));
    });
};
