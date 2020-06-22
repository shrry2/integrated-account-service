import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

import { useTranslation } from 'react-i18next';

import LabeledInput from '../../../components/input/LabeledInput';
import { Guidance } from '../style';

function DisiplayNameInput(props) {
  const { t } = useTranslation();

  const {
    value,
    onChange,
    errorMessage,
    onBlur,
    onFocus,
  } = props;

  // ref for focusing input on initial mount
  const displayNameInput = useRef(null);
  useEffect(() => {
    displayNameInput.current.focus();
  }, []);

  return (
    <>
      <Guidance>{t('pages:signup.form.displayNameHeading')}</Guidance>
      <LabeledInput
        name="displayName"
        label={t('pages:signup.labels.displayName')}
        value={value}
        hint={t('pages:signup.form.displayNameHint')}
        errorMessage={errorMessage}
        onChange={onChange}
        onBlur={onBlur}
        onFocus={onFocus}
        innerRef={displayNameInput}
      />
    </>
  );
}

DisiplayNameInput.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  errorMessage: PropTypes.string,
  onBlur: PropTypes.func.isRequired,
  onFocus: PropTypes.func,
};

DisiplayNameInput.defaultProps = {
  errorMessage: null,
  onFocus: () => {},
};

export default DisiplayNameInput;
