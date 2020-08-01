import { Action, ActionType } from '../../actions';
import { Focus } from '../../types';

const DEFAULT: State = {
  focus: null,
};

interface State {
  focus?: Focus;
}

export default function meta(state = DEFAULT, action: Action) {
  switch (action.type) {
    case ActionType.ChangeFocus:
      return { ...state, focus: action.focus };

    case ActionType.CompileRequest:
      return { ...state, focus: Focus.Execute };

    default:
      return state;
  }
}
