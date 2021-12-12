import * as React from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import LojbanParser from './LojbanParser';
import ParseTreeBoxes from './ParseTreeBoxes';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = function (props: TabPanelProps) {
  const {
    children, value, index, ...other
  } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
};

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

interface Props {
  parsers: LojbanParser[];
}

const ResultTabs = function ({ parsers }: Props) {
  const [value, setValue] = React.useState(0);

  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={value}
          onChange={handleChange}
          aria-label="basic tabs example"
          sx={{
            '& .Mui-selected': {
              color: '#fff',
              fontWeight: 'bold',
            },
            '& .MuiTabs-indicator': {
              display: 'none',
            },
            '& .MuiTabs-flexContainer': {
              flexWrap: 'wrap',
            },
          }}
        >
          {parsers.map((parser, index) => (
            // eslint-disable-next-line react/jsx-props-no-spreading
            <Tab label={parser.name} {...a11yProps(index)} />
          ))}
        </Tabs>
      </Box>
      {parsers.map((parser, index) => (
        // eslint-disable-next-line react/jsx-props-no-spreading
        <TabPanel value={value} index={index}>
          <ParseTreeBoxes parser={parser} />
        </TabPanel>
      ))}
    </Box>
  );
};

export default ResultTabs;
