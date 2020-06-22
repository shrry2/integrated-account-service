import styled from 'styled-components';
import media from 'styled-media-query';

const RoundInput = styled.input`
  -webkit-appearance: none;
  box-sizing: border-box;
  width: 100%;
  padding: 1rem 25px;
  outline: none;
  background: #fff;
  border: none;
  border-radius: 30px;
  
  transition: all .1s;
  
  letter-spacing: .04rem;
  font-size: 1.05rem;
  
  ${media.greaterThan('medium')`
    border: 1px solid #2DA85F;
  `}
  
  &:hover,
  &:active {
    box-shadow: 0 0 1px 2px #efefef inset;
  }
  
  &:focus {
    box-shadow: 0 0 1px 2px #2DA85F;
  }
`;

export default RoundInput;
