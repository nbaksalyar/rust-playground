import React, { useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import * as actions from './actions';
import { State } from './reducers';
import { Focus } from './types';

import * as selectors from './selectors';

const Tab: React.SFC<TabProps> = ({ kind, focus, label, onClick, tabProps }) => {
  if (selectors.hasProperties(tabProps)) {
    const selected = focus === kind ? 'output-tab-selected' : '';
    return (
      <button className={`output-tab ${selected}`}
        onClick={onClick}>
        {label}
      </button>
    );
  } else {
    return null;
  }
};

interface TabProps {
  kind: Focus;
  focus?: Focus;
  label: string;
  onClick: () => any;
  tabProps: object;
}

const Output: React.SFC = () => {
  const somethingToShow = useSelector(selectors.getSomethingToShow);
  const { meta: { focus }, execute } =
    useSelector((state: State) => state.output);

  const dispatch = useDispatch();
  const focusExecute = useCallback(() => dispatch(actions.changeFocus(Focus.Execute)), [dispatch]);

  if (!somethingToShow) {
    return null;
  }

  let close = null;
  let body = null;

  return (
    <div className="output">
      <div className="output-tabs">
        <Tab kind={Focus.Execute} focus={focus}
          label="Execution"
          onClick={focusExecute}
          tabProps={execute} />
        {close}
      </div>
      {body}
    </div>
  );
};

export default Output;
