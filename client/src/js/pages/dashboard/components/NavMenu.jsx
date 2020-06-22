import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';

import styled from 'styled-components';
import media from 'styled-media-query';
import Media from 'react-media';

import { Link, useLocation } from 'react-router-dom';

import { FaTimes } from 'react-icons/fa';

import pages from '../pages';

const Wrapper = styled.nav`
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
  
  display: ${({ isOpen }) => (isOpen ? 'block' : 'none')};

  ${media.greaterThan('medium')`
    position: static;
    display: inline-block;
    width: 100%;
    min-height: auto;
    background: transparent;
  `}
`;

const MenuItem = styled.li`
  width: 100%;
  margin: 0;
  padding: 0;
  
  ${media.greaterThan('medium')`
    margin-top: .5rem;
    
    &:first-of-type {
      margin-top: 0;
    }
  `}

  a,
  button {
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
    
    ${media.greaterThan('medium')`
      font-size: 1rem;
      color: #333;
      border-radius: 40px;
      background: #fff;
      padding: .9rem .5rem;
      font-weight: 400;
      outline: none;
      
      &:hover {
        background: #efefef;
      }
      
      &:active,
      &:focus {
        outline: none;
        background: #eee;
      }
      
      &:focus {
        box-shadow: 0 0 0 3px #9ee691;
      }
    `}
  }
  
  &.active {
    a,
    button {
      ${media.greaterThan('medium')`
        background: #43b937;
          background: linear-gradient(to bottom, #43b937, #39b367);
          color: #fff;
      `}
    }
  }
`;

const MenuList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
`;

function NavMenu({ isOpen, setIsOpen }) {
  const { t } = useTranslation();
  const location = useLocation();

  const close = () => setIsOpen(false);

  // close menu on every route change
  useEffect(() => {
    close();
  }, [location]);

  /**
   * Close account switcher on esc key press
   */
  const handleKeyPress = (e) => {
    if (e.keyCode === 27 && isOpen) {
      close();
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, []);

  return (
    <Wrapper isOpen={isOpen}>
      <MenuList>
        <Media
          query="(max-width: 768px)"
          render={() => (
            <MenuItem>
              <button type="button" onClick={close}>
                <FaTimes />
              </button>
            </MenuItem>
          )}
        />
        {pages.map((page) => {
          let className = location.pathname.startsWith(page.path) ? 'active' : '';
          if (page.key === 'home' && location.pathname !== '/') {
            className = '';
          }
          return (
            <MenuItem key={page.key} className={className}>
              <Link to={page.path}>{t(`pages:dashboard.pages.${page.key}.title`)}</Link>
            </MenuItem>
          );
        })}
      </MenuList>
    </Wrapper>
  );
}

NavMenu.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  setIsOpen: PropTypes.func.isRequired,
};

export default NavMenu;
