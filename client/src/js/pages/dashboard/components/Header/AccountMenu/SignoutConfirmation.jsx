import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';

import {
  MenuContent,
  MenuWrapper,
  ConfirmationButtonContainer,
} from './style';

import MenuHeader from './MenuHeader';

import Button from './Button';
import ErrorScreen from './ErrorScreen';
import ProcessingScreen from './ProcessingScreen';

/**
 * @return {null}
 */
function SignoutConfirmation(props) {
  const { t } = useTranslation();
  const T = (key, data) => t(`pages:dashboard.signoutConfirmation.${key}`, data);

  const {
    from,
    goBack,
    sessionStore,
  } = props;

  if (sessionStore.currentAccount === null
    && (sessionStore.otherAccounts === null || sessionStore.otherAccounts.length <= 0)) {
    window.location = '/signin';
    return null;
  }

  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const handleSignout = async () => {
    setIsProcessing(true);
    setErrorMessage(null);
    let response;
    try {
      response = await sessionStore.signout(from);
    } catch (e) {
      setErrorMessage(e.message);
    }
    setIsProcessing(false);
    if (response && response.result === 'ok') {
      toast.info(T('done'));
      goBack();
    }
  };

  const closeErrorMessage = () => {
    setIsProcessing(false);
    setErrorMessage(null);
  };

  if (isProcessing) {
    return (
      <ProcessingScreen />
    );
  }

  if (errorMessage) {
    return (
      <ErrorScreen onClose={closeErrorMessage} message={errorMessage} />
    );
  }

  let confirmationMessage;
  if (from === 'current' || from === 'all') {
    confirmationMessage = T(`confirmation.${from}`, {
      displayName: sessionStore.currentAccount.displayName,
      count: sessionStore.otherAccounts.length + 1,
    });
  } else {
    const targetAccount = sessionStore.otherAccounts.find((account) => account.id === from);
    if (!targetAccount) {
      goBack();
    } else {
      confirmationMessage = T('confirmation.specific', {
        displayName: targetAccount.displayName,
      });
    }
  }

  return (
    <MenuWrapper>
      <MenuHeader
        title={T('title')}
        onLeftArrowClick={goBack}
      />
      <MenuContent>
        <p>{confirmationMessage}</p>
      </MenuContent>
      <ConfirmationButtonContainer>
        <Button onClick={handleSignout}>{T('yes')}</Button>
      </ConfirmationButtonContainer>
    </MenuWrapper>
  );
}

SignoutConfirmation.propTypes = {
  from: PropTypes.string.isRequired,
  goBack: PropTypes.func.isRequired,
  // eslint-disable-next-line react/forbid-prop-types
  sessionStore: PropTypes.object.isRequired,
};

export default SignoutConfirmation;
