import React from 'react';
import styled from 'styled-components';
import media from 'styled-media-query';
import { useTranslation } from 'react-i18next';
import { inject, observer } from 'mobx-react';
import { Link } from 'react-router-dom';

import theme from '../../../../../shared/global/theme';

import pages from './pages';

const Title = styled.h1`
  font-weight: 400;
  text-align: center;
  font-size: 1.3rem;
  margin-top: 2rem;
  
  ${media.greaterThan('small')`
    font-size: 1.6rem;
  `}
`;

const Guidance = styled.p`
  text-align: center;
  font-size: 1rem;
  
  ${media.greaterThan('small')`
    font-size: 1.1rem;
  `}
`;

const CardContainer = styled.div`
  margin-top: 1rem;
`;

const Card = styled.div`
  box-sizing: border-box;
  border-radius: 10px;
  margin-top: 1rem;
  background: #fff;
  color: #333;
  
  display: inline-block;
  vertical-align: top;
  
  width: 100%;
  
  ${media.greaterThan('small')`
    width: 45%;
    margin-left: 2.5%;
    margin-right: 2.5%;
  `}
  
  ${media.greaterThan('medium')`
    border: 1px solid #888;
    border-radius: 5px;
  `}
  
  h2 {
    box-sizing: border-box;
    font-weight: 400;
    font-size: 1.4rem;
    margin: 0;
    padding: 1rem 1rem 0;
    
    display: flex;
    align-items: center;

    svg {
      margin-right: .5rem;
    }
  }
  
  p {
    box-sizing: border-box;
    margin: 0;
    padding: 1rem;
    font-size: .9rem;
    color: #333;
  }
  
  a {
    box-sizing: border-box;
    display: block;
    width: 100%;
    margin: 0;
    padding: 1rem;
    border-top: 1px solid #888;
    text-decoration: none;
    color: ${theme.colors.link};
    
    border-bottom-left-radius: 5px;
    border-bottom-right-radius: 5px;
    
    &:hover {
      background: #f5f5f5;
    }
    
    &:active {
      background: #f0f0f0;
    }
  }
`;

const Home = inject('sessionStore')(observer((props) => {
  const { t } = useTranslation();
  const T = (key, data) => t(`pages:dashboard.home.${key}`, data);

  const { currentAccount } = props.sessionStore;

  return (
    <>
      <Title>
        {T('welcome', {
          userName: currentAccount.displayName,
        })}
      </Title>
      <Guidance>{T('guidance')}</Guidance>
      <CardContainer>
        {pages.map((page) => {
          if (page.key === 'home') {
            return null;
          }
          return (
            <Card key={page.key}>
              <h2>
                {page.icon}
                {t(`pages:dashboard.pages.${page.key}.title`)}
              </h2>
              <p>{t(`pages:dashboard.pages.${page.key}.description`)}</p>
              <Link to={page.path}>{t(`pages:dashboard.pages.${page.key}.link`)}</Link>
            </Card>
          );
        })}
      </CardContainer>
    </>
  );
}));

Home.propTypes = {
};

Home.defaultProps = {
};

export default Home;
