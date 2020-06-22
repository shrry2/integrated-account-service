import React from 'react';
import styled from 'styled-components';

const ErrorMessage = styled.div`
  max-width: 380px;
  margin: 0 auto;
  background: #e8383d;
  color: #fff;
  padding: 1rem;
  border-radius: 5px;
  margin-bottom: .5rem;
`;

const BlueScreen = () => (
  <ErrorMessage>
    We are sorry, but something went wrong while preparing this component.
  </ErrorMessage>
);

export default BlueScreen;
