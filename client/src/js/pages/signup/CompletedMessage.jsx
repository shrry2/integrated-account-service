import React from 'react';
import PropTypes from 'prop-types';

import { useTranslation } from 'react-i18next';

import Button from '../../components/form/Button';

import {
  Guidance,
  MailBoxWrapper,
  TryAgainButtonWrapper,
} from './style';

function CompletedMessage(props) {
  const { t, i18n } = useTranslation();

  const {
    email,
    tryAgain,
  } = props;

  return (
    <>
      <Guidance>{t('pages:signup.completed.heading')}</Guidance>
      <MailBoxWrapper>📫</MailBoxWrapper>
      {t('pages:signup.completed.mainGuidance', { email })}
      <Guidance>{t('pages:signup.completed.notReceiving')}</Guidance>
      {t('pages:signup.completed.notReceivingGuidance')}
      <TryAgainButtonWrapper>
        <Button type="button" onClick={tryAgain} theme="gloomy">
          {t('pages:signup.labels.tryAgain')}
        </Button>
      </TryAgainButtonWrapper>
    </>
  );
}

CompletedMessage.propTypes = {
  email: PropTypes.string,
  tryAgain: PropTypes.func,
};

CompletedMessage.defaultProps = {
  email: '',
  tryAgain: () => {},
};

export default CompletedMessage;
