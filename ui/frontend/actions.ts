import fetch from 'isomorphic-fetch';
import { ThunkAction as ReduxThunkAction } from 'redux-thunk';
import Url from 'url';

import {
  isAutoBuildSelector,
} from './selectors';
import State from './state';
import {
  Editor,
  Focus,
  Notification,
  Orientation,
  Page,
  PairCharacters,
  PrimaryAction,
  PrimaryActionAuto,
  PrimaryActionCore,
  Position,
  makePosition,
} from './types';

const routes = {
  compile: { pathname: '/compile' },
  execute: { pathname: '/execute' },
  meta: {
    crates: { pathname: '/meta/crates' },
    version: {
      stable: '/meta/version/stable',
      beta: '/meta/version/beta',
      nightly: '/meta/version/nightly',
      rustfmt: '/meta/version/rustfmt',
      clippy: '/meta/version/clippy',
      miri: '/meta/version/miri',
    },
    gist: { pathname: '/meta/gist/' },
  },
};

type ThunkAction<T = void> = ReduxThunkAction<T, State, {}, Action>;

const createAction = <T extends string, P extends {}>(type: T, props?: P) => (
  Object.assign({ type }, props)
);

export enum ActionType {
  SetPage = 'SET_PAGE',
  ChangeEditor = 'CHANGE_EDITOR',
  ChangeKeybinding = 'CHANGE_KEYBINDING',
  ChangeTheme = 'CHANGE_THEME',
  ChangePairCharacters = 'CHANGE_PAIR_CHARACTERS',
  ChangeOrientation = 'CHANGE_ORIENTATION',
  ChangeAssemblyFlavor = 'CHANGE_ASSEMBLY_FLAVOR',
  ChangePrimaryAction = 'CHANGE_PRIMARY_ACTION',
  ChangeChannel = 'CHANGE_CHANNEL',
  ChangeDemangleAssembly = 'CHANGE_DEMANGLE_ASSEMBLY',
  ChangeProcessAssembly = 'CHANGE_PROCESS_ASSEMBLY',
  ChangeMode = 'CHANGE_MODE',
  ChangeEdition = 'CHANGE_EDITION',
  ChangeBacktrace = 'CHANGE_BACKTRACE',
  ChangeFocus = 'CHANGE_FOCUS',
  ExecuteRequest = 'EXECUTE_REQUEST',
  ExecuteSucceeded = 'EXECUTE_SUCCEEDED',
  ExecuteFailed = 'EXECUTE_FAILED',
  EditCode = 'EDIT_CODE',
  AddMainFunction = 'ADD_MAIN_FUNCTION',
  AddImport = 'ADD_IMPORT',
  EnableFeatureGate = 'ENABLE_FEATURE_GATE',
  GotoPosition = 'GOTO_POSITION',
  SelectText = 'SELECT_TEXT',
  RequestFormat = 'REQUEST_FORMAT',
  FormatSucceeded = 'FORMAT_SUCCEEDED',
  FormatFailed = 'FORMAT_FAILED',
  RequestClippy = 'REQUEST_CLIPPY',
  ClippySucceeded = 'CLIPPY_SUCCEEDED',
  ClippyFailed = 'CLIPPY_FAILED',
  RequestMiri = 'REQUEST_MIRI',
  MiriSucceeded = 'MIRI_SUCCEEDED',
  MiriFailed = 'MIRI_FAILED',
  RequestMacroExpansion = 'REQUEST_MACRO_EXPANSION',
  MacroExpansionSucceeded = 'MACRO_EXPANSION_SUCCEEDED',
  MacroExpansionFailed = 'MACRO_EXPANSION_FAILED',
  NotificationSeen = 'NOTIFICATION_SEEN',
}

const setPage = (page: Page) =>
  createAction(ActionType.SetPage, { page });

export const navigateToIndex = () => setPage('index');
export const navigateToHelp = () => setPage('help');

export const changeEditor = (editor: Editor) =>
  createAction(ActionType.ChangeEditor, { editor });

export const changeKeybinding = (keybinding: string) =>
  createAction(ActionType.ChangeKeybinding, { keybinding });

export const changeTheme = (theme: string) =>
  createAction(ActionType.ChangeTheme, { theme });

export const changePairCharacters = (pairCharacters: PairCharacters) =>
  createAction(ActionType.ChangePairCharacters, { pairCharacters });

export const changeOrientation = (orientation: Orientation) =>
  createAction(ActionType.ChangeOrientation, { orientation });

const changePrimaryAction = (primaryAction: PrimaryAction) =>
  createAction(ActionType.ChangePrimaryAction, { primaryAction });

export const changeFocus = (focus: Focus) =>
  createAction(ActionType.ChangeFocus, { focus });

const requestExecute = () =>
  createAction(ActionType.ExecuteRequest);

const receiveExecuteSuccess = ({ body, stderr, isAutoBuild }) =>
  createAction(ActionType.ExecuteSucceeded, { body, stderr, isAutoBuild });

const receiveExecuteFailure = ({ error, isAutoBuild }) =>
  createAction(ActionType.ExecuteFailed, { error, isAutoBuild });

async function jsonPost(urlObj, body) {
  const args = {
    method: 'post',
    body: JSON.stringify(body),
  };

  const headers = {'Content-Type': 'application/json'};

  let response;
  try {
    response = await fetch(Url.format(urlObj), { ...args, headers });
  } catch (networkError) {
    // e.g. server unreachable
    throw ({
      error: `Network error: ${networkError.toString()}`,
    });
  }

  if (response.ok) {
    // HTTP 2xx
    let body;
    try {
      body = await response.arrayBuffer();
    } catch (error) {
      throw ({
        error: `Could not get response body: ${error.toString()}`,
      });
    }
    return { body, stdout: null };
  } else if (response.status == 400) {
    // Compilation failed
    let stderr;
    try {
      stderr = await response.text();
    } catch (error) {
      throw ({
        error: `Could not parse stderr: ${error.toString()}`,
      });
    }
    return { stderr, body: null, stdout: null };
  } else {
    // HTTP 4xx, 5xx (e.g. malformed JSON request)
    throw response;
  }
}

interface ExecuteRequestBody {
  code: string;
}

const performCommonExecute = (): ThunkAction => (dispatch, getState) => {
  dispatch(requestExecute());

  const state = getState();
  const { code } = state;
  const isAutoBuild = isAutoBuildSelector(state);

  const body: ExecuteRequestBody = { code };

  return jsonPost(routes.execute, body)
    .then(res => dispatch(receiveExecuteSuccess({ body: res.body, stderr: res.stderr, isAutoBuild })))
    .catch(res => dispatch(receiveExecuteFailure({ error: res.error, isAutoBuild })));
};

function performAutoOnly(): ThunkAction {
  return function(dispatch, getState) {
    const state = getState();
    return dispatch(performCommonExecute());
  };
}

const performExecuteOnly = (): ThunkAction => performCommonExecute();

const PRIMARY_ACTIONS: { [index in PrimaryAction]: () => ThunkAction } = {
  [PrimaryActionCore.Execute]: performExecuteOnly,
  [PrimaryActionAuto.Auto]: performAutoOnly,
};

export const performPrimaryAction = (): ThunkAction => (dispatch, getState) => {
  const state = getState();
  const primaryAction = PRIMARY_ACTIONS[state.configuration.primaryAction];
  dispatch(primaryAction());
};

const performAndSwitchPrimaryAction = (inner: () => ThunkAction, id: PrimaryAction) => (): ThunkAction => dispatch => {
  dispatch(changePrimaryAction(id));
  dispatch(inner());
};

export const performExecute =
  performAndSwitchPrimaryAction(performExecuteOnly, PrimaryActionCore.Execute);

export const editCode = (code: string) =>
  createAction(ActionType.EditCode, { code });

export const addMainFunction = () =>
  createAction(ActionType.AddMainFunction);

export const addImport = (code: string) =>
  createAction(ActionType.AddImport, { code });

export const enableFeatureGate = (featureGate: string) =>
  createAction(ActionType.EnableFeatureGate, { featureGate });

export const gotoPosition = (line: string | number, column: string | number) =>
  createAction(ActionType.GotoPosition, makePosition(line, column));

export const selectText = (start: Position, end: Position) =>
  createAction(ActionType.SelectText, { start, end });

const requestFormat = () =>
  createAction(ActionType.RequestFormat);

const notificationSeen = (notification: Notification) =>
  createAction(ActionType.NotificationSeen, { notification });

export const seenRust2018IsDefault = () => notificationSeen(Notification.Rust2018IsDefault);

export function indexPageLoad({
  code,
}): ThunkAction {
  return function(dispatch) {
    dispatch(navigateToIndex());

    if (code) {
      dispatch(editCode(code));
    }
  };
}

export function helpPageLoad() {
  return navigateToHelp();
}

export function showExample(code): ThunkAction {
  return function(dispatch) {
    dispatch(navigateToIndex());
    dispatch(editCode(code));
  };
}

export type Action =
  | ReturnType<typeof setPage>
  | ReturnType<typeof changePairCharacters>
  | ReturnType<typeof changeEditor>
  | ReturnType<typeof changeFocus>
  | ReturnType<typeof changeKeybinding>
  | ReturnType<typeof changeOrientation>
  | ReturnType<typeof changePrimaryAction>
  | ReturnType<typeof changeTheme>
  | ReturnType<typeof requestExecute>
  | ReturnType<typeof receiveExecuteSuccess>
  | ReturnType<typeof receiveExecuteFailure>
  | ReturnType<typeof editCode>
  | ReturnType<typeof addMainFunction>
  | ReturnType<typeof addImport>
  | ReturnType<typeof enableFeatureGate>
  | ReturnType<typeof gotoPosition>
  | ReturnType<typeof selectText>
  | ReturnType<typeof requestFormat>
  | ReturnType<typeof notificationSeen>
  ;
