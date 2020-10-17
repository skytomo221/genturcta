// General functions

function addDotsToWord(word, previous) {

    var preDot = "";
    var postDot = "";

    // if word begins with a vowel: dot before
    if (isVowel(word.charAt(0))) {
        preDot = ".";
    }

    // if word is a cmene: dot after
    if (!isVowel(word.charAt(word.length - 1))) {
        postDot = ".";

        // and except for preceding selma'o DOI or LA, also a dot before
        if (!previous || (previous !== "doi" && previous !== "la")) { // TODO: check if there are more of these
            preDot = ".";
        }
    }

    return preDot + word + postDot;
}

function isVowel(c) {
    return c === "a" || c === "e" || c === "i" || c === "o" || c === "u" || c === "y";
}

function arrayToString(array) {
    var result = "";

    for (var i = 0; i < array.length - 1; i++) {
        result += array[i] + " ";
    }

    result += array[array.length - 1];

    return result;
}

// Latin mode

function transcribeToLatin(text) {
    var result = [];

    for (var i in text) {
        result.push(addDotsToWord(text[i], text[i - 1]));
    }

    return result;
}

// Cyrillic mode

function transcribeToCyrillic(text) {
    var result = [];

    for (var i in text) {
        result.push(wordToCyrillic(addDotsToWord(text[i], text[i - 1])));
    }

    return result;
}

function wordToCyrillic(word) {

    var cyrillicWord = "";

    for (var i = 0; i < word.length; i++) {
        var letter = word.charAt(i);

        var cyrillicLetter = cyrillicTable[letter];
        if (!cyrillicLetter) {
            cyrillicLetter = letter;
        }
        cyrillicWord += cyrillicLetter;
    }

    return cyrillicWord;
}

var cyrillicTable = {};
cyrillicTable["b"] = "&#1073;";
cyrillicTable["c"] = "&#1096;";
cyrillicTable["d"] = "&#1076;";
cyrillicTable["f"] = "&#1092;";
cyrillicTable["g"] = "&#1075;";
cyrillicTable["j"] = "&#1078;";
cyrillicTable["k"] = "&#1082;";
cyrillicTable["l"] = "&#1083;";
cyrillicTable["m"] = "&#1084;";
cyrillicTable["n"] = "&#1085;";
cyrillicTable["p"] = "&#1087;";
cyrillicTable["r"] = "&#1088;";
cyrillicTable["s"] = "&#1089;";
cyrillicTable["t"] = "&#1090;";
cyrillicTable["v"] = "&#1074;";
cyrillicTable["x"] = "&#1093;";
cyrillicTable["z"] = "&#1079;";
cyrillicTable["a"] = "&#1072;";
cyrillicTable["e"] = "&#1077;";
cyrillicTable["i"] = "&#1080;";
cyrillicTable["o"] = "&#1086;";
cyrillicTable["u"] = "&#1091;";
cyrillicTable["y"] = "&#1098;";

// Tengwar mode

function transcribeToTengwar(text) {
    var result = [];

    for (var i in text) {
        result.push(wordToTengwar(addDotsToWord(text[i], text[i - 1])));
    }

    return result;
}

function wordToTengwar(word) {

    var tengwarWord = "";
    var canUseTehta = false;

    for (var i = 0; i < word.length; i++) {
        var letter = word.charAt(i);

        if (letter === "'") {
            tengwarWord += "&#57389;" // halla
            canUseTehta = false;
            continue;
        }

        if (letter === ".") {
            // It would have been enough to set canUseTehta to true to get ":" for ".i",
            // but Tengwar Unicode fonts do not have tehta placement rules for the "lowered pusta",
            // which I render as the ASCII "." (period).
            // Therefore, add an extra case for ".i".
            if (word.length > i + 1 && word.charAt(i + 1) === "i") {
                // And also prevent longer words.
                if (word.length === i + 2 || word.charAt(i + 2) === " ") {
                    tengwarWord += "&#57441;"; // double pusta
                    i++;
                    canUseTehta = false;
                    continue;
                }
            }

            tengwarWord += ".";
            canUseTehta = false;
            continue;
        }

        var tehta = tehtaTable[letter];
        if (tehta) {
            if (i < word.length - 1 && tehtaTable[word.charAt(i + 1)]) {
                // diphtong
                tengwarWord += tengwaTable[letter];
                tengwarWord += tehtaTable[word.charAt(i + 1)];
                i++;
                canUseTehta = false;
                continue;
            } else if (!canUseTehta) {
                tengwarWord += "&#57390;"; // short carrier
                tengwarWord += tehta;
                canUseTehta = true;
                continue;
            } else {
                tengwarWord += tehta;
                canUseTehta = false;
                continue;
            }
        }

        var tengwa = tengwaTable[letter];
        if (tengwa) {
            tengwarWord += tengwa;
            canUseTehta = true;
            continue;
        }

        tengwarWord += "?";
    }

    return tengwarWord;
}

var tengwaTable = {};
tengwaTable["b"] = "&#57349;";
tengwaTable["c"] = "&#57354;";
tengwaTable["d"] = "&#57348;";
tengwaTable["f"] = "&#57353;";
tengwaTable["g"] = "&#57351;";
tengwaTable["j"] = "&#57358;";
tengwaTable["k"] = "&#57347;";
tengwaTable["l"] = "&#57378;";
tengwaTable["m"] = "&#57361;";
tengwaTable["n"] = "&#57360;";
tengwaTable["p"] = "&#57345;";
tengwaTable["r"] = "&#57376;";
tengwaTable["s"] = "&#57380;";
tengwaTable["t"] = "&#57344;";
tengwaTable["v"] = "&#57357;";
tengwaTable["x"] = "&#57355;";
tengwaTable["z"] = "&#57382;";

tengwaTable["a"] = "&#57394;";
tengwaTable["e"] = "&#57386;";
tengwaTable["i"] = "&#57390;";
tengwaTable["o"] = "&#57366;";
tengwaTable["u"] = "&#57365;";
tengwaTable["y"] = "&#57388;";

var tehtaTable = {};
tehtaTable["a"] = "&#57408;";
tehtaTable["e"] = "&#57414;";
tehtaTable["i"] = "&#57412;";
tehtaTable["o"] = "&#57418;";
tehtaTable["u"] = "&#57420;";
tehtaTable["y"] = "&#57413;";

// Hiragana mode

function transcribeToHiragana(text) {
    var result = [];

    for (var i in text) {
        result.push(wordToHiragana(addDotsToWord(text[i], text[i - 1])));
    }

    return result;
}

function wordToHiragana(word) {

    var hiraganaWord = "";
    var preHiraganaWord = word
        .replace("ba", "バ").replace("bi", "ビ").replace("bu", "ブ").replace("be", "ベ").replace("bo", "ボ").replace("by", "バ")
        .replace("ca", "シャ").replace("ci", "ビ").replace("cu", "ブ").replace("ce", "シェ").replace("co", "ショ").replace("cy", "シァ")
        .replace("da", "ダ").replace("di", "ビ").replace("du", "ブ").replace("de", "デ").replace("do", "ド").replace("dy", "ダァ")
        .replace("fa", "ファ").replace("fi", "ビ").replace("fu", "ブ").replace("fe", "フェ").replace("fo", "フォ").replace("fy", "ファ")
        .replace("ga", "ガ").replace("gi", "ビ").replace("gu", "ブ").replace("ge", "ベ").replace("go", "ゴ").replace("gy", "ガァ")
        .replace("ja", "ジャ").replace("ji", "ビ").replace("ju", "ブ").replace("je", "ベ").replace("jo", "ジョ").replace("jy", "ジァ")
        .replace("ka", "カ").replace("ki", "キ").replace("ku", "ク").replace("ke", "ケ").replace("ko", "コ").replace("ky", "カァ")
        .replace("la", "ラﾟ").replace("li", "リﾟ").replace("lu", "ルﾟ").replace("le", "レﾟ").replace("lo", "ロﾟ").replace("ly", "ラﾟァ")
        .replace("ma", "マ").replace("mi", "ミ").replace("mu", "ム").replace("me", "メ").replace("mo", "モ").replace("my", "マァ")
        .replace("na", "ナ").replace("ni", "ニ").replace("nu", "ヌ").replace("ne", "ネ").replace("no", "ノ").replace("ny", "ナァ")
        .replace("pa", "パ").replace("pi", "ピ").replace("pu", "プ").replace("pe", "ペ").replace("po", "ポ").replace("py", "パァ")
        .replace("ra", "ラ").replace("ri", "リ").replace("ru", "ル").replace("re", "レ").replace("ro", "ロ").replace("ry", "ラァ")
        .replace("sa", "サ").replace("si", "シ").replace("su", "ス").replace("se", "セ").replace("so", "ソ").replace("sy", "サァ")
        .replace("ta", "タ").replace("ti", "ティ").replace("tu", "トゥ").replace("te", "テ").replace("to", "ト").replace("ty", "タァ")
        .replace("va", "ヴァ").replace("vi", "ヴィ").replace("vu", "ヴ").replace("ve", "ヴェ").replace("vo", "ヴォ").replace("vy", "ヴァ")
        .replace("xa", "ハ").replace("xi", "ヒ").replace("xu", "フ").replace("xe", "ヘ").replace("xo", "ホ").replace("xy", "ハァ")
        .replace("za", "ザ").replace("zi", "ジ").replace("zu", "ズ").replace("ze", "ゼ").replace("zo", "ゾ").replace("zy", "ザァ")
        .replace("'a", "は").replace("'i", "ひ").replace("'u", "ふ").replace("'e", "へ").replace("'o", "ほ").replace("'y", "はァ")
        .replace("ia", "ヤ").replace("ii", "イィ").replace("iu", "ユ").replace("ie", "イェ").replace("io", "ヨ").replace("iy", "イァ")
        .replace("ua", "ワ").replace("ui", "ウィ").replace("uu", "ウゥ").replace("ue", "ウェ").replace("uo", "ウォ").replace("uy", "ウァ")
        .replace("a", "ア").replace("i", "イ").replace("u", "ウ").replace("e", "エ").replace("o", "オ").replace("y", "ァ")
        .replace("n", "ン");

    for (var i = 0; i < preHiraganaWord.length; i++) {
        var next = preHiraganaWord.charAt(i);
        var nextTwo = preHiraganaWord.substring(i, i + 2);

        console.log(hiraganaTable["co"]);

        if (hiraganaTable[nextTwo]) {
            hiraganaWord += hiraganaTable[nextTwo];
            i++;
            continue;
        }
        if (hiraganaTable[next]) {
            hiraganaWord += hiraganaTable[next];
            continue;
        }
        hiraganaWord += next; // TODO this should not happen, of course
    }

    return hiraganaWord;
}

var hiraganaTable = {};
hiraganaTable["c"] = "<span class=\"unvoiced-sound\">ブ</span>";
hiraganaTable["d"] = "<span class=\"unvoiced-sound\">ド</span>";
hiraganaTable["f"] = "<span class=\"unvoiced-sound\">フ</span>";
hiraganaTable["g"] = "<span class=\"unvoiced-sound\">グ</span>";
hiraganaTable["j"] = "<span class=\"unvoiced-sound\">ジ</span>";
hiraganaTable["k"] = "<span class=\"unvoiced-sound\">ク</span>";
hiraganaTable["l"] = "<span class=\"unvoiced-sound\">ルﾟ</span>";
hiraganaTable["m"] = "<span class=\"unvoiced-sound\">ム</span>";
hiraganaTable["p"] = "<span class=\"unvoiced-sound\">プ</span>";
hiraganaTable["r"] = "<span class=\"unvoiced-sound\">ル</span>";
hiraganaTable["s"] = "<span class=\"unvoiced-sound\">ス</span>";
hiraganaTable["t"] = "<span class=\"unvoiced-sound\">ト</span>";
hiraganaTable["v"] = "<span class=\"unvoiced-sound\">ヴ</span>";
hiraganaTable["x"] = "<span class=\"unvoiced-sound\">ハ</span>";
hiraganaTable["z"] = "<span class=\"unvoiced-sound\">ズ</span>";
