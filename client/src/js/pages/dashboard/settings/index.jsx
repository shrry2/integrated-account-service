import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import Cookies from 'js-cookie';

import { toast } from 'react-toastify';

import {
  PageTitle,
  Card,
} from '../style';

import {
  ModalTitle,
  List,
  Item,
} from './style';
import EditButton from '../components/EditButton';

import ProcessingScreen from '../../../components/ProcessingScreen';

import Modal from '../../../components/Modal';

import locales from '../../../../../../shared/global/locales';

import {
  updateLocale,
  fetchTimezoneList,
  updateTimezone,
} from '../../../domain/Backend/Settings';

function Settings({ locale, timezone: defaultTimezone, reloadAccount }) {
  const { t, i18n } = useTranslation();
  const T = (key, data) => t(`pages:dashboard.settings.${key}`, data);

  // can be language or timezone
  const [modal, setModal] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [timezones, setTimezones] = useState([]);

  const getLocaleLabel = (localeCode) => {
    const currentLocale = locales.filter((loc) => loc.code === localeCode);
    if (Array.isArray(currentLocale) && currentLocale.length === 1) {
      return currentLocale[0].label;
    }
    return 'Unknown';
  };

  const [localeLabel, setLocaleLabel] = useState(getLocaleLabel(locale));
  const [timezone, setTimezone] = useState(defaultTimezone);

  const changeLanguage = async (localeCode) => {
    setIsProcessing(true);
    try {
      await updateLocale(localeCode);
      setLocaleLabel(getLocaleLabel(localeCode));
      await i18n.changeLanguage(localeCode);
      Cookies.set('locale', localeCode);
      setModal(null);
      toast.success(T('updated', { field: T('language.title') }));
    } catch (e) {
      toast.error(e.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const loadTimezoneList = async () => {
    try {
      const timezoneList = await fetchTimezoneList();
      setTimezones(timezoneList);
    } catch (e) {
      setTimezones([e.message]);
    }
  };

  useEffect(() => {
    loadTimezoneList();
  }, []);

  const changeTimezone = async (tz) => {
    setIsProcessing(true);
    try {
      await updateTimezone(tz);
      setModal(null);
      setTimezone(tz);
      await reloadAccount();
      toast.success(T('updated', { field: T('timezone.title') }));
    } catch (e) {
      toast.error(e.message);
    } finally {
      setIsProcessing(false);
    }
  };

  let timezoneItems;
  if (timezones.length === 1) {
    // show loading error
    timezoneItems = <li>{timezones[0]}</li>;
  } else {
    timezoneItems = timezones.map((tzName) => (
      <Item key={tzName}>
        <button type="button" onClick={() => changeTimezone(tzName)}>
          {tzName}
        </button>
      </Item>
    ));
  }

  return (
    <>
      <ProcessingScreen isActive={isProcessing} />
      <PageTitle>{T('title')}</PageTitle>
      <Card>
        <EditButton onClick={() => setModal('language')} />
        <dl>
          <dd>{T('language.title')}</dd>
          <dt>{localeLabel}</dt>
        </dl>
        <p className="helpText">{T('language.helpText')}</p>
      </Card>
      <Modal
        contentLabel=""
        onRequestClose={() => setModal(null)}
        isOpen={modal === 'language'}
        type="narrow"
      >
        <ModalTitle>{T('select', { field: T('language.title') })}</ModalTitle>
        <List>
          {locales.map((loc) => (
            <Item key={loc.code}>
              <button type="button" onClick={() => changeLanguage(loc.code)}>
                {loc.label}
              </button>
            </Item>
          ))}
        </List>
      </Modal>
      <Card>
        <EditButton onClick={() => setModal('timezone')} />
        <dl>
          <dd>{T('timezone.title')}</dd>
          <dt>{timezone}</dt>
        </dl>
        <p className="helpText">{T('timezone.helpText')}</p>
      </Card>
      <Modal
        contentLabel=""
        onRequestClose={() => setModal(null)}
        isOpen={modal === 'timezone'}
        type="narrow"
      >
        <ModalTitle>{T('select', { field: T('timezone.title') })}</ModalTitle>
        <List>
          {timezoneItems}
        </List>
      </Modal>
    </>
  );
}

Settings.propTypes = {
  locale: PropTypes.string,
  timezone: PropTypes.string,
  reloadAccount: PropTypes.func.isRequired,
};

Settings.defaultProps = {
  locale: null,
  timezone: null,
};

export default Settings;
