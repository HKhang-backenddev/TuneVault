import { useState, useEffect } from 'react';
import api from '../axios';
import { useAudio } from '../Contexts/AudioContext';

interface ChartItem {
  id: string;
  title: string;
  artist: string;
  url: string;
  thumbnailUrl: string;
  durationInSeconds: number;
  genre: string;
  playCount: number;
}

const TopCharts = () => {
  const { playTrack } = useAudio();
  const [items, setItems] = useState<ChartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [genre, setGenre] = useState<string>('');

  const genres = [
    { key: '', label: 'Tất cả' },
    { key: 'YouTube', label: 'YouTube' },
    { key: 'Lofi', label: 'Lofi' },
    { key: 'Pop', label: 'Pop' },
    { key: 'Rock', label: 'Rock' },
  ];

  useEffect(() => { fetchCharts(); }, [genre]);

  const fetchCharts = async () => {
    setLoading(true);
    try {
      const url = genre ? `/media/top?limit=50&genre=${encodeURIComponent(genre)}` : '/media/top?limit=50';
      const res = await api.get(url);
      setItems(res.data || []);
    } catch (error) {
      console.error("Lỗi:", error);
    }
    setLoading(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatViews = (count: number) => {
    if (count >= 1000000) return (count / 1000000).toFixed(1) + 'M';
    if (count >= 1000) return (count / 1000).toFixed(1) + 'K';
    return count.toString();
  };

  const handlePlay = (item: ChartItem, index: number) => {
    const trackItems = items.map(i => ({
      id: i.id, title: i.title, artist: i.artist,
      url: i.url, thumbnailUrl: i.thumbnailUrl, durationSeconds: i.durationInSeconds
    }));
    playTrack(trackItems[index], trackItems);
  };

  const getRankStyle = (index: number) => {
    if (index === 0) return { bg: '#fbbf24', label: 'Vàng', border: '#fef3c7' };
    if (index === 1) return { bg: '#94a3b8', label: 'Bạc', border: '#f1f5f9' };
    if (index === 2) return { bg: '#d97706', label: 'Đồng', border: '#fef3c7' };
    return { bg: '#4b5563', label: '', border: '#f3f4f6' };
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1000px', margin: '0 auto' }}>
      
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '16px',
        marginBottom: '20px',
        padding: '20px 24px',
        background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(245, 158, 11, 0.3)'
      }}>
        <div style={{ 
          width: '60px', height: '60px', 
          backgroundColor: 'rgba(255,255,255,0.2)', 
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '32px'
        }}>
          🏆
        </div>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: 'white', margin: 0 }}>Top Bài Hát</h1>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px', margin: '4px 0 0' }}>
            {items.length} bài hát • Bảng xếp hạng
          </p>
        </div>
      </div>

      {/* Genre Filter */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {genres.map(g => (
          <button
            key={g.key}
            onClick={() => setGenre(g.key)}
            style={{
              padding: '8px 16px',
              backgroundColor: genre === g.key ? '#f59e0b' : '#374151',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: genre === g.key ? 'bold' : 'normal',
              boxShadow: genre === g.key ? '0 2px 10px #f59e0b40' : 'none'
            }}
          >
            {g.label}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', backgroundColor: '#1e1e2e', borderRadius: '12px' }}>
          <div style={{ 
            width: '40px', height: '40px', 
            border: '4px solid #f59e0b', 
            borderTopColor: 'transparent', 
            borderRadius: '50%', 
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }} />
          <p style={{ color: '#9ca3af' }}>Đang tải bảng xếp hạng...</p>
        </div>
      ) : items.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '60px', 
          background: '#1e1e2e',
          borderRadius: '12px',
          border: '1px solid #3b3b5c'
        }}>
          <span style={{ fontSize: '64px', display: 'block', marginBottom: '16px' }}>📊</span>
          <p style={{ color: '#9ca3af', fontSize: '18px' }}>Chưa có dữ liệu</p>
        </div>
      ) : (
        <>
          {/* Table Header */}
          <div style={{ 
            display: 'flex', 
            padding: '14px 20px', 
            background: 'linear-gradient(90deg, #f59e0b 0%, #f97316 100%)',
            borderRadius: '12px 12px 0 0',
            color: 'white',
            fontSize: '13px',
            fontWeight: 'bold',
            textTransform: 'uppercase'
          }}>
            <div style={{ width: '50px', textAlign: 'center' }}>#</div>
            <div style={{ flex: 1 }}>Bài hát</div>
            <div style={{ width: '100px', textAlign: 'center' }}>Lượt nghe</div>
            <div style={{ width: '80px', textAlign: 'center' }}>Thời gian</div>
            <div style={{ width: '80px', textAlign: 'center' }}>Phát</div>
          </div>

          {/* Table Body */}
          {items.map((item, index) => {
            const style = getRankStyle(index);
            const isLast = index === items.length - 1;
            return (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '12px 20px',
                  backgroundColor: index % 2 === 0 ? '#1e1e2e' : '#252536',
                  borderLeft: `4px solid ${style.bg}`,
                  borderRight: '1px solid #3b3b5c',
                  borderBottom: isLast ? '1px solid #3b3b5c' : 'none',
                }}
              >
                {/* Index + Rank */}
                <div style={{ width: '50px', textAlign: 'center' }}>
                  <span style={{ 
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '32px', 
                    height: '32px', 
                    backgroundColor: style.bg,
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    color: index < 3 ? '#1e1e2e' : '#fff'
                  }}>
                    {index + 1}
                  </span>
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
                  </div>
                </div>

                {/* Views */}
                <div style={{ 
                  width: '100px', 
                  textAlign: 'center',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px'
                }}>
                  <span style={{ fontSize: '14px' }}>👁</span>
                  <span style={{ color: '#10b981', fontSize: '13px', fontWeight: 'bold' }}>
                    {formatViews(item.playCount)}
                  </span>
                </div>

                {/* Duration */}
                <div style={{ width: '80px', textAlign: 'center', color: '#9ca3af', fontSize: '13px' }}>
                  {formatTime(item.durationInSeconds)}
                </div>

                {/* Play Button */}
                <div style={{ width: '80px', textAlign: 'center' }}>
                  <button
                    onClick={() => handlePlay(item, index)}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#10b981',
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
            <span>Hiển thị </span>
            <strong style={{ color: '#f59e0b' }}>{items.length}</strong>
            <span> bài hát trong bảng xếp hạng</span>
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

export default TopCharts;
