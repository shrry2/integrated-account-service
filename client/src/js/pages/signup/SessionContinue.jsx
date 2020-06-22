import React from 'react';
import PropTypes from 'prop-types';

import { useTranslation } from 'react-i18next';

import Button from '../../components/input/Button';

import {
  Guidance,
  CenteredButtonWrapper,
  ErrorMessage,
} from './style';

function SessionContinue(props) {
  const { t } = useTranslation();

  const {
    onContinueSession,
    apiError,
  } = props;

  return (
    <>
      <Guidance>{t('pages:signup.sessionContinue.heading')}</Guidance>
      <p>{t('pages:signup.sessionContinue.question')}</p>
      <p>{t('pages:signup.sessionContinue.hint')}</p>
      {!apiError && (
        <>
          <CenteredButtonWrapper>
            <Button type="button" onClick={() => { onContinueSession(true); }}>
              {t('pages:signup.sessionContinue.yes')}
            </Button>
          </CenteredButtonWrapper>
          <CenteredButtonWrapper>
            <Button type="button" onClick={() => { onContinueSession(false); }}>
              {t('pages:signup.sessionContinue.no')}
            </Button>
          </CenteredButtonWrapper>
        </>
      )}
      {apiError && (
        <>
          <ErrorMessage>{apiError}</ErrorMessage>
          <CenteredButtonWrapper>
            <a href="/signin">
              {t('pages:signup.sessionContinue.signin')}
            </a>
          </CenteredButtonWrapper>
        </>
      )}
    </>
  );
}

SessionContinue.propTypes = {
  onContinueSession: PropTypes.func.isRequired,
  apiError: PropTypes.string,
};

SessionContinue.defaultProps = {
  apiError: null,
};

export default SessionContinue;
