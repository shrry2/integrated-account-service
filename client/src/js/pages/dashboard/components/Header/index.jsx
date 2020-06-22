import React, { useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import media from 'styled-media-query';
import Media from 'react-media';
import { Link } from 'react-router-dom';

import variables from '../../../../../../../shared/global/variables';

import SidebarSwitch from './SidebarSwitch';
import AccountBadge from './AccountBadge';
import AccountMenu from './AccountMenu';

const headerHeight = 60;
const headerHeightPx = `${headerHeight}px`;
const innerHeight = 40;

const Wrapper = styled.header`
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1000;
  width: 100%;
  height: ${headerHeightPx};
  margin: 0;
  padding: 0;
  color: #fff;
  box-shadow: 0 2px 3px rgba(0, 0 , 0, 0.2);
  background: #00c34d;
`;

const Inner = styled.div`
  width: 100%;
  height: ${headerHeightPx};
  box-sizing: border-box;
  padding: ${`${(headerHeight - innerHeight) / 2}px`} 2.5%;
  display: flex;
  justify-content: space-between;
`;

const Logo = styled(Link)`
  width: 40px;
  height: 100%;
  
  background-image: url("${`${variables.staticCDNImg}amid_logo.svg`}");
  background-repeat: no-repeat;
  
  ${media.greaterThan('medium')`
    width: 156.4px;
    background-image: url("${`${variables.staticCDNImg}amid_logotype.svg`}");
  `}
`;

const MenuOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100% !important;
  height: 100% !important;
  z-index: 5000;
  text-align: right;
  background: transparent;
`;

function Header(props) {
  const {
    onClickSidebarSwitch,
  } = props;

  const [isAccountMenuOpen, setAccountMenuOpen] = useState(false);

  /**
   * Close account switcher on esc key press
   */
  const handleKeyPress = (e) => {
    if (e.keyCode === 27) {
      // eslint-disable-next-line no-use-before-define
      closeAccountMenu();
    }
  };

  const openAccountMenu = () => {
    window.addEventListener('keydown', handleKeyPress);
    setAccountMenuOpen(true);
  };

  const closeAccountMenu = () => {
    window.removeEventListener('keydown', handleKeyPress);
    setAccountMenuOpen(false);
  };

  const switchAccountMenu = () => {
    if (isAccountMenuOpen) {
      closeAccountMenu();
    } else {
      openAccountMenu();
    }
  };

  return (
    <Wrapper>
      <Inner>
        <Media
          query="(max-width: 768px)"
          render={() => (
            <SidebarSwitch onClick={onClickSidebarSwitch} />
          )}
        />
        <Logo to="/" />
        <AccountBadge
          onClick={switchAccountMenu}
        />
        {isAccountMenuOpen && (
          <>
            <MenuOverlay onClick={switchAccountMenu} />
            <AccountMenu
              onClickCloseButton={switchAccountMenu}
            />
          </>
        )}
      </Inner>
    </Wrapper>
  );
}

Header.propTypes = {
  onClickSidebarSwitch: PropTypes.func.isRequired,
};

export default Header;
