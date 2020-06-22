import React, { useState } from 'react';
import PropTypes from 'prop-types';

import { useTranslation } from 'react-i18next';

import Button from '../../components/input/Button';

import {
  Guidance,
  CenteredButtonWrapper,
  ErrorMessage,
} from '../signup/style';
import SigninAPI from '../../domain/Backend/Signin';
import ApiClient from '../../utils/ApiClient';

function SessionContinue(props) {
  const { t } = useTranslation();

  const {
    api,
    token,
    onTokenExpired,
  } = props;

  // state
  const [isProcesssing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const requestSession = async (extend) => {
    setIsProcessing(true);
    let response;
    try {
      response = await SigninAPI.requestSession(api, token, extend);
    } catch (e) {
      setIsProcessing(false);
      if (e.message === 'tokenExpired') {
        onTokenExpired();
      } else {
        setErrorMessage(e.message);
      }
      return;
    }

    setIsProcessing(false);

    if (response && response.result === 'ok') {
      window.location = '/';
    } else {
      setErrorMessage('unknown response');
    }
  };

  return (
    <>
      <Guidance>{t('pages:signin.sessionContinue.heading')}</Guidance>
      <p>{t('pages:signin.sessionContinue.question')}</p>
      <p>{t('pages:signin.sessionContinue.hint')}</p>
      {errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>}
      <CenteredButtonWrapper>
        <Button type="button" onClick={() => { requestSession(true); }} disabled={isProcesssing}>
          {t('pages:signin.sessionContinue.yes')}
        </Button>
      </CenteredButtonWrapper>
      <CenteredButtonWrapper>
        <Button type="button" onClick={() => { requestSession(false); }} disabled={isProcesssing}>
          {t('pages:signin.sessionContinue.no')}
        </Button>
      </CenteredButtonWrapper>
    </>
  );
}

SessionContinue.propTypes = {
  api: PropTypes.instanceOf(ApiClient).isRequired,
  token: PropTypes.string.isRequired,
  onTokenExpired: PropTypes.func.isRequired,
};

export default SessionContinue;
