import React, {
  Suspense,
  useState,
} from 'react';
import ReactDOM from 'react-dom';

import {
  BrowserRouter as Router,
  Switch,
  Route,
} from 'react-router-dom';

import { inject, observer, Provider } from 'mobx-react';

import '../../utils/i18n';

import LoadingLanguage from '../../components/LoadingLanguage';
import { ErrorBoundary } from '../../components/error';

import * as stores from '../../stores';
import ToastViewer from '../../components/ToastViewer';

import {
  ContentWrapper,
  Side,
  Main,
} from './style';

import Home from './Home';
import Header from './components/Header';
import NavMenu from './components/NavMenu';

import Profile from './profile';
import Settings from './settings';
import Contact from './contact';

const Routes = inject('sessionStore')(observer((props) => {
  const { currentAccount, otherAccounts, updateAccountStates } = props.sessionStore;

  if (!currentAccount && (!otherAccounts || otherAccounts.length <= 0)) {
    // no accounts available
    window.location = '/signin';
    return null;
  }

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <Suspense fallback={<LoadingLanguage />}>
      <ErrorBoundary>
        <Router>
          <Header
            onClickSidebarSwitch={() => { setIsMenuOpen(!isMenuOpen); }}
          />
          <ContentWrapper>
            <Side>
              <NavMenu
                isOpen={isMenuOpen}
                setIsOpen={(how) => setIsMenuOpen(how)}
              />
            </Side>
            <Main>
              <Switch>
                <Route exact path="/">
                  <ErrorBoundary>
                    <Home />
                  </ErrorBoundary>
                </Route>
                <Route path="/profile">
                  <ErrorBoundary>
                    <Profile
                      account={props.sessionStore.currentAccount}
                      onUpdated={updateAccountStates}
                    />
                  </ErrorBoundary>
                </Route>
                <Route path="/settings">
                  <ErrorBoundary>
                    <Settings
                      locale={currentAccount.settings.locale}
                      timezone={currentAccount.settings.timezone}
                      reloadAccount={updateAccountStates}
                    />
                  </ErrorBoundary>
                </Route>
                <Route path="/contact">
                  <ErrorBoundary>
                    <Contact />
                  </ErrorBoundary>
                </Route>
                <Route path="/auth-and-security">
                  <ErrorBoundary>
                    <h1>Authentication and Security</h1>
                  </ErrorBoundary>
                </Route>
              </Switch>
            </Main>
          </ContentWrapper>
        </Router>
      </ErrorBoundary>
      <ErrorBoundary>
        <ToastViewer />
      </ErrorBoundary>
    </Suspense>
  );
}));

function Root() {
  return (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <Provider {...stores}>
      <Routes />
    </Provider>
  );
}

ReactDOM.render(<Root />, document.getElementById('root'));
