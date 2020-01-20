import React, { useState } from 'react';
import PropTypes from 'prop-types';

import { useTranslation } from 'react-i18next';

import validators from '../../../../../shared/validators';

import {
  Guidance,
  ErrorMessage,
  ModalButtonContainer,
  CheckboxWrapper,
  BottomWrapper,
} from './style';

import LabeledInput from '../../components/form/LabeledInput';
import Button from '../../components/form/Button';
import Checkbox from '../../components/form/Checkbox';
import Modal from '../../components/Modal';
import RightAlign from '../../layouts/RightAlign';

function BasicInformationForm(props) {
  const { t, i18n } = useTranslation();

  // props
  const {
    displayName: defaultDisplayName,
    email: defaultEmail,
    agreement: defaultAgreement,
    onFormCompleted,
  } = props;

  // states
  const [form, setForm] = useState({
    displayName: defaultDisplayName,
    email: defaultEmail,
    agreement: defaultAgreement,
  });
  const [errors, setErrors] = useState({
    general: null,
    displayName: null,
    email: null,
    agreement: null,
  });
  const [modal, setModal] = useState(null);
  const [generalError, setGeneralError] = useState(null);

  const updateField = (field, value) => {
    setForm({
      ...form,
      [field]: value,
    });
  };

  const setError = (field, errorMessage) => {
    setErrors({
      ...errors,
      [field]: errorMessage,
    });
  };

  const validate = (field, value) => {
    let errorMessage = null;
    setGeneralError(null);
    try {
      updateField(field, validators[field](value));
    } catch (error) {
      errorMessage = t(`validators:${error.message}`);
    }
    setError(field, errorMessage);

    return errorMessage || true;
  };

  const handleChange = (event) => {
    const { target } = event;
    const field = target.name;
    const value = target.type === 'checkbox' ? target.checked : target.value;

    updateField(field, value);
    if (errors[field] !== null) {
      validate(field, value);
    }
  };

  const handleBlur = (event) => {
    validate(event.target.name, event.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    // Run validation for all form fields
    let noError = true;
    const errorMessages = { ...errors };
    Object.keys(form).forEach((field) => {
      const validationResult = validate(field, form[field]);
      if (typeof validationResult === 'string') {
        noError = false;
        errorMessages[field] = validationResult;
      }
    });

    // Send information if there is no validation error
    if (noError) {
      onFormCompleted(form);
    } else {
      setGeneralError(`⚠️ ${t('pages:signup.form.generalError')}`);
      setErrors(errorMessages);
    }
  };

  return (
    <>
      <Guidance>{t('pages:signup.form.heading')}</Guidance>
      <form onSubmit={handleSubmit}>
        <LabeledInput
          name="displayName"
          label={t('pages:signup.labels.displayName')}
          value={form.displayName}
          errorMessage={errors.displayName}
          onChange={handleChange}
          onBlur={handleBlur}
        />
        <LabeledInput
          name="email"
          label={t('pages:signup.labels.email')}
          value={form.email}
          errorMessage={errors.email}
          onChange={handleChange}
          onBlur={handleBlur}
        />
        <Guidance>{t('pages:signup.form.pleaseAgree')}</Guidance>
        <ModalButtonContainer>
          <Button
            type="button"
            theme="blue"
            onClick={() => { setModal('tos'); }}
          >
            {t('pages:signup.labels.tos')}
          </Button>
          <Button
            type="button"
            theme="blue"
            onClick={() => { setModal('pp'); }}
          >
            {t('pages:signup.labels.pp')}
          </Button>
        </ModalButtonContainer>
        <Modal
          isOpen={modal === 'tos'}
          appElement="#signup-page-app"
          onRequestClose={() => { setModal(null); }}
          contentLabel={t('pages:signup.labels.tos')}
        >
          TERMS OF SERVICE
        </Modal>
        <Modal
          isOpen={modal === 'pp'}
          appElement="#signup-page-app"
          onRequestClose={() => { setModal(null); }}
          contentLabel={t('pages:signup.labels.pp')}
        >
          PRIVACY POLICY
        </Modal>
        <CheckboxWrapper>
          <Checkbox
            name="agreement"
            checked={form.agreement}
            errorMessage={errors.agreement}
            onChange={handleChange}
          >
            {t('pages:signup.form.agreement')}
          </Checkbox>
        </CheckboxWrapper>
        <BottomWrapper>
          { generalError && <ErrorMessage>{generalError}</ErrorMessage>}
          <RightAlign>
            <Button type="submit" theme="primary">{t('pages:signup.labels.next')}</Button>
          </RightAlign>
        </BottomWrapper>
      </form>
    </>
  );
}

BasicInformationForm.propTypes = {
  displayName: PropTypes.string,
  email: PropTypes.string,
  agreement: PropTypes.bool,
  onFormCompleted: PropTypes.func.isRequired,
};

BasicInformationForm.defaultProps = {
  displayName: '',
  email: '',
  agreement: false,
};

export default BasicInformationForm;
