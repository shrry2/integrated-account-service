import React, { useState } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import styled, { css } from 'styled-components';

import theme from '../../../../../shared/global/theme';

const Wrapper = styled.div`
  position: relative;
  margin-top: .8rem;
`;

const padding = 18; // px

const mixinToppedLabel = css`
  background: #fff;
  font-size: .95rem;
  letter-spacing: .03rem;
  top: -.55rem;
  left: ${padding}px;
  padding: 0 5px;
`;

const Input = styled.input`
  -webkit-appearance: none; // remove upper shadow on ios browsers
  box-sizing: border-box;
  width: 100%;
  
  padding: ${padding}px ${padding * 1.2}px;
  
  outline: none;
  border: 2px solid #888;
  border-radius: 5px;
  
  transition: all .1s;
  letter-spacing: .04rem;
  
  &:hover,
  &:active {
    border-color: #666;
    
    & + label {
      color: #666;
    }
  }
  
  &:focus {
    border-color: ${theme.form.input};
  }
  
  &.focused + label {
    ${mixinToppedLabel};
    color: ${theme.form.input};
  }

  &.filled + label {
    ${mixinToppedLabel};
    color: #000;
  }
`;

const Label = styled.label`
  transition: all .3s;
  
  position: absolute;
  top: ${padding + 2}px;
  left: ${padding * 1.2}px;

  color: #888;
  cursor: text;
  letter-spacing: .04rem;
`;

const ErrorMessage = styled.div`
  &:before {
    content: "⚠️";
    margin-right: .5rem;
  }
  
  color: red;
  padding: .2rem .5rem;
`;

function LabeledInput(props) {
  const {
    id: givenId,
    value,
    type,
    autoComplete,
    name,
    required,
    label,
    tabIndex,
    innerRef,
    onChange,
    onBlur,
    onFocus,
    errorMessage,
  } = props;

  // set unique id if not provided
  let id;
  if (typeof givenId !== 'string' || givenId.length === 0) {
    id = `li-${Math.random().toString(32).substring(2)}`;
  } else {
    id = givenId;
  }

  const [focused, setFocused] = useState(false);

  const className = classNames({
    focused,
    filled: (!focused && value.length > 0),
  });

  function handleFocus(e) {
    onFocus(e);
    setFocused(true);
  }

  function handleBlur(e) {
    onBlur(e);
    setFocused(false);
  }

  return (
    <Wrapper>
      <Input
        type={type}
        name={name}
        autoComplete={autoComplete}
        id={id}
        required={required}
        aria-label={label}
        aria-required={required}
        tabIndex={tabIndex}
        ref={innerRef}
        value={value}
        onChange={onChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        className={className}
      />
      <Label htmlFor={id}>{label}</Label>
      { typeof errorMessage === 'string'
        && <ErrorMessage>{errorMessage}</ErrorMessage> }
    </Wrapper>
  );
}

LabeledInput.propTypes = {
  id: PropTypes.string,
  name: PropTypes.string.isRequired,
  type: PropTypes.oneOf(['text', 'search', 'tel', 'email', 'password', 'datetime', 'date', 'month', 'month', 'week']),
  autoComplete: PropTypes.oneOf((['on', 'off'])),
  onChange: PropTypes.func,
  label: PropTypes.string.isRequired,
  required: PropTypes.bool,
  tabIndex: PropTypes.number,
  innerRef: PropTypes.object,
  value: PropTypes.string,
  onFocus: PropTypes.func,
  onBlur: PropTypes.func,
  errorMessage: PropTypes.string,
};

LabeledInput.defaultProps = {
  id: null,
  type: 'text',
  autoComplete: 'off',
  onChange: () => {},
  required: false,
  tabIndex: null,
  innerRef: null,
  value: '',
  onFocus: () => {},
  onBlur: () => {},
  errorMessage: null,
};

export default LabeledInput;
