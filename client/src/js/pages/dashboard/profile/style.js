import styled from 'styled-components';
import media from 'styled-media-query';
import { Link } from 'react-router-dom';
import { lighten } from 'polished';

import theme from '../../../../../../shared/global/theme';

export const SectionTitle = styled.h2`
  margin: 0;
  box-sizing: border-box;
  padding: 1rem .5rem 0;
  color: #fff;
  font-size: 1.4rem;

  display: flex;
  align-items: center;
  font-weight: 200;
  
  ${media.greaterThan('medium')`
    color: #333;
  `}
`;

export const SectionSubTitle = styled.h3`
  margin: 0;
  box-sizing: border-box;
  padding: 1rem .5rem 0;
  color: #fff;
  font-size: 1.2rem;

  display: flex;
  align-items: center;
  font-weight: 200;
  
  ${media.greaterThan('medium')`
    color: #333;
  `}
`;

export const SectionBody = styled.div`
  margin-top: .5rem;
`;

export const History = styled.ul`
  margin: -2rem;
  padding: 0;
  list-style-type: none;
`;

export const HistoryItem = styled.li`
  display: flex;
  width: 100%;
  box-sizing: border-box;
  padding: .7rem 1rem;
  border-bottom: 1px solid #ccc;
  
  justify-content: space-between;
  align-items: center;
  
  &:first-of-type {
    border-top-left-radius: 20px;
    border-top-right-radius: 20px;
  }
  
  &:last-of-type {
    border-bottom-left-radius: 20px;
    border-bottom-right-radius: 20px;
    border-bottom: 0;
  }
  
  button {
    opacity: 0;
  }
  
  &:hover,
  &:focus {
    background: #efefef;
    button {
      opacity: 1;
    }
  }

  .date {
    display: block;
    color: #888;
    font-size: .8rem;
    margin-bottom: .4rem;
  }
`;

export const HistoryDeleteButton = styled.button`
  display: inline-flex;
  border-radius: 50%;
  width: 35px;
  height: 35px;
  padding: 0;
  background: #efefef;

  font-size: 1.3rem;
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
    color: #fff;
    background: #333;
  }

  &:active,
  &:focus {
    color: #fff;
    background: #333;
    box-shadow: 0 0 0 2px ${lighten(0.2, '#333')}
  }
`;

export const ButtonContainer = styled.div`
  margin-top: 1rem;
  text-align: right;
`;

export const buttonColors = theme.form.button.default;

export const CircleLink = styled(Link)`
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

export const ReturnCircleLink = styled(CircleLink)`
  display: inline-flex;
  position: static;
  margin-right: .5rem;
  color: #fff;
  font-size: inherit;
  
  ${media.greaterThan('medium')`
    color: #333;
  `}
`;

export const ErrorMessage = styled.div`
  background: #e8383d;
  color: #fff;
  padding: 1rem;
  border-radius: 5px;
  margin: 1rem 0;
  text-align: left;
`;

export const HelpText = styled.p`
  margin: 1rem 0;
  font-size: .8rem;
  color: #fff;
  text-align: center;
  
  ${media.greaterThan('medium')`
    color: #333;
  `}
`;

export const CircleImage = styled.img`
  width: 100%;
  height: auto;
  max-width: 300px;
  display: block;
  margin: 0 auto;
  border-radius: 50%;
`;
