import React from 'react';
import PropTypes from 'prop-types';
import { FaArrowLeft } from 'react-icons/all';

import { ReturnCircleLink } from '../profile/style';

const ReturnLink = ({ to }) => (
  <ReturnCircleLink to={to}>
    <FaArrowLeft />
  </ReturnCircleLink>
);

ReturnLink.propTypes = {
  to: PropTypes.string.isRequired,
};

export default ReturnLink;
