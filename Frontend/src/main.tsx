import React from 'react';
import ReactDOM from 'react-dom/client';
import { PlayerProvider } from './context/PlayerContext';
import AppRoutes from './routes/AppRoutes';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <PlayerProvider>
      <AppRoutes />
    </PlayerProvider>
  </React.StrictMode>
);