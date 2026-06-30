import { useState, useEffect } from 'react';
import api from '../axios';
import { useAudio } from '../Contexts/AudioContext';

interface HistoryItem {
  id: string;
  title: string;
  artist: string;
  url: string;
  thumbnailUrl: string;
  durationInSeconds: number;
  genre: string;
  playedAt: string;
}

const ListenHistory = () => {
  const { playTrack } = useAudio();
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchHistory(); }, []);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await api.get('/media/history?pageSize=100');
      
      // Backend trả về: data, items, hoặc trực tiếp array
      let data = res.data;
      if (data?.items) data = data.items;
      if (data?.data) data = data.data;
      
      // Map dữ liệu
      const mapped = (Array.isArray(data) ? data : []).map((item: any) => ({
        id: item.id || item.mediaItemId || item.mediaItem?.id,
        title: item.title || item.mediaItem?.title || item.mediaItem?.Title,
        artist: item.artist?.name || item.Artist?.Name || item.artist || item.mediaItem?.artist?.Name || 'Nghệ sĩ',
        url: item.url || item.mediaItem?.url || '',
        thumbnailUrl: item.thumbnailUrl || item.ThumbnailUrl || item.mediaItem?.thumbnailUrl || item.mediaItem?.ThumbnailUrl || '',
        durationInSeconds: item.durationInSeconds || item.DurationInSeconds || item.mediaItem?.durationInSeconds || 0,
        genre: item.genre || item.Genre || item.mediaItem?.genre || '',
        playedAt: item.playedAt || item.PlayedAt || item.createdAt || item.created_at || new Date().toISOString()
      }));
      
      setItems(mapped);
    } catch (error) {
      console.error("Lỗi:", error);
      setItems([]);
    }
    setLoading(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatRelativeTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const diff = Date.now() - date.getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (mins < 1) return 'Vừa xong';
    if (mins < 60) return `${mins} phút`;
    if (hours < 24) return `${hours} giờ`;
    if (days < 7) return `${days} ngày`;
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: 'short' });
  };

  const getTimeIcon = (dateStr: string) => {
    const date = new Date(dateStr);
    const hour = date.getHours();
    if (hour < 6) return { icon: '🌙', label: 'Đêm khuya' };
    if (hour < 12) return { icon: '☀️', label: 'Sáng' };
    if (hour < 18) return { icon: '🌤️', label: 'Chiều' };
    return { icon: '🌆', label: 'Tối' };
  };

  const handlePlay = (item: HistoryItem, index: number) => {
    const trackItems = items.map(i => ({
      id: i.id, title: i.title, artist: i.artist,
      url: i.url, thumbnailUrl: i.thumbnailUrl, durationSeconds: i.durationInSeconds
    }));
    playTrack(trackItems[index], trackItems);
  };

  const handleClearHistory = async () => {
    if (!confirm('Xóa toàn bộ lịch sử?')) return;
    try {
      await api.delete('/media/history');
      setItems([]);
    } catch (error) {
      console.error("Lỗi:", error);
    }
  };

  // Group by date
  const groupedItems = items.reduce((acc, item) => {
    const date = new Date(item.playedAt);
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();
    const dateKey = isToday ? 'Hôm nay' : date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(item);
    return acc;
  }, {} as Record<string, HistoryItem[]>);

  const sortedDates = Object.entries(groupedItems).sort((a, b) => {
    const dateA = new Date(a[1][0]?.playedAt || 0);
    const dateB = new Date(b[1][0]?.playedAt || 0);
    return dateB.getTime() - dateA.getTime();
  });

  const totalTime = items.reduce((acc, item) => acc + (item.durationInSeconds || 0), 0);
  const formatTotalTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return hours > 0 ? `${hours}h ${mins}m` : `${mins} phút`;
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1000px', margin: '0 auto' }}>
      
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        gap: '16px',
        marginBottom: '20px',
        padding: '20px 24px',
        background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(139, 92, 246, 0.3)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ 
            width: '60px', height: '60px', 
            backgroundColor: 'rgba(255,255,255,0.2)', 
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '32px'
          }}>
            🎧
          </div>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: 'white', margin: 0 }}>Lịch Sử Nghe</h1>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px', margin: '4px 0 0' }}>
              {items.length} bài hát • {formatTotalTime(totalTime)}
            </p>
          </div>
        </div>
        {items.length > 0 && (
          <button
            onClick={handleClearHistory}
            style={{
              padding: '10px 20px',
              backgroundColor: 'rgba(255,255,255,0.2)',
              color: 'white',
              border: '1px solid rgba(255,255,255,0.3)',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold'
            }}
          >
            🗑 Xóa lịch sử
          </button>
        )}
      </div>

      {/* Loading */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', backgroundColor: '#1e1e2e', borderRadius: '12px' }}>
          <div style={{ 
            width: '40px', height: '40px', 
            border: '4px solid #8b5cf6', 
            borderTopColor: 'transparent', 
            borderRadius: '50%', 
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }} />
          <p style={{ color: '#9ca3af' }}>Đang tải lịch sử...</p>
        </div>
      ) : items.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '60px', 
          background: '#1e1e2e',
          borderRadius: '12px',
          border: '1px solid #3b3b5c'
        }}>
          <span style={{ fontSize: '64px', display: 'block', marginBottom: '16px' }}>🎵</span>
          <p style={{ color: '#9ca3af', fontSize: '18px' }}>Chưa có lịch sử nghe</p>
          <p style={{ color: '#6b7280', fontSize: '14px', marginTop: '8px' }}>Hãy bắt đầu nghe nhạc!</p>
        </div>
      ) : (
        <>
          {/* Table Header */}
          <div style={{ 
            display: 'flex', 
            padding: '14px 20px', 
            background: 'linear-gradient(90deg, #8b5cf6 0%, #6366f1 50%, #3b82f6 100%)',
            borderRadius: '12px 12px 0 0',
            color: 'white',
            fontSize: '13px',
            fontWeight: 'bold',
            textTransform: 'uppercase'
          }}>
            <div style={{ width: '50px', textAlign: 'center' }}>#</div>
            <div style={{ width: '50px', textAlign: 'center' }}>Giờ</div>
            <div style={{ flex: 1 }}>Bài hát</div>
            <div style={{ width: '80px', textAlign: 'center' }}>Thời lượng</div>
            <div style={{ width: '80px', textAlign: 'center' }}>Phát</div>
          </div>

          {/* Grouped by Date */}
          {sortedDates.map(([date, dateItems]) => (
            <div key={date}>
              {/* Date Header */}
              <div style={{ 
                padding: '12px 20px', 
                backgroundColor: '#374151',
                borderLeft: '4px solid #8b5cf6',
                borderRight: '1px solid #3b3b5c',
                color: '#e5e7eb',
                fontSize: '13px',
                fontWeight: 'bold'
              }}>
                📅 {date} • {dateItems.length} bài
              </div>

              {/* Items */}
              {dateItems.map((item, index) => {
                const timeInfo = getTimeIcon(item.playedAt);
                const globalIndex = items.indexOf(item);
                const dateIndex = dateItems.indexOf(item);
                const isLast = globalIndex === items.length - 1;
                return (
                  <div
                    key={`${item.id}-${index}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '12px 20px',
                      backgroundColor: dateIndex % 2 === 0 ? '#1e1e2e' : '#252536',
                      borderLeft: '1px solid #3b3b5c',
                      borderRight: '1px solid #3b3b5c',
                      borderBottom: isLast ? '1px solid #3b3b5c' : 'none',
                    }}
                  >
                    {/* Index */}
                    <div style={{ width: '50px', textAlign: 'center', color: '#6b7280', fontSize: '14px' }}>
                      {globalIndex + 1}
                    </div>

                    {/* Time Icon */}
                    <div style={{ width: '50px', textAlign: 'center', fontSize: '18px' }}>
                      {timeInfo.icon}
                    </div>

                    {/* Song Info */}
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <img 
                        src={item.thumbnailUrl} 
                        alt={item.title}
                        style={{ 
                          width: '48px', height: '48px', 
                          borderRadius: '8px', 
                          objectFit: 'cover',
                          border: '2px solid #3b3b5c'
                        }} 
                      />
                      <div>
                        <p style={{ color: '#f3f4f6', fontSize: '14px', fontWeight: '500', margin: 0 }}>{item.title}</p>
                        <p style={{ color: '#9ca3af', fontSize: '12px', margin: '4px 0 0' }}>{item.artist}</p>
                        <p style={{ color: '#8b5cf6', fontSize: '11px', margin: '4px 0 0' }}>{timeInfo.label} • {formatRelativeTime(item.playedAt)}</p>
                      </div>
                    </div>

                    {/* Duration */}
                    <div style={{ width: '80px', textAlign: 'center', color: '#9ca3af', fontSize: '13px' }}>
                      {formatTime(item.durationInSeconds)}
                    </div>

                    {/* Play Button */}
                    <div style={{ width: '80px', textAlign: 'center' }}>
                      <button
                        onClick={() => handlePlay(item, globalIndex)}
                        style={{
                          padding: '8px 16px',
                          backgroundColor: '#8b5cf6',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '13px',
                          fontWeight: 'bold'
                        }}
                      >
                        ▶ Phát
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}

          {/* Table Footer */}
          <div style={{ 
            padding: '16px 20px', 
            background: 'linear-gradient(180deg, #252536 0%, #1e1e2e 100%)',
            borderRadius: '0 0 12px 12px',
            border: '1px solid #3b3b5c',
            borderTop: 'none',
            color: '#9ca3af',
            fontSize: '13px'
          }}>
            <span>Đã nghe </span>
            <strong style={{ color: '#8b5cf6' }}>{items.length}</strong>
            <span> bài hát • Tổng thời gian: </span>
            <strong style={{ color: '#10b981' }}>{formatTotalTime(totalTime)}</strong>
          </div>
        </>
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default ListenHistory;
