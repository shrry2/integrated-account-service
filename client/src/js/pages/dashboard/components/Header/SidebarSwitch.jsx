import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

const Button = styled.button`
  background-color: transparent;
  border: none;
  cursor: pointer;
  outline: none;
  padding: 0;
  appearance: none;
  
  width: ${(props) => props.sizePx};
  height: ${(props) => props.sizePx};

  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const Inner = styled.div`
  width: ${(props) => props.innerSizePx};
  height: ${(props) => props.innerSizePx};
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
`;

const Square = styled.span`
  display: inline-block;
  width: ${(props) => props.squareSizePx};
  height: ${(props) => props.squareSizePx};
  background: transparent;
  box-sizing: border-box;
  border: 2px solid #fff;
  border-radius: 3px;
  margin-bottom: ${(props) => (props.bottomMarginPx ? props.bottomMarginPx : '0px')};
`;

function SidebarSwitch(props) {
  const { size, onClick } = props;

  const sizePx = `${size}px`;

  const margin = 2;
  const marginPx = `${margin}px`;

  const innerSize = size - margin * 2;
  const innerSizePx = `${innerSize}px`;

  const squareSize = innerSize / 2 - margin;
  const squareSizePx = `${squareSize}px`;

  return (
    <Button type="button" onClick={onClick} sizePx={sizePx}>
      <Inner innerSizePx={innerSizePx}>
        <Square squareSizePx={squareSizePx} bottomMarginPx={marginPx} />
        <Square squareSizePx={squareSizePx} bottomMarginPx={marginPx} />
        <Square squareSizePx={squareSizePx} />
        <Square squareSizePx={squareSizePx} />
      </Inner>
    </Button>
  );
}

SidebarSwitch.propTypes = {
  size: PropTypes.number,
  onClick: PropTypes.func.isRequired,
};

SidebarSwitch.defaultProps = {
  size: 40,
};

export default SidebarSwitch;
