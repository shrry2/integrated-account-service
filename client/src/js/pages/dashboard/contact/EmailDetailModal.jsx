import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';

import {
  Switch,
  Route,
  useRouteMatch,
} from 'react-router-dom';

import Modal from '../../../components/Modal';

function EmailDetailModal({ targetEmail, onRequestClose, isOpen }) {
  const { t } = useTranslation();
  const T = (key, data) => t(`pages:dashboard.contact.email.${key}`, data);
  const { path, url } = useRouteMatch();

  return (
    <Modal
      contentLabel={T('modalLabel')}
      onRequestClose={onRequestClose}
      isOpen={isOpen}
    >
      {targetEmail}
    </Modal>
  );
}

EmailDetailModal.propTypes = {
  targetEmail: PropTypes.string,
  onRequestClose: PropTypes.func.isRequired,
  isOpen: PropTypes.bool.isRequired,
};

EmailDetailModal.defaultProps = {
  targetEmail: null,
};

export default EmailDetailModal;
