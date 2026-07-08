import React, { useEffect, useState } from 'react';
import api from '../axios';
import { Heart, Play, Music, Clock, Loader2 } from 'lucide-react';
import { useAudio } from '../Contexts/AudioContext';

interface MediaItem {
  id: string;
  title: string;
  artist: string;
  url: string;
  thumbnailUrl: string;
  durationInSeconds?: number;
  isLiked?: boolean;
}

interface LikedSongsProps {
  lastRefreshTime: number;
}

const LikedSongs = ({ lastRefreshTime }: LikedSongsProps) => {
  const [songs, setSongs] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('recent');
  const { playTrack, currentTrack, isPlaying, updateLikedStatus } = useAudio();
  const token = localStorage.getItem('token');
  const [hearts, setHearts] = useState<{ id: number; x: number; y: number; color: string }[]>([]);

  const fetchLikedSongs = async () => {
    try {
      const res = await api.get(`/favorites?sortBy=${sortBy}`);
      setSongs(res.data);
    } catch (error) {
      console.error("Failed to fetch liked songs", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLikedSongs();
  }, [sortBy, lastRefreshTime, token]);

  const handleToggleLike = async (e: React.MouseEvent, song: MediaItem) => {
    e.stopPropagation();
    const randomColors = ['#FF0000', '#FF1493', '#FF4500', '#FFD700', '#FF6B6B', '#E91E63'];
    const randomColor = randomColors[Math.floor(Math.random() * randomColors.length)];
    const newHeart = { id: Date.now(), x: e.clientX, y: e.clientY, color: randomColor };
    setHearts(prev => [...prev, newHeart]);
    
    setTimeout(() => {
      setHearts(prev => prev.filter(h => h.id !== newHeart.id));
    }, 1000);

    try {
      await api.post(`/favorites/toggle/${song.id}`);
      setSongs(prev => prev.filter(s => s.id !== song.id));
      if (currentTrack?.id === song.id) {
        updateLikedStatus(false);
      }
    } catch (error) {
      console.error("Error toggling like", error);
    }
  };

  const formatTime = (seconds?: number) => {
    if (!seconds) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div style={{ padding: '24px 32px', minHeight: '100%' }}>
      <style>{`
        @keyframes wave {
          0% { height: 4px; }
          100% { height: 14px; }
        }
        .music-bar {
          width: 3px;
          background: linear-gradient(to top, #FF00FF, #00FFFF);
          border-radius: 2px;
          animation: wave 0.5s ease-in-out infinite alternate;
          box-shadow: 0 0 10px rgba(255, 0, 255, 0.8);
        }
        @keyframes float-heart-liked {
          0% { transform: translate(-50%, -50%) scale(0.5); opacity: 1; }
          100% { transform: translate(-50%, calc(-50% - 200px)) scale(2); opacity: 0; }
        }
        .floating-heart { position: fixed; pointer-events: none; z-index: 9999; animation: float-heart-liked 1s ease-out forwards; }
        .neon-text {
          text-shadow: 0 0 10px rgba(255, 0, 255, 0.8), 0 0 20px rgba(0, 255, 255, 0.6);
        }
      `}</style>

      {/* Header - Neon Cyberpunk Style */}
      <div style={{
        padding: '32px',
        display: 'flex',
        alignItems: 'flex-end',
        gap: '24px',
        background: 'linear-gradient(180deg, #FF00FF 0%, #0a0a1a 100%)',
        borderRadius: '12px',
        marginBottom: '24px',
        boxShadow: '0 0 30px rgba(255, 0, 255, 0.5), 0 0 60px rgba(0, 255, 255, 0.3)',
      }}>
        <div style={{
          width: '192px',
          height: '192px',
          background: 'linear-gradient(135deg, #FF00FF, #00FFFF)',
          boxShadow: '0 0 30px rgba(255, 0, 255, 0.8), 0 0 60px rgba(0, 255, 255, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '8px',
        }}>
          <Heart size={80} fill="white" color="white" style={{ filter: 'drop-shadow(0 0 20px rgba(255,255,255,0.8))' }} />
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: '12px', fontWeight: '700', color: '#00FFFF', textTransform: 'uppercase', marginBottom: '8px', textShadow: '0 0 10px rgba(0, 255, 255, 0.8)' }}>
            Playlist
          </p>
          <h1 style={{ fontSize: '72px', fontWeight: '900', color: '#fff', margin: '0 0 16px', lineHeight: 1, textShadow: '0 0 20px rgba(255, 0, 255, 0.8), 0 0 40px rgba(0, 255, 255, 0.6)' }}>
            Liked Songs
          </h1>
          <p style={{ fontSize: '14px', color: '#b3b3b3', margin: 0 }}>
            {songs.length} songs
          </p>
        </div>
      </div>

      {/* Play Button & Sort */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
        <button 
          onClick={() => songs.length > 0 && playTrack(songs[0], songs)}
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #FF00FF, #00FFFF)',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 20px rgba(255, 0, 255, 0.8), 0 0 40px rgba(0, 255, 255, 0.5)',
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = 'scale(1.1)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 0 30px rgba(255, 0, 255, 1), 0 0 60px rgba(0, 255, 255, 0.8)'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 0 20px rgba(255, 0, 255, 0.8), 0 0 40px rgba(0, 255, 255, 0.5)'; }}
        >
          <Play size={24} fill="black" color="black" style={{ marginLeft: '4px' }} />
        </button>
        <select 
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          style={{
            backgroundColor: 'transparent',
            border: '1px solid #b3b3b3',
            color: '#b3b3b3',
            padding: '8px 32px 8px 12px',
            borderRadius: '20px',
            fontSize: '12px',
            cursor: 'pointer',
            outline: 'none',
          }}
        >
          <option value="recent" style={{ backgroundColor: '#181818', color: 'white' }}>Newest</option>
          <option value="oldest" style={{ backgroundColor: '#181818', color: 'white' }}>Oldest</option>
          <option value="title_asc" style={{ backgroundColor: '#181818', color: 'white' }}>Title (A-Z)</option>
          <option value="title_desc" style={{ backgroundColor: '#181818', color: 'white' }}>Title (Z-A)</option>
        </select>
      </div>

      {/* Songs List */}
      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px', color: '#b3b3b3' }}>
          <Loader2 size={32} style={{ animation: 'spin 1s linear infinite' }} />
          <span style={{ marginLeft: '12px' }}>Loading...</span>
        </div>
      ) : songs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 32px', backgroundColor: '#1a1a2e', borderRadius: '12px', boxShadow: '0 0 20px rgba(255, 0, 255, 0.3)' }}>
          <Heart size={64} style={{ color: '#FF00FF', marginBottom: '16px', filter: 'drop-shadow(0 0 20px rgba(255, 0, 255, 0.8))' }} />
          <h3 style={{ fontSize: '24px', fontWeight: '700', color: '#fff', marginBottom: '8px', textShadow: '0 0 10px rgba(255, 0, 255, 0.5)' }}>Songs you like will appear here</h3>
          <p style={{ color: '#b3b3b3', marginBottom: '24px' }}>Save songs by tapping the heart icon</p>
          <button onClick={() => window.location.href = '/app/search'} style={{ background: 'linear-gradient(135deg, #FF00FF, #00FFFF)', color: 'black', border: 'none', padding: '12px 24px', borderRadius: '20px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 0 20px rgba(255, 0, 255, 0.5)' }}>
            Find Songs
          </button>
        </div>
      ) : (
        <div style={{ borderBottom: '1px solid #2a2a4e', marginBottom: '16px' }}>
          {/* Header Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '40px 6fr 4fr 100px', gap: '16px', padding: '8px 16px', borderBottom: '1px solid #2a2a4e' }}>
            <div style={{ textAlign: 'center', color: '#00FFFF', fontSize: '14px' }}>#</div>
            <div style={{ color: '#00FFFF', fontSize: '14px' }}>Title</div>
            <div style={{ color: '#00FFFF', fontSize: '14px' }}>Album</div>
            <div style={{ color: '#00FFFF', fontSize: '14px', textAlign: 'right' }}><Clock size={16} /></div>
          </div>

          {/* Song Rows */}
          {songs.map((song, index) => {
            const isCurrent = currentTrack?.id === song.id;
            return (
              <div 
                key={song.id}
                onClick={() => playTrack(song, songs)}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '40px 6fr 4fr 100px',
                  gap: '16px',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  alignItems: 'center',
                  transition: 'all 0.3s ease',
                  backgroundColor: 'transparent',
                }}
                onMouseEnter={(e) => { 
                  (e.currentTarget as HTMLElement).style.backgroundColor = '#2a2a4e'; 
                  (e.currentTarget as HTMLElement).style.boxShadow = '0 0 15px rgba(255, 0, 255, 0.3)';
                  (e.currentTarget as HTMLElement).style.borderRadius = '8px';
                }}
                onMouseLeave={(e) => { 
                  (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
                  (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                }}
              >
                <div style={{ textAlign: 'center', color: isCurrent ? '#FF00FF' : '#b3b3b3', fontSize: '14px', textShadow: isCurrent ? '0 0 10px rgba(255, 0, 255, 0.8)' : 'none' }}>
                  {isCurrent && isPlaying ? (
                    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: '2px', height: '16px' }}>
                      <div className="music-bar" />
                      <div className="music-bar" style={{ animationDelay: '0.1s' }} />
                      <div className="music-bar" style={{ animationDelay: '0.2s' }} />
                    </div>
                  ) : (
                    index + 1
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <img src={song.thumbnailUrl} style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '8px', boxShadow: '0 0 10px rgba(0, 255, 255, 0.3)' }} alt="" />
                  <div>
                    <div style={{ fontSize: '16px', fontWeight: '500', color: isCurrent ? '#FF00FF' : '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '300px', textShadow: isCurrent ? '0 0 10px rgba(255, 0, 255, 0.5)' : 'none' }}>
                      {song.title}
                    </div>
                  </div>
                </div>
                <div style={{ color: '#b3b3b3', fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {song.artist || 'Unknown Artist'}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '16px' }}>
                  <button 
                    onClick={(e) => handleToggleLike(e, song)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#FF00FF',
                      opacity: 0.8,
                      transition: 'all 0.2s',
                      filter: 'drop-shadow(0 0 5px rgba(255, 0, 255, 0.5))',
                    }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.opacity = '1'; (e.currentTarget as HTMLElement).style.transform = 'scale(1.2)'; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.opacity = '0.8'; (e.currentTarget as HTMLElement).style.transform = 'scale(1)'; }}
                  >
                    <Heart size={16} fill="currentColor" />
                  </button>
                  <span style={{ color: '#00FFFF', fontSize: '14px', textShadow: '0 0 5px rgba(0, 255, 255, 0.5)' }}>{formatTime(song.durationInSeconds)}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Floating Hearts */}
      {hearts.map(h => (
        <Heart 
          key={h.id} 
          className="floating-heart"
          style={{ left: h.x, top: h.y, color: h.color }}
          size={24}
          fill="currentColor"
        />
      ))}
    </div>
  );
};

export default LikedSongs;
