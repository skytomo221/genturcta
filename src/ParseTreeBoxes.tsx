/* eslint-disable no-nested-ternary */
import * as React from 'react';
import Alert from '@mui/material/Alert';
import LojbanParser from './LojbanParser';
import {
  SimplifiedParseTree,
  SimplifiedParseTreeWithChildren,
} from './ParseTree';
import grosses from '../js/dictionary';
import {
  addDotsToWord,
  wordToCyrillic,
  wordToTengwar,
  wordToHiragana,
} from './transcriber';
import './css/layout.css';

interface constructBoxesOutputProps {
  parseResult: SimplifiedParseTree;
  depth: number;
}

function outputWord(word: string, mode: number) {
  if (mode === 1) {
    // Latin mode
    return addDotsToWord(word, '');
  }
  if (mode === 2) {
    // Cyrillic mode
    return wordToCyrillic(addDotsToWord(word, ''));
  }
  if (mode === 3) {
    // Tengwar mode
    return wordToTengwar(addDotsToWord(word, ''));
  }
  if (mode === 4) {
    // Hiragana mode
    return wordToHiragana(addDotsToWord(word, ''));
  }
  return null;
}

const getVlasiskuLink = (word: string) => (
  <a
    className="vlasisku-link"
    href={`http://vlasisku.lojban.org/vlasisku/${word}`}
  >
    {outputWord(word, 1)}
  </a>
);

const visiable = (result: SimplifiedParseTreeWithChildren) => !(
  /（非表示）/.test(result.type)
    || (/コレクション|下位/.test(result.type) && result.children.length <= 1)
);

function boxClassForType(parseResult: SimplifiedParseTreeWithChildren) {
  if (parseResult.type === '文章（text）') {
    return 'box box-text';
  }

  if (parseResult.type === '文（sentence）') {
    return 'box box-sentence';
  }

  if (parseResult.type === '第xスムティ（sumti x）') {
    if (parseResult.sumtiPlace > 5) {
      return 'box box-sumti6';
    }
    if (parseResult.sumtiPlace === 'fai') {
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

const ConstructBoxesOutput = function ({
  parseResult,
  depth,
}: constructBoxesOutputProps) {
  // precaution against infinite recursion; this should not actually happen of course
  if (depth > 3000) {
    return <b>too much recursion</b>;
  }

  // if we get null, just print that
  if (parseResult === null) {
    return <i>(none?)</i>;
  }

  // if we get undefined, just print that
  if (!parseResult) {
    return <i>(undefined?)</i>;
  }

  const result = parseResult;
  if ('word' in result) {
    return (
      <div className="terminal">
        <b>{getVlasiskuLink(result.word)}</b>
        &nbsp;
        {result.type}
        {grosses[result.word as keyof typeof grosses] ? (
          <span className="translation">
            &nbsp;
            {grosses[result.word as keyof typeof grosses]}
          </span>
        ) : (
          '  不明'
        )}
      </div>
    );
  }

  return (
    <div className={boxClassForType(result)}>
      {visiable(result) && (
        <div className="box box-type">
          {result.sumtiPlace ? (
            `第${result.sumtiPlace}スムティ（sumti x${result.sumtiPlace}）`
          ) : result.type ? (
            <div dangerouslySetInnerHTML={{ __html: result.type }} />
          ) : (
            <div className="box box-undefined" />
          )}
        </div>
      )}
      {result.children.map((child) => (
        <ConstructBoxesOutput parseResult={child} depth={depth + 1} />
      ))}
    </div>
  );
};

interface Props {
  parser: LojbanParser;
}

const ResultTreeBoxes = function ({ parser }: Props) {
  const { result, error } = parser;
  if (error) {
    return <Alert severity="error">{error.message}</Alert>;
  }
  if (!result) {
    return <div>構文解析をクリックしてください。</div>;
  }
  return <ConstructBoxesOutput parseResult={result} depth={0} />;
};

export default ResultTreeBoxes;
