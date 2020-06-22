import React from 'react';
import PropTypes from 'prop-types';
import { MdEdit } from 'react-icons/all';
import { CircleLink } from '../profile/style';

const EditLink = ({ to }) => (
  <CircleLink to={to}>
    <MdEdit />
  </CircleLink>
);

EditLink.propTypes = {
  to: PropTypes.string.isRequired,
};

export default EditLink;
