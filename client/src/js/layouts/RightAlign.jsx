import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

const Wrapper = styled.div`
  text-align: right;
`;

function RightAlign(props) {
  const { children } = props;

  return (
    <Wrapper>
      {children}
    </Wrapper>
  );
}

RightAlign.propTypes = {
  children: PropTypes.node,
};

RightAlign.defaultProps = {
  children: null,
};

export default RightAlign;
