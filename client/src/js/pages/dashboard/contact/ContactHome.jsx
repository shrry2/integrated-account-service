import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import {
  FaAngleRight,
} from 'react-icons/fa';

import {
  Link,
  useRouteMatch,
} from 'react-router-dom';

import {
  PageTitle,
} from '../style';

import {
  Card,
  CardInner,
  CardTitle,
  ContactList,
  Label,
} from './style';

import {
  fetchEmails,
  fetchPhones,
} from '../../../domain/Backend/Contact';

import EmailDetailModal from './EmailDetailModal';

function ContactHome() {
  const { t } = useTranslation();
  const T = (key, data) => t(`pages:dashboard.contact.${key}`, data);
  const { url } = useRouteMatch();

  const [emails, setEmails] = useState(t('common:loading'));
  const [phones, setPhones] = useState(t('common:loading'));

  const [modal, setModal] = useState(null);
  const [targetItem, setTargetItem] = useState(null);

  const loadEmails = async () => {
    try {
      const response = await fetchEmails();
      if (Array.isArray(response)) {
        setEmails(response);
      }
    } catch (e) {
      setEmails(t('common:loadFailed'));
    }
  };

  const loadPhones = async () => {
    try {
      const response = await fetchPhones();
      if (Array.isArray(response)) {
        setPhones(response);
      }
    } catch (e) {
      setPhones(t('common:loadFailed'));
    }
  };

  const onClickEmail = (email) => {
    setTargetItem(email);
    setModal('email');
  };

  const onRequestModalClose = () => {
    setModal(null);
    setTargetItem(null);
  };

  useEffect(() => {
    loadEmails();
    loadPhones();
  }, []);

  return (
    <>
      <PageTitle>{T('title')}</PageTitle>
      <p>{T('description')}</p>
      <Card>
        <CardInner>
          <CardTitle>{T('email.title')}</CardTitle>
          <ContactList>
            {typeof emails === 'string' && <li>{emails}</li>}
            {Array.isArray((emails)) && emails.length === 0 && (
              <li>
                {t('common:NotSet')}
              </li>
            )}
            {Array.isArray((emails)) && emails.length > 0 && emails.map((email) => (
              <li key={email.email}>
                <button type="button" onClick={() => onClickEmail(email.email)}>
                  <div>
                    {email.email}
                    {email.isPrimary && <Label>{t('common:primary')}</Label>}
                  </div>
                  <FaAngleRight />
                </button>
              </li>
            ))}
          </ContactList>
          <EmailDetailModal
            onRequestClose={onRequestModalClose}
            targetEmail={targetItem}
            isOpen={modal === 'email'}
          />
          <Link to={`${url}/email/new`}>Add new</Link>
        </CardInner>
      </Card>

      <Card>
        <CardInner>
          <CardTitle>{T('phone.title')}</CardTitle>
          <ContactList>
            {typeof phones === 'string' && <li>{phones}</li>}
            {Array.isArray((phones)) && phones.length === 0 && (
              <li>
                {t('common:NotSet')}
              </li>
            )}
            {Array.isArray((phones)) && phones.length > 0 && phones.map((phone) => (
              <li key={phone.phoneNumber}>
                <button type="button">
                  <div>
                    {phone.phoneNumber}
                  </div>
                  <FaAngleRight />
                </button>
              </li>
            ))}
          </ContactList>
        </CardInner>
      </Card>
    </>
  );
}

export default ContactHome;
