import React, { useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import HeaderButton from './HeaderButton';
import { BuildIcon } from './Icon';
import { SegmentedButton, SegmentedButtonSet } from './SegmentedButton';

import * as actions from './actions';
import * as selectors from './selectors';

const Header: React.SFC = () => (
  <div className="header">
    <HeaderSet id="build">
      <SegmentedButtonSet>
        <ExecuteButton />
      </SegmentedButtonSet>
    </HeaderSet>
  </div>
);

interface HeaderSetProps {
  id: string;
}

const HeaderSet: React.SFC<HeaderSetProps> = ({ id, children }) => (
  <div className={`header__set header__set--${id}`}>{children}</div>
);

const ExecuteButton: React.SFC = () => {
  const executionLabel = useSelector(selectors.getExecutionLabel);

  const dispatch = useDispatch();
  const execute = useCallback(() => dispatch(actions.performPrimaryAction()), [dispatch]);

  return (
    <SegmentedButton isBuild onClick={execute}>
      <HeaderButton rightIcon={<BuildIcon />}>
        {executionLabel}
      </HeaderButton>
    </SegmentedButton>
  );
};

export default Header;
