import React, { useState } from 'react';
import { useAudio } from '../Contexts/AudioContext';
import { Play, Pause, Volume2, VolumeX, Loader2, Heart, Share2, X, SkipBack, SkipForward } from 'lucide-react';
import api from '../axios';

const PlayerBar = () => {
  // Sửa lỗi: Lấy trực tiếp playNext và playPrev từ context
  const { currentTrack, isPlaying, loading, togglePlay, stopTrack, volume, setVolume, currentTime, duration, seek, updateLikedStatus, selectSongForShare, playNext, playPrev } = useAudio();
  const [hearts, setHearts] = useState<{ id: number; x: number; y: number; color: string }[]>([]);

  if (!currentTrack) {
    return null; // Không hiển thị PlayerBar nếu không có bài hát nào đang phát
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
      @keyframes progress-neon-rainbow {
        0% { accent-color: #3b82f6; filter: drop-shadow(0 0 3px rgba(59, 130, 246, 0.6)); }
        25% { accent-color: #60a5fa; filter: drop-shadow(0 0 3px rgba(96, 165, 250, 0.6)); }
        50% { accent-color: #93c5fd; filter: drop-shadow(0 0 3px rgba(147, 197, 253, 0.6)); }
        75% { accent-color: #60a5fa; filter: drop-shadow(0 0 3px rgba(96, 165, 250, 0.6)); }
        100% { accent-color: #3b82f6; filter: drop-shadow(0 0 3px rgba(59, 130, 246, 0.6)); }
      }
      .neon-progress-bar {
        animation: progress-neon-rainbow 6s linear infinite !important;
      }
      @keyframes float-heart-player { /* Đổi tên animation để tránh xung đột */
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
        backgroundColor: 'rgba(10, 10, 10, 0.7)',
        backdropFilter: 'blur(10px)',
        borderTop: '2px solid #3b82f6',
        padding: '12px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 -5px 30px rgba(59, 130, 246, 0.4)'
      }}>
        {/* Nút thoát - góc trên bên phải */}
        <button 
          onClick={stopTrack}
          style={{
            position: 'absolute',
            top: '-15px', // Điều chỉnh lại vị trí
            right: '20px',
            width: '28px',
            height: '28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#1a1a1a',
            border: '2px solid #3b82f6',
            borderRadius: '50%',
            cursor: 'pointer',
            color: '#3b82f6',
            boxShadow: '0 0 10px rgba(59, 130, 246, 0.5)',
            zIndex: 1001,
          }}
          className="hover:bg-blue-600 hover:text-white transition-colors"
          title="Thoát / Đóng trình phát"
        >
          <X size={16} />
        </button>
        {/* Thông tin bài hát */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
          <img src={currentTrack.thumbnailUrl} alt={currentTrack.title} style={{ width: '56px', height: '56px', borderRadius: '8px', objectFit: 'cover' }} />
          <div style={{ overflow: 'hidden' }}>
            <p className="text-white font-bold text-[11px] truncate">{currentTrack.title}</p>
            <p className="text-neutral-400 text-[10px] truncate">{currentTrack.artist || 'Nghệ sĩ'}</p>
          </div>
        </div>

        {/* Điều khiển & Tiến trình */}
        <div style={{ flex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '0 20px' }}>
          {/* Các nút điều khiển chính */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <button onClick={playPrev} className="text-neutral-400 hover:text-white transition-all active:scale-90">
              <SkipBack size={20} fill="currentColor" />
            </button>
            <button 
              onClick={(e) => handleToggleLike(e)}
              className={`transition-transform active:scale-90 ${currentTrack.isLiked ? 'text-blue-500' : 'text-neutral-500 hover:text-white'}`}
              title={currentTrack.isLiked ? "Bỏ thích" : "Yêu thích"}
            >
              <Heart size={18} fill={currentTrack.isLiked ? "currentColor" : "none"} />
            </button>
            <button 
              onClick={togglePlay} 
              disabled={loading}
              className="text-white transition disabled:opacity-50 flex-shrink-0 w-10 h-10 rounded-full bg-white flex items-center justify-center text-black hover:scale-105 active:scale-100"
            >
              {loading ? <Loader2 size={24} className="animate-spin text-blue-500" /> : (isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-1" />)}
            </button>
            <button 
              onClick={handleShare}
              className="text-neutral-500 hover:text-white transition-transform active:scale-90"
              title="Chia sẻ bài hát"
            >
              <Share2 size={18} />
            </button>
            <button onClick={playNext} className="text-neutral-400 hover:text-white transition-all active:scale-90">
              <SkipForward size={20} fill="currentColor" />
            </button>
          </div>

          {/* Thanh tiến trình */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '100%', maxWidth: '600px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '10px', color: '#737373', minWidth: '35px', textAlign: 'right' }}>{formatTime(currentTime)}</span>
              <input
                type="range"
                min="0"
                max={duration}
                value={currentTime}
                step="0.1"
                onChange={handleSeek}
                style={{ flex: 1, height: '4px', cursor: 'pointer' }}
                className="neon-progress-bar"
              />
              <span style={{ fontSize: '10px', color: '#737373', minWidth: '35px' }}>{formatTime(duration)}</span>
            </div>
          </div>
        </div>

        {/* Âm lượng */}
        <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '12px', minWidth: '150px' }}>
          <div className="flex items-center gap-2">
            {volume > 0 ? <Volume2 size={16} className="text-neutral-400" /> : <VolumeX size={16} className="text-neutral-400" />}
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-20 h-1 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
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
