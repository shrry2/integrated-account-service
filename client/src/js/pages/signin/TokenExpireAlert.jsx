import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';

import moment from 'moment';
import momentPropTypes from 'react-moment-proptypes';

import { WarningMessage } from '../signup/style';

/**
 * @return {null}
 */
function TokenExpireAlert(props) {
  const { t } = useTranslation();

  const {
    tokenExpiresAt,
    onTokenExpired,
  } = props;

  const [beforeOneMinute, setBeforeOneMinute] = useState(false);

  useEffect(() => {
    const now = moment.utc();
    const msToExpire = tokenExpiresAt.diff(now);
    const msToOneMinuteBefore = tokenExpiresAt.subtract(1, 'minutes').diff(now);

    // timer to expire token
    const tokenExpireTimer = setTimeout(() => {
      onTokenExpired();
    }, msToExpire);

    // timer to show alert 1 minute before token expires
    const oneMinutesBeforeAlertTimer = setTimeout(() => {
      setBeforeOneMinute(true);
    }, msToOneMinuteBefore);

    return () => {
      clearTimeout(oneMinutesBeforeAlertTimer);
      clearTimeout(tokenExpireTimer);
    };
  }, [tokenExpiresAt]);

  if (beforeOneMinute) {
    return (
      <WarningMessage>{t('pages:signin.tokenExpireAlert.oneMinuteWarning')}</WarningMessage>
    );
  }

  return null;
}

TokenExpireAlert.propTypes = {
  tokenExpiresAt: momentPropTypes.momentObj.isRequired,
  onTokenExpired: PropTypes.func.isRequired,
};

export default TokenExpireAlert;
