import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAudio } from '../Contexts/AudioContext';
import api from '../axios';
import { History, CheckCircle2, Trash2, Clock, Music, ExternalLink, Loader2, AlertCircle, Play } from 'lucide-react';

interface DownloadItem {
  id: string;
  title: string;
  createdAt: string;
  status: 'Completed' | 'Downloading' | 'Error';
  thumbnailUrl: string;
  durationSeconds?: number;
}

const DownloadHistory = ({ lastRefreshTime }: { lastRefreshTime?: number }) => {
  const navigate = useNavigate();
  const { playTrack } = useAudio();
  const [history, setHistory] = useState<DownloadItem[]>([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token'); // Lấy token để theo dõi thay đổi người dùng

  const fetchHistory = async () => {
    try {
      // Quay lại sử dụng endpoint history gốc
      const res = await api.get('/import/history');
      // Giả sử API trả về đúng status, nếu không mặc định là Completed cho dữ liệu cũ
      const data = res.data.map((item: any) => ({ ...item, status: item.status || 'Completed' }));
      setHistory(data);
      console.log("DownloadHistory: History fetched successfully", data);
    } catch (error) {
      console.error("Failed to fetch history", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchHistory();
  }, [lastRefreshTime, token]); // Tự động tải lại khi có refresh từ SignalR hoặc khi người dùng thay đổi

  const formatDuration = (seconds?: number) => {
    if (!seconds) return "--:--";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleDelete = async (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete the song "${title}" from your library?`)) {
      try {
        await api.delete(`/media/${id}`); // Gọi API DELETE từ MediaController
        fetchHistory(); // Downloading...i lịch sử sau khi xóa thành công
      } catch (error: any) {
        console.error("Failed to delete song", error);
        const msg = error.response?.data?.message || "An error occurred while deleting the song.";
        alert(msg);
      }
    }
  };

  return (
    <div className="min-h-screen pb-32 flex justify-center">
      <div style={{
        width: '100%',
        backgroundColor: '#1a1a2e',
        borderRadius: '12px',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 0 30px rgba(59, 130, 246, 0.3)',
      }}>
        {/* Hero Header - Neon Blue Style */}
        <div style={{
          padding: '32px',
          paddingTop: '48px',
          display: 'flex',
          alignItems: 'flex-end',
          gap: '24px',
          background: 'linear-gradient(180deg, #00CCFF 0%, #1a1a2e 100%)',
          borderBottom: '1px solid rgba(59, 130, 246, 0.2)',
        }}>
          <div style={{
            width: '192px',
            height: '192px',
            background: 'linear-gradient(135deg, #00CCFF, #0066FF)',
            boxShadow: '0 0 30px rgba(0, 204, 255, 0.8), 0 0 60px rgba(0, 102, 255, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '8px',
          }}>
            <History size={80} style={{ color: 'white', filter: 'drop-shadow(0 0 10px rgba(255,255,255,0.5))' }} />
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: '12px', fontWeight: '700', color: '#000', textTransform: 'uppercase', marginBottom: '8px' }}>
              Download Manager
            </p>
            <h1 style={{ fontSize: '56px', fontWeight: '900', color: '#fff', marginBottom: '12px', textShadow: '0 0 20px rgba(0, 204, 255, 0.8), 0 0 40px rgba(0, 102, 255, 0.6)' }}>
              Music Download History
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#b3b3b3' }}>
              <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'linear-gradient(135deg, #FF00FF, #00FFFF)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: 'white', fontWeight: 'bold' }}>TV</div>
              <span>TuneVault User</span>
              <span style={{ color: '#00CCFF' }}>•</span>
              <span style={{ color: '#00CCFF', textShadow: '0 0 10px rgba(0, 204, 255, 0.5)' }}>{history.length} songs downloaded</span>
            </div>
          </div>
        </div>

        {/* Quick Actions (Optional) */}
        <div style={{ padding: '24px 32px', backgroundColor: 'rgba(0, 0, 0, 0.3)', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
          <button 
            onClick={() => navigate('/import')}
            style={{
              backgroundColor: '#3b82f6',
              color: 'white',
              padding: '10px 24px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: '900',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 0 15px rgba(59, 130, 246, 0.4)'
            }}
          >
            <Play size={16} fill="white" /> Import More Music
          </button>
        </div>

        {/* List Frame */}
        <div style={{ padding: '0 32px 32px' }}>
          <div style={{
            backgroundColor: 'rgba(24, 24, 24, 0.7)',
            borderRadius: '8px',
            padding: '16px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: 'inset 0 0 15px rgba(0,0,0,0.5)',
            marginTop: '24px'
          }}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '80px', color: '#737373', fontSize: '12px', fontWeight: '900', letterSpacing: '0.2em' }} className="animate-pulse">
                LOADING HISTORY...
              </div>
            ) : history.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '80px' }}>
                <Music size={64} style={{ color: '#262626', marginBottom: '24px' }} />
                <p style={{ color: '#737373', fontWeight: 'bold' }}>No songs have been downloaded yet..</p>
              </div>
            ) : (
              <>
                {/* Header Grid */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '40px 4fr 1.5fr 1.5fr 1.2fr 1fr',
                  gap: '16px',
                  padding: '12px 24px',
                  color: '#737373',
                  fontSize: '10px',
                  fontWeight: '900',
                  textTransform: 'uppercase',
                  letterSpacing: '0.2em',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                  marginBottom: '8px',
                }}>
                  <div style={{ textAlign: 'center' }}>#</div>
                  <div>Song Information</div>
                  <div>Duration</div>
                  <div>Date Added</div>
                  <div>Status</div>
                  <div style={{ textAlign: 'right' }}></div>
                </div>

                {/* Items */}
                {history.map((item, index) => (
                  <div 
                    key={item.id}
                    className="group"
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '40px 4fr 1.5fr 1.5fr 1.2fr 1fr',
                      gap: '16px',
                      padding: '12px 24px',
                      borderRadius: '12px',
                      alignItems: 'center',
                      transition: 'all 0.2s ease',
                      cursor: item.status === 'Completed' ? 'pointer' : 'default'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.03)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                    onClick={() => {
                      if (item.status !== 'Completed') return;
                      playTrack({ // Giả sử playTrack có thể xử lý đối tượng này
                        id: item.id,
                        title: item.title,
                        artist: 'YouTube',
                        url: `/api/media/stream/${item.id}`,
                        thumbnailUrl: item.thumbnailUrl,
                        durationSeconds: item.durationSeconds,
                      });
                    }}
                  >
                    <div style={{ color: '#737373', fontSize: '12px', fontFamily: 'monospace', textAlign: 'center' }}>
                      {item.status === 'Completed' ? (
                        <Play size={14} className="opacity-0 group-hover:opacity-100" style={{ color: '#3b82f6', margin: '0 auto' }} />
                      ) : (
                        <span>{(index + 1).toString().padStart(2, '0')}</span>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <img src={item.thumbnailUrl} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.05)' }} alt="" />
                      <div style={{ overflow: 'hidden' }}>
                        <div style={{ fontWeight: '600', fontSize: '14px', color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.title}</div>
                        <div style={{ color: '#737373', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                          <ExternalLink size={10} /> YouTube
                        </div>
                      </div>
                    </div>
                    <div style={{ color: '#B0B0B0', fontSize: '13px', fontFamily: 'monospace' }}>
                      {formatDuration(item.durationSeconds)}
                    </div>
                    <div style={{ color: '#B0B0B0', fontSize: '13px' }}>
                      {new Date(item.createdAt).toLocaleDateString('vi-VN')}
                    </div>
                    <div>
                      <StatusBadge status={item.status} />
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleDelete(item.id, item.title); }} 
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#737373',
                          cursor: 'pointer',
                          padding: '8px',
                          transition: 'color 0.2s',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.color = '#ef4444'}
                        onMouseLeave={(e) => e.currentTarget.style.color = '#737373'}
                        title="Delete from history"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const StatusBadge = ({ status }: { status: string }) => {
  switch (status) {
    case 'Completed':
      return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 12px', borderRadius: '12px', backgroundColor: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', border: '1px solid rgba(34, 197, 94, 0.2)' }}>
          <CheckCircle2 size={10} /> Done
        </span>
      );
    case 'Downloading':
      return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 12px', borderRadius: '12px', backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
          <Loader2 size={10} className="animate-spin" /> Downloading...
        </span>
      );
    case 'Error':
      return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 12px', borderRadius: '12px', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
          <AlertCircle size={10} /> Error
        </span>
      );
    default:
      return null;
  }
};

export default DownloadHistory;
