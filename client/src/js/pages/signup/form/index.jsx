import React, { useRef, useState } from 'react';
import PropTypes from 'prop-types';

import { useTranslation } from 'react-i18next';

import validators from '../../../../../../shared/validators';

import {
  ErrorMessage,
  BottomWrapper,
} from '../style';

import Button from '../../../components/input/Button';
import RightAlign from '../../../layouts/RightAlign';

import DisplayNameInput from './DisplayNameInput';
import ContactInput from './ContactInput';
import AgreementForm from './AgreementForm';

function Form(props) {
  const { t, i18n } = useTranslation();

  // props
  const {
    displayName: defaultDisplayName,
    email: defaultEmail,
    mobilePhone: defaultPhone,
    agreement: defaultAgreement,
    emailPreferred,
    onFormCompleted,
  } = props;

  // states
  const [form, setForm] = useState({
    displayName: defaultDisplayName,
    email: defaultEmail,
    mobilePhone: defaultPhone,
    agreement: defaultAgreement,
  });
  const [errors, setErrors] = useState({
    general: null,
    displayName: null,
    email: null,
    mobilePhone: null,
    agreement: null,
  });
  const [withEmail, setWithEmail] = useState(!!emailPreferred);
  const [generalError, setGeneralError] = useState(null);

  const skipNextValidation = useRef(false);

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
      if (field === 'mobilePhone') {
        // mobile phone number validator requires default country
        updateField(field, validators[field](value, i18n.language.slice(-2)));
      } else {
        updateField(field, validators[field](value));
      }
    } catch (error) {
      errorMessage = t(`validators:${error.message}`);
    }
    setError(field, errorMessage);

    return errorMessage || true;
  };

  const handleFocus = (e) => {
    skipNextValidation.current = false;
    if (e.target.value === '') {
      setError(e.target.name, null);
    }
  };

  const handleChange = (event) => {
    const { target } = event;
    const field = target.name;
    const value = target.type === 'checkbox' ? target.checked : target.value;

    updateField(field, value);
    if (value === '') {
      setError(field, null);
    } else if (errors[field] !== null) {
      validate(field, value);
    }
  };

  const handleBlur = (event) => {
    if (skipNextValidation.current) {
      skipNextValidation.current = false;
      return;
    }
    validate(event.target.name, event.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    // Run validation for all input fields
    let noError = true;
    const errorMessages = { ...errors };
    Object.keys(form).forEach((field) => {
      if (field === 'mobilePhone' && withEmail) return;
      if (field === 'email' && !withEmail) return;

      const validationResult = validate(field, form[field]);
      if (typeof validationResult === 'string') {
        noError = false;
        errorMessages[field] = validationResult;
      }
    });

    // Send information if there is no validation error
    if (noError) {
      onFormCompleted({
        ...form,
        withEmail, // add extra flag of contact type
      });
    } else {
      setGeneralError(`⚠️ ${t('pages:signup.form.generalError')}`);
      setErrors(errorMessages);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <DisplayNameInput
          value={form.displayName}
          errorMessage={errors.displayName}
          onChange={handleChange}
          onBlur={handleBlur}
          onFocus={handleFocus}
        />
        <ContactInput
          emailValue={form.email}
          emailError={errors.email}
          mobilePhoneValue={form.mobilePhone}
          mobilePhoneError={errors.mobilePhone}
          withEmail={withEmail}
          toggleContact={() => {
            skipNextValidation.current = true;
            setWithEmail(!withEmail);
          }}
          onChange={handleChange}
          onBlur={handleBlur}
          onFocus={handleFocus}
        />
        <AgreementForm
          agreement={form.agreement}
          agreementError={errors.agreement}
          handleChange={handleChange}
          setErrorMessage={(message) => { setError('agreement', message); }}
        />
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

Form.propTypes = {
  displayName: PropTypes.string,
  email: PropTypes.string,
  mobilePhone: PropTypes.string,
  agreement: PropTypes.bool,
  emailPreferred: PropTypes.bool,
  onFormCompleted: PropTypes.func.isRequired,
};

Form.defaultProps = {
  displayName: '',
  email: '',
  mobilePhone: '',
  emailPreferred: false,
  agreement: false,
};

export default Form;
