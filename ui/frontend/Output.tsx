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

  if (details.body != null) {
    WebAssembly.instantiate(details.body, { env: { alert: function (v) { alert(v); }} })
      .then((instance) => {
        if (instance.exports.main) {
          let main = instance.exports.main as CallableFunction;
          main();
        }
      });
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
