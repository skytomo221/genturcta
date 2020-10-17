$(document).ready(function () {
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
    $('#time-label').html(`（処理時間: ${  end - start  } ms)`);
}

function subparse(parserName, parserId, parserFunction, textToParse) {
    parserTabId = `${parserId  }-tab`;
    try {
        let parse = parserFunction.parse(textToParse)
        parse = remove_morphology(parse);
        parse = remove_spaces(parse);
        const simplified = simplifyTree(parse);
        numberSumti(simplified);
        if (parse) {
            tokens = [];
            findTokens(parse, tokens);
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

function constructBoxesOutput(parse, depth) {

    // precaution against infinite recursion; this should not actually happen of course
    if (depth > 50) {
        return '<b>too much recursion :-(</b>';
    }

    // if we get null, just print that
    if (parse === null) {
        return '<i>(none?)</i>';
    }

    // if we get undefined, just print that
    if (!parse) {
        return '<i>(undefined?)</i>';
    }

    let output = '';

    if (parse.word) {

        output += '<div class="box box-terminal">';

        // we have a terminal
        output += `&nbsp;<b>${  getVlasiskuLink(parse.word)  }</b>&nbsp;`;
        output += `&nbsp;${  parse.type  }&nbsp;`;
        if (shortDescriptions[parse.word]) {
            output += `<span class="translation">&nbsp;${  shortDescriptions[parse.word]  }&nbsp;</span>`;
        } else {
            output += '不明';
        }

        output += '</div>';

    } else {

        // we have a non-terminal

        output += `<div class="${  boxClassForType(parse)  }">`;

        if (!(/下位/.test(parse.type) && parse.children.length <= 1)) {
            output += '<div class="box box-type">';
            if (parse.sumtiPlace) {
                output += `第${  parse.sumtiPlace  }スムティ（sumti x${  parse.sumtiPlace  }）`;
            } else if (parse.type) {
                output += parse.type;
            } else {
                output += '<div class="box box-undefined"></div>';
            }
            output += '</div>';
        }

        for (const child in parse.children) {
            output += constructBoxesOutput(parse.children[child], depth + 1);
        }

        output += '</div>';
    }

    return output;
}

function boxClassForType(parse) {

    if (parse.type === '文章（text）') {
        return 'box box-text';
    }

    if (parse.type === '文（sentence）') {
        return 'box box-sentence';
    }

    if (parse.type === '第xスムティ（sumti x）') {
        if (parse.sumtiPlace > 5) {
            return 'box box-sumti6';
        } if (parse.sumtiPlace == 'fai') {
            return 'box box-sumti-fai';
        } 
            return `box box-sumti${  parse.sumtiPlace}`;
        
    }

    if (parse.type === '法制スムティ（sumti modal）') {
        return 'box box-modal';
    }

    if (parse.type === 'スムティ（sumti）') {
        return 'box box-sumti';
    }

    if (parse.type === 'セルブリ（selbri）') {
        return 'box box-selbri';
    }

    if (parse.type === 'prenex') {
        return 'box box-prenex';
    }

    if (/下位/.test(parse.type) && parse.children.length <= 1) {
        return 'box box-not-shown';
    }

    return 'box box-thin';
}

/**
 * Shows a syntax error in the interface.
 */
function showSyntaxError(e, textToParse, $element) {

    const output = `${'<div class="alert">' +
        '<p><b>Syntax error</b> on line <b>'}${ 
        e.line 
        }</b>, at column <b>${ 
        e.column 
        }</b>: ${ 
        e.message 
        }</p>` +
        `<p class="error-sentence">${ 
        generateErrorPosition(e, textToParse) 
        }</p>${ 
        generateFixes(e) 
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
        before = `...${  before}`;
    }
    if (e.offset < textToParse.length - 20) {
        after += '...';
    }

    return `${before  }<span class="error-marker">&#9652;</span>${  after}`;
}

function generateFixes(e) {
    if (!e.fix) {
        // return "<p><i>No quick fixes available.</i></p>";
        return '';
    }

    let fixes = '<p>Quick fixes:<ul>';

    for (const f in e.fix) {
        const fix = (e.fix)[f];
        fixes += '<li>';

        if (fix.fixFunction) {
            fixes += '<a>';
            fixes += fix.name;
            fixes += '</a>';
        } else {
            fixes += fix.name;
        }

        fixes += '</li>';
    }

    fixes += '</ul></p>';

    return fixes;
}

/**
 * Shows the translation in the interface.
 */
function showTranslation(parse, text, $element) {

    let output = '<p class="muted">This translation feature tries to give an approximate translation of the Lojban text into English. However, it does only work for a few sentences as of now. (Try [mi gleki] or something simple like that...)</p>';

    // var translation = translate(parse);
    const translation = 'Sorry! Translation is switched off at the moment, to prevent crashes in the other parts :-(';
    output += `<center><big>${  translation  }</big></center>`;

    $element.html(output);
}

// Auxiliary

function isString(s) {
    return typeof (s) === 'string' || s instanceof String;
}

function getVlasiskuLink(word) {
    return `<a class="vlasisku-link" href="http://vlasisku.lojban.org/vlasisku/${  word  }">${  outputWord(word, getSelectedMode())  }</a>`;
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
}

function endsWith(str, suffix) {
    return str.indexOf(suffix, str.length - suffix.length) !== -1;
}
