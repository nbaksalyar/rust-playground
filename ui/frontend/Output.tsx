import React from 'react';
import { useSelector } from 'react-redux';

import { State } from './reducers';
import SimplePane from './Output/SimplePane';

import * as selectors from './selectors';

const Output: React.SFC = () => {
  const somethingToShow = useSelector(selectors.getSomethingToShow);
  let details = useSelector((state: State) => state.output.compile);

  if (!somethingToShow) {
    return null;
  }

  return (
    <div className="output">
      <div className="output-body">
        <SimplePane {...details} kind="execute" />
      </div>
    </div>
  );
};

export default Output;
