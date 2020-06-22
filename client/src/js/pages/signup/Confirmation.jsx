import React from 'react';
import PropTypes from 'prop-types';

import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import Button from '../../components/input/Button';

import {
  Guidance,
  BottomContainer,
  ErrorMessage,
} from './style';

const ContactInfoWrapper = styled.div`
  margin: 3rem 0;
  text-align: center;
  font-weight: 400;
  font-size: 1.5rem;
  
  &:before {
    content: "${(props) => (props.withEmail ? '✉️' : '📱')}";
    margin-right: .5rem;
  }
`;

function Confirmation(props) {
  const { t } = useTranslation();

  const {
    displayName,
    contact,
    goBack,
    onConfirmed,
    apiError,
    isProcessing,
    withEmail,
  } = props;

  return (
    <>
      {
        withEmail
          ? <Guidance>{t('pages:signup.confirmation.headingWithEmail', { name: displayName })}</Guidance>
          : <Guidance>{t('pages:signup.confirmation.headingWithMobilePhone', { name: displayName })}</Guidance>
      }
      <ContactInfoWrapper withEmail={withEmail}>{contact}</ContactInfoWrapper>
      {apiError && <ErrorMessage>{apiError}</ErrorMessage>}
      <BottomContainer>
        <Button type="button" onClick={goBack} theme="gloomy" disabled={isProcessing}>{t('pages:signup.labels.back')}</Button>
        <Button type="button" onClick={onConfirmed} theme="primary" disabled={isProcessing}>{t('pages:signup.labels.confirmed')}</Button>
      </BottomContainer>
    </>
  );
}

Confirmation.propTypes = {
  displayName: PropTypes.string,
  contact: PropTypes.string,
  goBack: PropTypes.func,
  onConfirmed: PropTypes.func,
  apiError: PropTypes.string,
  isProcessing: PropTypes.bool,
  withEmail: PropTypes.bool,
};

Confirmation.defaultProps = {
  displayName: '',
  contact: '',
  goBack: () => {},
  onConfirmed: () => {},
  apiError: null,
  isProcessing: false,
  withEmail: false,
};

export default Confirmation;
