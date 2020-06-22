import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';

function ProcessingLoader({ message }) {
  const { t } = useTranslation();

  const theMessage = message === null ? t('components:ProcessingLoader.defaultMessage') : message;

  return (
    <div className="loading-message">
      <div className="loader" />
      {theMessage}
    </div>
  );
}

ProcessingLoader.propTypes = {
  message: PropTypes.string,
};

ProcessingLoader.defaultProps = {
  message: null,
};

export default ProcessingLoader;
