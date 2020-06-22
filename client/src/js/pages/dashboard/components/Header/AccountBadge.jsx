import React from 'react';
import PropTypes from 'prop-types';
import { observer, inject } from 'mobx-react';
import { useTranslation } from 'react-i18next';

import styled from 'styled-components';

import CircleIcon from '../../../../components/CircleIcon';

const Badge = styled.button`
  background-color: #fff;
  border: none;
  cursor: pointer;
  outline: none;
  appearance: none;
  
  padding: 0;
  border-radius: 50%;
  
  width: ${(props) => props.sizePx};
  height: ${(props) => props.sizePx};
  
  &:hover {
    box-shadow: 0 0 0 3px #eee;
  }
  
  &:focus,
  &:active {
    box-shadow: 0 0 0 3px #53b84b;
  }
`;

const AccountBadge = inject('sessionStore')(observer((props) => {
  const { t } = useTranslation();
  const { onClick, size, sessionStore } = props;
  const sizePx = `${size}px`;

  const { currentAccount } = sessionStore;
  const profilePictureUrl = currentAccount.profilePictureImgix
    ? `${currentAccount.profilePictureImgix}?w=80` : currentAccount.profilePicture;

  return (
    <Badge sizePx={sizePx} onClick={onClick}>
      <CircleIcon
        size={size}
        src={profilePictureUrl}
        alt={t('pages:dashboard.accountMenu.profilePictureAlt')}
      />
    </Badge>
  );
}));

AccountBadge.propTypes = {
  size: PropTypes.number,
  onClick: PropTypes.func.isRequired,
};

AccountBadge.defaultProps = {
  size: 40,
};

export default AccountBadge;
