
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import AppContainer from './containers/AppContainer';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './components/common/Toast';

const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <ToastProvider>
        <AppContainer />
      </ToastProvider>
    </AuthProvider>
  </BrowserRouter>
);

export default App;
