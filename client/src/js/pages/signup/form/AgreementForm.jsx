import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

import { useTranslation } from 'react-i18next';

import {
  CheckboxWrapper,
  Guidance,
  ModalButtonContainer,
} from '../style';

import Modal from '../../../components/Modal';
import Button from '../../../components/input/Button';
import Checkbox from '../../../components/input/Checkbox';

function AgreementForm(props) {
  const { t } = useTranslation();

  const [modal, setModal] = useState(null);
  const [modalOpens, setModalOpens] = useState({
    tos: false,
    pp: false,
  });

  const {
    agreement,
    agreementError,
    handleChange: parentHandleChange,
    setErrorMessage,
  } = props;

  // if already agreed (not a initial page load)
  // avoid resetting check status
  useEffect(() => {
    if (agreement) {
      setModalOpens({
        tos: true,
        pp: true,
      });
    }
  }, []);

  const getRemainingStatements = () => {
    const remaining = [];
    if (!modalOpens.tos) {
      remaining.push(t('pages:signup.labels.tos'));
    }
    if (!modalOpens.pp) {
      remaining.push(t('pages:signup.labels.pp'));
    }
    return remaining.join(t('common:andWithSpace'));
  };

  const checkModalOpen = (onModalClosing = false) => {
    if (!modalOpens.tos || !modalOpens.pp) {
      const remaining = getRemainingStatements();
      if (!onModalClosing || agreementError) {
        setErrorMessage(t('pages:signup.form.checkTermsWarning', { remaining }));
      }
      return false;
    }

    setErrorMessage(null);
    return true;
  };

  const openModal = (which) => {
    setModalOpens({
      ...modalOpens,
      [which]: true,
    });
    setModal(which);
  };

  const closeModal = () => {
    setModal(null);
    checkModalOpen(true);
  };

  const handleChange = (e) => {
    if (!checkModalOpen()) {
      return;
    }
    parentHandleChange(e);
  };

  return (
    <>
      <Guidance>{t('pages:signup.form.pleaseAgree')}</Guidance>
      <ModalButtonContainer>
        <Button
          type="button"
          theme="blue"
          onClick={() => { openModal('tos'); }}
        >
          {t('pages:signup.labels.tos')}
        </Button>
        <Button
          type="button"
          theme="blue"
          onClick={() => { openModal('pp'); }}
        >
          {t('pages:signup.labels.pp')}
        </Button>
      </ModalButtonContainer>
      <CheckboxWrapper>
        <Checkbox
          name="agreement"
          checked={agreement}
          errorMessage={agreementError}
          onChange={handleChange}
        >
          {t('pages:signup.form.agreement')}
        </Checkbox>
      </CheckboxWrapper>
      <Modal
        isOpen={modal === 'tos'}
        onRequestClose={() => { closeModal(); }}
        contentLabel={t('pages:signup.labels.tos')}
      >
        // TODO: Implement terms view
        TERMS OF SERVICE
      </Modal>
      <Modal
        isOpen={modal === 'pp'}
        onRequestClose={() => { closeModal(); }}
        contentLabel={t('pages:signup.labels.pp')}
      >
        // TODO: Implement privacy policy view
        PRIVACY POLICY
      </Modal>
    </>
  );
}

AgreementForm.propTypes = {
  agreement: PropTypes.bool.isRequired,
  agreementError: PropTypes.string,
  handleChange: PropTypes.func,
  setErrorMessage: PropTypes.func.isRequired,
};

AgreementForm.defaultProps = {
  agreementError: null,
  handleChange: () => {},
};

export default AgreementForm;
