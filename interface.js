$(document).ready(function() {
    $('label').popover();
});

/**
 * Launches the parsing process by calling the parser with the data entered in the interface,
 * and processing the results.
 */
function parse() {
    var textToParse = $("#lojban-text-area").val();
    $("#result-row").slideDown();
        var start = new Date().getTime();
    try {
        var parse_camxes_beta = camxes_beta.parse(textToParse);
        parse_camxes_beta = remove_morphology(parse_camxes_beta);
        parse_camxes_beta = remove_spaces(parse_camxes_beta);
        var simplified_camxes_beta = simplifyTree(parse_camxes_beta);
        numberSumti(simplified_camxes_beta);
        if (parse_camxes_beta) {
            tokens = [];
            findTokens(parse_camxes_beta, tokens);
            var $parserCamxesBeta = $("#parser-camxes-beta");
            showBoxes(simplified_camxes_beta, $parserCamxesBeta);
        }
        $("#parser-camxes-beta-tab").html("camxes-beta");
    } catch (e) {
        if (e.name && e.name === "SyntaxError") {
            $("#parser-camxes-beta").html("<span class=\"muted\">Boxes</span>");
            showSyntaxError(e, textToParse, $("#parser-camxes-beta"));
        } else {
            throw e;
        }
    }
    try {
        var parse_zantufa = zantufa_1_3.parse(textToParse);
        parse_zantufa = remove_morphology(parse_zantufa);
        parse_zantufa = remove_spaces(parse_zantufa);
        var simplified_zantufa = simplifyTree(parse_zantufa);
        numberSumti(simplified_zantufa);
        if (parse_zantufa) {
            tokens = [];
            findTokens(parse_zantufa, tokens);
            var $parserZantufa = $("#parser-zantufa");
            showBoxes(simplified_zantufa, $parserZantufa);
        }
        $("#parser-zantufa-tab").html("zantufa 1.3");
    } catch (e) {
        if (e.name && e.name === "minajimpe") {
            $("#parser-zantufa").html("<span class=\"muted\">Boxes</span>");
            showSyntaxError(e, textToParse, $("#parser-zantufa"));
        } else {
            throw e;
        }
    }
    var end = new Date().getTime();
    $("#time-label").html("（処理時間: " + (end - start) + " ms)");        
}

/**
 * Finds all tokens in the resulting parse tree, and puts them in the tokens array.
 */
function findTokens(parse, tokens) {
    
    if (parse instanceof Array) {
        if (parse.length == 2 && isString(parse[0]) && isString(parse[1])) {
            tokens.push(parse[1]);
        } else {
            for (child in parse) {
                findTokens(parse[child], tokens);
            }
        }
    }
}

/**
 * Shows the boxes in the interface.
 */
function showBoxes(simplified, $element) {
    
    var output = "";
    
    output += constructBoxesOutput(simplified[0], 0);
    
    /*output += "<p>Legend: ";
    var types = ["sentence", "prenex", "selbri", "sumti"];
    for (var type in types) {
        output += "<div class=\"" + boxClassForType({ type: types[type] }) + "\">" + types[type] + "</div>";
    }
    output += "</p>";*/
    
    $element.html(output);
}

function constructBoxesOutput(parse, depth) {
    
    // precaution against infinite recursion; this should not actually happen of course
    if (depth > 50) {
        return "<b>too much recursion :-(</b>";
    }
    
    // if we get null, just print that
    if (parse === null) {
        return "<i>(none?)</i>";
    }
    
    // if we get undefined, just print that
    if (!parse) {
        return "<i>(undefined?)</i>";
    }
    
    var output = "";
    
    if (parse.word) {
        
        output += "<div class=\"box box-terminal\">";
        
        // we have a terminal
        output += "&nbsp;<b>" + getVlasiskuLink(parse.word) + "</b>&nbsp;";
        output += "&nbsp;" + parse.type + "&nbsp;";
        if (shortDescriptions[parse.word]) {
            output += "<span class=\"translation\">&nbsp;" + shortDescriptions[parse.word] + "&nbsp;</span>";
        } else {
            output += "不明";
        }
        
        output += "</div>";
        
    } else {
        
        // we have a non-terminal
        
        output += "<div class=\"" + boxClassForType(parse) + "\">";

        if (!(/下位/.test(parse.type) && parse.children.length <= 1)) {
            output += "<div class=\"box box-type\">";
            if (parse.sumtiPlace) {
                output += "第" + parse.sumtiPlace + "スムティ（sumti x" + parse.sumtiPlace + "）";
            } else if (parse.type) {
                output += parse.type;
            } else {
                output += "<div class=\"box box-undefined\"></div>";
            }
            output += "</div>";
        }

        for (var child in parse.children) {
            output += constructBoxesOutput(parse.children[child], depth + 1);
        }
        
        output += "</div>";
    }
    
    return output;
}

function boxClassForType(parse) {
    
    if (parse.type === "文章（text）") {
        return "box box-text";
    }

    if (parse.type === "文（sentence）") {
        return "box box-sentence";
    }
    
    if (parse.type === "第xスムティ（sumti x）") {
        if (parse.sumtiPlace > 5) {
            return "box box-sumti6";
        } else if (parse.sumtiPlace == "fai") {
            return "box box-sumti-fai";
        } else {
            return "box box-sumti" + parse.sumtiPlace;
        }
    }
    
    if (parse.type === "法制スムティ（sumti modal）") {
        return "box box-modal";
    }
    
    if (parse.type === "スムティ（sumti）") {
        return "box box-sumti";
    }
    
    if (parse.type === "セルブリ（selbri）") {
        return "box box-selbri";
    }
    
    if (parse.type === "prenex") {
        return "box box-prenex";
    }

    if (/下位/.test(parse.type) && parse.children.length <= 1) {
        return "box box-not-shown";
    }
    
    return "box box-thin";
}

/**
 * Shows a syntax error in the interface.
 */
function showSyntaxError(e, textToParse, $element) {
    
    var output = "<div class=\"alert\">" +
    "<p><b>Syntax error</b> on line <b>" + 
    e.line +
    "</b>, at column <b>" +
    e.column +
    "</b>: " +
    e.message +
    "</p>" +
    "<p class=\"error-sentence\">" +
    generateErrorPosition(e, textToParse) + 
    "</p>" +
    generateFixes(e) +
    "</div>";
    
    $element.html(output);
}

/**
 * Generates the text sample that shows the error position.
 */
function generateErrorPosition(e, textToParse) {
    
    //"mi vau <span class=\"error-marker\">&#9652;</span> do cusku ..." +
    
    var before = textToParse.substring(e.offset - 20, e.offset);
    
    var after = textToParse.substring(e.offset + 0, e.offset + 20);
    
    if (e.offset > 20) {
        before = "..." + before;
    }
    if (e.offset < textToParse.length - 20) {
        after = after + "...";
    }
    
    return before + "<span class=\"error-marker\">&#9652;</span>" + after;
}

function generateFixes(e) {
    if (!e.fix) {
        //return "<p><i>No quick fixes available.</i></p>";
        return "";
    }
    
    var fixes = "<p>Quick fixes:<ul>";
    
    for (var f in e.fix) {
        var fix = (e.fix)[f];
        fixes += "<li>";
        
        if (fix.fixFunction) {
            fixes += "<a>";
            fixes += fix.name;
            fixes += "</a>";
        } else {
            fixes += fix.name;
        }
        
        fixes += "</li>";
    }
    
    fixes += "</ul></p>";
    
    return fixes;
}

/**
 * Shows the translation in the interface.
 */
function showTranslation(parse, text, $element) {
    
    var output = "<p class=\"muted\">This translation feature tries to give an approximate translation of the Lojban text into English. However, it does only work for a few sentences as of now. (Try [mi gleki] or something simple like that...)</p>";
    
    //var translation = translate(parse);
    var translation = "Sorry! Translation is switched off at the moment, to prevent crashes in the other parts :-(";
    output += "<center><big>" + translation + "</big></center>";
    
    $element.html(output);
}

// Auxiliary

function isString(s) {
    return typeof(s) === 'string' || s instanceof String;
}

function getVlasiskuLink(word) {
    return "<a class=\"vlasisku-link\" href=\"http://vlasisku.lojban.org/vlasisku/" + word + "\">" + outputWord(word, getSelectedMode()) + "</a>";
}

function outputWord(word, mode) {
    if (mode === 1) { // Latin mode
        return addDotsToWord(word);
    } else if (mode === 2) { // Cyrillic mode
        return wordToCyrillic(addDotsToWord(word));
    } else if (mode === 3) { // Tengwar mode
        return wordToTengwar(addDotsToWord(word));
    } else if (mode === 4) { // Hiragana mode
        return wordToHiragana(addDotsToWord(word));
    }
}

function getSelectedMode() {
    if ($("#latin-button").hasClass('active')) {
        return 1;
    } else if ($("#cyrillic-button").hasClass('active')) {
        return 2;
    } else if ($("#tengwar-button").hasClass('active')) {
        return 3;
    } else if ($("#hiragana-button").hasClass('active')) {
        return 4;
    }
}

function endsWith(str, suffix) {
    return str.indexOf(suffix, str.length - suffix.length) !== -1;
}
