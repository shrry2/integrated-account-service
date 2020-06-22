import styled from 'styled-components';
import media from 'styled-media-query';

export const ContentWrapper = styled.div`
  width: 100%;
  max-width: 1024px;
  margin: 60px auto 0;
`;

export const Side = styled.aside`
  width: 100%;
  height: auto;
  
  ${media.greaterThan('medium')`
    width: 20%;
    display: inline-block;
    vertical-align: top;
    box-sizing: border-box;
    padding: 2rem .5rem 0;
  `}
`;

export const Main = styled.main`
  width: 100%;
  display: inline-block;
  vertical-align: top;
  box-sizing: border-box;
  padding: 0 1rem;
  
  padding-bottom: 1rem;
  
  ${media.greaterThan('medium')`
    width: 80%;
    padding: 0 4rem 1rem;
  `}
`;

export const PageTitle = styled.h1`
  margin: 0;
  box-sizing: border-box;
  padding: 2rem .5rem 0;
  color: #fff;
  font-weight: 200;
  
  ${media.greaterThan('medium')`
    font-size: 2.4rem;
    color: #333;
  `}
`;

export const Card = styled.section`
  position: relative;
  background: #fff;
  box-sizing: border-box;
  padding: 2rem;
  border-radius: 20px;
  color: #333;

  max-width: 600px;
  margin: 1.5rem auto 0;

  ${media.greaterThan('medium')`
    border: 1px solid #ccc;
  `}

  dd {
    font-size: 1.2rem;
    margin: 0;
    padding: 0 0 1rem;
    letter-spacing: .06rem;
    text-transform: capitalize;
  }

  dt {
    text-align: center;
    font-size: 1.2rem;
    img {
      width: 300px;
      height: auto;
      max-width: 100%;
    }
  }

  .helpText {
    display: block;
    color: #333;
    font-size: .8rem;
    margin-top: 1.5rem;
    text-align: center;
  }
`;
