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
      @keyframes progress-spotify {
        0% { accent-color: #1DB954; }
        100% { accent-color: #1DB954; }
      }
      .spotify-progress {
        animation: progress-spotify 0s linear !important;
        -webkit-appearance: none;
        appearance: none;
        width: 100%;
        height: 4px;
        background: rgba(255, 255, 255, 0.3);
        border-radius: 2px;
        cursor: pointer;
      }
      .spotify-progress::-webkit-slider-thumb {
        -webkit-appearance: none;
        width: 12px;
        height: 12px;
        border-radius: 50%;
        background: #1DB954;
        cursor: pointer;
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
      .player-button {
        transition: transform 0.1s ease;
      }
      .player-button:hover {
        transform: scale(1.1);
      }
      .player-button:active {
        transform: scale(0.95);
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
        backgroundColor: '#181818',
        borderTop: '1px solid #282828',
        padding: '12px 24px',
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
            width: '28px',
            height: '28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#282828',
            border: '1px solid #404040',
            borderRadius: '50%',
            cursor: 'pointer',
            color: '#b3b3b3',
            zIndex: 1001,
          }}
          className="hover:bg-neutral-700 transition-colors"
          title="Exit / Close Player"
        >
          <X size={16} />
        </button>
        {/* Thông tin bài hát */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
          <img src={currentTrack.thumbnailUrl} alt={currentTrack.title} style={{ width: '56px', height: '56px', borderRadius: '8px', objectFit: 'cover' }} />
          <div style={{ overflow: 'hidden' }}>
            <p className="text-white font-bold text-[11px] truncate hover:text-[#1DB954] cursor-pointer">{currentTrack.title}</p>
            <p className="text-[#b3b3b3] text-[10px] truncate hover:text-white cursor-pointer">{currentTrack.artist || 'Artist'}</p>
          </div>
          <button 
            onClick={(e) => handleToggleLike(e)}
            className={`ml-2 ${currentTrack.isLiked ? 'text-[#1DB954]' : 'text-[#b3b3b3] hover:text-white'}`}
            title={currentTrack.isLiked ? "Unlike" : "Like"}
          >
            <Heart size={18} fill={currentTrack.isLiked ? "currentColor" : "none"} className="player-button" />
          </button>
        </div>

        {/* Điều khiển & Tiến trình */}
        <div style={{ flex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '0 20px' }}>
          {/* Các nút điều khiển chính */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button onClick={playPrev} className="text-[#b3b3b3] hover:text-white player-button">
              <SkipBack size={20} fill="currentColor" />
            </button>
            <button 
              onClick={togglePlay} 
              disabled={loading}
              className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-black player-button hover:scale-105 disabled:opacity-50"
            >
              {loading ? <Loader2 size={20} className="animate-spin text-[#1DB954]" /> : (isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-0.5" />)}
            </button>
            <button onClick={playNext} className="text-[#b3b3b3] hover:text-white player-button">
              <SkipForward size={20} fill="currentColor" />
            </button>
          </div>

          {/* Thanh tiến trình */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '100%', maxWidth: '600px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '11px', color: '#b3b3b3', minWidth: '40px', textAlign: 'right' }}>{formatTime(currentTime)}</span>
              <input
                type="range"
                min="0"
                max={duration || 100}
                value={currentTime}
                step="0.1"
                onChange={handleSeek}
                className="spotify-progress flex-1"
              />
              <span style={{ fontSize: '11px', color: '#b3b3b3', minWidth: '40px' }}>{formatTime(duration)}</span>
            </div>
          </div>
        </div>

        {/* Âm lượng */}
        <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '8px', minWidth: '180px' }}>
          <button 
            onClick={handleShare}
            className="text-[#b3b3b3] hover:text-white player-button p-1"
            title="Share Song"
          >
            <Share2 size={16} />
          </button>
          
          {/* Playback Speed */}
          <div className="relative" ref={speedMenuRef}>
            <button
              onClick={() => setShowSpeedMenu(!showSpeedMenu)}
              className="flex items-center gap-1 px-2 py-1 rounded-md bg-[#282828] hover:bg-[#333] transition-colors text-[#b3b3b3] hover:text-white text-xs"
              title="Playback Speed"
            >
              <Gauge size={14} />
              <span style={{ minWidth: '30px' }}>
                {playbackRate === 1 ? '1x' : `${playbackRate}x`}
              </span>
            </button>
            {showSpeedMenu && (
              <div 
                className="absolute bottom-full mb-2 right-0 bg-[#282828] border border-[#404040] rounded-lg shadow-xl py-1 z-50"
                style={{ minWidth: '100px' }}
              >
                {speedOptions.map((speed) => (
                  <button
                    key={speed}
                    onClick={() => {
                      setPlaybackRate(speed);
                      setShowSpeedMenu(false);
                    }}
                    className={`w-full px-3 py-2 text-left text-sm hover:bg-[#333] transition-colors ${
                      playbackRate === speed ? 'text-[#1DB954]' : 'text-[#b3b3b3]'
                    }`}
                  >
                    {speed === 1 ? 'Normal' : `${speed}x`}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-1">
            {volume > 0 ? <Volume2 size={16} className="text-[#b3b3b3]" /> : <VolumeX size={16} className="text-[#b3b3b3]" />}
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-20 h-1 bg-[#404040] rounded-full appearance-none cursor-pointer accent-[#1DB954]"
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
