import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { MusicProvider } from './context/MusicContext';
import { Sidebar } from './components/Sidebar';
import { PlayerBar } from './components/PlayerBar';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { HomePage } from './pages/HomePage';
import { SearchPage } from './pages/SearchPage';
import './App.css';

interface NavData {
  page: string;
  data?: any;
}

const MainApp: React.FC = () => {
  const { user, token } = useAuth();
  const [currentNav, setCurrentNav] = useState<NavData>({ page: 'home' });

  const handleNavigate = (page: string, data?: any) => {
    setCurrentNav({ page, data });
  };

  // Show login if not authenticated
  if (!token || !user) {
    if (currentNav.page === 'register') {
      return <RegisterPage onNavigate={handleNavigate} />;
    }
    return <LoginPage onNavigate={handleNavigate} />;
  }

  // Show main app layout if authenticated
  return (
    <div className="app-layout">
      <Sidebar onNavigate={handleNavigate} />
      <div className="main-content-area">
        <div className="page-content">
          {currentNav.page === 'home' && <HomePage />}
          {currentNav.page === 'search' && <SearchPage />}
          {currentNav.page === 'artists' && <div className="page-container">Artists Page Coming Soon</div>}
          {currentNav.page === 'playlist' && <div className="page-container">Playlist: {currentNav.data?.title}</div>}
          {currentNav.page === 'create-playlist' && <div className="page-container">Create Playlist Coming Soon</div>}
        </div>
        <PlayerBar />
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <MusicProvider>
        <MainApp />
      </MusicProvider>
    </AuthProvider>
  );
}

export default App;
