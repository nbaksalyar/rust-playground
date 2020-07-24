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

    case ActionType.ExecuteRequest:
      return { ...state, focus: Focus.Execute };

    case ActionType.RequestFormat:
      return { ...state, focus: Focus.Format };

    case ActionType.RequestGistLoad:
      return { ...state, focus: Focus.Gist };

    default:
      return state;
  }
}
