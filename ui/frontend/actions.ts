import fetch from 'isomorphic-fetch';
import { ThunkAction as ReduxThunkAction } from 'redux-thunk';
import url from 'url';

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
  RequestGistLoad = 'REQUEST_GIST_LOAD',
  GistLoadSucceeded = 'GIST_LOAD_SUCCEEDED',
  GistLoadFailed = 'GIST_LOAD_FAILED',
  RequestGistSave = 'REQUEST_GIST_SAVE',
  GistSaveSucceeded = 'GIST_SAVE_SUCCEEDED',
  GistSaveFailed = 'GIST_SAVE_FAILED',
  RequestCratesLoad = 'REQUEST_CRATES_LOAD',
  CratesLoadSucceeded = 'CRATES_LOAD_SUCCEEDED',
  RequestVersionsLoad = 'REQUEST_VERSIONS_LOAD',
  VersionsLoadSucceeded = 'VERSIONS_LOAD_SUCCEEDED',
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

const receiveExecuteSuccess = ({ stdout, stderr, isAutoBuild }) =>
  createAction(ActionType.ExecuteSucceeded, { stdout, stderr, isAutoBuild });

const receiveExecuteFailure = ({ error, isAutoBuild }) =>
  createAction(ActionType.ExecuteFailed, { error, isAutoBuild });

function jsonGet(urlObj) {
  const urlStr = url.format(urlObj);

  return fetchJson(urlStr, {
    method: 'get',
  });
}

function jsonPost(urlObj, body) {
  const urlStr = url.format(urlObj);

  return fetchJson(urlStr, {
    method: 'post',
    body: JSON.stringify(body),
  });
}

async function fetchJson(url, args) {
  const { headers = {} } = args;
  headers['Content-Type'] = 'application/json';

  let response;
  try {
    response = await fetch(url, { ...args, headers });
  } catch (networkError) {
    // e.g. server unreachable
    throw ({
      error: `Network error: ${networkError.toString()}`,
    });
  }

  let body;
  try {
    body = await response.json();
  } catch (convertError) {
    throw ({
      error: `Response was not JSON: ${convertError.toString()}`,
    });
  }

  if (response.ok) {
    // HTTP 2xx
    return body;
  } else {
    // HTTP 4xx, 5xx (e.g. malformed JSON request)
    throw body;
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
    .then(json => dispatch(receiveExecuteSuccess({ ...json, isAutoBuild })))
    .catch(json => dispatch(receiveExecuteFailure({ ...json, isAutoBuild })));
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

interface GistSuccessProps {
  id: string;
  url: string;
  code: string;
  stdout: string;
  stderr: string;
}

const requestGistLoad = () =>
  createAction(ActionType.RequestGistLoad);

const receiveGistLoadSuccess = (props: GistSuccessProps) =>
  createAction(ActionType.GistLoadSucceeded, props);

const receiveGistLoadFailure = () => // eslint-disable-line no-unused-vars
  createAction(ActionType.GistLoadFailed);

type PerformGistLoadProps =
  Pick<GistSuccessProps, Exclude<keyof GistSuccessProps, 'url' | 'code' | 'stdout' | 'stderr'>>;

export function performGistLoad({ id }: PerformGistLoadProps): ThunkAction {
  return function(dispatch, _getState) {
    dispatch(requestGistLoad());
    const u = url.resolve(routes.meta.gist.pathname, id);
    jsonGet(u)
      .then(gist => dispatch(receiveGistLoadSuccess({ ...gist })));
    // TODO: Failure case
  };
}

const requestCratesLoad = () =>
  createAction(ActionType.RequestCratesLoad);

const receiveCratesLoadSuccess = ({ crates }) =>
  createAction(ActionType.CratesLoadSucceeded, { crates });

export function performCratesLoad(): ThunkAction {
  return function(dispatch) {
    dispatch(requestCratesLoad());

    return jsonGet(routes.meta.crates)
      .then(json => dispatch(receiveCratesLoadSuccess(json)));
    // TODO: Failure case
  };
}

const requestVersionsLoad = () =>
  createAction(ActionType.RequestVersionsLoad);

const receiveVersionsLoadSuccess = ({ stable, beta, nightly, rustfmt, clippy, miri }) =>
  createAction(ActionType.VersionsLoadSucceeded, { stable, beta, nightly, rustfmt, clippy, miri });

export function performVersionsLoad(): ThunkAction {
  return function(dispatch) {
    dispatch(requestVersionsLoad());

    const stable = jsonGet(routes.meta.version.stable);
    const beta = jsonGet(routes.meta.version.beta);
    const nightly = jsonGet(routes.meta.version.nightly);
    const rustfmt = jsonGet(routes.meta.version.rustfmt);
    const clippy = jsonGet(routes.meta.version.clippy);
    const miri = jsonGet(routes.meta.version.miri);

    const all = Promise.all([stable, beta, nightly, rustfmt, clippy, miri]);

    return all
      .then(([stable, beta, nightly, rustfmt, clippy, miri]) => dispatch(receiveVersionsLoadSuccess({
        stable,
        beta,
        nightly,
        rustfmt,
        clippy,
        miri,
      })));
    // TODO: Failure case
  };
}

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
  | ReturnType<typeof requestGistLoad>
  | ReturnType<typeof receiveGistLoadSuccess>
  | ReturnType<typeof receiveGistLoadFailure>
  | ReturnType<typeof requestCratesLoad>
  | ReturnType<typeof receiveCratesLoadSuccess>
  | ReturnType<typeof requestVersionsLoad>
  | ReturnType<typeof receiveVersionsLoadSuccess>
  | ReturnType<typeof notificationSeen>
  ;
