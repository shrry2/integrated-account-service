import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

const StyledButton = styled.button`
  display: inline-block;
  outline: none;

  font-size: 1rem;
  letter-spacing: .05rem;

  padding: .6rem 1.4rem;
  box-sizing: border-box;

  border: none;
  background: transparent;
  
  color: ${({ color }) => color};

  transition-duration: .1s;
  text-decoration: none;

  &:hover {
    cursor: pointer;
    text-decoration: underline;
  }

  &:active,
  &:focus {
    box-shadow: 0 0 0 3px ${({ color }) => color};
  }
  
  &:disabled {
    cursor: default;
    color: #333;
  }
`;

function LinkButton({ children, color, ...restProps }) {
  return (
    <StyledButton
      color={color}
      /* eslint-disable-next-line react/jsx-props-no-spreading */
      {...restProps}
    >
      {children}
    </StyledButton>
  );
}

LinkButton.propTypes = {
  children: PropTypes.node,
  color: PropTypes.string,
};

LinkButton.defaultProps = {
  children: 'OK',
  color: '#4e82bd',
};

export default LinkButton;
