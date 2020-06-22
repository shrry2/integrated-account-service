import styled from 'styled-components';
import media from 'styled-media-query';

import theme from '../../../../../../../../shared/global/theme';

export const CloseButton = styled.button`
  display: block;
  text-decoration: none;
  padding: 1.2rem 0;
  text-align: center;
  color: #fff;
  
  border: none;
  cursor: pointer;
  outline: none;
  appearance: none;
  width: 100%;
  background: transparent;
  
  font-weight: 200;
  letter-spacing: .08rem;
  font-size: 1.3rem;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
  
  &:active,
  &:focus {
    background: rgba(255, 255, 255, 0.1);
    outline: 2px solid #2671a6;
  }
  
  ${media.greaterThan('450px')`
    display: none;
  `}
`;

export const MenuWrapper = styled.nav`
    position: fixed;
    top: 0;
    left: 0;
    text-align: left;
    z-index: 6000;
    color: #fff;
    font-weight: bolder;
    
    background: #43b937;
    background: linear-gradient(to bottom, #43b937, #39b367);
    
    min-height: 100%;
    
    width: 100%;
    ${media.greaterThan('450px')`
      width: 400px;
      top: 65px;
      left: auto;
      right: 1.5%;
      border-radius: 5px;
      box-shadow: 0 0 4px 1px #eee;
      min-height: auto;
    `}
`;

export const MenuContent = styled.div`
  box-sizing: border-box;
  padding: .5rem 1rem;
`;

export const MenuSection = styled.section`
  border-top: 1px solid #eee;
  box-sizing: border-box;
  text-align: center;
  padding: 1rem;
`;

export const CurrentAccount = styled.div`
  padding: 2rem 1rem;
  display: flex;
  align-items: center;
  align-content: center;
  
  .leftPane {
    box-sizing: border-box;
    width: 25%;
  }
  
  .rightPane {
    box-sizing: border-box;
    width: 75%;
    padding-left: 1rem;
    
    h2 {
      font-weight: 400;
      font-size: 1.2rem;
      margin: 0;
    }
    
    .buttonContainer {
      margin-top: 1rem;
      //display: flex;
      //justify-content: space-around;
    }
  }
`;

export const ConfirmationButtonContainer = styled.div`
  margin-bottom: 1rem;
  text-align: center;
`;

export const OtherAccountsList = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;
`;

export const OtherAccountsListItem = styled.li`
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  border-top: 1px solid #eee;
  cursor: pointer;
  outline: none;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
  
  &:focus,
  &:active {
    box-shadow: 0 0 0 3px ${theme.base.focus};
  }
`;

export const OtherAccountCard = styled.div`
  padding: 1rem;
  display: flex;
  justify-content: space-around;
  box-sizing: border-box;
  align-items: center;
`;

export const OtherAccountCardIcon = styled.div`
  width: 20%;
`;

export const OtherAccountCardName = styled.div`
  width: 60%;
  text-align: left;
`;

export const OtherAccountCardSign = styled.div`
  width: 20%;
  text-align: right;
  font-size: 1.2rem;
`;

export const OtherAccountControl = styled.div`
  padding: 0 1rem 1rem;
  display: flex;
  justify-content: space-around;
`;
