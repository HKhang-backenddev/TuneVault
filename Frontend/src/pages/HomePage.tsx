import React, { useEffect, useState } from 'react';
import { songsAPI } from '../services/apiClient';
import { useMusic, type Song } from '../context/MusicContext';

export const HomePage: React.FC = () => {
  const { playSong } = useMusic();
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadSongs();
  }, []);

  const loadSongs = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await songsAPI.getSongs(undefined, 1, 50);
      setSongs(response.data.songs);
    } catch (err) {
      console.error('Failed to load songs:', err);
      setError('Failed to load songs');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>🏠 Home</h1>
        <p>Discover Your Favorite Music</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading">Loading songs...</div>
      ) : songs.length === 0 ? (
        <div className="empty-state">
          <p>No songs available yet</p>
        </div>
      ) : (
        <div className="songs-grid">
          {songs.map((song) => (
            <div key={song.id} className="song-card" onClick={() => playSong(song)}>
              <div className="song-card-image">
                {song.thumbnailUrl ? (
                  <img src={song.thumbnailUrl} alt={song.title} />
                ) : (
                  <div className="no-image">🎵</div>
                )}
              </div>
              <div className="song-card-content">
                <h3>{song.title}</h3>
                <p>{song.artistName || 'Unknown Artist'}</p>
                <p className="genre">{song.genre}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
