import React from 'react';
import PropTypes from 'prop-types';

import { useTranslation } from 'react-i18next';

import Button from '../../components/input/Button';

import {
  Heading2,
  Guidance,
  ErrorMessage,
  CenteredButtonWrapper,
} from './style';

function EmailVerified(props) {
  const { t } = useTranslation();

  const {
    displayName,
    email,
    onConfirmed,
    apiError,
    isProcessing,
  } = props;

  return (
    <>
      <Heading2>{t('pages:signup.emailVerified.heading')}</Heading2>
      <Guidance>{t('pages:signup.emailVerified.guidance', { displayName, email })}</Guidance>
      {apiError && <ErrorMessage>{apiError}</ErrorMessage>}
      <CenteredButtonWrapper>
        <Button type="button" onClick={onConfirmed} theme="primary" disabled={isProcessing}>{t('pages:signup.labels.confirmed')}</Button>
      </CenteredButtonWrapper>
    </>
  );
}

EmailVerified.propTypes = {
  displayName: PropTypes.string,
  email: PropTypes.string,
  onConfirmed: PropTypes.func,
  apiError: PropTypes.string,
  isProcessing: PropTypes.bool,
};

EmailVerified.defaultProps = {
  displayName: '',
  email: '',
  onConfirmed: () => {},
  apiError: null,
  isProcessing: false,
};

export default EmailVerified;
