
import React from 'react';
import ReactDOM from 'react-dom/client';
import AppWrapper from './App';

// Log environment variables for debugging
console.log('Environment Variables:', {
  'import.meta.env.API_KEY': import.meta.env.API_KEY,
  'import.meta.env.GEMINI_API_KEY': import.meta.env.GEMINI_API_KEY,
  'import.meta.env.VITE_LANGFLOW_API_KEY': import.meta.env.VITE_LANGFLOW_API_KEY,
  'import.meta.env.VITE_LANGFLOW_API_URL': import.meta.env.VITE_LANGFLOW_API_URL,
  'import.meta.env.VITE_ADMIN_EMAIL': import.meta.env.VITE_ADMIN_EMAIL,
  'import.meta.env.VITE_ADMIN_PASSWORD': import.meta.env.VITE_ADMIN_PASSWORD
});

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("No se pudo encontrar el elemento raíz para montar la aplicación.");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <AppWrapper />
  </React.StrictMode>
);
