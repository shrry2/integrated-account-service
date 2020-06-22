import React, { Suspense, useState, useEffect } from 'react';
import ReactDOM from 'react-dom';

import '../../utils/i18n';
import { useTranslation } from 'react-i18next';

import { ErrorBoundary } from '../../components/error';
import LoadingLanguage from '../../components/LoadingLanguage';

import Form from './form/index';
import Confirmation from './Confirmation';
import CodeVerification from './CodeVerification';
import EmailMessage from './EmailMessage';
import EmailVerified from './EmailVerified';
import SessionContinue from './SessionContinue';

import ApiClient from '../../utils/ApiClient';
import SignupAPI from '../../domain/Backend/Signup';

import validators from '../../../../../shared/validators';

import {
  View,
  Heading,
} from './style';

function SignupComponent() {
  const { t, i18n } = useTranslation();

  const api = new ApiClient();

  // states
  const [stage, setStage] = useState(1);
  const [displayName, setDisplayName] = useState('test');
  const [mobilePhone, setMobilePhone] = useState('080-3160-7532');
  const [email, setEmail] = useState('takaki.personal@gmail.com');
  const [agreement, setAgreement] = useState(true);
  const [withEmail, setWithEmail] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [apiMessage, setApiMessage] = useState(null);
  const [signupId, setSignupId] = useState('');
  const [verificationCode, setVerificationCode] = useState('');

  useEffect(() => {
    const pathArray = window.location.pathname.split('/');
    if (pathArray[2] && pathArray[2].toLowerCase() === 'verify') {
      setSignupId(pathArray[3]);
      setStage(32);
    }
  }, []);

  /**
   * set user input values (already validated)
   */
  const handleFormCompleted = (formData) => {
    setDisplayName(formData.displayName);
    setMobilePhone(formData.mobilePhone);
    setEmail(formData.email);
    setAgreement(formData.agreement);
    setWithEmail(formData.withEmail);
    setStage(2);
  };

  /**
   * communicate with server
   */
  const sendSignupRequest = async (navigate = true) => {
    setApiError(null);
    setIsProcessing(true);

    // make phone number international format (normalize it)
    let contact;
    if (withEmail) {
      contact = email;
    } else {
      try {
        contact = validators.formatPhoneNumber(mobilePhone, 'E.164', i18n.language.slice(-2));
      } catch (e) {
        setApiError(e.message);
      }
    }

    let response;
    try {
      response = await SignupAPI.createSignup(api, displayName, contact, withEmail);
    } catch (e) {
      response = false;
      setApiError(e.message);
    }
    setIsProcessing(false);

    if (response && response.result === 'ok') {
      setSignupId(response.data.id);
      if (navigate) {
        if (!withEmail) {
          setVerificationCode('');
          setStage(21);
        } else {
          setStage(31);
        }
      } else {
        return true;
      }
    } else {
      return false;
    }
  };

  /**
   * navigate to the first stage
   */
  const handleTryAgain = () => {
    setApiError(null);
    setStage(1);
  };

  const handleChangeVerificationCode = async (code) => {
    setVerificationCode(code);
    setApiMessage(null);
    setApiError(null);

    if (code.length >= 6) {
      setIsProcessing(true);
      let response;
      try {
        response = await SignupAPI.verifyCode(api, signupId, code);
      } catch (e) {
        response = false;
        setApiError(e.message);
      }

      setVerificationCode('');
      setIsProcessing(false);

      if (response && response.result === 'ok') {
        if (response.sessionContinue) {
          setStage(41);
        } else {
          window.location = '/signin';
        }
      }
    }
  };

  const handleResendCode = async () => {
    setApiMessage(null);
    const result = await sendSignupRequest(false);
    if (result) {
      setVerificationCode('');
      setApiMessage(t('pages:signup.codeVerification.resendSuccess'));
    }
  };

  const handleContinueSession = async (extend) => {
    setApiError(null);
    let response;
    try {
      response = await SignupAPI.continueSession(api, extend);
    } catch (e) {
      setApiError(e.message);
      return;
    }

    if (response && response.result === 'ok') {
      window.location = '/';
    } else {
      setApiError('Unknown response');
    }
  };

  const handleConfirmEmail = async () => {
    let response;
    try {
      const verificationKey = window.location.search.substring(5);
      response = await SignupAPI.verifyEmail(api, signupId, verificationKey);
    } catch (e) {
      setApiError(e.message);
    }

    if (response && response.result === 'ok') {
      if (response.sessionContinue) {
        setStage(41);
      } else {
        window.location = '/signin';
      }
    }
  };

  return (
    <View>
      <Heading>{t('pages:signup:title')}</Heading>
      {(() => {
        switch (stage) {
          case 1:
            return (
              <Form
                displayName={displayName}
                mobilePhone={mobilePhone}
                email={email}
                agreement={agreement}
                emailPreferred={withEmail}
                onFormCompleted={handleFormCompleted}
              />
            );
          case 2:
            return (
              <Confirmation
                displayName={displayName}
                contact={withEmail ? email : mobilePhone}
                withEmail={withEmail}
                goBack={() => { setStage(1); }}
                onConfirmed={sendSignupRequest}
                apiError={apiError}
                isProcessing={isProcessing}
              />
            );
          case 21:
            return (
              <CodeVerification
                phoneNumber={mobilePhone}
                verificationCode={verificationCode}
                onChangeVerificationCode={handleChangeVerificationCode}
                resendCode={handleResendCode}
                tryAgain={handleTryAgain}
                isProcessing={isProcessing}
                apiError={apiError}
                apiMessage={apiMessage}
              />
            );
          case 31:
            return (
              <EmailMessage
                email={email}
                tryAgain={handleTryAgain}
                apiError={apiError}
              />
            );
          case 32:
            return (
              <EmailVerified
                displayName={displayName}
                email={email}
                onConfirmed={handleConfirmEmail}
                apiError={apiError}
                isProcessing={isProcessing}
              />
            );
          case 41:
            return (
              <SessionContinue
                onContinueSession={handleContinueSession}
                apiError={apiError}
              />
            );
          case 99:
            return (
              <div>ERROR</div>
            );
          default:
            setStage(1);
            return null;
        }
      })()}
    </View>
  );
}

function SignUpPage() {
  return (
    <Suspense fallback={<LoadingLanguage />}>
      <ErrorBoundary>
        <SignupComponent />
      </ErrorBoundary>
    </Suspense>
  );
}

ReactDOM.render(<SignUpPage />, document.getElementById('root'));
