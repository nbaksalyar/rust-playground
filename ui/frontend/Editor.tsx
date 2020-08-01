import React, { useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import * as actions from './actions';
import AdvancedEditor from './AdvancedEditor';
import { State } from './reducers';

const Editor: React.SFC = () => {
  const code = useSelector((state: State) => state.code);
  const position = useSelector((state: State) => state.position);
  const selection = useSelector((state: State) => state.selection);

  const dispatch = useDispatch();
  const execute = useCallback(() => dispatch(actions.performPrimaryAction()), [dispatch]);
  const onEditCode = useCallback((c) => dispatch(actions.editCode(c)), [dispatch]);

  return (
    <div className="editor">
      <AdvancedEditor code={code}
        position={position}
        selection={selection}
        onEditCode={onEditCode}
        execute={execute} />
    </div>
  );
};

export default Editor;
