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
    type,
  } = props;

  ReactModal.setAppElement('#root');
  const { t } = useTranslation();

  let className = 'component-modal';
  switch (type) {
    case 'narrow':
      className += ' narrow';
      break;
    default:
      break;
  }

  return (
    <ReactModal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel={contentLabel}
      className={className}
      overlayClassName="component-modal--overlay"
    >
      <header>
        <button
          type="button"
          className="component-modal--close-button"
          aria-label={t('components:modal.closeButtonAriaLabel')}
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
  type: PropTypes.oneOf(['default', 'narrow']),
};

Modal.defaultProps = {
  children: null,
  type: 'default',
};

export default Modal;
