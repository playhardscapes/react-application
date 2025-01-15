
// src/App.jsx
import React from 'react';
import AppRouter from './AppRouter';
import { Toaster } from '@/components/ui/toast';
import { ToastProvider } from '@radix-ui/react-toast';

function App() {
  return (
    <ToastProvider>
      <AppRouter />
      <Toaster />
    </ToastProvider>
  );
}

export default App;
