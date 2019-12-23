import React from 'react';
import ReactDOM from 'react-dom';
import Cookies from 'js-cookie';

const locales = require('../../../../shared/global/locales');

const languageOptions = [];

locales.forEach((lang) => {
  languageOptions.push(
    <option key={lang.code} value={lang.code}>{lang.label}</option>,
  );
});

class LanguageSelector extends React.Component {
  constructor(props) {
    super(props);

    this.state = { currentLocale: document.documentElement.lang };

    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(e) {
    this.setState({ currentLocale: e.target.value });
    Cookies.set('locale', e.target.value);
    window.location.reload();
  }

  render() {
    const { currentLocale } = this.state;

    return (
      <select
        value={currentLocale}
        onChange={this.handleChange}
      >
        {languageOptions}
      </select>
    );
  }
}

ReactDOM.render(<LanguageSelector />, document.getElementById('language-selector'));
