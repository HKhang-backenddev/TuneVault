import React, { useState, useEffect, useRef } from 'react';
import { useAudio } from '../Contexts/AudioContext';
import { Music, X, Info, Heart, Share2, ListPlus } from 'lucide-react';
import api from '../axios';

const AudioVisualizer = () => {
  const { analyser } = useAudio();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!analyser || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    let animationFrameId: number;

    const renderFrame = () => {
      animationFrameId = requestAnimationFrame(renderFrame);
      analyser.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / bufferLength) * 2.5;
      let barHeight;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        barHeight = dataArray[i] / 2;
        ctx.fillStyle = `rgba(59, 130, 246, ${barHeight / 200})`;
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
        x += barWidth + 1;
      }
    };

    renderFrame();
    return () => cancelAnimationFrame(animationFrameId);
  }, [analyser]);

  return <canvas ref={canvasRef} width="260" height="80" style={{ marginTop: '16px' }} />;
};

export const NowPlayingSidebar = () => {
  const { currentTrack, stopTrack, updateLikedStatus, selectSongForShare, isPlaying } = useAudio();
  const [isLiked, setIsLiked] = useState(currentTrack?.isLiked || false);

  useEffect(() => {
    setIsLiked(currentTrack?.isLiked || false);
  }, [currentTrack]);

  const handleToggleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentTrack) return;

    const newLikedState = !isLiked;
    setIsLiked(newLikedState); // Cập nhật UI ngay lập tức
    updateLikedStatus(newLikedState); // Cập nhật context

    try {
      await api.post(`/favorites/toggle/${currentTrack.id}`);
      window.dispatchEvent(new CustomEvent('favoritesUpdated'));
    } catch (error) {
      console.error("Lỗi khi thả tim:", error);
      // Hoàn tác lại nếu có lỗi
      setIsLiked(!newLikedState);
      updateLikedStatus(!newLikedState);
    }
  };

  // Chỉ hiển thị sidebar khi có bài hát đang được chọn
  if (!currentTrack) {
    return null;
  }

  return (
    <div
      className="animate-in fade-in-50 slide-in-from-right-4 duration-300"
      style={{
        width: '300px',
        flexShrink: 0,
        backgroundColor: 'rgba(18, 18, 18, 0.7)',
        backdropFilter: 'blur(12px)',
        borderRadius: '12px',
        padding: '20px',
        border: '1px solid rgba(59, 130, 246, 0.2)',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        alignSelf: 'flex-start', // Giữ cho nó ở trên cùng
        boxShadow: '0 0 25px rgba(59, 130, 246, 0.1)',
        position: 'sticky', // Giúp nó cố định khi cuộn trang chính
        top: '24px', // Giữ khoảng cách với top
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{
          fontSize: '12px',
          fontWeight: '900',
          color: '#60a5fa',
          textTransform: 'uppercase',
          letterSpacing: '1px',
          margin: 0,
          textShadow: '0 0 8px rgba(59, 130, 246, 0.7)',
        }}>
          Đang phát
        </h3>
        <button
          onClick={stopTrack}
          title="Đóng trình phát"
          style={{ background: 'transparent', border: 'none', color: '#a7a7a7', cursor: 'pointer', padding: '4px' }}
          className="hover:text-white"
        >
          <X size={18} />
        </button>
      </div>

      {/* Ảnh bìa */}
      <div style={{
        width: '100%',
        aspectRatio: '1 / 1',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
      }}>
        {currentTrack.thumbnailUrl ? (
          <img
            src={currentTrack.thumbnailUrl}
            alt={currentTrack.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <div style={{
            width: '100%', height: '100%',
            backgroundColor: '#262626',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Music size={60} style={{ color: '#525252' }} />
          </div>
        )}
      </div>

      {/* Thông tin bài hát */}
      <div style={{ textAlign: 'center' }}>
        <p style={{
          fontSize: '1.125rem',
          fontWeight: 'bold',
          color: 'white',
          margin: 0,
        }}>
          {currentTrack.title}
        </p>
        <p style={{
          fontSize: '0.875rem',
          color: '#a3a3a3',
          margin: '4px 0 0',
        }}>
          {currentTrack.artist || 'Nghệ sĩ không xác định'}
        </p>
      </div>

      {/* Các nút tính năng */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '16px',
        padding: '12px 0',
        borderTop: '1px solid rgba(255, 255, 255, 0.05)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
      }}>
        <button
          onClick={handleToggleLike}
          title={isLiked ? "Bỏ thích" : "Yêu thích"}
          style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: isLiked ? '#3b82f6' : '#a7a7a7', padding: '8px' }}
          className="hover:text-white transition-colors"
        >
          <Heart size={22} fill={isLiked ? 'currentColor' : 'none'} />
        </button>
        <button
          onClick={() => selectSongForShare(currentTrack)}
          title="Chia sẻ"
          style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#a7a7a7', padding: '8px' }}
          className="hover:text-white transition-colors"
        >
          <Share2 size={22} />
        </button>
        <button
          onClick={() => alert('Tính năng "Thêm vào playlist" sẽ sớm được cập nhật!')}
          title="Thêm vào playlist"
          style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#a7a7a7', padding: '8px' }}
          className="hover:text-white transition-colors"
        >
          <ListPlus size={22} />
        </button>
      </div>

      {/* Sóng âm (Visualizer) */}
      {isPlaying && <AudioVisualizer />}

      {/* Có thể thêm các thông tin khác ở đây */}
      <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '16px', marginTop: 'auto', color: '#737373', fontSize: '12px', textAlign: 'center' }}>
        <Info size={14} style={{ display: 'inline-block', marginRight: '6px' }} />
        Thông tin chi tiết và lời bài hát sẽ sớm được cập nhật.
      </div>
    </div>
  );
};