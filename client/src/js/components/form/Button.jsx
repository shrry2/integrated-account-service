import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { lighten } from 'polished';

import theme from '../../../../../shared/global/theme';

const StyledButton = styled.button`
  display: inline-block;
  outline: none;

  font-size: 1rem;
  letter-spacing: .05rem;

  padding: .6rem 1.4rem;
  box-sizing: border-box;
  width: ${({ fullWidth }) => (fullWidth ? '100%' : 'auto')};

  border: 2px solid ${({ buttonTheme }) => buttonTheme.border};
  border-radius: 4px;
  background: ${({ buttonTheme }) => buttonTheme.bg};

  color: ${({ buttonTheme }) => buttonTheme.text};

  transition-duration: .1s;

  &:hover {
    color: ${({ buttonTheme }) => buttonTheme.hoverText};
    cursor: pointer;
    background: ${({ buttonTheme }) => buttonTheme.hoverBg};
  }

  &:active,
  &:focus {
    color: ${({ buttonTheme }) => buttonTheme.hoverText};
    box-shadow: 0 0 0 3px ${({ shadowColor }) => shadowColor};
    background: ${({ buttonTheme }) => buttonTheme.hoverBg};
  }
`;

function Button(props) {
  const { children, theme: themeCode } = props;
  const buttonProps = { ...props };
  delete buttonProps.children;

  let buttonTheme;
  try {
    buttonTheme = theme.form.button[themeCode];
  } catch (e) {
    buttonTheme = theme.form.button.default;
  }

  const shadowColor = lighten(0.1, buttonTheme.border);

  return (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <StyledButton buttonTheme={buttonTheme} shadowColor={shadowColor} {...buttonProps}>
      {children}
    </StyledButton>
  );
}

Button.propTypes = {
  children: PropTypes.node,
  theme: PropTypes.string,
};

Button.defaultProps = {
  children: 'OK',
  theme: 'default',
};

export default Button;
