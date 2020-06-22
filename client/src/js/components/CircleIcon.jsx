import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

const Icon = styled.img`
  width: ${(props) => props.width};
  height: ${(props) => props.height};
  border-radius: 50%;
  
  margin: 0;
  padding: 0;
  
  box-shadow: 0 0 2px #eee;
  
  user-drag: none;
  user-select: none;
  background: #fff;
`;

function CircleIcon({ src, size, alt }) {
  let width = `${size}px`;
  let height = `${size}px`;

  if (size <= 0) {
    width = '100%';
    height = 'auto';
  }

  const imgSrc = src || 'https://static-cdn.stayt.co/amid/web/images/default_profile_image.png';

  return (
    <Icon width={width} height={height} alt={alt} src={imgSrc} />
  );
}

CircleIcon.propTypes = {
  src: PropTypes.string,
  size: PropTypes.number,
  alt: PropTypes.string,
};

CircleIcon.defaultProps = {
  src: null,
  size: 120,
  alt: 'icon',
};

export default CircleIcon;
