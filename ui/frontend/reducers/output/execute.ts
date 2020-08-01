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

export default function execute(state = DEFAULT, action: Action) {
  switch (action.type) {
    case ActionType.ExecuteRequest:
      return start(DEFAULT, state);
    case ActionType.ExecuteSucceeded: {
      const { body = '', stderr = '', isAutoBuild } = action;
      return finish(state, { body, stderr, isAutoBuild });
    }
    case ActionType.ExecuteFailed: {
      const { error, isAutoBuild } = action;
      return finish(state, { error, isAutoBuild });
    }
    default:
      return state;
  }
}
