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
    if (parse.length == 2 && isString(parse[0]) && isString(parse[1])) {
        return [{
            type: parse[0],
            word: parse[1]
        }]
    }
    
    var f = simplifyFunctions[parse[0]];
    
    // if there is a simplification function, apply it
    if (f) {
        return [f(parse)];
    }
    
    // else, we recursively search the children for things we do have a simplification function for
    var result;
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
    
    var result = [];
    
    for (var i in parse) {
        result = result.concat(simplifyTree(parse[i]));
    }
    
    return result;
}

// The simplification functions

var simplifyFunctions = {};

simplifyFunctions["text"] = function(parse) {
    
    return {
        type: "文章（text）",
        children: simplifyArrayOfTrees(parse.slice(1))
    }
}

simplifyFunctions["free"] = function(parse) {
    
    return {
        type: "自由修飾句（free modifier）",
        children: simplifyArrayOfTrees(parse.slice(1))
    }
}

simplifyFunctions["statement"] = function(parse) {
    
    return {
        type: "言明（statement）",
        children: simplifyArrayOfTrees(parse.slice(1))
    }
}

simplifyFunctions["sentence"] = function(parse) {
    
    return {
        type: "文（sentence）",
        children: simplifyArrayOfTrees(parse.slice(1))
    }
}

simplifyFunctions["prenex"] = function(parse) {
    
    return {
        type: "prenex",
        children: simplifyArrayOfTrees(parse.slice(1))
    }
}

simplifyFunctions["bridi_tail"] = function(parse) {
    
    return {
        type: "ブリディ末端（bridi tail）",
        children: simplifyArrayOfTrees(parse.slice(1))
    }
}

function simplifyFunction(type) {
    return function(parse) {
        return {
            type: type,
            children: simplifyArrayOfTrees(parse.slice(1))
        }
    }
}

simplifyFunctions["bridi_tail_1"] = simplifyFunction("ブリディ末端第一下位（bridi-tail-1）");
simplifyFunctions["bridi_tail_2"] = simplifyFunction("ブリディ末端第二下位（bridi-tail-2）");
simplifyFunctions["bridi_tail_3"] = simplifyFunction("ブリディ末端第三下位（bridi-tail-3）");

simplifyFunctions["selbri"] = function(parse) {
    
    return {
        type: "セルブリ（selbri）",
        children: simplifyArrayOfTrees(parse.slice(1))
    }
}

simplifyFunctions["selbri_1"] = simplifyFunction("セルブリ第一下位（selbri-1）");
simplifyFunctions["selbri_2"] = simplifyFunction("セルブリ第二下位（selbri-2）");
simplifyFunctions["selbri_3"] = simplifyFunction("セルブリ第三下位（selbri-3）");
simplifyFunctions["selbri_4"] = simplifyFunction("セルブリ第四下位（selbri-4）");
simplifyFunctions["selbri_5"] = simplifyFunction("セルブリ第五下位（selbri-5）");
simplifyFunctions["selbri_6"] = simplifyFunction("セルブリ第六下位（selbri-6）");

simplifyFunctions["tanru_unit"] = function(parse) {
    return {
        type: "タンル単位（tanru unit）",
        children: simplifyArrayOfTrees(parse.slice(1))
    }
}

simplifyFunctions["sumti"] = function(parse) {

    return {
        type: "スムティ（sumti）",
        children: simplifyArrayOfTrees(parse.slice(1))
    }
}

simplifyFunctions["sumti_1"] = simplifyFunction("スムティ第一下位（sumti-1）");
simplifyFunctions["sumti_2"] = simplifyFunction("スムティ第二下位（sumti-2）");
simplifyFunctions["sumti_3"] = simplifyFunction("スムティ第三下位（sumti-3）");
simplifyFunctions["sumti_4"] = simplifyFunction("スムティ第四下位（sumti-4）");
simplifyFunctions["sumti_5"] = simplifyFunction("スムティ第五下位（sumti-5）");

simplifyFunctions["sumti_6"] = function(parse) {
    
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
    
    if (parse[1][0] === "ZO_clause") {
        return {
            type: "LOhU句（LOhU clause）<br>= 一語引用（one-word quote）",
            children: simplifyArrayOfTrees(parse.slice(1))
        }
    }
    
    if (parse[1][0] === "ZOI_clause") {
        return {
            type: "ZOI句（ZOI clause）<br>= 非ロジバン引用（non-Lojban quote）",
            children: simplifyArrayOfTrees(parse.slice(1))
        }
    }
    
    if (parse[1][0] === "LOhU_clause") {
        return {
            type: "LOhU句（LOhU clause）<br>= エラー引用（ungrammatical quote）",
            children: simplifyArrayOfTrees(parse.slice(1))
        }
    }
    
    if (parse[1][0] === "lerfu_string") {
        return {
            type: "字詞（letterals）",
            children: simplifyArrayOfTrees(parse.slice(1))
        }
    }
    
    if (parse[1][0] === "LU_clause") {
        return {
            type: "LU句（LU clause）<br>= 引用（grammatical quote）",
            children: simplifyArrayOfTrees(parse.slice(1))
        }
    }
    
    if (parse[1][0] instanceof Array) {
        if (parse[1][0][0] === "LAhE_clause") {
            return {
                type: "LAhE句（LAhE clause）<br>= 参照スムティ（reference sumti）",
                children: simplifyArrayOfTrees(parse.slice(1))
            }
        }
        
        if (parse[1][0][0] === "NAhE_clause") {
            return {
                type: "NAhE句（NAhE clause）<br>= 否定スムティ（negated sumti）",
                children: simplifyArrayOfTrees(parse.slice(1))
            }
        }
    }
    
    if (parse[1][0] === "KOhA_clause") {
        return {
            type: "KOhA句（KOhA clause）<br>= 代スムティ（sumka'i）",
            children: simplifyArrayOfTrees(parse.slice(1))
        }
    }
    
    if (parse[1][0] === "LA_clause") {
        return {
            type: "LA句（LA clause）", // TODO how to disambiguate between those two?
            children: simplifyArrayOfTrees(parse.slice(1))
        }
    }
    
    if (parse[1][0] === "LE_clause") {
        return {
            type: "LE句（LE clause）<br>= 描写スムティ（description）",
            children: simplifyArrayOfTrees(parse.slice(1))
        }
    }
    
    if (parse[1][0] === "li_clause") {
        return {
            type: "li句（li clause）<br>= 数（number）",
            children: simplifyArrayOfTrees(parse.slice(1))
        }
    }
    
    return {
        type: "unknown type sumti (bug?)",
        children: simplifyArrayOfTrees(parse.slice(1))
    }
}

simplifyFunctions["relative_clause"] = function(parse) {
    
    return {
        type: "関係節（relative clause）",
        children: simplifyArrayOfTrees(parse.slice(1))
    }
}



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
    if (parse.length == 2 && isString(parse[0]) && isString(parse[1])) {
        return parse
    }
    
    // if it is a sentence, start searching through it
    if (parse.type === "文（sentence）") {
        numberSumtiInSentence(parse);
    }
    
    // and recursively search the children for things we can number as well
    for (var i in parse) {
        if (!isString(parse[i])) {
            numberSumti(parse[i]);
        }
    }
    
    return parse;
}

// TODO This is not working correctly for [GIhA] bridi-tail connections.
// We should reset the sumtiCounter to the value it had before entering the bridi-tail,
// when we encounter a [GIhA].
function numberSumtiInSentence(parse) {
    
    // first, for convenience, merge the bridi head and tail together in one array
    var sentenceElements = [];
    
    for (var i = 0; i < parse.children.length; i++) {
        var child = parse.children[i];
        
        if (child.type === "ブリディ末端（bridi tail）") {
            for (var j = 0; j < child.children.length; j++) {
                var subchild = child.children[j];
                sentenceElements.push(subchild);
            }
        } else {
            sentenceElements.push(child);
        }
    }
    
    // now walk through this array
    var sumtiCounter = 1;
    var nextIsModal = false;
    
    for (var i = 0; i < sentenceElements.length; i++) {
        var child = sentenceElements[i];
        
        if (child.type === "FA") {
            sumtiCounter = placeTagToPlace(child);
        }
        
        if (child.type === "BAI" || child.type === "FIhO" || child.type === "PU") {
            nextIsModal = true;
        }
        
        if (child.type === "スムティ（sumti）") {
            if (nextIsModal) {
                child.type = "法制スムティ（sumti modal）";
                nextIsModal = false;
            } else {
                child.type = "第xスムティ（sumti x）";
                child.sumtiPlace = sumtiCounter;
                sumtiCounter++;
            }
        }
        
        if (child.type === "セルブリ（selbri）" && sumtiCounter === 1) {
            sumtiCounter++;
        }
    }
}

function placeTagToPlace(tag) {
    if (tag.word === "fa") {
        return 1;
    } else if (tag.word === "fe") {
        return 2;
    } else if (tag.word === "fi") {
        return 3;
    } else if (tag.word === "fo") {
        return 4;
    } else if (tag.word === "fu") {
        return 5;
    } else if (tag.word === "fai") {
        return "fai";
        /* Ilmen: Yeah that's an ugly lazy handling of "fai", but a cleaner 
         * handling will require more work. */
    }
}
