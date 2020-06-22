import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

import LeftArrow from './LeftArrow';

const Header = styled.header`
  margin: 0;
  padding: 0;
  display: flex;
  justify-content: space-between;
`;

const Title = styled.h2`
  font-size: 1rem;
  margin: 0;
  text-align: center;
  font-weight: 600;
  box-sizing: border-box;
  padding: 1rem 0;
`;

function MenuHeader({ title, onLeftArrowClick }) {
  return (
    <Header>
      <LeftArrow onClick={onLeftArrowClick} />
      <Title>{title}</Title>
      <div style={{ width: '50px' }} />
    </Header>
  );
}

MenuHeader.propTypes = {
  title: PropTypes.string,
  onLeftArrowClick: PropTypes.func.isRequired,
};

MenuHeader.defaultProps = {
  title: '',
};

export default MenuHeader;
