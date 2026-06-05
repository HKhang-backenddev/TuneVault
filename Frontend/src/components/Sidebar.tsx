import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { playlistsAPI } from '../services/apiClient';
import './Sidebar.css';

interface Playlist {
  id: string;
  title: string;
  trackCount: number;
}

export const Sidebar: React.FC<{ onNavigate: (page: string, data?: any) => void }> = ({ onNavigate }) => {
  const { user, logout } = useAuth();
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadPlaylists();
    }
  }, [user]);

  const loadPlaylists = async () => {
    setLoading(true);
    try {
      const response = await playlistsAPI.getPlaylists();
      setPlaylists(response.data);
    } catch (error) {
      console.error('Failed to load playlists:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    onNavigate('login');
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h1>🎵 TuneVault</h1>
      </div>

      <nav className="sidebar-nav">
        <button className="nav-item" onClick={() => onNavigate('home')}>
          🏠 Home
        </button>
        <button className="nav-item" onClick={() => onNavigate('search')}>
          🔍 Search
        </button>
        <button className="nav-item" onClick={() => onNavigate('artists')}>
          👤 Artists
        </button>
      </nav>

      <div className="sidebar-section">
        <div className="section-header">
          <h3>Playlists</h3>
          <button className="add-btn" onClick={() => onNavigate('create-playlist')}>
            +
          </button>
        </div>
        <div className="playlists-list">
          {loading ? (
            <p className="loading">Loading...</p>
          ) : playlists.length === 0 ? (
            <p className="empty">No playlists yet</p>
          ) : (
            playlists.map((playlist) => (
              <button
                key={playlist.id}
                className="playlist-item"
                onClick={() => onNavigate('playlist', playlist)}
              >
                <span className="playlist-icon">🎵</span>
                <span className="playlist-name">{playlist.title}</span>
              </button>
            ))
          )}
        </div>
      </div>

      <div className="sidebar-footer">
        <div className="user-info">
          <span className="user-avatar">👤</span>
          <span className="user-name">{user?.username}</span>
        </div>
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </div>
  );
};
