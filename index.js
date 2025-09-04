import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.js';

document.addEventListener('DOMContentLoaded', () => {
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    throw new Error("Could not find root element to mount to");
  }
  const root = createRoot(rootElement);
  root.render(
    React.createElement(React.StrictMode, null,
      React.createElement(App, null)
    )
  );
});
