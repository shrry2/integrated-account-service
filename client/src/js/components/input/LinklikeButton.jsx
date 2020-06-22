import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

const StyledButton = styled.button`
  background: none !important;
  color: #2671a6;
  cursor: pointer;
  outline: none;
  padding: .2rem .5rem;
  letter-spacing: .05rem;
  
  border: 3px solid transparent;
  border-radius: 3px;
  
  &:hover {
    text-decoration: underline;
  }
  
  &:active,
  &:focus {
    border-color: #279fdf;
  }
`;

function LinklikeButton(props) {
  const { children } = props;
  const buttonProps = { ...props };
  delete buttonProps.children;
  return (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <StyledButton
      /* eslint-disable-next-line react/jsx-props-no-spreading */
      {...buttonProps}
    >
      {children}
    </StyledButton>
  );
}

LinklikeButton.propTypes = {
  children: PropTypes.node,
};

LinklikeButton.defaultProps = {
  children: 'OK',
};

export default LinklikeButton;
