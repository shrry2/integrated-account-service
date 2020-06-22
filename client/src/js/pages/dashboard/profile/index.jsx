import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';

import {
  Switch,
  Route,
  useRouteMatch,
} from 'react-router-dom';

import {
  PageTitle,
  Card,
} from '../style';

import {
  CircleImage,
} from './style';

import EditLink from '../components/EditLink';

import DisplayName from './DisplayName';
import ProfilePicture from './ProfilePicture';

function Profile({ account, onUpdated }) {
  const { t } = useTranslation();
  const T = (key, data) => t(`pages:dashboard.profile.${key}`, data);
  const { path, url } = useRouteMatch();

  let profilePicture = t('common:NotSet');
  if (account.profilePicture) {
    profilePicture = <CircleImage src={account.profilePicture} alt={t('common:profilePicture')} />;
  }

  return (
    <>
      <PageTitle>{T('title')}</PageTitle>
      <Switch>
        <Route exact path={path}>
          <Card>
            <EditLink to={`${url}/display-name`} />
            <dl>
              <dd>{t('common:displayName')}</dd>
              <dt>{account.displayName}</dt>
            </dl>
          </Card>
          <Card>
            <EditLink to={`${url}/profile-picture`} />
            <dl>
              <dd>{t('common:profilePicture')}</dd>
              <dt>{profilePicture}</dt>
            </dl>
          </Card>
        </Route>
        <Route path={`${path}/display-name`}>
          <DisplayName
            currentDisplayName={account.displayName}
            timezone={account.settings.timezone}
            onUpdated={onUpdated}
          />
        </Route>
        <Route path={`${path}/profile-picture`}>
          <ProfilePicture
            currentProfilePicture={account.profilePicture}
            onUpdated={onUpdated}
          />
        </Route>
      </Switch>
    </>
  );
}

Profile.propTypes = {
  account: PropTypes.shape({
    displayName: PropTypes.string,
    profilePicture: PropTypes.string,
    settings: PropTypes.shape({
      timezone: PropTypes.string,
    }),
  }).isRequired,
  onUpdated: PropTypes.func.isRequired,
};

Profile.defaultProps = {
};

export default Profile;
