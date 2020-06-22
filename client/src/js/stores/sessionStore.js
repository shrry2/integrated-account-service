import { action, runInAction, observable } from 'mobx';

import {
  getStates,
  switchAccount,
  signout,
} from '../domain/Backend/Session';

let initialState = null;
if (window && typeof window.__INITIAL_STATE__ === 'object') {
  initialState = window.__INITIAL_STATE__.session;
} else {
  throw new Error('Initial state is not provided');
}

class SessionStore {
  @observable currentAccount = initialState.currentAccount;

  @observable otherAccounts = initialState.otherAccounts;

  @action
  updateAccountStates = async () => {
    try {
      const response = await getStates();
      if (response && response.result === 'ok') {
        runInAction(() => {
          this.currentAccount = response.currentAccount;
          this.otherAccounts = response.otherAccounts;
        });
      } else {
        runInAction(() => {
          this.currentAccount = null;
          this.otherAccounts = [];
        });
      }
    } catch (e) {
      runInAction(() => {
        this.currentAccount = null;
        this.otherAccounts = [];
      });
    }
  };

  @action
  signout = async (from) => {
    const response = await signout(from);
    if (response && response.result === 'ok') {
      await this.updateAccountStates();
    }
    return response;
  };

  @action
  switchAccount = async (targetAccountId) => {
    if (!this.otherAccounts.find((otherAccount) => (otherAccount.id === targetAccountId))) {
      // not found in switchable accounts
      throw new Error('Not allowed to switch to this account.');
    }
    const response = await switchAccount(targetAccountId);
    if (response && response.result === 'ok') {
      await this.updateAccountStates();
    }
    return response;
  }
}

const sessionStore = new SessionStore();

export default sessionStore;
