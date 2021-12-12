/* eslint-disable no-continue */
// General functions

const isVowel = (c: string) => c === 'a' || c === 'e' || c === 'i' || c === 'o' || c === 'u' || c === 'y';

export function addDotsToWord(word: string, previous: string) {
  let preDot = '';
  let postDot = '';

  // if word begins with a vowel: dot before
  if (isVowel(word.charAt(0))) {
    preDot = '.';
  }

  // if word is a cmene: dot after
  if (!isVowel(word.charAt(word.length - 1))) {
    postDot = '.';

    // and except for preceding selma'o DOI or LA, also a dot before
    if (!previous || (previous !== 'doi' && previous !== 'la')) {
      // TODO: check if there are more of these
      preDot = '.';
    }
  }

  return preDot + word + postDot;
}

export const arrayToString = (array: string[]) => {
  let result = '';

  for (let i = 0; i < array.length - 1; i += 1) {
    result += `${array[i]} `;
  }

  result += array[array.length - 1];

  return result;
};

// Latin mode

export const transcribeToLatin = (text: string[]) => {
  const result: string[] = [];

  text.forEach((_, index) => {
    result.push(addDotsToWord(text[index], text[index - 1]));
  });

  return result;
};

// Cyrillic mode

const cyrillicTable = {
  b: '&#1073;',
  c: '&#1096;',
  d: '&#1076;',
  f: '&#1092;',
  g: '&#1075;',
  j: '&#1078;',
  k: '&#1082;',
  l: '&#1083;',
  m: '&#1084;',
  n: '&#1085;',
  p: '&#1087;',
  r: '&#1088;',
  s: '&#1089;',
  t: '&#1090;',
  v: '&#1074;',
  x: '&#1093;',
  z: '&#1079;',
  a: '&#1072;',
  e: '&#1077;',
  i: '&#1080;',
  o: '&#1086;',
  u: '&#1091;',
  y: '&#1098;',
};

export const wordToCyrillic = (word: string) => {
  let cyrillicWord = '';

  for (let i = 0; i < word.length; i += 1) {
    const letter = word.charAt(i);

    let cyrillicLetter = cyrillicTable[<keyof typeof cyrillicTable>letter];
    if (!cyrillicLetter) {
      cyrillicLetter = letter;
    }
    cyrillicWord += cyrillicLetter;
  }

  return cyrillicWord;
};

export const transcribeToCyrillic = (text: string[]) => {
  const result: string[] = [];

  text.forEach((_, index) => {
    result.push(wordToCyrillic(addDotsToWord(text[index], text[index - 1])));
  });

  return result;
};

// Tengwar mode

const tengwaTable = {
  b: '&#57349;',
  c: '&#57354;',
  d: '&#57348;',
  f: '&#57353;',
  g: '&#57351;',
  j: '&#57358;',
  k: '&#57347;',
  l: '&#57378;',
  m: '&#57361;',
  n: '&#57360;',
  p: '&#57345;',
  r: '&#57376;',
  s: '&#57380;',
  t: '&#57344;',
  v: '&#57357;',
  x: '&#57355;',
  z: '&#57382;',

  a: '&#57394;',
  e: '&#57386;',
  i: '&#57390;',
  o: '&#57366;',
  u: '&#57365;',
  y: '&#57388;',
};

const tehtaTable = {
  a: '&#57408;',
  e: '&#57414;',
  i: '&#57412;',
  o: '&#57418;',
  u: '&#57420;',
  y: '&#57413;',
};

export const wordToTengwar = (word: string) => {
  let tengwarWord = '';
  let canUseTehta = false;

  for (let i = 0; i < word.length; i += 1) {
    const letter = word.charAt(i);

    if (letter === "'") {
      tengwarWord += '&#57389;'; // halla
      canUseTehta = false;
      continue;
    }

    if (letter === '.') {
      // It would have been enough to set canUseTehta to true to get ":" for ".i",
      // but Tengwar Unicode fonts do not have tehta placement rules for the "lowered pusta",
      // which I render as the ASCII "." (period).
      // Therefore, add an extra case for ".i".
      if (word.length > i + 1 && word.charAt(i + 1) === 'i') {
        // And also prevent longer words.
        if (word.length === i + 2 || word.charAt(i + 2) === ' ') {
          tengwarWord += '&#57441;'; // double pusta
          i += 1;
          canUseTehta = false;
          continue;
        }
      }

      tengwarWord += '.';
      canUseTehta = false;
      continue;
    }

    const tehta = tehtaTable[<keyof typeof tehtaTable>letter];
    if (tehta) {
      if (
        i < word.length - 1
        && tehtaTable[<keyof typeof tehtaTable>word.charAt(i + 1)]
      ) {
        // diphtong
        tengwarWord += tengwaTable[<keyof typeof tengwaTable>letter];
        tengwarWord += tehtaTable[<keyof typeof tehtaTable>word.charAt(i + 1)];
        i += 1;
        canUseTehta = false;
        continue;
      } else if (!canUseTehta) {
        tengwarWord += '&#57390;'; // short carrier
        tengwarWord += tehta;
        canUseTehta = true;
        continue;
      } else {
        tengwarWord += tehta;
        canUseTehta = false;
        continue;
      }
    }

    const tengwa = tengwaTable[<keyof typeof tengwaTable>letter];
    if (tengwa) {
      tengwarWord += tengwa;
      canUseTehta = true;
      continue;
    }

    tengwarWord += '?';
  }

  return tengwarWord;
};

export const transcribeToTengwar = (text: string[]) => {
  const result: string[] = [];

  text.forEach((_, index) => {
    result.push(wordToTengwar(addDotsToWord(text[index], text[index - 1])));
  });

  return result;
};

// Hiragana mode

const hiraganaTable = {
  c: '<span class="unvoiced-sound">ブ</span>',
  d: '<span class="unvoiced-sound">ド</span>',
  f: '<span class="unvoiced-sound">フ</span>',
  g: '<span class="unvoiced-sound">グ</span>',
  j: '<span class="unvoiced-sound">ジ</span>',
  k: '<span class="unvoiced-sound">ク</span>',
  l: '<span class="unvoiced-sound">ルﾟ</span>',
  m: '<span class="unvoiced-sound">ム</span>',
  p: '<span class="unvoiced-sound">プ</span>',
  r: '<span class="unvoiced-sound">ル</span>',
  s: '<span class="unvoiced-sound">ス</span>',
  t: '<span class="unvoiced-sound">ト</span>',
  v: '<span class="unvoiced-sound">ヴ</span>',
  x: '<span class="unvoiced-sound">ハ</span>',
  z: '<span class="unvoiced-sound">ズ</span>',
};

export const wordToHiragana = (word: string) => {
  let hiraganaWord = '';
  const preHiraganaWord = word
    .replace('ba', 'バ')
    .replace('bi', 'ビ')
    .replace('bu', 'ブ')
    .replace('be', 'ベ')
    .replace('bo', 'ボ')
    .replace('by', 'バ')
    .replace('ca', 'シャ')
    .replace('ci', 'ビ')
    .replace('cu', 'ブ')
    .replace('ce', 'シェ')
    .replace('co', 'ショ')
    .replace('cy', 'シァ')
    .replace('da', 'ダ')
    .replace('di', 'ビ')
    .replace('du', 'ブ')
    .replace('de', 'デ')
    .replace('do', 'ド')
    .replace('dy', 'ダァ')
    .replace('fa', 'ファ')
    .replace('fi', 'ビ')
    .replace('fu', 'ブ')
    .replace('fe', 'フェ')
    .replace('fo', 'フォ')
    .replace('fy', 'ファ')
    .replace('ga', 'ガ')
    .replace('gi', 'ビ')
    .replace('gu', 'ブ')
    .replace('ge', 'ベ')
    .replace('go', 'ゴ')
    .replace('gy', 'ガァ')
    .replace('ja', 'ジャ')
    .replace('ji', 'ビ')
    .replace('ju', 'ブ')
    .replace('je', 'ベ')
    .replace('jo', 'ジョ')
    .replace('jy', 'ジァ')
    .replace('ka', 'カ')
    .replace('ki', 'キ')
    .replace('ku', 'ク')
    .replace('ke', 'ケ')
    .replace('ko', 'コ')
    .replace('ky', 'カァ')
    .replace('la', 'ラﾟ')
    .replace('li', 'リﾟ')
    .replace('lu', 'ルﾟ')
    .replace('le', 'レﾟ')
    .replace('lo', 'ロﾟ')
    .replace('ly', 'ラﾟァ')
    .replace('ma', 'マ')
    .replace('mi', 'ミ')
    .replace('mu', 'ム')
    .replace('me', 'メ')
    .replace('mo', 'モ')
    .replace('my', 'マァ')
    .replace('na', 'ナ')
    .replace('ni', 'ニ')
    .replace('nu', 'ヌ')
    .replace('ne', 'ネ')
    .replace('no', 'ノ')
    .replace('ny', 'ナァ')
    .replace('pa', 'パ')
    .replace('pi', 'ピ')
    .replace('pu', 'プ')
    .replace('pe', 'ペ')
    .replace('po', 'ポ')
    .replace('py', 'パァ')
    .replace('ra', 'ラ')
    .replace('ri', 'リ')
    .replace('ru', 'ル')
    .replace('re', 'レ')
    .replace('ro', 'ロ')
    .replace('ry', 'ラァ')
    .replace('sa', 'サ')
    .replace('si', 'シ')
    .replace('su', 'ス')
    .replace('se', 'セ')
    .replace('so', 'ソ')
    .replace('sy', 'サァ')
    .replace('ta', 'タ')
    .replace('ti', 'ティ')
    .replace('tu', 'トゥ')
    .replace('te', 'テ')
    .replace('to', 'ト')
    .replace('ty', 'タァ')
    .replace('va', 'ヴァ')
    .replace('vi', 'ヴィ')
    .replace('vu', 'ヴ')
    .replace('ve', 'ヴェ')
    .replace('vo', 'ヴォ')
    .replace('vy', 'ヴァ')
    .replace('xa', 'ハ')
    .replace('xi', 'ヒ')
    .replace('xu', 'フ')
    .replace('xe', 'ヘ')
    .replace('xo', 'ホ')
    .replace('xy', 'ハァ')
    .replace('za', 'ザ')
    .replace('zi', 'ジ')
    .replace('zu', 'ズ')
    .replace('ze', 'ゼ')
    .replace('zo', 'ゾ')
    .replace('zy', 'ザァ')
    .replace("'a", 'は')
    .replace("'i", 'ひ')
    .replace("'u", 'ふ')
    .replace("'e", 'へ')
    .replace("'o", 'ほ')
    .replace("'y", 'はァ')
    .replace('ia', 'ヤ')
    .replace('ii', 'イィ')
    .replace('iu', 'ユ')
    .replace('ie', 'イェ')
    .replace('io', 'ヨ')
    .replace('iy', 'イァ')
    .replace('ua', 'ワ')
    .replace('ui', 'ウィ')
    .replace('uu', 'ウゥ')
    .replace('ue', 'ウェ')
    .replace('uo', 'ウォ')
    .replace('uy', 'ウァ')
    .replace('a', 'ア')
    .replace('i', 'イ')
    .replace('u', 'ウ')
    .replace('e', 'エ')
    .replace('o', 'オ')
    .replace('y', 'ァ')
    .replace('n', 'ン');

  for (let i = 0; i < preHiraganaWord.length; i += 1) {
    const next = preHiraganaWord.charAt(i);
    const nextTwo = preHiraganaWord.substring(i, i + 2);

    if (hiraganaTable[<keyof typeof hiraganaTable>nextTwo]) {
      hiraganaWord += hiraganaTable[<keyof typeof hiraganaTable>nextTwo];
      i += 1;
      continue;
    }
    if (hiraganaTable[<keyof typeof hiraganaTable>next]) {
      hiraganaWord += hiraganaTable[<keyof typeof hiraganaTable>next];
      continue;
    }
    hiraganaWord += next; // TODO this should not happen, of course
  }

  return hiraganaWord;
};

export const transcribeToHiragana = (text: string[]) => {
  const result: string[] = [];

  text.forEach((_, index) => {
    result.push(wordToHiragana(addDotsToWord(text[index], text[index - 1])));
  });

  return result;
};
