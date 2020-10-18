/**
 * This file contains functions that simplify the parse tree returned by camxes.js.
 * 
 * The original parse tree has the following structure:
 * [
 *   "...",   // the type
 *   ...      // children as array elements
 * ]
 * Here, the first element of every array indicates the type of the object parsed, and the
 * next objects are the children of the element.
 * 
 * The simplified parse tree has quite another structure:
 * [
 *   {
 *     type: "...",
 *     children: [ ... ],   // only one of children and word
 *     word: "...",
 *     ...: ...             // other optional elements
 *   }
 * ]
 * Here, type gives the type. For non-terminals, children is an array containing the children.
 * For terminals, word contains the actual word parsed. (Of course, one cannot have both
 * children and word.) Furthermore, there can be more elements added to this structure to add
 * additional information as needed.
 */

/**
 * Simplifies the given parse tree. Returns an array.
 */
function simplifyTree(parse) {

    // if it is a terminal, just return that
    if (parse.length === 2 && isString(parse[0]) && isString(parse[1])) {
        return [{
            type: parse[0],
            word: parse[1]
        }]
    }

    const f = simplifyFunctions[parse[0]];

    // if there is a simplification function, apply it
    if (f) {
        return [f(parse)];
    }

    // else, we recursively search the children for things we do have a simplification function for
    let result;
    if (isString(parse[0])) {
        result = simplifyArrayOfTrees(parse.slice(1));
    } else {
        result = simplifyArrayOfTrees(parse);
    }

    return result;
}

/**
 * Simplifies an array of trees.
 */
function simplifyArrayOfTrees(parse) {

    let result = [];

    parse.forEach(element => {
        result = result.concat(simplifyTree(element));
    });

    return result;
}

function simplifyFunction(type) {
    return (parse) => {
        return {
            type: type + ((parse.length === 2 && isString(parse[1][0]) && /[A-Z]+/.test(parse[1][0])) ? '（非表示）' : ''),
            children: simplifyArrayOfTrees(parse.slice(1))
        }
    }
}

function simplifyFunctionUnconditionalShow(type) {
    return (parse) => {
        return {
            type,
            children: simplifyArrayOfTrees(parse.slice(1))
        }
    }
}

/** The simplification functions */
const simplifyFunctions = {
    'text': simplifyFunction('文章（text）'),
    'intro_null': simplifyFunction('イントロ・ヌル（intro null）'),
    'text_1': simplifyFunction('文章第一下位（text 1）'),
    'paragraphs': simplifyFunction('段落コレクション（paragraphs）'),
    'paragraphs_1': simplifyFunction('段落コレクション第一下位（paragraphs 1）'),
    'paragraphs_2': simplifyFunction('段落コレクション第二下位（paragraphs 2）'),
    'paragraph': simplifyFunction('段落（paragraph）'),
    'statement_terms': simplifyFunction('段落-項コレクション（paragraph terms）'),
    'statement': simplifyFunction('言明（statement）'),
    'statement_0': simplifyFunction('言明第〇下位（statement 0）'),
    'statement_1': simplifyFunction('言明第一下位（statement 1）'),
    'statement_2': simplifyFunction('言明第二下位（statement 2）'),
    'statement_3': simplifyFunction('言明第三下位（statement 3）'),
    'sentence': simplifyFunction('文（sentence）'),
    'bridi_tail_t1': simplifyFunction('ブリディ末端T1下位（bridi tail t1）'),
    'bridi_tail_t2': simplifyFunction('ブリディ末端T2下位（bridi tail t2）'),
    'subsentence': simplifyFunction('副文（subsentence）'),
    'prenex': simplifyFunction('冠頭（prenex）'),
    'bridi_tail': simplifyFunction('ブリディ末端（bridi tail）'),
    'bridi_tail_1': (parse) => {
        return {
            type: `セルブリ末端第一下位（bridi tail 1）${((parse.length === 2 && parse[0][0] === 'bridi_tail_2' && parse[1][0] === 'bridi_tail_3') || (parse.length === 3 && parse[1][0] === 'bridi_tail_2' && parse[2][0] === 'bridi_tail_3')) ? '（非表示）' : ''}`,
            children: simplifyArrayOfTrees(parse.slice(1))
        }
    },
    'bridi_tail_2': simplifyFunction('ブリディ末端第二下位（bridi tail 2）'),
    'bridi_tail_3': (parse) => {
        return {
            type: `ブリディ末端第三下位（bridi tail 3）${(parse.length === 3 && parse[2].length === 2 && parse[2][1].length === 1 && parse[2][1][0] === 'VAU') ? '（非表示）' : ''}`,
            children: simplifyArrayOfTrees(parse.slice(1))
        }
    },

    'tail_terms': simplifyFunction('末端項コレクション（tail terms）'),
    'terms': simplifyFunction('項コレクション（terms）'),
    'terms_1': simplifyFunction('項コレクション第一下位（terms 1）'),
    'terms_2': simplifyFunction('項コレクション第二下位（terms 2）'),
    'tag_term': simplifyFunction('タグ項（tag term）'),
    'termset': simplifyFunction('項集合（term set）'),
    'terms_gik_terms': simplifyFunction('項コレクション-gik-項コレクション（terms_gik_terms）'),
    'nonabs_terms': simplifyFunction('非吸収性項コレクション（nonabs terms）'),
    'nonabs_terms_1': simplifyFunction('非吸収性項コレクション第一下位（nonabs terms 1）'),
    'nonabs_terms_2': simplifyFunction('非吸収性項コレクション第二下位（nonabs terms 2）'),
    'term': simplifyFunction('項（term）'),
    'term_1': simplifyFunction('項第一下位（term 1）'),
    'term_2': simplifyFunction('項第二下位（term 2）'),
    'sumti': simplifyFunction('スムティ（sumti）'),
    'sumti_1': simplifyFunction('スムティ第一下位（sumti 1）'),
    'sumti_2': simplifyFunction('スムティ第二下位（sumti 2）'),
    'sumti_3': simplifyFunction('スムティ第三下位（sumti 3）'),
    'sumti_4': simplifyFunction('スムティ第四下位（sumti 4）'),
    'sumti_5': simplifyFunction('スムティ第五下位（sumti 5）'),
    'sumti_6': (parse) => {

        // sumti-6 <- ZO-clause free* /
        //            ZOI-clause free* /
        //            LOhU-clause free* /
        //            lerfu-string !MOI-clause BOI-clause? free* /
        //            LU-clause text LIhU-clause? free* /
        //            (LAhE-clause free* / NAhE-clause BO-clause free*) relative-clauses? sumti LUhU-clause? free* /
        //            KOhA-clause free* /
        //            LA-clause free* relative-clauses? CMENE-clause+ free* /
        //            (LA-clause / LE-clause) free* sumti-tail KU-clause? free* /
        //            li-clause

        if (parse[1][0] === 'ZO_clause') {
            return {
                type: 'LOhU句（LOhU clause）<br>= 一語引用（one-word quote）',
                children: simplifyArrayOfTrees(parse.slice(1))
            }
        }

        if (parse[1][0] === 'ZOI_clause') {
            return {
                type: 'ZOI句（ZOI clause）<br>= 非ロジバン引用（non-Lojban quote）',
                children: simplifyArrayOfTrees(parse.slice(1))
            }
        }

        if (parse[1][0] === 'LOhU_clause') {
            return {
                type: 'LOhU句（LOhU clause）<br>= エラー引用（ungrammatical quote）',
                children: simplifyArrayOfTrees(parse.slice(1))
            }
        }

        if (parse[1][0] === 'lerfu_string') {
            return {
                type: '字詞（letterals）',
                children: simplifyArrayOfTrees(parse.slice(1))
            }
        }

        if (parse[1][0] === 'LU_clause') {
            return {
                type: 'LU句（LU clause）<br>= 引用（grammatical quote）',
                children: simplifyArrayOfTrees(parse.slice(1))
            }
        }

        if (parse[1][0] instanceof Array) {
            if (parse[1][0][0] === 'LAhE_clause') {
                return {
                    type: 'LAhE句（LAhE clause）<br>= 参照スムティ（reference sumti）',
                    children: simplifyArrayOfTrees(parse.slice(1))
                }
            }

            if (parse[1][0][0] === 'NAhE_clause') {
                return {
                    type: 'NAhE句（NAhE clause）<br>= 否定スムティ（negated sumti）',
                    children: simplifyArrayOfTrees(parse.slice(1))
                }
            }
        }

        if (parse[1][0] === 'KOhA_clause') {
            return {
                type: 'KOhA句（KOhA clause）<br>= 代スムティ（sumka\'i）',
                children: simplifyArrayOfTrees(parse.slice(1))
            }
        }

        if (parse[1][0] === 'LA_clause') {
            return {
                type: 'LA句（LA clause）', // TODO how to disambiguate between those two?
                children: simplifyArrayOfTrees(parse.slice(1))
            }
        }

        if (parse[1][0] === 'LE_clause') {
            return {
                type: 'LE句（LE clause）<br>= 描写スムティ（description）',
                children: simplifyArrayOfTrees(parse.slice(1))
            }
        }

        if (parse[1][0] === 'li_clause') {
            return {
                type: 'li句（li clause）<br>= 数（number）',
                children: simplifyArrayOfTrees(parse.slice(1))
            }
        }

        return {
            type: 'unknown type sumti (bug?)',
            children: simplifyArrayOfTrees(parse.slice(1))
        }
    },
    'sumti_tail_1': simplifyFunction('スムティ末端第一下位（sumti tail 1）'),
    'sumti_tail_2': simplifyFunction('スムティ末端第二下位（sumti tail 2）'),
    'relative_clauses': simplifyFunction('関係節コレクション（relative clauses）'),
    'relative_clause': simplifyFunction('関係節（relative clause）'),
    'selbri': simplifyFunction('セルブリ（selbri）'),
    'selbri_1': simplifyFunction('セルブリ第一下位（selbri 1）'),
    'selbri_2': simplifyFunction('セルブリ第二下位（selbri 2）'),
    'selbri_3': simplifyFunction('セルブリ第三下位（selbri 3）'),
    'selbri_4': simplifyFunction('セルブリ第四下位（selbri 4）'),
    'selbri_5': simplifyFunction('セルブリ第五下位（selbri 5）'),
    'selbri_6': simplifyFunction('セルブリ第六下位（selbri 6）'),
    'tanru_unit': simplifyFunction('タンル単位（tanru unit）'),
    'tanru_unit_1': simplifyFunction('タンル単位第一下位（tanru unit 1）'),
    'linkargs': simplifyFunction('付加引数（linkargs）'),
    // 'links': simplifyFunction('リンクコレクション（links）'),
    'mex': simplifyFunction('数式（mex）'),
    'mex_1': simplifyFunction('数式第一下位（mex 1）'),
    'mex_2': simplifyFunction('数式第二下位（mex 2）'),
    'mex_rp': simplifyFunction('数式RP下位（mex rp）'),
    'mex_forethought': simplifyFunction('数式おもんぱかり下位（mex forethought）'),
    'operator': simplifyFunctionUnconditionalShow('演算子（operator）'),
    'operand': simplifyFunctionUnconditionalShow('被演算子（operand）'),
    'tense_modal': simplifyFunction('時空間制（tense modal）'),
    'simple_tense_modal': simplifyFunction('単純時空間制（simple tense modal）'),
    'time': simplifyFunction('時制（time）'),
    'space': simplifyFunction('空間制（space）'),
    'free': simplifyFunction('自由修飾句（free modifier）'),
    'xi_clause': simplifyFunction('xi句（xi clause）'),
    'vocative': simplifyFunction('呼応系心態詞（vocative）'),
    // 'indicators': simplifyFunction('心態指標コレクション（indicators）'),
    // 'indicator': simplifyFunction('心態指標（indicator）'),
    'sa_clause': simplifyFunction('sa句（sa clause）'),
    'si_clause': simplifyFunction('si句（si clause）'),
    'su_clause': simplifyFunction('su句（su clause）'),
};

// Additional functions to improve the resulting tree

/**
 * Numbers the placed sumti in the parse tree. That is, replaces the type "sumti" by either
 * "sumti x" if it is a normally placed sumti, or "modal sumti" if it is a modal sumti.
 * If it is a sumti in a vocative or something like that, which is not placed at all, it will
 * just leave "sumti".
 * 
 * For placed sumti, also an attribute sumtiPlace is added with the place number.
 */
function numberSumti(parse) {

    // if it is a terminal, do nothing
    if (parse.length === 2 && isString(parse[0]) && isString(parse[1])) {
        return parse
    }

    // if it is a sentence, start searching through it
    if (parse.type === '文（sentence）') {
        numberSumtiInSentence(parse);
    }

    // and recursively search the children for things we can number as well
    for (const i in parse) {
        if (!isString(parse[i])) {
            numberSumti(parse[i]);
        }
    }

    return parse;
}

function numberSumtiInSentence(parse) {
    let baseCounter = 1;

    for (let i = 0; i < parse.children.length; i += 1) {
        const child = parse.children[i];

        if (child.type === 'ブリディ末端（bridi tail）') {
            for (let j = 0; j < child.children.length; j += 1) {
                const subchild = child.children[j];
                bridiTailRecursion(subchild, baseCounter);
            }
        } else {
            baseCounter = toPlace(child, baseCounter);
        }
    }
}

function bridiTailRecursion(child, baseCounter) {
    sumtiCounter = baseCounter;
    for (let j = 0; j < child.children.length; j += 1) {
        const subchild = child.children[j];
        if (/FA|BAI|FIhO|PU|スムティ（sumti）|セルブリ（selbri）/g.test(subchild.type)) {
            sumtiCounter = toPlace(subchild, sumtiCounter);
        } else if (/ブリディ末端/.test(subchild.type)) {
            bridiTailRecursion(subchild, baseCounter);
        }
    }
}

function toPlace(child, sumtiCounter) {
    // now walk through this array
    let nextIsModal = false;

    if (child.type === 'FA') {
        sumtiCounter = placeTagToPlace(child);
    }

    if (child.type === 'BAI' || child.type === 'FIhO' || child.type === 'PU') {
        nextIsModal = true;
    }

    if (child.type === 'スムティ（sumti）') {
        if (nextIsModal) {
            child.type = '法制スムティ（sumti modal）';
            nextIsModal = false;
        } else {
            child.type = '第xスムティ（sumti x）';
            child.sumtiPlace = sumtiCounter;
            sumtiCounter += 1;
        }
    }

    if (child.type === 'セルブリ（selbri）' && sumtiCounter === 1) {
        sumtiCounter += 1;
    }

    return sumtiCounter;
}

function placeTagToPlace(tag) {
    if (tag.word === 'fa') {
        return 1;
    } if (tag.word === 'fe') {
        return 2;
    } if (tag.word === 'fi') {
        return 3;
    } if (tag.word === 'fo') {
        return 4;
    } if (tag.word === 'fu') {
        return 5;
    } if (tag.word === 'fai') {
        return 'fai';
        /* Ilmen: Yeah that's an ugly lazy handling of "fai", but a cleaner 
         * handling will require more work. */
    }
    return null;
}
