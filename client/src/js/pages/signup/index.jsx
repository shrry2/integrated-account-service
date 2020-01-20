import React, { Suspense, useState } from 'react';
import ReactDOM from 'react-dom';

import '../../utils/i18n';
import { useTranslation } from 'react-i18next';

import { ErrorBoundary } from '../../components/error';
import LoadingLanguage from '../../components/LoadingLanguage';

import BasicInformationForm from './BasicInformationForm';
import ConfirmationForm from './ConfirmationForm';
import CompletedMessage from './CompletedMessage';

import ApiClient from '../../utils/ApiClient';

import {
  View,
  Heading,
} from './style';

function SignupComponent() {
  const { t } = useTranslation();

  // states
  const [stage, setStage] = useState(1);
  const [displayName, setDisplayName] = useState('TestMan');
  const [email, setEmail] = useState('test@test.com');
  const [agreement, setAgreement] = useState(false);

  /**
   * set user input values (already validated)
   */
  const receiveBasicInformation = (userInput) => {
    setDisplayName(userInput.displayName);
    setEmail(userInput.email);
    setAgreement(userInput.agreement);
    setStage(2);
  };

  /**
   * communicate with server
   */
  const sendSignupRequest = async () => {
    const api = new ApiClient();

    const result = await api.post('/signup/_/request_setup_email', {
      displayName,
      email,
    });

    console.log(result);

    if (result) {
      setStage(3);
    } else {
      setStage(99);
    }
  };

  /**
   * navigate to the first stage
   */
  const handleTryAgain = () => {
    setStage(1);
  };

  return (
    <View>
      <Heading>{t('pages:signup:title')}</Heading>
      {(() => {
        switch (stage) {
          case 1:
            return (
              <BasicInformationForm
                displayName={displayName}
                email={email}
                agreement={agreement}
                onFormCompleted={receiveBasicInformation}
              />
            );
          case 2:
            return (
              <ConfirmationForm
                displayName={displayName}
                email={email}
                goBack={() => { setStage(1); }}
                onConfirmed={sendSignupRequest}
              />
            );
          case 3:
            return (
              <CompletedMessage
                email={email}
                tryAgain={handleTryAgain}
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
