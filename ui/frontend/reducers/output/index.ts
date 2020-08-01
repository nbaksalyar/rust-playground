import { combineReducers } from 'redux';

import compile from './compile';
import meta from './meta';

const output = combineReducers({
  meta,
  compile,
});

export type State = ReturnType<typeof output>;

export default output;
