import { combineReducers } from 'redux';

import execute from './execute';
import meta from './meta';

const output = combineReducers({
  meta,
  execute,
});

export type State = ReturnType<typeof output>;

export default output;
