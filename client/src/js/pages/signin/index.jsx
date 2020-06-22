import React, { Suspense, useState } from 'react';
import ReactDOM from 'react-dom';
import jwtDecode from 'jwt-decode';
import moment from 'moment';

import '../../utils/i18n';
import { useTranslation } from 'react-i18next';

import { ErrorBoundary } from '../../components/error';
import LoadingLanguage from '../../components/LoadingLanguage';
import IdentifierInput from './IdentifierInput';
import SessionContinue from './SessionContinue';

import ApiClient from '../../utils/ApiClient';

import { View, Heading } from '../signup/style';
import EnterCodeEmail from './EnterCodeEmail';
import EnterCodePhone from './EnterCodePhone';
import TokenExpireAlert from './TokenExpireAlert';

function SigninComponent() {
  const { t } = useTranslation();

  const api = new ApiClient();

  // states
  const [stage, setStage] = useState('identifier');
  const [token, setToken] = useState(null);
  const [tokenExpiresAt, setTokenExpiresAt] = useState(null);
  const [globalErrorMessage, setGlobalErrorMessage] = useState(null);

  const nextAuth = (factors) => {
    const getNextFactor = () => {
      let nextFactor = null;
      Object.keys(factors).forEach((factor) => {
        if (factors[factor] === null) {
          nextFactor = factor;
        }
      });
      return nextFactor;
    };

    const nextFactor = getNextFactor();

    console.log(nextFactor);
    if (nextFactor === null) {
      setStage('complete');
    } else {
      setStage(nextFactor);
    }
  };

  const updateToken = async (newToken) => {
    setGlobalErrorMessage(null);
    // decode token
    const decoded = jwtDecode(newToken);
    console.log('token updated');
    console.log(decoded);
    // set token expiry
    const expiresAt = moment.unix(decoded.exp).utc();
    setTokenExpiresAt(expiresAt);
    // set raw token
    setToken(newToken);
    nextAuth(decoded.auth);
  };

  const handleTokenExpired = async () => {
    setGlobalErrorMessage(t('pages:signin.errors.tokenExpired'));
    setStage('identifier');
    setToken(null);
  };

  return (
    <View>
      <Heading>{t('pages:signin.title')}</Heading>
      {(() => {
        switch (stage) {
          case 'identifier':
            return (
              <IdentifierInput
                api={api}
                updateToken={updateToken}
                defaultErrorMessage={globalErrorMessage}
              />
            );
          case 'email':
            return (
              <EnterCodeEmail
                api={api}
                token={token}
                updateToken={updateToken}
                onEmailVerified={updateToken}
                onTokenExpired={handleTokenExpired}
              />
            );
          case 'phone':
            return (
              <EnterCodePhone
                api={api}
                token={token}
                updateToken={updateToken}
                onPhoneVerified={updateToken}
                onTokenExpired={handleTokenExpired}
              />
            );
          case 'complete':
            return (
              <SessionContinue
                api={api}
                token={token}
                onTokenExpired={handleTokenExpired}
              />
            );
          default:
            setGlobalErrorMessage('Unknown stage code');
            setStage('identifier');
            return null;
        }
      })()}
      {token && (
        <TokenExpireAlert
          tokenExpiresAt={tokenExpiresAt}
          onTokenExpired={handleTokenExpired}
        />
      )}
    </View>
  );
}

function SigninPage() {
  return (
    <Suspense fallback={<LoadingLanguage />}>
      <ErrorBoundary>
        <SigninComponent />
      </ErrorBoundary>
    </Suspense>
  );
}

ReactDOM.render(<SigninPage />, document.getElementById('root'));
