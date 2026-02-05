/**
 * Application entry point for Echo Feedback Collector.
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

/**
 * Renders the root React application.
 * @returns {void}
 */
const renderApp = () => {
  const rootElement = document.getElementById('root');

  if (!rootElement) {
    throw new Error('Root element with id "root" not found');
  }

  const root = ReactDOM.createRoot(rootElement);

  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
};

renderApp();

