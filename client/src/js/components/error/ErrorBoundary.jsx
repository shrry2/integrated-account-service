import React from 'react';
import PropTypes from 'prop-types';
import * as Sentry from '@sentry/browser';

import BlueScreen from './BlueScreen';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ error });
    // eslint-disable-next-line no-console
    console.error({ error });
    Sentry.captureException(error, { extra: errorInfo });
  }

  render() {
    const { error } = this.state;
    const {
      fallbackComponent: FallbackComponent = null,
      children,
    } = this.props;

    if (error) {
      if (FallbackComponent) {
        return <FallbackComponent />;
      }

      return <BlueScreen />;
    }

    return children;
  }
}

ErrorBoundary.propTypes = {
  fallbackComponent: PropTypes.element,
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.element),
    PropTypes.element
  ]),
};

ErrorBoundary.defaultProps = {
  fallbackComponent: null,
  children: null,
};

export default ErrorBoundary;
