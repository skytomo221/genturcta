/* eslint-disable camelcase */
import React from 'react';
import SearchIcon from '@mui/icons-material/Search';
import SettingsIcon from '@mui/icons-material/Settings';
import Button from '@mui/material/Button';
import CheckIcon from '@mui/icons-material/Check';
import TextField from '@mui/material/TextField';
import Container from '@mui/material/Container';
import Box from '@mui/system/Box';
import camxes_beta_cbm_ckt from '../parser/camxes-beta-cbm-ckt';
import camxes_beta_cbm from '../parser/camxes-beta-cbm';
import camxes_beta from '../parser/camxes-beta';
import camxes_exp from '../parser/camxes-exp';
import camxes from '../parser/camxes';
import maftufa_1_15 from '../parser/maftufa-1.15';
import maltufa_0_9 from '../parser/maltufa-0.9';
import maltufa_1_15 from '../parser/maltufa-1.15';
import zantufa_0_9 from '../parser/zantufa-0.9';
import zantufa_0_61 from '../parser/zantufa-0.61';
import zantufa_1_3 from '../parser/zantufa-1.3';

import LojbanParser from './LojbanParser';
import ResultTabs from './ResultTabs';

// eslint-disable-next-line no-unused-vars
const parsers: LojbanParser[] = [
  new LojbanParser('Camxes: Beta CBM CKT', camxes_beta_cbm_ckt),
  new LojbanParser('Camxes: Beta CBM', camxes_beta_cbm),
  new LojbanParser('Camxes: Beta', camxes_beta),
  new LojbanParser('Camxes: Experimental', camxes_exp),
  new LojbanParser('Camxes: Standard', camxes),
  new LojbanParser('Maftufa 1.15', maftufa_1_15),
  new LojbanParser('Maltufa 0.9', maltufa_0_9),
  new LojbanParser('Maltufa 1.15', maltufa_1_15),
  new LojbanParser('Zantufa 0.9', zantufa_0_9),
  new LojbanParser('Zantufa 0.61', zantufa_0_61),
  new LojbanParser('Zantufa 1.3', zantufa_1_3),
];

// eslint-disable-next-line react/function-component-definition
const App: React.FC = () => {
  const [lojbanText, setLojbanText] = React.useState('');
  const [parserResult, setParserResult] = React.useState<LojbanParser[]>([]);
  const [update, setUpdate] = React.useState<boolean>(false);

  const lojbanTextHandleChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setLojbanText(event.target.value);
  };

  const parse = () => {
    parsers.map((parser) => parser.parse(lojbanText));
    setParserResult(parserResult);
    setUpdate(!update);
  };

  return (
    <Container>
      <div className="row">
        <div className="span12">
          <h3>ロジバン構文解析器</h3>
          このページの情報は
          <a href="https://github.com/skytomo221/genturcta">リポジトリ</a>
          をご覧ください。問題がありますか？ここから、
          <a href="https://github.com/skytomo221/genturcta/issues">Issue</a>
          を立てることができます。
        </div>
      </div>
      <div className="row">
        <div className="span12">
          <Box
            sx={{
              m: 1, p: 1, display: 'flex', alignItems: 'center',
            }}
          >
            <TextField
              id="lojban-text-area"
              label="解析するテキスト"
              multiline
              value={lojbanText}
              onChange={lojbanTextHandleChange}
              sx={{ width: '100%' }}
            />
            <Button
              variant="contained"
              startIcon={<SearchIcon />}
              className="btn btn-primary"
              onClick={parse}
              sx={{ m: 1, whiteSpace: 'nowrap' }}
            >
              構文解析する
            </Button>
          </Box>
        </div>
      </div>
      <div className="row">
        <div id="result-row" className="span12">
          <legend>
            <small>
              <span id="time-label" />
            </small>
          </legend>
          <ResultTabs parsers={parsers} />
        </div>
      </div>
    </Container>
  );
};

export default App;
