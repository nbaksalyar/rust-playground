import { combineReducers } from 'redux';

import code from './code';
import configuration from './configuration';
import globalConfiguration from './globalConfiguration';
import notifications from './notifications';
import output from './output';
import page from './page';
import position from './position';
import selection from './selection';

const playgroundApp = combineReducers({
  code,
  configuration,
  globalConfiguration,
  notifications,
  output,
  page,
  position,
  selection,
});

export type State = ReturnType<typeof playgroundApp>;

export default playgroundApp;
