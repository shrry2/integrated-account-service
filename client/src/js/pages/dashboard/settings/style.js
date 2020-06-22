import styled from 'styled-components';

export const ModalTitle = styled.h2`
  font-weight: 200;
  font-size: 1.4rem;
`;

export const List = styled.ul`
  width: 100%;
  margin: 0;
  padding: 0;
  margin-top: 1rem;
  list-style: none;
`;

export const Item = styled.li`
  width: 100%;
  margin: 0;
  padding: 0;
  border: 0;
  
  button {
    width: 100%;
    margin: 0;
    padding: 1.3rem 0;
    text-align: center;
    
    background: #fff;
    color: #333;
    border: 0;
    cursor: pointer;
    outline: none;

    &:hover,
    &:focus {
      background: #eee;
    }
    
    &:focus {
      box-shadow: #0575e6 0 0 3px;
    }
    
    &:active {
      background: #ddd;
    }
  }
`;
