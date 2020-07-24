import { Action, ActionType } from '../actions';
import {
  Editor,
  Orientation,
  PairCharacters,
  PrimaryAction,
  PrimaryActionAuto,
} from '../types';

export interface State {
  editor: Editor;
  keybinding: string;
  theme: string;
  pairCharacters: PairCharacters;
  orientation: Orientation;
  primaryAction: PrimaryAction;
}

const DEFAULT: State = {
  editor: Editor.Advanced,
  keybinding: 'ace',
  theme: 'github',
  pairCharacters: PairCharacters.Enabled,
  orientation: Orientation.Automatic,
  primaryAction: PrimaryActionAuto.Auto,
};

export default function configuration(state = DEFAULT, action: Action): State {
  switch (action.type) {
    case ActionType.ChangeEditor:
      return { ...state, editor: action.editor };
    case ActionType.ChangeKeybinding:
      return { ...state, keybinding: action.keybinding };
    case ActionType.ChangeTheme:
      return { ...state, theme: action.theme };
    case ActionType.ChangePairCharacters:
      return { ...state, pairCharacters: action.pairCharacters };
    case ActionType.ChangeOrientation:
      return { ...state, orientation: action.orientation };
    case ActionType.ChangePrimaryAction:
      return { ...state, primaryAction: action.primaryAction };
    default:
      return state;
  }
}
