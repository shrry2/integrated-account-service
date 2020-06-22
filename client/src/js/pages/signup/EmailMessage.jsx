import React, { useState } from 'react';
import PropTypes from 'prop-types';

import { useTranslation } from 'react-i18next';

import Button from '../../components/input/Button';
import Modal from '../../components/Modal';

import {
  Guidance,
  MailBoxWrapper,
  CenteredButtonWrapper,
} from './style';

function EmailMessage(props) {
  const { t } = useTranslation();
  const [modal, setModal] = useState(null);

  const {
    email,
    tryAgain,
  } = props;

  return (
    <>
      <Guidance>{t('pages:signup.emailMessage.heading')}</Guidance>
      <MailBoxWrapper>
        <span role="img" aria-label="Cute Mailbox">📫</span>
      </MailBoxWrapper>
      <p>{t('pages:signup.emailMessage.mainGuidance', { email })}</p>
      <CenteredButtonWrapper>
        <Button type="button" onClick={() => setModal('noReceive')} theme="gloomy">
          {t('pages:signup.labels.noReceive')}
        </Button>
      </CenteredButtonWrapper>
      <Modal
        isOpen={modal === 'noReceive'}
        onRequestClose={() => { setModal(null); }}
        contentLabel={t('pages:signup.labels.noReceive')}
      >
        <Guidance>{t('pages:signup.emailMessage.notReceiving')}</Guidance>
        {t('pages:signup.emailMessage.notReceivingGuidance')}
        <CenteredButtonWrapper>
          <Button type="button" onClick={tryAgain} theme="gloomy">
            {t('pages:signup.labels.tryAgain')}
          </Button>
        </CenteredButtonWrapper>
      </Modal>
    </>
  );
}

EmailMessage.propTypes = {
  email: PropTypes.string,
  tryAgain: PropTypes.func,
};

EmailMessage.defaultProps = {
  email: '',
  tryAgain: () => {},
};

export default EmailMessage;
