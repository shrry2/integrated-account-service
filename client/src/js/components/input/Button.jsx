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

  padding: ${({ size }) => (size === 'small' ? '.3rem .5rem' : '.6rem 1rem')};
  box-sizing: border-box;
  width: ${({ fullWidth }) => (fullWidth ? '100%' : 'auto')};

  border: 1px solid ${({ buttonTheme }) => buttonTheme.border};
  border-radius: 4px;
  background: ${({ buttonTheme }) => buttonTheme.bg};

  color: ${({ buttonTheme }) => buttonTheme.text};

  transition-duration: .1s;
  
  text-transform: ${({ capitalize }) => (capitalize ? 'capitalize' : 'none')};

  &:hover {
    cursor: pointer;
    color: ${({ buttonTheme }) => buttonTheme.hoverText};
    background: ${({ buttonTheme }) => buttonTheme.hoverBg};
    border-color: ${({ buttonTheme }) => buttonTheme.hoverBorder};
  }

  &:active,
  &:focus {
    color: ${({ buttonTheme }) => buttonTheme.hoverText};
    box-shadow: 0 0 0 3px ${({ shadowColor }) => shadowColor};
    background: ${({ buttonTheme }) => buttonTheme.hoverBg};
    border-color: ${({ buttonTheme }) => buttonTheme.hoverBorder};
  }
  
  &:disabled {
    cursor: not-allowed;
    color: #fff;
    background: #ccc;
    border-color: #ccc;
  }
`;

const ButtonInner = styled.span`
  display: inline-flex;
  justify-content: center;
  align-items: center;
  
  /* for icons */
  svg {
    margin: 0 .2rem;
  }
`;

function Button({
  children,
  theme: themeCode,
  size,
  capitalize,
  ...restProps
}) {
  let buttonTheme;
  try {
    buttonTheme = theme.form.button[themeCode];
  } catch (e) {
    buttonTheme = theme.form.button.default;
  }

  const shadowColor = lighten(0.1, buttonTheme.border);

  return (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <StyledButton
      buttonTheme={buttonTheme}
      shadowColor={shadowColor}
      size={size}
      capitalize={capitalize}
      /* eslint-disable-next-line react/jsx-props-no-spreading */
      {...restProps}
    >
      <ButtonInner>
        {children}
      </ButtonInner>
    </StyledButton>
  );
}

Button.propTypes = {
  children: PropTypes.node,
  theme: PropTypes.string,
  size: PropTypes.oneOf(['normal', 'small']),
  capitalize: PropTypes.bool,
};

Button.defaultProps = {
  children: 'OK',
  theme: 'default',
  size: 'normal',
  capitalize: false,
};

export default Button;
