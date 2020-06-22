import React from 'react';
import PropTypes from 'prop-types';

import { MenuContent, MenuWrapper } from './style';
import ProcessingLoader from '../../../../../components/ProcessingLoader';

function ProcessingScreen({ message }) {
  return (
    <MenuWrapper>
      <MenuContent>
        <ProcessingLoader message={message} />
      </MenuContent>
    </MenuWrapper>
  );
}

ProcessingScreen.propTypes = {
  message: PropTypes.string,
};

ProcessingScreen.defaultProps = {
  message: undefined,
};

export default ProcessingScreen;
