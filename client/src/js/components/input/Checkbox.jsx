import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';

const Input = styled.input`
  position: absolute; // take it out of document flow
  opacity: 0; // hide it

  & + label {
    position: relative;
    cursor: pointer;
    padding: 5px;
    font-size: 1.12rem;
    display: inline-block;
  }

  // Box.
  & + label:before {
    content: '';
    margin-right: 10px;
    display: inline-block;
    vertical-align: text-top;
    width: 20px;
    height: 20px;
    border-radius: 5px;
    background: #afafaf;
  }

  // Box hover
  &:hover + label{
    background: #eee;
    
    &:before {
      background: #00984f;
    }
  }
  
  // Box focus
  &:focus + label:before {
    box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.12);
  }

  // Box checked
  &:checked + label:before {
    background: #00984f;
  }
  
  // Disabled state label.
  &:disabled + label {
    color: #b8b8b8;
    cursor: auto;
  }

  // Disabled box.
  &:disabled + label:before {
    box-shadow: none;
    background: #ddd;
  }

  // Checkmark. Could be replaced with an image
  &:checked + label:after {
    content: '';
    position: absolute;
    left: 10px;
    top: 14px;
    background: white;
    width: 2px;
    height: 2px;
    box-shadow: 
      2px 0 0 white,
      4px 0 0 white,
      4px -2px 0 white,
      4px -4px 0 white,
      4px -6px 0 white,
      4px -8px 0 white;
    transform: rotate(45deg);
  }
`;

const ErrorMessage = styled.div`
  &:before {
    content: "⚠️";
    margin-right: .5rem;
  }
  
  color: red;
  padding: .2rem .5rem;
`;

function Checkbox(props) {
  const {
    id: domId,
    children,
    errorMessage,
  } = props;

  const checkboxProps = { ...props };
  delete checkboxProps.children;
  delete checkboxProps.type;

  return (
    <>
      {/* eslint-disable-next-line react/jsx-props-no-spreading */}
      <Input id={domId} type="checkbox" {...checkboxProps} />
      <label htmlFor={domId}>{children}</label>
      { typeof errorMessage === 'string'
      && <ErrorMessage>{errorMessage}</ErrorMessage> }
    </>
  );
}

Checkbox.propTypes = {
  id: PropTypes.string,
  children: PropTypes.node,
  errorMessage: PropTypes.string,
};

Checkbox.defaultProps = {
  id: `cb-${Math.random().toString(32).substring(2)}`,
  children: null,
  errorMessage: null,
};

export default Checkbox;
