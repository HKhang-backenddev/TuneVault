import React, { useState } from 'react';
import { useMusic, type Song } from '../context/MusicContext';
import apiClient from '../services/apiClient';
import './SearchPage.css';

export const SearchPage: React.FC = () => {
  const { playSong } = useMusic();
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'youtube' | 'library'>('youtube');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setLoading(true);
    setError('');
    
    try {
      if (activeTab === 'youtube') {
        // Search YouTube
        const response = await apiClient.get('/youtube/search', {
          params: { query: searchQuery, limit: 20 }
        });
        setResults(response.data);
      } else {
        // Search library
        const response = await apiClient.get('/songs', {
          params: { query: searchQuery, page: 1, pageSize: 20 }
        });
        setResults(response.data.songs);
      }
    } catch (err) {
      setError('Tìm kiếm thất bại. Thử lại nha!');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePlayYouTube = async (video: any) => {
    setLoading(true);
    try {
      // Get stream URL
      const streamResponse = await apiClient.get(`/youtube/stream/${video.id}`);
      
      // Create song object
      const song: Song = {
        id: video.id,
        title: video.title,
        artistName: video.channelName,
        durationInSeconds: video.durationSeconds,
        genre: 'YouTube',
        thumbnailUrl: video.thumbnailUrl,
        mediaUrl: streamResponse.data.url,
        createdAt: new Date().toISOString(),
      };

      playSong(song);
    } catch (err) {
      setError('Không thể phát nhạc. Thử lại nha!');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePlayLibrary = (song: any) => {
    // Get stream URL for library song
    playSong({
      id: song.id,
      title: song.title,
      artistName: song.artistName,
      durationInSeconds: song.durationInSeconds,
      genre: song.genre,
      thumbnailUrl: song.thumbnailUrl,
      mediaUrl: `/media/${song.filePath || song.id}`,
      createdAt: song.createdAt,
    });
  };

  return (
    <div className="search-page">
      <div className="search-header">
        <h1>🔍 Tìm Kiếm Nhạc</h1>
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm bài hát, nghệ sĩ, hoặc playlist..."
            className="search-input"
          />
          <button type="submit" disabled={loading} className="search-btn">
            {loading ? '⏳' : '🔍'}
          </button>
        </form>

        <div className="tabs">
          <button
            className={`tab ${activeTab === 'youtube' ? 'active' : ''}`}
            onClick={() => { setActiveTab('youtube'); setResults([]); }}
          >
            🎥 YouTube
          </button>
          <button
            className={`tab ${activeTab === 'library' ? 'active' : ''}`}
            onClick={() => { setActiveTab('library'); setResults([]); }}
          >
            🎵 Thư Viện
          </button>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="search-results">
        {loading ? (
          <div className="loading">Đang tìm kiếm...</div>
        ) : results.length === 0 ? (
          <div className="empty-state">
            <p>
              {searchQuery ? 'Không tìm thấy kết quả' : 'Nhập tên bài hát để tìm kiếm'}
            </p>
          </div>
        ) : (
          <div className="results-list">
            {activeTab === 'youtube' ? (
              // YouTube Results
              results.map((video) => (
                <div key={video.id} className="result-item youtube-result">
                  <img
                    src={video.thumbnailUrl}
                    alt={video.title}
                    className="result-thumbnail"
                  />
                  <div className="result-info">
                    <h3>{video.title}</h3>
                    <p className="artist">{video.channelName}</p>
                    <span className="duration">
                      {Math.floor(video.durationSeconds / 60)}:{String(video.durationSeconds % 60).padStart(2, '0')}
                    </span>
                  </div>
                  <button
                    className="play-btn"
                    onClick={() => handlePlayYouTube(video)}
                    disabled={loading}
                  >
                    ▶️ Phát
                  </button>
                </div>
              ))
            ) : (
              // Library Results
              results.map((song) => (
                <div key={song.id} className="result-item library-result">
                  {song.thumbnailUrl && (
                    <img
                      src={song.thumbnailUrl}
                      alt={song.title}
                      className="result-thumbnail"
                    />
                  )}
                  <div className="result-info">
                    <h3>{song.title}</h3>
                    <p className="artist">{song.artistName || 'Unknown'}</p>
                    <span className="genre">{song.genre}</span>
                  </div>
                  <button
                    className="play-btn"
                    onClick={() => handlePlayLibrary(song)}
                    disabled={loading}
                  >
                    ▶️ Phát
                  </button>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};
