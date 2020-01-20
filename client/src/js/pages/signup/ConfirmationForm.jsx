import React from 'react';
import PropTypes from 'prop-types';

import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import Button from '../../components/form/Button';

import {
  Guidance,
  BottomContainer,
} from './style';

const EmailWrapper = styled.div`
  margin: 3rem 0;
  text-align: center;
  font-weight: 400;
  font-size: 1.5rem;
  
  &:before {
    content: "✉️";
    margin-right: .5rem;
  }
`;

function ConfirmationForm(props) {
  const { t, i18n } = useTranslation();

  const {
    displayName,
    email,
    goBack,
    onConfirmed,
  } = props;

  return (
    <>
      <Guidance>{t('pages:signup.confirmation.heading', { name: displayName })}</Guidance>
      <EmailWrapper>{email}</EmailWrapper>
      <BottomContainer>
        <Button type="button" onClick={goBack} theme="gloomy">{t('pages:signup.labels.back')}</Button>
        <Button type="button" onClick={onConfirmed} theme="primary">{t('pages:signup.labels.confirmed')}</Button>
      </BottomContainer>
    </>
  );
}

ConfirmationForm.propTypes = {
  displayName: PropTypes.string,
  email: PropTypes.string,
  goBack: PropTypes.func,
  onConfirmed: PropTypes.func,
};

ConfirmationForm.defaultProps = {
  displayName: '',
  email: '',
  goBack: () => {},
  onConfirmed: () => {},
};

export default ConfirmationForm;
