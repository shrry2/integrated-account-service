import React from 'react';
import styled from 'styled-components';
import { lighten } from 'polished';

import { MdEdit } from 'react-icons/all';

import theme from '../../../../../../shared/global/theme';

const buttonColors = theme.form.button.default;

const CircleButton = styled.button`
  display: flex;
  position: absolute;
  top: 1rem;
  right: 3%;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  padding: 0;

  font-size: 1.6rem;
  border: none;
  color: #333;
  box-sizing: border-box;
  text-align: center;

  align-items: center;
  justify-content: center;
  
  transition-duration: .1s;
  outline: none;

  &:hover {
    cursor: pointer;
    color: ${buttonColors.hoverText};
    background: ${buttonColors.hoverBg};
    border-color: ${buttonColors.hoverBorder};
  }

  &:active,
  &:focus {
    color: ${buttonColors.hoverText};
    box-shadow: 0 0 0 3px ${lighten(0.1, buttonColors.border)}
    background: ${buttonColors.hoverBorder};
    border-color: ${buttonColors.hoverBorder};
  }
`;


const EditButton = (props) => (
  // eslint-disable-next-line react/jsx-props-no-spreading
  <CircleButton {...props}>
    <MdEdit />
  </CircleButton>
);

export default EditButton;
