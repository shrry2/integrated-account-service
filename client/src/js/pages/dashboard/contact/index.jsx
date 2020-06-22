import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import {
  Switch,
  Route,
  useRouteMatch,
} from 'react-router-dom';

import ContactHome from './ContactHome';

function Contact() {
  const { t } = useTranslation();
  const T = (key, data) => t(`pages:dashboard.contact.${key}`, data);
  const { path, url } = useRouteMatch();

  return (
    <Switch>
      <Route exact path={path}>
        <ContactHome />
      </Route>
      <Route path={`${path}/email/new`}>
        <h1>add new email</h1>
      </Route>
      <Route path={`${path}/phone/new`}>
        <h1>add new phone</h1>
      </Route>
    </Switch>
  );
}

export default Contact;
