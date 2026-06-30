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
  playedAt: string;
}

const ListenHistory = () => {
  const { playTrack } = useAudio();
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    console.log('🔄 ListenHistory: Đang load...');
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setLoading(true);
    setError('');
    try {
      console.log('📡 Gọi API: /api/media/history?pageSize=50');
      const res = await api.get('/media/history?pageSize=50');
      console.log('📥 Response:', res.data);
      
      let data = res.data;
      if (data?.items) data = data.items;
      if (data?.data) data = data.data;
      
      console.log('📋 Data sau map:', data);
      
      if (Array.isArray(data) && data.length > 0) {
        setItems(data.map((item: any) => ({
          id: item.id || item.mediaItemId || item.mediaItem?.id || '',
          title: item.title || item.mediaItem?.title || `Bài không tên`,
          artist: item.artist || item.mediaItem?.artist || item.Artist?.Name || 'Nghệ sĩ',
          url: item.url || item.mediaItem?.url || '',
          thumbnailUrl: item.thumbnailUrl || item.ThumbnailUrl || item.mediaItem?.thumbnailUrl || '',
          durationInSeconds: item.durationInSeconds || item.mediaItem?.durationInSeconds || 180,
          playedAt: item.playedAt || item.PlayedAt || item.createdAt || new Date().toISOString()
        })));
      } else {
        setItems([]);
      }
    } catch (err: any) {
      console.error('❌ Lỗi:', err);
      setError(err.message || 'Lỗi kết nối');
    }
    setLoading(false);
  };

  const handlePlay = (item: HistoryItem, index: number) => {
    playTrack({
      id: item.id,
      title: item.title,
      artist: item.artist,
      url: item.url,
      thumbnailUrl: item.thumbnailUrl,
      durationSeconds: item.durationInSeconds
    }, items);
  };

  const formatTime = (s: number) => `${Math.floor(s/60)}:${(s%60).toString().padStart(2,'0')}`;
  const formatDate = (d: string) => new Date(d).toLocaleString('vi-VN');

  return (
    <div style={{ padding: '24px', color: 'white' }}>
      <h1 style={{ fontSize: '24px', marginBottom: '20px' }}>🎧 Lịch Sử Nghe</h1>
      
      {loading && <p>⏳ Đang tải...</p>}
      
      {error && (
        <div style={{ padding: '20px', backgroundColor: '#3f1414', borderRadius: '8px' }}>
          <p>❌ Lỗi: {error}</p>
          <button onClick={fetchHistory} style={{ marginTop: '10px', padding: '8px 16px', cursor: 'pointer' }}>
            Thử lại
          </button>
        </div>
      )}
      
      {!loading && !error && items.length === 0 && (
        <div style={{ padding: '40px', textAlign: 'center', backgroundColor: '#1e1e2e', borderRadius: '8px' }}>
          <p style={{ fontSize: '48px', margin: '0 0 16px' }}>🎵</p>
          <p>Chưa có lịch sử nghe</p>
          <p style={{ fontSize: '12px', color: '#888' }}>Hãy phát một số bài hát</p>
        </div>
      )}
      
      {!loading && items.length > 0 && (
        <div>
          <p style={{ color: '#888', marginBottom: '16px' }}>Đã nghe {items.length} bài</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {items.map((item, index) => (
              <div 
                key={item.id || index}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '12px',
                  padding: '12px',
                  backgroundColor: index % 2 === 0 ? '#1e1e2e' : '#252536',
                  borderRadius: '8px'
                }}
              >
                <span style={{ width: '30px', textAlign: 'center', color: '#888' }}>{index + 1}</span>
                {item.thumbnailUrl && (
                  <img src={item.thumbnailUrl} alt="" style={{ width: '48px', height: '48px', borderRadius: '6px', objectFit: 'cover' }} />
                )}
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontWeight: 'bold' }}>{item.title}</p>
                  <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#888' }}>{item.artist}</p>
                  <p style={{ margin: '4px 0 0', fontSize: '10px', color: '#666' }}>{formatDate(item.playedAt)}</p>
                </div>
                <span style={{ color: '#888', fontSize: '12px', width: '45px' }}>{formatTime(item.durationInSeconds)}</span>
                <button 
                  onClick={() => handlePlay(item, index)}
                  style={{ padding: '6px 12px', backgroundColor: '#8b5cf6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                  ▶
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ListenHistory;
