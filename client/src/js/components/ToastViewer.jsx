import React from 'react';
import { ToastContainer } from 'react-toastify';

function ToastViewer() {
  return (
    <ToastContainer
      position="bottom-center"
      autoClose={5000}
      hideProgressBar
      newestOnTop={false}
      closeOnClick
      rtl={false}
      pauseOnVisibilityChange
      draggable={false}
      pauseOnHover
    />
  );
}

export default ToastViewer;
