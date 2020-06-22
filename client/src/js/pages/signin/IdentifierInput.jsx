import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

import { useTranslation } from 'react-i18next';

import LabeledInput from '../../components/input/LabeledInput';

import { WideButton, BottomContainer, ErrorMessage } from '../signup/style';
import validators from '../../../../../shared/validators';
import SigninAPI from '../../domain/Backend/Signin';
import ApiClient from '../../utils/ApiClient';

const Wrapper = styled.div`
  margin-top: 2rem;
`;

function IdentifierInput(props) {
  const { t } = useTranslation();

  const {
    api,
    updateToken,
    defaultErrorMessage,
  } = props;

  // states
  const [identifier, setIdentifier] = useState('');
  const [inputType, setInputType] = useState('text');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  // refs
  const identifierInput = useRef(null);
  // ref for focusing input on initial mount
  useEffect(() => {
    identifierInput.current.focus();
  }, []);

  const runIdentifierValidation = (value) => {
    let error = null;
    try {
      validators.notEmpty(value);
    } catch (e) {
      error = t(`validators:${e.message}`);
    }
    return error;
  };

  const handleChangeIdentifier = (e) => {
    const { value } = e.target;
    setIdentifier(value);
    setErrorMessage(runIdentifierValidation(value));
    if (value.length >= 3 && value.slice(0, 3) === '...') {
      // hide sign-in code
      setInputType('password');
    } else {
      setInputType('text');
    }
  };

  const findAccount = async (event) => {
    event.preventDefault();
    setIsProcessing(true);
    setErrorMessage(null);

    const error = runIdentifierValidation(identifier);

    if (error) {
      setErrorMessage(error);
      identifierInput.current.focus();
      setIsProcessing(false);
    } else {
      let response;
      try {
        response = await SigninAPI.createToken(api, identifier);
      } catch (e) {
        setIsProcessing(false);
        setErrorMessage(e.message);
        return;
      }

      setIsProcessing(false);

      if (response && response.result === 'ok') {
        updateToken(response.token);
      } else {
        setErrorMessage('Unknown error occurred');
      }
    }
  };

  return (
    <Wrapper>
      <form onSubmit={findAccount}>
        <LabeledInput
          name="identifier"
          type={inputType}
          label={t('pages:signin.labels.identifier')}
          value={identifier}
          errorMessage={errorMessage}
          onChange={handleChangeIdentifier}
          innerRef={identifierInput}
          disabled={isProcessing}
        />
        <BottomContainer>
          <WideButton type="submit" theme="primary" disabled={isProcessing}>{t('pages:signin.labels.next')}</WideButton>
        </BottomContainer>
        {defaultErrorMessage && !errorMessage && (
          <BottomContainer>
            <ErrorMessage>{defaultErrorMessage}</ErrorMessage>
          </BottomContainer>
        )}
      </form>
    </Wrapper>
  );
}

IdentifierInput.propTypes = {
  api: PropTypes.instanceOf(ApiClient).isRequired,
  updateToken: PropTypes.func.isRequired,
  defaultErrorMessage: PropTypes.string,
};

IdentifierInput.defaultProps = {
  defaultErrorMessage: null,
};

export default IdentifierInput;
