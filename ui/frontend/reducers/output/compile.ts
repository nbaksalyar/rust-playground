import { Action, ActionType } from '../../actions';
import { finish, start } from './sharedStateManagement';

const DEFAULT: State = {
  requestsInProgress: 0,
  body: null,
  stderr: null,
  error: null,
  isAutoBuild: false,
};

interface State {
  requestsInProgress: number;
  body?: string;
  stderr?: string;
  error?: string;
  isAutoBuild: boolean;
}

export default function compile(state = DEFAULT, action: Action) {
  switch (action.type) {
    case ActionType.CompileRequest:
      return start(DEFAULT, state);
    case ActionType.CompileSucceeded: {
      const { body = '', stderr = '', isAutoBuild } = action;
      return finish(state, { body, stderr, isAutoBuild });
    }
    case ActionType.CompileFailed: {
      const { error, isAutoBuild } = action;
      return finish(state, { error, isAutoBuild });
    }
    default:
      return state;
  }
}
