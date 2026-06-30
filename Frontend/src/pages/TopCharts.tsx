import { useState, useEffect } from 'react';
import api from '../axios';
import { useAudio } from '../Contexts/AudioContext';
import { Play, Music, RefreshCw, TrendingUp } from 'lucide-react';

interface ChartItem {
  id: string;
  title: string;
  artist: string;
  url: string;
  thumbnailUrl: string;
  durationInSeconds: number;
  playCount: number;
}

const TopCharts = () => {
  const { playTrack } = useAudio();
  const [items, setItems] = useState<ChartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCharts();
  }, []);

  const fetchCharts = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/media/top?limit=20');
      let data = res.data;
      if (data?.items) data = data.items;
      if (data?.data) data = data.data;

      if (Array.isArray(data) && data.length > 0) {
        setItems(data.map((item: any, index: number) => ({
          id: item.id || item.mediaItemId || '',
          title: item.title || item.Title || `Bài ${index + 1}`,
          artist: item.artist?.name || item.Artist?.Name || item.artist || 'Nghệ sĩ',
          url: item.url || item.Url || '',
          thumbnailUrl: item.thumbnailUrl || item.ThumbnailUrl || '',
          durationInSeconds: item.durationInSeconds || item.DurationInSeconds || 180,
          playCount: item.playCount || item.PlayCount || (data.length - index)
        })));
      } else {
        setItems([]);
      }
    } catch (err: any) {
      setError(err.message || 'Lỗi kết nối');
    }
    setLoading(false);
  };

  const handlePlay = (item: ChartItem, index: number) => {
    playTrack({
      id: item.id,
      title: item.title,
      artist: item.artist,
      url: item.url,
      thumbnailUrl: item.thumbnailUrl,
      durationSeconds: item.durationInSeconds
    }, items);
  };

  const handlePlayAll = () => {
    if (items.length > 0) {
      handlePlay(items[0], 0);
    }
  };

  const formatTime = (s: number) => `${Math.floor(s/60)}:${(s%60).toString().padStart(2,'0')}`;

  const styles = {
    container: {
      padding: '24px 32px',
      maxWidth: '900px',
      margin: '0 auto',
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: '24px',
      padding: '20px 24px',
      background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.15) 0%, rgba(245, 158, 11, 0.08) 100%)',
      borderRadius: '16px',
      border: '1px solid rgba(251, 191, 36, 0.2)',
    },
    titleWrapper: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
    },
    iconBox: {
      width: '48px',
      height: '48px',
      background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
      borderRadius: '12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    title: {
      fontSize: '24px',
      fontWeight: 'bold',
      color: 'white',
      margin: 0,
    },
    subtitle: {
      fontSize: '13px',
      color: 'rgba(255,255,255,0.6)',
      margin: '4px 0 0 0',
    },
    playAllBtn: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '12px 24px',
      background: 'linear-gradient(135deg, #10b981, #059669)',
      border: 'none',
      borderRadius: '25px',
      color: 'white',
      fontWeight: '600',
      fontSize: '14px',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
    },
    loadingBox: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '60px',
      backgroundColor: '#1a1a2e',
      borderRadius: '16px',
      border: '1px solid rgba(255,255,255,0.05)',
    },
    errorBox: {
      padding: '20px 24px',
      backgroundColor: 'rgba(239, 68, 68, 0.1)',
      borderRadius: '12px',
      border: '1px solid rgba(239, 68, 68, 0.2)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    emptyBox: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '60px',
      backgroundColor: '#1a1a2e',
      borderRadius: '16px',
      border: '1px solid rgba(255,255,255,0.05)',
      textAlign: 'center' as const,
    },
    listContainer: {
      backgroundColor: '#1a1a2e',
      borderRadius: '16px',
      border: '1px solid rgba(255,255,255,0.05)',
      overflow: 'hidden',
    },
    listHeader: {
      display: 'grid',
      gridTemplateColumns: '50px 1fr 100px 100px 60px',
      padding: '12px 20px',
      backgroundColor: 'rgba(255,255,255,0.03)',
      borderBottom: '1px solid rgba(255,255,255,0.05)',
      fontSize: '11px',
      fontWeight: '600',
      color: 'rgba(255,255,255,0.5)',
      textTransform: 'uppercase' as const,
      letterSpacing: '0.5px',
    },
    songRow: {
      display: 'grid',
      gridTemplateColumns: '50px 1fr 100px 100px 60px',
      padding: '12px 20px',
      alignItems: 'center',
      borderBottom: '1px solid rgba(255,255,255,0.03)',
      transition: 'all 0.2s ease',
      cursor: 'pointer',
    },
    rank: {
      fontSize: '16px',
      fontWeight: 'bold',
      color: 'rgba(255,255,255,0.3)',
    },
    rankGold: { color: '#fbbf24' },
    rankSilver: { color: '#94a3b8' },
    rankBronze: { color: '#d97706' },
    songInfo: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      minWidth: 0,
    },
    thumbnail: {
      width: '48px',
      height: '48px',
      borderRadius: '8px',
      objectFit: 'cover' as const,
      backgroundColor: '#2a2a3e',
    },
    songText: {
      minWidth: 0,
    },
    songTitle: {
      fontSize: '14px',
      fontWeight: '600',
      color: 'white',
      margin: 0,
      whiteSpace: 'nowrap' as const,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    },
    songArtist: {
      fontSize: '12px',
      color: 'rgba(255,255,255,0.5)',
      margin: '4px 0 0 0',
      whiteSpace: 'nowrap' as const,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    },
    playCount: {
      fontSize: '13px',
      color: '#10b981',
      fontWeight: '500',
    },
    duration: {
      fontSize: '13px',
      color: 'rgba(255,255,255,0.4)',
    },
    playBtn: {
      width: '36px',
      height: '36px',
      backgroundColor: '#10b981',
      border: 'none',
      borderRadius: '50%',
      color: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
    },
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.titleWrapper}>
          <div style={styles.iconBox}>
            <TrendingUp size={24} style={{ color: 'white' }} />
          </div>
          <div>
            <h1 style={styles.title}>🏆 Bảng Xếp Hạng</h1>
            <p style={styles.subtitle}>{items.length > 0 ? `${items.length} bài hát được nghe nhiều nhất` : 'Top bài hát phổ biến'}</p>
          </div>
        </div>
        {items.length > 0 && (
          <button
            style={styles.playAllBtn}
            onClick={handlePlayAll}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            <Play size={16} fill="white" />
            Phát tất cả
          </button>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <div style={styles.loadingBox}>
          <RefreshCw size={32} style={{ color: '#fbbf24', animation: 'spin 1s linear infinite' }} />
          <p style={{ color: 'rgba(255,255,255,0.6)', marginTop: '16px' }}>Đang tải dữ liệu...</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={styles.errorBox}>
          <p style={{ color: '#ef4444', margin: 0 }}>❌ {error}</p>
          <button
            onClick={fetchCharts}
            style={{
              padding: '8px 16px',
              backgroundColor: '#ef4444',
              border: 'none',
              borderRadius: '8px',
              color: 'white',
              cursor: 'pointer',
            }}
          >
            Thử lại
          </button>
        </div>
      )}

      {/* Empty */}
      {!loading && !error && items.length === 0 && (
        <div style={styles.emptyBox}>
          <Music size={64} style={{ color: '#2a2a3e', marginBottom: '16px' }} />
          <p style={{ fontSize: '18px', fontWeight: '600', color: 'rgba(255,255,255,0.7)', margin: '0 0 8px 0' }}>
            Chưa có dữ liệu bảng xếp hạng
          </p>
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', margin: 0 }}>
            Hãy phát một số bài hát để tạo dữ liệu
          </p>
        </div>
      )}

      {/* List */}
      {!loading && !error && items.length > 0 && (
        <div style={styles.listContainer}>
          <div style={styles.listHeader}>
            <span>#</span>
            <span>Bài hát</span>
            <span>Lượt nghe</span>
            <span>Thời lượng</span>
            <span></span>
          </div>
          {items.map((item, index) => (
            <div
              key={item.id || index}
              style={{
                ...styles.songRow,
                backgroundColor: index % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(16, 185, 129, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = index % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)';
              }}
              onClick={() => handlePlay(item, index)}
            >
              <span style={{
                ...styles.rank,
                ...(index === 0 ? styles.rankGold : {}),
                ...(index === 1 ? styles.rankSilver : {}),
                ...(index === 2 ? styles.rankBronze : {}),
              }}>
                {index + 1}
              </span>
              <div style={styles.songInfo}>
                {item.thumbnailUrl ? (
                  <img src={item.thumbnailUrl} alt="" style={styles.thumbnail} />
                ) : (
                  <div style={{ ...styles.thumbnail, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Music size={20} style={{ color: '#4a4a5e' }} />
                  </div>
                )}
                <div style={styles.songText}>
                  <p style={styles.songTitle}>{item.title}</p>
                  <p style={styles.songArtist}>{item.artist}</p>
                </div>
              </div>
              <span style={styles.playCount}>👁 {item.playCount}</span>
              <span style={styles.duration}>{formatTime(item.durationInSeconds)}</span>
              <button
                style={styles.playBtn}
                onClick={(e) => {
                  e.stopPropagation();
                  handlePlay(item, index);
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                <Play size={14} fill="white" />
              </button>
            </div>
          ))}
        </div>
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
