// src/main.jsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css'; // Tailwind styles
import AppRouter from './AppRouter';

const root = createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AppRouter />
  </React.StrictMode>
);