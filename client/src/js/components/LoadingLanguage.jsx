import React from 'react';

const messages = {
  'en-US': 'Taking you to English version',
  'ja-JP': '日本語でご案内いたします',
};

// Fallback language
let message = messages['en-US'];

const languageUsed = document.documentElement.lang;
if (languageUsed && languageUsed in messages) {
  message = messages[languageUsed];
}

function LoadingLanguage() {
  return (
    <div className="loading-message">
      <div className="loader">Loading...</div>
      {message}
    </div>
  );
}

export default LoadingLanguage;
