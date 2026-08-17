import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AppProvider } from '@shopify/polaris';
import { Provider as AppBridgeProvider } from '@shopify/app-bridge-react';
import '@shopify/polaris/build/esm/styles.css';
import App from './App';

// Get Shopify params from URL
const params = new URLSearchParams(window.location.search);
const host = params.get('host');
const shop = params.get('shop');

// App Bridge configuration
const appBridgeConfig = {
  apiKey: import.meta.env.VITE_SHOPIFY_API_KEY,
  host: host || '',
  forceRedirect: true,
};

// Check if running in embedded context
const isEmbedded = window.top !== window.self;

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      {isEmbedded && host ? (
        <AppBridgeProvider config={appBridgeConfig}>
          <AppProvider i18n={{}}>
            <App shop={shop} host={host} />
          </AppProvider>
        </AppBridgeProvider>
      ) : (
        <AppProvider i18n={{}}>
          <App shop={shop} host={host} />
        </AppProvider>
      )}
    </BrowserRouter>
  </React.StrictMode>
);
