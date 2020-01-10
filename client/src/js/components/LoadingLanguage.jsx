import React from 'react';

const messages = {
  'en-US': 'Loading English page...',
  'ja-JP': '日本語のページを読み込んでいます...',
};

// Fallback language
let message = messages['en-US'];

const languageUsed = document.documentElement.lang;
if (languageUsed && languageUsed in messages) {
  message = messages[languageUsed];
}

function LoadingLanguage() {
  return (
    <p>{message}</p>
  );
}

export default LoadingLanguage;
