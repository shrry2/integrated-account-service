import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { observer, inject } from 'mobx-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';

import { useHistory } from 'react-router-dom';

import {
  GoTriangleDown,
  GoTriangleUp,
  AiOutlinePlusCircle,
  IoMdPower,
  FaTimes,
} from 'react-icons/all';

import {
  MenuWrapper,
  MenuSection,
  CurrentAccount,
  OtherAccountsList,
  OtherAccountsListItem,
  OtherAccountCard,
  OtherAccountCardIcon,
  OtherAccountCardName,
  OtherAccountCardSign,
  OtherAccountControl,
  CloseButton,
} from './style';

import Button from './Button';
import CircleIcon from '../../../../../components/CircleIcon';

import ErrorScreen from './ErrorScreen';
import ProcessingScreen from './ProcessingScreen';
import SignoutConfirmation from './SignoutConfirmation';

const AccountMenu = inject('sessionStore')(observer((props) => {
  const {
    sessionStore,
    onClickCloseButton,
  } = props;

  const {
    currentAccount,
    otherAccounts,
    switchAccount,
  } = sessionStore;

  const { t, i18n } = useTranslation();

  const [mode, setMode] = useState('accountSwitcher');
  const [selectedAccount, setSelectedAccount] = useState(null);

  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const history = useHistory();

  const handleSelectAccount = (accountId) => {
    if (selectedAccount === accountId) {
      setSelectedAccount(null);
    } else {
      setSelectedAccount(accountId);
    }
  };

  const handleSwitchAccount = async (e) => {
    e.stopPropagation();
    if (!selectedAccount) return;
    setIsProcessing(true);
    try {
      await switchAccount(selectedAccount);
      if (sessionStore.currentAccount.settings.locale
        && sessionStore.currentAccount.settings.locale !== i18n.language) {
        await i18n.changeLanguage(sessionStore.currentAccount.settings.locale);
      }
      setSelectedAccount(null);
      toast.success(t('pages:dashboard.accountSwitcher.accountSwitched'));
      history.push('/');
    } catch (error) {
      setErrorMessage(error.message);
    }
    setIsProcessing(false);
  };

  const signoutCurrent = () => {
    setSelectedAccount(null);
    setMode('confirmSignoutCurrent');
  };

  const deleteAccount = (e) => {
    e.stopPropagation();
    if (!selectedAccount) return;
    setMode('confirmSignoutSpecific');
  };

  const otherAccountsListItems = [];
  otherAccounts.forEach((account, index) => {
    const profilePictureUrl = account.profilePictureImgix
      ? `${account.profilePictureImgix}?w=100` : account.profilePicture;

    otherAccountsListItems.push(
      <OtherAccountsListItem
        key={account.id}
        tabIndex={index}
        onClick={() => handleSelectAccount(account.id)}
        onKeyDown={(e) => {
          // return key
          if (e.keyCode === 13 && e.target.className.includes('account-list-item')) {
            handleSelectAccount(account.id);
          }
        }}
        className="account-list-item"
      >
        <OtherAccountCard>
          <OtherAccountCardIcon>
            <CircleIcon size={50} src={profilePictureUrl} />
          </OtherAccountCardIcon>
          <OtherAccountCardName>
            {account.displayName}
          </OtherAccountCardName>
          <OtherAccountCardSign>
            {selectedAccount === account.id ? <GoTriangleUp /> : <GoTriangleDown />}
          </OtherAccountCardSign>
        </OtherAccountCard>
        {selectedAccount === account.id && (
          <OtherAccountControl>
            <Button onClick={handleSwitchAccount}>{t('pages:dashboard.accountSwitcher.switchAccount')}</Button>
            <Button theme="gloomy" onClick={deleteAccount}>{t('labels.Signout')}</Button>
          </OtherAccountControl>
        )}
      </OtherAccountsListItem>,
    );
  });

  const goAccountSwitcher = () => {
    if (!currentAccount) {
      window.location = '/';
    }
    setMode('accountSwitcher');
  };

  const closeErrorMessage = () => {
    setIsProcessing(false);
    setErrorMessage(null);
  };

  if (isProcessing) {
    return (<ProcessingScreen />);
  }

  if (errorMessage) {
    return (<ErrorScreen message={errorMessage} onClose={closeErrorMessage} />);
  }

  const profilePictureUrl = currentAccount.profilePictureImgix
    ? `${currentAccount.profilePictureImgix}?w=200` : currentAccount.profilePicture;

  switch (mode) {
    case 'accountSwitcher':
      return (
        <MenuWrapper>
          <CloseButton onClick={onClickCloseButton}>
            <FaTimes />
          </CloseButton>
          <CurrentAccount>
            <div className="leftPane">
              <CircleIcon size={0} src={profilePictureUrl} />
            </div>
            <div className="rightPane">
              <h2>{currentAccount.displayName}</h2>
              <div className="buttonContainer">
                <Button theme="gloomy" onClick={signoutCurrent}>
                  <IoMdPower />
                  {t('labels.Signout')}
                </Button>
              </div>
            </div>
          </CurrentAccount>
          {otherAccounts && otherAccounts.length > 0 && (
            <OtherAccountsList>
              {otherAccountsListItems}
            </OtherAccountsList>
          )}
          <MenuSection>
            <Button onClick={() => { window.location = '/signin'; }}>
              <AiOutlinePlusCircle />
              {t('pages:dashboard.accountSwitcher.addAccount')}
            </Button>
          </MenuSection>
          <MenuSection>
            <Button theme="gloomy" onClick={() => setMode('confirmSignoutAll')}>
              <IoMdPower />
              {t('pages:dashboard.accountSwitcher.signoutFromAll')}
            </Button>
          </MenuSection>
        </MenuWrapper>
      );
    case 'confirmSignoutCurrent':
      return (
        <SignoutConfirmation
          from="current"
          goBack={goAccountSwitcher}
          sessionStore={sessionStore}
        />
      );
    case 'confirmSignoutAll':
      return (
        <SignoutConfirmation
          from="all"
          goBack={goAccountSwitcher}
          sessionStore={sessionStore}
        />
      );
    case 'confirmSignoutSpecific':
      return (
        <SignoutConfirmation
          from={selectedAccount}
          goBack={goAccountSwitcher}
          sessionStore={sessionStore}
        />
      );
    default:
      setMode('accountSwitcher');
      return null;
  }
}));

AccountMenu.propTypes = {
  onClickCloseButton: PropTypes.func.isRequired,
};

export default AccountMenu;
