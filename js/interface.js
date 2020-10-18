$(document).ready(() => {
    $('label').popover();
});

/**
 * Launches the parsing process by calling the parser with the data entered in the interface,
 * and processing the results.
 */
function parse() {
    const textToParse = $('#lojban-text-area').val();
    $('#result-row').slideDown();
    const start = new Date().getTime();
    subparse('Camxes: Beta CBM CKT', '#parser-camxes-beta-cbm-ckt', camxes_beta_cbm_ckt, textToParse);
    subparse('Camxes: Beta CBM', '#parser-camxes-beta-cbm', camxes_beta_cbm, textToParse);
    subparse('Camxes: Beta', '#parser-camxes-beta', camxes_beta, textToParse);
    subparse('Camxes: Experimental', '#parser-camxes-exp', camxes_exp, textToParse);
    subparse('Camxes: Standard', '#parser-camxes', camxes, textToParse);
    subparse('Maftufa 1.15', '#parser-maftufa-1-15', maftufa_1_15, textToParse);
    subparse('Maltufa 0.9', '#parser-maltufa-0-9', maltufa_0_9, textToParse);
    subparse('Maltufa 1.15', '#parser-maltufa-1-15', maltufa_1_15, textToParse);
    subparse('Zantufa 0.9', '#parser-zantufa-0-9', zantufa_0_9, textToParse);
    subparse('Zantufa 0.61', '#parser-zantufa-0-61', zantufa_0_61, textToParse);
    subparse('Zantufa 1.3', '#parser-zantufa-1-3', zantufa_1_3, textToParse);
    const end = new Date().getTime();
    $('#time-label').html(`（処理時間：${end - start}ミリ秒)`);
}

function subparse(parserName, parserId, parserFunction, textToParse) {
    parserTabId = `${parserId}-tab`;
    try {
        let parseResult = parserFunction.parse(textToParse)
        parseResult = removeMorphology(parseResult);
        parseResult = removeSpaces(parseResult);
        const simplified = simplifyTree(parseResult);
        numberSumti(simplified);
        if (parseResult) {
            tokens = [];
            findTokens(parseResult, tokens);
            const $parser = $(parserId);
            showBoxes(simplified, $parser);
        }
        $(parserTabId).html(`${parserName} ✅`);
    } catch (e) {
        if (e.name && (e.name === 'SyntaxError' || e.name === 'minajimpe')) {
            $(parserTabId).html(`${parserName} ❌`);
            $(parserId).html('<span class="muted">Boxes</span>');
            showSyntaxError(e, textToParse, $(parserId));
        } else {
            throw e;
        }
    }
}

/**
 * Finds all tokens in the resulting parse tree, and puts them in the tokens array.
 */
function findTokens(parseResult, tokens) {

    if (parseResult instanceof Array) {
        if (parseResult.length === 2 && isString(parseResult[0]) && isString(parseResult[1])) {
            tokens.push(parseResult[1]);
        } else {
            parseResult.forEach(child => findTokens(parseResult[child], tokens));
        }
    }
}

/**
 * Shows the boxes in the interface.
 */
function showBoxes(simplified, $element) {

    let output = '';

    output += constructBoxesOutput(simplified[0], 0);

    /* output += "<p>Legend: ";
    var types = ["sentence", "prenex", "selbri", "sumti"];
    for (var type in types) {
        output += "<div class=\"" + boxClassForType({ type: types[type] }) + "\">" + types[type] + "</div>";
    }
    output += "</p>"; */

    $element.html(output);
}

function constructBoxesOutput(parseResult, depth) {

    // precaution against infinite recursion; this should not actually happen of course
    if (depth > 3000) {
        return '<b>too much recursion :-(</b>';
    }

    // if we get null, just print that
    if (parseResult === null) {
        return '<i>(none?)</i>';
    }

    // if we get undefined, just print that
    if (!parseResult) {
        return '<i>(undefined?)</i>';
    }

    let output = '';

    if (parseResult.word) {

        output += '<div class="box box-terminal">';

        // we have a terminal
        output += `&nbsp;<b>${getVlasiskuLink(parseResult.word)}</b>&nbsp;`;
        output += `&nbsp;${parseResult.type}&nbsp;`;
        if (grosses[parseResult.word]) {
            output += `<span class="translation">&nbsp;${grosses[parseResult.word]}&nbsp;</span>`;
        } else {
            output += '不明';
        }

        output += '</div>';

    } else {

        // we have a non-terminal

        output += `<div class="${boxClassForType(parseResult)}">`;

        if (visiable(parseResult)) {
            output += '<div class="box box-type">';
            if (parseResult.sumtiPlace) {
                output += `第${parseResult.sumtiPlace}スムティ（sumti x${parseResult.sumtiPlace}）`;
            } else if (parseResult.type) {
                output += parseResult.type;
            } else {
                output += '<div class="box box-undefined"></div>';
            }
            output += '</div>';
        }        

        parseResult.children.forEach(child => {
            output += constructBoxesOutput(child, depth + 1);
        })

        output += '</div>';
    }

    return output;
}

function boxClassForType(parseResult) {

    if (parseResult.type === '文章（text）') {
        return 'box box-text';
    }

    if (parseResult.type === '文（sentence）') {
        return 'box box-sentence';
    }

    if (parseResult.type === '第xスムティ（sumti x）') {
        if (parseResult.sumtiPlace > 5) {
            return 'box box-sumti6';
        } if (parseResult.sumtiPlace === 'fai') {
            return 'box box-sumti-fai';
        }
        return `box box-sumti${parseResult.sumtiPlace}`;

    }

    if (parseResult.type === '法制スムティ（sumti modal）') {
        return 'box box-modal';
    }

    if (parseResult.type === 'スムティ（sumti）') {
        return 'box box-sumti';
    }

    if (parseResult.type === 'セルブリ（selbri）') {
        return 'box box-selbri';
    }

    if (parseResult.type === '冠頭（prenex）') {
        return 'box box-prenex';
    }

    if (!visiable(parseResult)) {
        return 'box box-not-shown';
    }

    return 'box box-thin';
}

function visiable(parseResult) {
    return !(/（非表示）/.test(parseResult.type) || (/コレクション|下位/.test(parseResult.type) && parseResult.children.length <= 1));
}

/**
 * Shows a syntax error in the interface.
 */
function showSyntaxError(e, textToParse, $element) {

    const output = `${'<div class="alert">' +
        '<p><b>Syntax error</b> on line <b>'}${e.line
        }</b>, at column <b>${e.column
        }</b>: ${e.message
        }</p>` +
        `<p class="error-sentence">${generateErrorPosition(e, textToParse)
        }</p>${generateFixes(e)
        }</div>`;

    $element.html(output);
}

/**
 * Generates the text sample that shows the error position.
 */
function generateErrorPosition(e, textToParse) {

    // "mi vau <span class=\"error-marker\">&#9652;</span> do cusku ..." +

    let before = textToParse.substring(e.offset - 20, e.offset);

    let after = textToParse.substring(e.offset + 0, e.offset + 20);

    if (e.offset > 20) {
        before = `...${before}`;
    }
    if (e.offset < textToParse.length - 20) {
        after += '...';
    }

    return `${before}<span class="error-marker">&#9652;</span>${after}`;
}

function generateFixes(e) {
    if (!e.fix) {
        // return "<p><i>No quick fixes available.</i></p>";
        return '';
    }

    let fixes = '<p>Quick fixes:<ul>';

    e.fix.forEach(fix => {
        fixes += '<li>';

        if (fix.fixFunction) {
            fixes += '<a>';
            fixes += fix.name;
            fixes += '</a>';
        } else {
            fixes += fix.name;
        }

        fixes += '</li>';
    });

    fixes += '</ul></p>';

    return fixes;
}

/**
 * Shows the translation in the interface.
 */
function showTranslation(parseResult, text, $element) {

    let output = '<p class="muted">This translation feature tries to give an approximate translation of the Lojban text into English. However, it does only work for a few sentences as of now. (Try [mi gleki] or something simple like that...)</p>';

    // var translation = translate(parse);
    const translation = 'Sorry! Translation is switched off at the moment, to prevent crashes in the other parts :-(';
    output += `<center><big>${translation}</big></center>`;

    $element.html(output);
}

// Auxiliary

function isString(s) {
    return typeof (s) === 'string' || s instanceof String;
}

function getVlasiskuLink(word) {
    return `<a class="vlasisku-link" href="http://vlasisku.lojban.org/vlasisku/${word}">${outputWord(word, getSelectedMode())}</a>`;
}

function outputWord(word, mode) {
    if (mode === 1) { // Latin mode
        return addDotsToWord(word);
    } if (mode === 2) { // Cyrillic mode
        return wordToCyrillic(addDotsToWord(word));
    } if (mode === 3) { // Tengwar mode
        return wordToTengwar(addDotsToWord(word));
    } if (mode === 4) { // Hiragana mode
        return wordToHiragana(addDotsToWord(word));
    }
    return null;
}

function getSelectedMode() {
    if ($('#latin-button').hasClass('active')) {
        return 1;
    } if ($('#cyrillic-button').hasClass('active')) {
        return 2;
    } if ($('#tengwar-button').hasClass('active')) {
        return 3;
    } if ($('#hiragana-button').hasClass('active')) {
        return 4;
    }
    return null;
}

function endsWith(str, suffix) {
    return str.indexOf(suffix, str.length - suffix.length) !== -1;
}
