import styled from 'styled-components';
import { Card as DefaultCard } from '../style';

export const Card = styled(DefaultCard)`
  padding: 0;
`;

export const CardInner = styled.div`
  padding: 2rem;
`;

export const CardTitle = styled.h2`
  font-size: 1.2rem;
  margin: 0;
  padding: 0 0 1rem;
  font-weight: normal;
  letter-spacing: .06rem;
  text-transform: capitalize;
`;

export const ContactList = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;
  
  li {
    width: 100%;
    margin: .8rem 0;
  }
  
  button {
    display: flex;
    width: 100%;
    padding: 1.5rem 1rem;
    border: 1px solid #ccc;
    border-radius: 10px;
    text-transform: none;
    cursor: pointer;
    text-align: left;
    
    justify-content: space-between;
    align-items: center;
    
    svg {
      font-size: 1.4rem;
      color: #888;
    }
    
    &:hover,
    &:focus {
      border-color: #888;
      background: #f8f8f8;
      
      svg {
        color: #333;
      }
    }
  }
`;

export const Label = styled.span`
  font-size: .7rem;
  margin-left: .5rem;
  padding: .2rem .5rem;
  background: #333;
  color: #fff;
  border-radius: 2px;
`;
