import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import ToastViewport from './components/ToastViewport';
import { AppProvider } from './context/AppProvider';
import { AuthProvider } from './context/AuthProvider';
import { PlatformProvider } from './context/PlatformProvider';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <AppProvider>
          <PlatformProvider>
            <App />
            <ToastViewport />
          </PlatformProvider>
        </AppProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);
