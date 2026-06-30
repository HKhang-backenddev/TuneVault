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
  playCount: number;
}

const TopCharts = () => {
  const { playTrack } = useAudio();
  const [items, setItems] = useState<ChartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    console.log('🔄 TopCharts: Đang load...');
    fetchCharts();
  }, []);

  const fetchCharts = async () => {
    setLoading(true);
    setError('');
    try {
      console.log('📡 Gọi API: /api/media/top?limit=20');
      const res = await api.get('/media/top?limit=20');
      console.log('📥 Response:', res.data);
      
      // Lấy data từ response
      let data = res.data;
      if (data?.items) data = data.items;
      if (data?.data) data = data.data;
      
      console.log('📋 Data sau map:', data);
      
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
      console.error('❌ Lỗi:', err);
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

  const formatTime = (s: number) => `${Math.floor(s/60)}:${(s%60).toString().padStart(2,'0')}`;

  return (
    <div style={{ padding: '24px', color: 'white' }}>
      <h1 style={{ fontSize: '24px', marginBottom: '20px' }}>🏆 Top Bài Hát</h1>
      
      {loading && <p>⏳ Đang tải...</p>}
      
      {error && (
        <div style={{ padding: '20px', backgroundColor: '#3f1414', borderRadius: '8px' }}>
          <p>❌ Lỗi: {error}</p>
          <button onClick={fetchCharts} style={{ marginTop: '10px', padding: '8px 16px', cursor: 'pointer' }}>
            Thử lại
          </button>
        </div>
      )}
      
      {!loading && !error && items.length === 0 && (
        <div style={{ padding: '40px', textAlign: 'center', backgroundColor: '#1e1e2e', borderRadius: '8px' }}>
          <p style={{ fontSize: '48px', margin: '0 0 16px' }}>📊</p>
          <p>Chưa có dữ liệu bảng xếp hạng</p>
          <p style={{ fontSize: '12px', color: '#888' }}>Hãy phát một số bài hát để tạo dữ liệu</p>
        </div>
      )}
      
      {!loading && items.length > 0 && (
        <div>
          <p style={{ color: '#888', marginBottom: '16px' }}>Tìm thấy {items.length} bài hát</p>
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
                  borderRadius: '8px',
                  borderLeft: index < 3 ? `4px solid ${index === 0 ? '#fbbf24' : index === 1 ? '#94a3b8' : '#d97706'}` : 'none'
                }}
              >
                <span style={{ width: '30px', textAlign: 'center', fontWeight: 'bold', color: index < 3 ? '#fbbf24' : '#888' }}>
                  {index + 1}
                </span>
                {item.thumbnailUrl && (
                  <img src={item.thumbnailUrl} alt="" style={{ width: '48px', height: '48px', borderRadius: '6px', objectFit: 'cover' }} />
                )}
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontWeight: 'bold' }}>{item.title}</p>
                  <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#888' }}>{item.artist}</p>
                </div>
                <span style={{ color: '#10b981', fontSize: '12px' }}>👁 {item.playCount}</span>
                <span style={{ color: '#888', fontSize: '12px', width: '45px' }}>{formatTime(item.durationInSeconds)}</span>
                <button 
                  onClick={() => handlePlay(item, index)}
                  style={{ padding: '6px 12px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
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

export default TopCharts;
