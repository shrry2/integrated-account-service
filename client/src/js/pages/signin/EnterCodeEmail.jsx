import React, { useState } from 'react';
import PropTypes from 'prop-types';

import { useTranslation } from 'react-i18next';

import ApiClient from '../../utils/ApiClient';

import Button from '../../components/input/Button';
import CodeInput from '../../components/input/CodeInput';

import SigninAPI from '../../domain/Backend/Signin';

import {
  Guidance,
  MailBoxWrapper,
  CenteredButtonWrapper,
  SuccessMessage,
  ErrorMessage,
} from '../signup/style';

function EnterCodeEmail(props) {
  const { t } = useTranslation();

  const [code, setCode] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [apiMessage, setAPIMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [emailSent, setEmailSent] = useState(false);

  const {
    api,
    token,
    onEmailVerified,
    onTokenExpired,
    updateToken,
  } = props;

  const sendEmail = async () => {
    setAPIMessage(null);
    setErrorMessage(null);
    setIsProcessing(true);
    let response;
    try {
      response = await SigninAPI.sendEmail(api, token);
      setEmailSent(true);
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

    console.log(response);

    if (response && response.result === 'ok') {
      updateToken(response.token);
      setAPIMessage(t('pages:signin.enterCodeEmail.emailSent'));
    } else {
      setErrorMessage('unknown api response');
    }
  };

  const handleCodeChange = async (value) => {
    setAPIMessage(null);
    setCode(value);
    setErrorMessage(null);
    if (value.length >= 6) {
      setIsProcessing(true);
      let response;
      try {
        response = await SigninAPI.verifyEmail(api, token, value);
      } catch (e) {
        if (e.message === 'tokenExpired') {
          onTokenExpired();
        } else {
          setErrorMessage(e.message);
        }
        setCode('');
      }

      setIsProcessing(false);

      if (response && response.result === 'ok') {
        onEmailVerified(response.token);
      }
    }
  };

  const sendEmailAgain = async () => {

  };

  /**
   *
   *
   * WhAT TO DO NEXT
   * * implement code input
   * * implement code verification
   *
   */

  if (!emailSent) {
    return (
      <>
        <Guidance>{t('pages:signin.enterCodeEmail.headingBeforeSend')}</Guidance>
        <p>{t('pages:signin.enterCodeEmail.guidanceBeforeSend')}</p>
        {apiMessage && <SuccessMessage>{apiMessage}</SuccessMessage>}
        {errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>}
        <CenteredButtonWrapper>
          <Button type="button" onClick={sendEmail} theme="primary" disabled={isProcessing}>
            {t('pages:signin.enterCodeEmail.send')}
          </Button>
        </CenteredButtonWrapper>
      </>
    );
  }
  return (
    <>
      <Guidance>{t('pages:signin.enterCodeEmail.heading')}</Guidance>
      <MailBoxWrapper>
        <span role="img" aria-label="Cute Mailbox">📫</span>
      </MailBoxWrapper>
      <p>{t('pages:signin.enterCodeEmail.guidance')}</p>
      <CodeInput
        value={code}
        disabled={isProcessing}
        onChange={handleCodeChange}
      />
      {apiMessage && <SuccessMessage>{apiMessage}</SuccessMessage>}
      {errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>}
      <CenteredButtonWrapper>
        <Button type="button" onClick={sendEmail} theme="gloomy" disabled={isProcessing}>
          {t('pages:signin.enterCodeEmail.resend')}
        </Button>
      </CenteredButtonWrapper>
    </>
  );
}

EnterCodeEmail.propTypes = {
  api: PropTypes.instanceOf(ApiClient).isRequired,
  token: PropTypes.string.isRequired,
  onEmailVerified: PropTypes.func.isRequired,
  onTokenExpired: PropTypes.func.isRequired,
  updateToken: PropTypes.func.isRequired,
};

export default EnterCodeEmail;
