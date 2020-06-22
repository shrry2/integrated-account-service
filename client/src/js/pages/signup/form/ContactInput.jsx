import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

import { useTranslation } from 'react-i18next';

import LabeledInput from '../../../components/input/LabeledInput';
import RightAlign from '../../../layouts/RightAlign';
import LinklikeButton from '../../../components/input/LinklikeButton';

import { Guidance } from '../style';

const ContactToggleButton = styled(LinklikeButton)`
  margin-top: .2rem;
`;

function ContactInput(props) {
  const { t } = useTranslation();

  const {
    emailValue,
    emailError,
    mobilePhoneValue,
    mobilePhoneError,
    withEmail,
    toggleContact,
    onChange,
    onBlur,
    onFocus,
  } = props;

  // autofocus on contact mode change
  const emailInput = useRef(null);
  const mobilePhoneInput = useRef(null);

  const isFirstRun = useRef(true);

  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }

    if (withEmail) {
      // switch to email input
      emailInput.current.focus();
    } else {
      // switch to mobile number input
      mobilePhoneInput.current.focus();
    }
  }, [withEmail]);

  if (withEmail) {
    return (
      <>
        <Guidance>{t('pages:signup.form.contactHeading')}</Guidance>
        <LabeledInput
          name="email"
          label={t('pages:signup.labels.email')}
          value={emailValue}
          errorMessage={emailError}
          onChange={onChange}
          onBlur={onBlur}
          style={{ marginTop: '2rem' }}
          innerRef={emailInput}
          onFocus={onFocus}
        />
        <RightAlign>
          <ContactToggleButton
            type="button"
            onClick={(e) => {
              e.preventDefault();
              toggleContact();
            }}
          >
            {t('pages:signup.form.switchToMobilePhone')}
          </ContactToggleButton>
        </RightAlign>
      </>
    );
  }

  return (
    <>
      <Guidance>{t('pages:signup.form.contactHeading')}</Guidance>
      <LabeledInput
        name="mobilePhone"
        label={t('pages:signup.labels.mobilePhone')}
        value={mobilePhoneValue}
        hint={t('pages:signup.form.mobilePhoneHint')}
        errorMessage={mobilePhoneError}
        onChange={onChange}
        onBlur={onBlur}
        style={{ marginTop: '2rem' }}
        innerRef={mobilePhoneInput}
        onFocus={onFocus}
      />
      <RightAlign>
        <ContactToggleButton
          type="button"
          onClick={(e) => {
            e.preventDefault();
            toggleContact();
          }}
        >
          {t('pages:signup.form.switchToEmail')}
        </ContactToggleButton>
      </RightAlign>
    </>
  );
}

ContactInput.propTypes = {
  emailValue: PropTypes.string.isRequired,
  emailError: PropTypes.string,
  mobilePhoneValue: PropTypes.string.isRequired,
  mobilePhoneError: PropTypes.string,
  withEmail: PropTypes.bool,
  toggleContact: PropTypes.func,
  onChange: PropTypes.func.isRequired,
  onBlur: PropTypes.func.isRequired,
  onFocus: PropTypes.func,
};

ContactInput.defaultProps = {
  emailError: '',
  mobilePhoneError: '',
  withEmail: false,
  toggleContact: () => {},
  onFocus: () => {},
};

export default ContactInput;
