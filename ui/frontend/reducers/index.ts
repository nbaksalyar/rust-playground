import { combineReducers } from 'redux';

import code from './code';
import configuration from './configuration';
import globalConfiguration from './globalConfiguration';
import output from './output';
import page from './page';
import position from './position';
import selection from './selection';

const playgroundApp = combineReducers({
  code,
  configuration,
  globalConfiguration,
  output,
  page,
  position,
  selection,
});

export type State = ReturnType<typeof playgroundApp>;

export default playgroundApp;
