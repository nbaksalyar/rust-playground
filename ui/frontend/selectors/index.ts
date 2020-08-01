import { source } from 'common-tags';
import { createSelector } from 'reselect';
import * as url from 'url';

import { State } from '../reducers';
import { PrimaryActionAuto, PrimaryActionCore } from '../types';

const codeSelector = (state: State) => state.code;

const HAS_TESTS_RE = /^\s*#\s*\[\s*test\s*([^"]*)]/m;
export const hasTestsSelector = createSelector(codeSelector, code => !!code.match(HAS_TESTS_RE));

const HAS_MAIN_FUNCTION_RE = /^\s*(pub\s+)?\s*(const\s+)?\s*(async\s+)?\s*fn\s+main\s*\(\s*\)/m;
export const hasMainFunctionSelector = createSelector(codeSelector, code => !!code.match(HAS_MAIN_FUNCTION_RE));

const CRATE_TYPE_RE = /^\s*#!\s*\[\s*crate_type\s*=\s*"([^"]*)"\s*]/m;
export const crateTypeSelector = createSelector(codeSelector, code => (code.match(CRATE_TYPE_RE) || [])[1]);

const autoPrimaryActionSelector = createSelector(
  crateTypeSelector,
  hasTestsSelector,
  hasMainFunctionSelector,
  (crateType, hasTests, hasMainFunction) => {
    return PrimaryActionCore.Execute;
  },
);

export const getCrateType = createSelector(
  autoPrimaryActionSelector,
  primaryAction => primaryAction === PrimaryActionCore.Execute ? 'bin' : 'lib',
);

const rawPrimaryActionSelector = (state: State) => state.configuration.primaryAction;

export const isAutoBuildSelector = createSelector(
  rawPrimaryActionSelector,
  autoPrimaryActionSelector,
  (primaryAction, autoPrimaryAction) => (
    primaryAction === PrimaryActionAuto.Auto
  ),
);

const primaryActionSelector = createSelector(
  rawPrimaryActionSelector,
  autoPrimaryActionSelector,
  (primaryAction, autoPrimaryAction): PrimaryActionCore => (
    primaryAction === PrimaryActionAuto.Auto ? autoPrimaryAction : primaryAction
  ),
);

const LABELS: { [index in PrimaryActionCore]: string } = {
  [PrimaryActionCore.Execute]: 'Run',
};

export const getExecutionLabel = createSelector(primaryActionSelector, primaryAction => LABELS[primaryAction]);

export const hasProperties = obj => Object.values(obj).some(val => !!val);

const getOutputs = (state: State) => [
  state.output.execute,
];

export const getSomethingToShow = createSelector(
  getOutputs,
  a => a.some(hasProperties),
);

const baseUrlSelector = (state: State) =>
  state.globalConfiguration.baseUrl;

export const permalinkSelector = createSelector(
  baseUrlSelector,
  (baseUrl) => {
    const u = url.parse(baseUrl, true);
    return url.format(u);
  },
);

const codeBlock = (code: string, language = '') =>
  '```' + language + `\n${code}\n` + '```';

const maybeOutput = (code: string, whenPresent: (_: string) => void) => {
  const val = (code || '').trim();
  if (val.length !== 0) { whenPresent(code); }
};

export const codeUrlSelector = createSelector(
  baseUrlSelector,
  (baseUrl) => {
    const u = url.parse(baseUrl, true);
    return url.format(u);
  },
);

const notificationsSelector = (state: State) => state.notifications;

const NOW = new Date();
const RUST_2018_DEFAULT_END = new Date('2019-01-01T00:00:00Z');
const RUST_2018_DEFAULT_OPEN = NOW <= RUST_2018_DEFAULT_END;
export const showRust2018IsDefaultSelector = createSelector(
  notificationsSelector,
  notifications => RUST_2018_DEFAULT_OPEN && !notifications.seenRust2018IsDefault,
);

export const anyNotificationsToShowSelector = createSelector(
  showRust2018IsDefaultSelector,
  allNotifications => allNotifications,
);
