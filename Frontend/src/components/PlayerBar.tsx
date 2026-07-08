import React, { useState, useRef, useEffect } from 'react';
import { useAudio } from '../Contexts/AudioContext';
import { Play, Pause, Volume2, VolumeX, Loader2, Heart, Share2, X, SkipBack, SkipForward, Gauge } from 'lucide-react';
import api from '../axios';

const PlayerBar = () => {
  // Sửa lỗi: Lấy trực tiếp playNext và playPrev từ context
  const { currentTrack, isPlaying, loading, togglePlay, stopTrack, volume, setVolume, playbackRate, setPlaybackRate, currentTime, duration, seek, updateLikedStatus, selectSongForShare, playNext, playPrev } = useAudio();
  const [hearts, setHearts] = useState<{ id: number; x: number; y: number; color: string }[]>([]);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const speedMenuRef = useRef<HTMLDivElement>(null);
  const speedOptions = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

  // Close speed menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (speedMenuRef.current && !speedMenuRef.current.contains(event.target as Node)) {
        setShowSpeedMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!currentTrack) {
    return null; // Do not display PlayerBar if no song is playing
  }

  // Hàm trợ giúp để định dạng thời gian (ví dụ: 03:45)
  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds < 0) return "00:00";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    seek(newTime);
  };

  const handleToggleLike = async (e: React.MouseEvent) => {
    if (!currentTrack) return;
    try {
      const randomColors = ['#FF0000', '#FF1493', '#FF4500', '#FFD700', '#FF6B6B', '#E91E63'];
      const randomColor = randomColors[Math.floor(Math.random() * randomColors.length)];
      const newHeart = { id: Date.now(), x: e.clientX, y: e.clientY, color: randomColor };
      setHearts(prev => [...prev, newHeart]);
      
      setTimeout(() => {
        setHearts(prev => prev.filter(h => h.id !== newHeart.id));
      }, 1000);

      const res = await api.post(`/favorites/toggle/${currentTrack.id}`);
      updateLikedStatus(res.data.isLiked);
      // Note: In a real app, you might want to trigger a global event 
      // to update the Heart icon in Library.tsx as well.
    } catch (error) {
      console.error("Failed to toggle favorite in PlayerBar", error);
    }
  };

  const handleShare = () => {
    if (!currentTrack) return;
    // Mở sidebar chia sẻ bằng cách cập nhật context
    selectSongForShare(currentTrack);
  };

  return (
    <>
    <style>{`
      @keyframes pulse-neon {
        0%, 100% { box-shadow: 0 0 20px rgba(102, 126, 234, 0.6), 0 0 40px rgba(118, 75, 162, 0.4); }
        50% { box-shadow: 0 0 35px rgba(102, 126, 234, 0.9), 0 0 70px rgba(118, 75, 162, 0.6); }
      }
      @keyframes float-heart-player { 
        0% { transform: translate(-50%, -50%) scale(0.5); opacity: 1; }
        25% { transform: translate(calc(-50% - 20px), calc(-50% - 50px)) scale(1); opacity: 0.8; }
        50% { transform: translate(calc(-50% + 20px), calc(-50% - 100px)) scale(1.5); opacity: 0.6; }
        75% { transform: translate(calc(-50% - 10px), calc(-50% - 150px)) scale(1.8); opacity: 0.3; }
        100% { transform: translate(-50%, calc(-50% - 200px)) scale(2); opacity: 0; }
      }
      .floating-heart {
        position: fixed;
        pointer-events: none;
        z-index: 9999;
        animation: float-heart-player 1s ease-out forwards;
      }
      .neon-progress {
        -webkit-appearance: none;
        appearance: none;
        width: 100%;
        height: 6px;
        background: rgba(255, 255, 255, 0.2);
        border-radius: 3px;
        cursor: pointer;
        box-shadow: 0 0 10px rgba(102, 126, 234, 0.3);
      }
      .neon-progress::-webkit-slider-thumb {
        -webkit-appearance: none;
        width: 16px;
        height: 16px;
        border-radius: 50%;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        cursor: pointer;
        box-shadow: 0 0 15px rgba(102, 126, 234, 0.8), 0 0 30px rgba(118, 75, 162, 0.5);
        border: 2px solid rgba(255, 255, 255, 0.5);
      }
      .neon-volume {
        -webkit-appearance: none;
        appearance: none;
        width: 100px;
        height: 6px;
        background: rgba(255, 255, 255, 0.2);
        border-radius: 3px;
        cursor: pointer;
        box-shadow: 0 0 10px rgba(102, 126, 234, 0.3);
      }
      .neon-volume::-webkit-slider-thumb {
        -webkit-appearance: none;
        width: 14px;
        height: 14px;
        border-radius: 50%;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        cursor: pointer;
        box-shadow: 0 0 10px rgba(102, 126, 234, 0.8);
        border: 2px solid rgba(255, 255, 255, 0.5);
      }
      .neon-btn {
        transition: all 0.2s ease;
      }
      .neon-btn:hover {
        transform: scale(1.15);
        filter: drop-shadow(0 0 10px currentColor);
      }
      .neon-btn:active {
        transform: scale(0.95);
      }
      .neon-play-btn {
        transition: all 0.2s ease;
        box-shadow: 0 0 20px rgba(102, 126, 234, 0.6), 0 0 40px rgba(118, 75, 162, 0.4);
      }
      .neon-play-btn:hover {
        transform: scale(1.1);
        box-shadow: 0 0 30px rgba(102, 126, 234, 0.9), 0 0 60px rgba(118, 75, 162, 0.6);
      }
    `}</style>
    <div style={{
      position: 'fixed',
      bottom: '0',
      left: '0',
      width: '100%',
      zIndex: 1000,
    }}>
      <div style={{
        position: 'relative',
        background: 'linear-gradient(180deg, rgba(20, 20, 35, 0.98) 0%, rgba(15, 15, 25, 0.99) 100%)',
        borderTop: '2px solid rgba(102, 126, 234, 0.4)',
        boxShadow: '0 -5px 30px rgba(102, 126, 234, 0.2), 0 -2px 10px rgba(0, 0, 0, 0.5)',
        padding: '14px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        {/* Nút thoát - góc trên bên phải */}
        <button 
          onClick={stopTrack}
          style={{
            position: 'absolute',
            top: '-15px',
            right: '20px',
            width: '30px',
            height: '30px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #ff4757 0%, #ff6b81 100%)',
            border: '2px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '50%',
            cursor: 'pointer',
            color: 'white',
            zIndex: 1001,
            boxShadow: '0 0 15px rgba(255, 71, 87, 0.5)',
          }}
          className="neon-btn"
          title="Exit / Close Player"
        >
          <X size={14} />
        </button>
        {/* Thông tin bài hát */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: 0 }}>
          <img src={currentTrack.thumbnailUrl} alt={currentTrack.title} style={{ width: '60px', height: '60px', borderRadius: '10px', objectFit: 'cover', boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)' }} />
          <div style={{ overflow: 'hidden' }}>
            <p style={{ color: '#fff', fontWeight: 'bold', fontSize: '13px', truncate: true, marginBottom: '4px', textShadow: '0 0 10px rgba(102, 126, 234, 0.5)' }}>{currentTrack.title}</p>
            <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '11px', truncate: true }}>{currentTrack.artist || 'Artist'}</p>
          </div>
          <button 
            onClick={(e) => handleToggleLike(e)}
            style={{
              color: currentTrack.isLiked ? '#ff6b81' : 'rgba(255, 255, 255, 0.6)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '50%',
              transition: 'all 0.2s',
            }}
            className="neon-btn"
            title={currentTrack.isLiked ? "Unlike" : "Like"}
          >
            <Heart size={22} fill={currentTrack.isLiked ? "currentColor" : "none"} />
          </button>
        </div>

        {/* Điều khiển & Tiến trình */}
        <div style={{ flex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', padding: '0 20px' }}>
          {/* Các nút điều khiển chính */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <button onClick={playPrev} style={{ color: 'rgba(255, 255, 255, 0.7)', background: 'none', border: 'none', cursor: 'pointer', padding: '8px' }} className="neon-btn">
              <SkipBack size={22} fill="currentColor" />
            </button>
            <button 
              onClick={togglePlay} 
              disabled={loading}
              style={{
                width: '50px',
                height: '50px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
                border: '3px solid rgba(255, 255, 255, 0.3)',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
              }}
              className="neon-play-btn"
            >
              {loading ? <Loader2 size={24} className="animate-spin" /> : (isPlaying ? <Pause size={24} fill="white" /> : <Play size={24} fill="white" />)}
            </button>
            <button onClick={playNext} style={{ color: 'rgba(255, 255, 255, 0.7)', background: 'none', border: 'none', cursor: 'pointer', padding: '8px' }} className="neon-btn">
              <SkipForward size={22} fill="currentColor" />
            </button>
          </div>

          {/* Thanh tiến trình */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%', maxWidth: '650px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.6)', minWidth: '45px', textAlign: 'right', fontFamily: 'monospace' }}>{formatTime(currentTime)}</span>
              <input
                type="range"
                min="0"
                max={duration || 100}
                value={currentTime}
                step="0.1"
                onChange={handleSeek}
                className="neon-progress flex-1"
              />
              <span style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.6)', minWidth: '45px', fontFamily: 'monospace' }}>{formatTime(duration)}</span>
            </div>
          </div>
        </div>

        {/* Âm lượng */}
        <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '12px', minWidth: '200px' }}>
          <button 
            onClick={handleShare}
            style={{ color: 'rgba(255, 255, 255, 0.6)', background: 'none', border: 'none', cursor: 'pointer', padding: '8px' }}
            className="neon-btn"
            title="Share Song"
          >
            <Share2 size={18} />
          </button>
          
          {/* Tốc độ phát */}
          <div className="relative" ref={speedMenuRef}>
            <button
              onClick={() => setShowSpeedMenu(!showSpeedMenu)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 12px',
                borderRadius: '20px',
                background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.3) 0%, rgba(118, 75, 162, 0.3) 100%)',
                border: '1px solid rgba(102, 126, 234, 0.5)',
                cursor: 'pointer',
                color: 'rgba(255, 255, 255, 0.8)',
                fontSize: '12px',
                transition: 'all 0.2s',
              }}
              className="neon-btn"
              title="Tốc độ phát"
            >
              <Gauge size={16} />
              <span style={{ minWidth: '35px', fontWeight: 'bold' }}>
                {playbackRate === 1 ? '1x' : `${playbackRate}x`}
              </span>
            </button>
            {showSpeedMenu && (
              <div 
                style={{
                  position: 'absolute',
                  bottom: '100%',
                  right: '0',
                  marginBottom: '10px',
                  background: 'linear-gradient(180deg, rgba(30, 30, 50, 0.98) 0%, rgba(20, 20, 35, 0.99) 100%)',
                  border: '1px solid rgba(102, 126, 234, 0.5)',
                  borderRadius: '12px',
                  padding: '8px',
                  zIndex: 50,
                  boxShadow: '0 0 20px rgba(102, 126, 234, 0.3), 0 10px 30px rgba(0, 0, 0, 0.5)',
                  minWidth: '110px',
                }}
              >
                {speedOptions.map((speed) => (
                  <button
                    key={speed}
                    onClick={() => {
                      setPlaybackRate(speed);
                      setShowSpeedMenu(false);
                    }}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      textAlign: 'left',
                      background: playbackRate === speed ? 'linear-gradient(135deg, rgba(102, 126, 234, 0.4) 0%, rgba(118, 75, 162, 0.4) 100%)' : 'transparent',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      color: playbackRate === speed ? '#fff' : 'rgba(255, 255, 255, 0.7)',
                      fontSize: '13px',
                      fontWeight: playbackRate === speed ? 'bold' : 'normal',
                      transition: 'all 0.2s',
                      textShadow: playbackRate === speed ? '0 0 10px rgba(102, 126, 234, 0.8)' : 'none',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(102, 126, 234, 0.2)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = playbackRate === speed ? 'linear-gradient(135deg, rgba(102, 126, 234, 0.4) 0%, rgba(118, 75, 162, 0.4) 100%)' : 'transparent'}
                  >
                    {speed === 1 ? 'Normal' : `${speed}x`}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {volume > 0 ? <Volume2 size={18} style={{ color: 'rgba(255, 255, 255, 0.6)' }} /> : <VolumeX size={18} style={{ color: 'rgba(255, 255, 255, 0.6)' }} />}
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="neon-volume"
            />
          </div>
        </div>
      </div>
    </div>

    {/* Render Floating Hearts */}
    {hearts.map(h => (
      <Heart 
        key={h.id} 
        className="floating-heart"
        style={{ left: h.x, top: h.y, color: h.color }}
        size={24}
        fill="currentColor"
      />
    ))}
    </>
  );
};

export default PlayerBar;
