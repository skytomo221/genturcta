import { OriginalParseTree, SimplifiedParseTree } from './ParseTree';
import { numberSumti, simplifyTree } from './tree';

const among = (v: string | OriginalParseTree, s: string[]) => {
  let i = 0;
  while (i < s.length) {
    if (s[i] === v) return true;
    i += 1;
  }
  return false;
};

const isSelmaho = (v: string | OriginalParseTree) => {
  if (typeof v === 'string') {
    return (
      v.search(
        /^[IUBCDFGJKLMNPRSTVXZ]?([AEIOUY]|(AI|EI|OI|AU))(h([AEIOUY]|(AI|EI|OI|AU)))*$/g,
      ) === 0
    );
  }
  return false;
};

/* Checks whether the argument node is a target for pruning. */
const isTargetNode = (node: OriginalParseTree) => among(node[0], ['cmevla', 'gismu', 'lujvo', 'fuhivla', 'initial_spaces'])
  || isSelmaho(node[0]);

const removeSpaces = (tree: OriginalParseTree) => {
  if (tree.length > 0 && among(tree[0], ['spaces', 'initial_spaces'])) return null;
  let i = 0;
  while (i < tree.length) {
    const child = tree[i];
    if (Array.isArray(child)) {
      // eslint-disable-next-line no-param-reassign
      tree[i] = removeSpaces(child);
      if (tree[i] === null) {
        tree.splice(i, 1);
        i -= 1;
      }
    }
    i += 1;
  }
  return tree;
};

/* This function returns the string resulting from the recursive concatenation of
 * all the leaf elements of the parse tree argument (except node names). */
const joinExpr = (node: OriginalParseTree) => {
  if (node.length < 1) return '';
  let s = '';
  let i = Array.isArray(node[0]) ? 0 : 1;
  while (i < node.length) {
    const child = node[i];
    s += typeof child === 'string' ? child : joinExpr(child);
    i += 1;
  }
  return s;
};

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

const removeMorphology = (tree: OriginalParseTree) => {
  if (tree.length < 1) return [];
  let i;
  /* Sometimes nodes have no label and have instead an array as their first
     element. */
  if (Array.isArray(tree[0])) i = 0;
  else {
    // The first element is a label (node name).
    // Let's check if this node is a candidate for our pruning.
    if (isTargetNode(tree)) {
      /* We join recursively all the terminal elements (letters) in this
       * node and its child nodes, and put the resulting string in the #1
       * slot of the array; afterwards we delete all the remaining elements
       * (their terminal values have been concatenated into pt[1]). */
      // eslint-disable-next-line no-param-reassign
      tree[1] = joinExpr(tree);
      // If pt[1] contains an empty string, let's delete it as well:
      tree.splice(tree[1] === '' ? 1 : 2);
      return tree;
    }
    i = 1;
  }
  /* If we've reached here, then this node is not a target for pruning, so let's
     do recursion into its child nodes. */
  while (i < tree.length) {
    const child = tree[i];
    if (Array.isArray(child)) removeMorphology(child);
    i += 1;
  }
  return tree;
};

class LojbanParser {
  name: string;

  parser: any;

  result: SimplifiedParseTree;

  error: any;

  public constructor(name: string, parser: any) {
    this.name = name;
    this.parser = parser;
  }

  parse(input: string) {
    try {
      let result = this.parser.parse(input) as OriginalParseTree;
      result = removeMorphology(result);
      result = removeSpaces(result);
      this.error = null;
      this.result = numberSumti(simplifyTree(result)[0]);
    } catch (e) {
      this.error = e;
      this.result = null;
    }
  }
}

export default LojbanParser;
