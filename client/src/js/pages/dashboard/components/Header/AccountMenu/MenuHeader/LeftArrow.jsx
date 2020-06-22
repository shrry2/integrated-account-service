import React from 'react';
import styled from 'styled-components';

import LinkButton from '../../../../../../components/input/LinkButton';

const CustomLinkButton = styled(LinkButton)`
  font-size: 1.8rem;
  color: #fff;
  width: 50px;
  padding: 0;
  text-align: center;
`;

function LeftArrow({ ...props }) {
  return (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <CustomLinkButton {...props}>&#8249;</CustomLinkButton>
  );
}

export default LeftArrow;
