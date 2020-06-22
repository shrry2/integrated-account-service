import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { MenuContent, MenuWrapper } from './style';
import MenuHeader from './MenuHeader';

const ErrorMessage = styled.div`
  background: #e8383d;
  color: #fff;
  padding: 1rem;
  border-radius: 5px;
  margin-bottom: .5rem;
  text-align: left;
`;

function ErrorScreen({ message, onClose }) {
  const { t } = useTranslation();

  return (
    <MenuWrapper>
      <MenuHeader
        onLeftArrowClick={onClose}
        title={t('common:Error')}
      />
      <MenuContent>
        <ErrorMessage>
          {message}
        </ErrorMessage>
      </MenuContent>
    </MenuWrapper>
  );
}

ErrorScreen.propTypes = {
  message: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default ErrorScreen;
