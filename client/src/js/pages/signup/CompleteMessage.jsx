import React from 'react';
import PropTypes from 'prop-types';

import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import Button from '../../components/form/Button';

import {
  Guidance,
  BottomContainer,
} from './style';

function CompletedMessage(props) {
  const { t, i18n } = useTranslation();

  const {
    email,
    tryAgain,
  } = props;

  return (
    <>
      <Guidance>{t('pages:signup.completed.heading')}</Guidance>
      📫
      {email}
      <BottomContainer>
        <Button type="button" onClick={tryAgain} theme="gloomy">{t('pages:signup.labels.back')}</Button>
      </BottomContainer>
    </>
  );
}

CompletedMessage.propTypes = {
  email: PropTypes.string,
  tryAgain: PropTypes.func,
};

CompletedMessage.defaultProps = {
  email: '',
  tryAgain: () => {},
};

export default CompletedMessage;
