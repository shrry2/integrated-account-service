import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

import { useTranslation } from 'react-i18next';

import CodeInput from '../../components/input/CodeInput';
import Button from '../../components/input/Button';

import {
  Guidance,
  ErrorMessage,
  SuccessMessage,
} from './style';

const BottomWrapper = styled.div`
  margin: .5rem 0;
  padding: 1rem;
  text-align: center;
`;

function CodeVerification(props) {
  const { t } = useTranslation();

  const {
    phoneNumber,
    verificationCode,
    onChangeVerificationCode,
    resendCode,
    tryAgain,
    isProcessing,
    apiError,
    apiMessage,
  } = props;

  return (
    <>
      <Guidance>{t('pages:signup.codeVerification.heading')}</Guidance>
      {!isProcessing && (
        <>
          <p>{t('pages:signup.codeVerification.guidance', { phoneNumber })}</p>
          <CodeInput
            value={verificationCode}
            disabled={isProcessing}
            onChange={onChangeVerificationCode}
          />
        </>
      )}
      <BottomWrapper>
        {isProcessing
          ? (
            <>
              <div className="loader" />
              {t('pages:signup.codeVerification.processing')}
            </>
          )
          : (
            <>
              {apiError && <ErrorMessage>{apiError}</ErrorMessage>}
              {apiMessage && <SuccessMessage>{apiMessage}</SuccessMessage>}
              <p>{t('pages:signup.codeVerification.notReceiving')}</p>
              <Button onClick={resendCode} theme="gloomy" disabled={isProcessing}>{t('pages:signup.codeVerification.resendCode')}</Button>
              <p>{t('pages:signup.codeVerification.or')}</p>
              <Button onClick={tryAgain} theme="gloomy" disabled={isProcessing}>{t('pages:signup.codeVerification.tryAgain')}</Button>
            </>
          )}
      </BottomWrapper>
    </>
  );
}

CodeVerification.propTypes = {
  phoneNumber: PropTypes.string.isRequired,
  verificationCode: PropTypes.string.isRequired,
  onChangeVerificationCode: PropTypes.func.isRequired,
  resendCode: PropTypes.func.isRequired,
  tryAgain: PropTypes.func.isRequired,
  isProcessing: PropTypes.bool,
  apiError: PropTypes.string,
  apiMessage: PropTypes.string,
};

CodeVerification.defaultProps = {
  isProcessing: false,
  apiError: null,
  apiMessage: null,
};

export default CodeVerification;
