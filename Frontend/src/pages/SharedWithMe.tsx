import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../axios';
import { Music, Play, User, Users, Clock, Save, Loader2 } from 'lucide-react';
import { useAudio } from '../Contexts/AudioContext';

interface SharedItem {
  mediaId: string;
  title: string;
  artistName: string;
  senderName: string;
  sharedAt: string;
  thumbnailUrl: string | null;
  mediaUrl: string;
}

const SharedWithMe = () => {
  const navigate = useNavigate();
  const { playTrack } = useAudio();
  const [items, setItems] = useState<SharedItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSharedItems = async () => {
    setLoading(true);
    try {
      const response = await api.get('/User/shared-with-me');
      setItems(response.data?.data || response.data || []);
    } catch (error) {
      console.error("Failed to fetch shared items:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSharedItems();
    window.addEventListener('mediaShared', fetchSharedItems);
    return () => window.removeEventListener('mediaShared', fetchSharedItems);
  }, []);

  const handlePlay = (item: SharedItem, queue: SharedItem[]) => {
    const trackToPlay = {
      id: item.mediaId,
      title: item.title,
      artist: item.artistName,
      url: item.mediaUrl.startsWith('/') ? item.mediaUrl : `/api/media/stream/${item.mediaId}`,
      thumbnailUrl: item.thumbnailUrl || '',
    };
    const trackQueue = queue.map(i => ({
      id: i.mediaId,
      title: i.title,
      artist: i.artistName,
      url: i.mediaUrl.startsWith('/') ? i.mediaUrl : `/api/media/stream/${i.mediaId}`,
      thumbnailUrl: i.thumbnailUrl || '',
    }));
    playTrack(trackToPlay, trackQueue);
  };

  const handleSave = async (e: React.MouseEvent, mediaId: string) => {
    e.stopPropagation(); // Ngăn không cho sự kiện click phát nhạc
    try {
      await api.post(`/media/save/${mediaId}`);
      alert('Song saved to your library!');
      navigate('/'); // Chuyển hướng về trang chủ
    } catch (error: any) {
      const message = error.response?.data?.message || "Cannot save this song.";
      alert(message);
    }
  };

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString.endsWith('Z') ? dateString : dateString + 'Z');
    const now = new Date();
    const seconds = Math.round((now.getTime() - date.getTime()) / 1000);
    const minutes = Math.round(seconds / 60);
    const hours = Math.round(minutes / 60);
    const days = Math.round(hours / 24);

    if (seconds < 60) return "just now";
    if (minutes < 60) return `${minutes} minutes ago`;
    if (hours < 24) return `${hours} hours ago`;
    if (days === 1) return `yesterday`;
    return date.toLocaleDateString('vi-VN');
  };

  return (
    <div style={{ width: '100%', padding: '24px 32px' }}>
      <div style={{
        backgroundColor: '#1a1a2e',
        borderRadius: '12px',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 0 30px rgba(131, 58, 180, 0.3)',
      }}>
        {/* Hero Header - Neon Green Style */}
        <div style={{
          padding: '32px', paddingTop: '48px', display: 'flex', alignItems: 'flex-end', gap: '24px',
          background: 'linear-gradient(180deg, #833ab4 0%, #1a1a2e 100%)',
          borderBottom: '1px solid rgba(131, 58, 180, 0.2)',
        }}>
          <div style={{
            width: '192px', height: '192px', background: 'linear-gradient(135deg, #833ab4, #fd1d1d)',
            boxShadow: '0 0 30px rgba(131, 58, 180, 0.8), 0 0 60px rgba(0, 255, 255, 0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px',
          }}>
            <Users size={80} style={{ color: 'black', filter: 'drop-shadow(0 0 10px rgba(255,255,255,0.5))' }} />
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: '12px', fontWeight: '700', color: '#000', textTransform: 'uppercase', marginBottom: '8px' }}>
              Playlist
            </p>
            <h1 style={{ fontSize: '72px', fontWeight: '900', color: '#fff', marginBottom: '16px', lineHeight: 1, textShadow: '0 0 20px rgba(131, 58, 180, 0.8), 0 0 40px rgba(0, 255, 255, 0.6)' }}>
              Shared With Me
            </h1>
            <p style={{ color: '#b3b3b3', fontSize: '14px' }}>
              {items.length} songs
            </p>
          </div>
        </div>

        {/* List Frame */}
        <div style={{ padding: '24px 32px 32px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '80px', color: '#833ab4', fontSize: '14px', fontWeight: '700', textShadow: '0 0 10px rgba(131, 58, 180, 0.5)' }}>
              LOADING...
            </div>
          ) : items.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px', backgroundColor: '#1a1a2e', borderRadius: '12px', boxShadow: '0 0 20px rgba(131, 58, 180, 0.2)' }}>
              <Music size={64} style={{ color: '#833ab4', marginBottom: '24px', filter: 'drop-shadow(0 0 20px rgba(131, 58, 180, 0.8))' }} />
              <p style={{ color: '#b3b3b3', fontWeight: 'bold', fontSize: '18px' }}>Your inbox is empty.</p>
            </div>
          ) : (
            <div style={{
              backgroundColor: 'rgba(26, 26, 46, 0.8)', borderRadius: '12px', padding: '16px',
              border: '1px solid rgba(131, 58, 180, 0.2)', boxShadow: '0 0 20px rgba(131, 58, 180, 0.2)',
            }}>
              {/* Header Grid */}
              <div style={{
                display: 'grid', gridTemplateColumns: '40px 5fr 3fr 2fr 1fr', gap: '16px', padding: '12px 24px',
                color: '#fd1d1d', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em',
                textShadow: '0 0 5px rgba(0, 255, 255, 0.5)',
                borderBottom: '1px solid rgba(255, 255, 255, 0.05)', marginBottom: '8px',
              }}>
                <div style={{ textAlign: 'center' }}>#</div>
                <div>Title</div>
                <div>Sender</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={12} /> Date Received</div>
                <div></div>
              </div>

              {/* Items */}
              {items.map((item, index) => (
                <div
                  key={item.mediaId}
                  className="group"
                  style={{
                    display: 'grid', gridTemplateColumns: '40px 5fr 3fr 2fr 1fr', gap: '16px', padding: '8px 24px',
                    borderRadius: '12px', cursor: 'pointer', alignItems: 'center', transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  onClick={() => handlePlay(item, items)}
                >
                  <div style={{ color: '#737373', fontSize: '12px', fontFamily: 'monospace', textAlign: 'center' }}>
                    {(index + 1).toString().padStart(2, '0')}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0 }}>
                      {item.thumbnailUrl ? (
                        <img src={item.thumbnailUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: '100%', height: '100%', backgroundColor: '#262626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Music size={20} style={{ color: '#525252' }} />
                        </div>
                      )}
                    </div>
                    <div style={{ overflow: 'hidden' }}>
                      <p style={{ fontWeight: '600', fontSize: '15px', color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.title}</p>
                      <p style={{ color: '#B0B0B0', fontSize: '13px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.artistName}</p>
                    </div>
                  </div>
                  <div style={{ color: '#B0B0B0', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <User size={14} style={{ color: '#737373' }} />
                    {item.senderName}
                  </div>
                  <div style={{ color: '#B0B0B0', fontSize: '13px' }}>
                    {formatRelativeTime(item.sharedAt)}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', opacity: 0 }} className="group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => handleSave(e, item.mediaId)}
                      title="Save to Library"
                      style={{ background: 'none', border: 'none', color: '#737373', cursor: 'pointer', padding: '8px' }}
                      onMouseEnter={(e) => e.currentTarget.style.color = '#22c55e'}
                      onMouseLeave={(e) => e.currentTarget.style.color = '#737373'}
                    >
                      <Save size={16} />
                    </button>
                    <button
                      onClick={() => handlePlay(item, items)}
                      title="Play Music"
                      style={{ background: 'none', border: 'none', color: '#737373', cursor: 'pointer', padding: '8px' }}
                      onMouseEnter={(e) => e.currentTarget.style.color = '#3b82f6'}
                      onMouseLeave={(e) => e.currentTarget.style.color = '#737373'}
                    >
                      <Play size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SharedWithMe;
