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

function EnterCodePhone(props) {
  const { t } = useTranslation();

  const [code, setCode] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [apiMessage, setAPIMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [emailSent, setEmailSent] = useState(false);

  const {
    api,
    token,
    onPhoneVerified,
    onTokenExpired,
    updateToken,
  } = props;

  const sendSMS = async () => {
    setAPIMessage(null);
    setErrorMessage(null);
    setIsProcessing(true);
    let response;
    try {
      response = await SigninAPI.issuePhone(api, token);
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
        response = await SigninAPI.verifyPhone(api, token, value);
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
        onPhoneVerified(response.token);
      }
    }
  };

  if (!emailSent) {
    return (
      <>
        <Guidance>{t('pages:signin.enterCodePhone.headingBeforeSend')}</Guidance>
        <p>{t('pages:signin.enterCodePhone.guidanceBeforeSend')}</p>
        {apiMessage && <SuccessMessage>{apiMessage}</SuccessMessage>}
        {errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>}
        <CenteredButtonWrapper>
          <Button type="button" onClick={sendSMS} theme="primary" disabled={isProcessing}>
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
      <p>{t('pages:signin.enterCodePhone.guidance')}</p>
      <CodeInput
        value={code}
        disabled={isProcessing}
        onChange={handleCodeChange}
      />
      {apiMessage && <SuccessMessage>{apiMessage}</SuccessMessage>}
      {errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>}
      <CenteredButtonWrapper>
        <Button type="button" onClick={sendSMS} theme="gloomy" disabled={isProcessing}>
          {t('pages:signin.enterCodeEmail.resend')}
        </Button>
      </CenteredButtonWrapper>
    </>
  );
}

EnterCodePhone.propTypes = {
  api: PropTypes.instanceOf(ApiClient).isRequired,
  token: PropTypes.string.isRequired,
  onPhoneVerified: PropTypes.func.isRequired,
  onTokenExpired: PropTypes.func.isRequired,
  updateToken: PropTypes.func.isRequired,
};

export default EnterCodePhone;
