const IS_NODEJS_ENV = () => { try { return this === global; } catch (e) { return false; } };

if (IS_NODEJS_ENV()) {
    module.exports = removeMorphology;

    /* Just for testing the program from the terminal. */
    const test_input = ['text', ['text_part_2', [['free', ['vocative', [['COI_clause', ['COI_pre', ['COI', [['c', 'c'], ['o', 'o'], ['i', 'i']]], ['spaces', ['initial_spaces']]]]]], ['sumti', ['sumti_1', ['sumti_2', ['sumti_3', ['sumti_4', ['sumti_5', ['quantifier', ['number', ['PA_clause', ['PA_pre', ['PA', [['r', 'r'], ['o', 'o']]], ['spaces', ['initial_spaces']]]]], ['BOI']], ['sumti_6', ['KOhA_clause', ['KOhA_pre', ['KOhA', [['d', 'd'], ['o', 'o']]]]]]]]]]]], ['DOhU']]]]];

    console.log(JSON.stringify(removeMorphology(test_input)));
    process.exit();
}

// =========================================================================== //

function removeSpaces(tree) {
    if (tree.length > 0 && among(tree[0], ['spaces', 'initial_spaces'])) return null;
    let i = 0;
    while (i < tree.length) {
        if (isArray(tree[i])) {
            tree[i] = removeSpaces(tree[i]);
            if (tree[i] === null) { tree.splice(i, 1); i -= 1; }
        }
        i += 1;
    }
    return tree;
}

/*
 * EXAMPLE OF PARSE TREE PRUNING PROCEDURE
 * 
 * removeMorphology(parse_tree)
 * 
 * This function takes a parse tree, and joins the expressions of the following
 * nodes:
 * "cmevla", "gismu_2", "lujvo", "fuhivla", "spaces"
 * as well as any selmaho node (e.g. "KOhA").
 * 
 */

function removeMorphology(pt) {
    if (pt.length < 1) return [];
    let i;
    /* Sometimes nodes have no label and have instead an array as their first
       element. */
    if (isArray(pt[0])) i = 0;
    else { // The first element is a label (node name).
        // Let's check if this node is a candidate for our pruning.
        if (isTargetNode(pt)) {
            /* We join recursively all the terminal elements (letters) in this
             * node and its child nodes, and put the resulting string in the #1
             * slot of the array; afterwards we delete all the remaining elements
             * (their terminal values have been concatenated into pt[1]). */
            pt[1] = joinExpr(pt);
            // If pt[1] contains an empty string, let's delete it as well:
            pt.splice((pt[1] === '') ? 1 : 2);
            return pt;
        }
        i = 1;
    }
    /* If we've reached here, then this node is not a target for pruning, so let's
       do recursion into its child nodes. */
    while (i < pt.length) {
        if (isArray(pt[i])) removeMorphology(pt[i]);
        i += 1;
    }
    return pt;
}

/* This function returns the string resulting from the recursive concatenation of
 * all the leaf elements of the parse tree argument (except node names). */
function joinExpr(n) {
    if (n.length < 1) return '';
    let s = '';
    let i = isArray(n[0]) ? 0 : 1;
    while (i < n.length) {
        s += isString(n[i]) ? n[i] : joinExpr(n[i]);
        i += 1;
    }
    return s;
}

/* Checks whether the argument node is a target for pruning. */
function isTargetNode(n) {
    return (among(n[0], ['cmevla', 'gismu', 'lujvo', 'fuhivla', 'initial_spaces'])
        || isSelmaho(n[0]));
}

function among(v, s) {
    let i = 0;
    while (i < s.length) { if (s[i] === v) return true; i += 1; }
    return false;
}

function isSelmaho(v) {
    if (!isString(v)) return false;
    return (v.search(/^[IUBCDFGJKLMNPRSTVXZ]?([AEIOUY]|(AI|EI|OI|AU))(h([AEIOUY]|(AI|EI|OI|AU)))*$/g) === 0);
}

function isString(v) {
    return Object.prototype.toString.call(v) === '[object String]';
}

function isArray(v) {
    return Object.prototype.toString.call(v) === '[object Array]';
}

