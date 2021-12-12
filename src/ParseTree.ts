export type OriginalParseTree = (string | OriginalParseTree)[];

export interface SimplifiedParseTreeWithWord {
  type: string;
  word: string;
  sumtiPlace?: number | 'fai';
}

export interface SimplifiedParseTreeWithChildren {
  type: string;
  children: SimplifiedParseTree[];
  sumtiPlace?: number | 'fai';
}

export type SimplifiedParseTree =
  | SimplifiedParseTreeWithWord
  | SimplifiedParseTreeWithChildren;
