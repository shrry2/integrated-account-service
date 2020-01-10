import React from 'react';
import PropTypes from 'prop-types';
import ReactModal from 'react-modal';

import { useTranslation } from 'react-i18next';

function Modal(props) {
  const {
    isOpen,
    onRequestClose,
    contentLabel,
    children,
  } = props;

  ReactModal.setAppElement('#root');
  const { t, i18n } = useTranslation();

  return (
    <ReactModal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel={contentLabel}
      className="component-modal"
      overlayClassName="component-modal--overlay"
    >
      <header>
        <button
          type="button"
          className="component-modal--close-button"
          aria-label="{t('components:modal.closeButtonAriaLabel')}"
          onClick={onRequestClose}
        >
          &times;
        </button>
      </header>
      {children}
    </ReactModal>
  );
}

Modal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onRequestClose: PropTypes.func.isRequired,
  contentLabel: PropTypes.string.isRequired,
  children: PropTypes.node,
};

Modal.defaultProps = {
  children: null,
};

export default Modal;
