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
    <div style={{ width: '100%', maxWidth: '900px', margin: '24px auto', paddingBottom: '6rem' }}>
      <style>{`
        /* Keyframes cho viền chuyển động */
        @keyframes animated-border-shared {
          0% { background-position: 0% center; }
          100% { background-position: 200% center; }
        }
      `}</style>
      <div style={{
        backgroundColor: 'rgba(0,0,0,0.5)',
        border: '2px solid transparent',
        borderRadius: '24px',
        backgroundImage: 'linear-gradient(rgba(0,0,0,0.8), rgba(0,0,0,0.8)), linear-gradient(135deg, #c084fc, #3b82f6, #10b981, #c084fc)',
        backgroundOrigin: 'border-box',
        backgroundClip: 'padding-box, border-box',
        backgroundSize: '200% 100%',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.8), 0 0 40px rgba(16, 185, 129, 0.2)',
        animation: 'animated-border-shared 8s linear infinite',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Hero Header */}
        <div style={{
          padding: '32px', paddingTop: '48px', display: 'flex', alignItems: 'flex-end', gap: '24px',
          background: 'linear-gradient(to bottom, rgba(5, 150, 105, 0.4) 0%, rgba(0, 0, 0, 0.5) 100%)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
        }}>
          <div style={{
            width: '160px', height: '160px', background: 'linear-gradient(to bottom right, #10b981, #047857)',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5), 0 0 20px rgba(16, 185, 129, 0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '16px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}>
            <Users size={70} style={{ color: 'white' }} />
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.2em', color: '#6ee7b7', marginBottom: '8px' }}>
              Inbox
            </p>
            <h1 style={{ fontSize: '48px', fontWeight: '900', letterSpacing: '-0.05em', color: 'white', marginBottom: '12px' }}>
              Shared With Me
            </h1>
            <p style={{ color: '#B0B0B0', fontSize: '13px', fontWeight: 'bold' }}>
              {items.length} songs sent to you
            </p>
          </div>
        </div>

        {/* List Frame */}
        <div style={{ padding: '24px 32px 32px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '80px', color: '#737373', fontSize: '12px', fontWeight: '900', letterSpacing: '0.2em' }} className="animate-pulse">
              LOADING...
            </div>
          ) : items.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px' }}>
              <Music size={64} style={{ color: '#262626', marginBottom: '24px', margin: '0 auto' }} />
              <p style={{ color: '#737373', fontWeight: 'bold' }}>Your inbox is empty.</p>
            </div>
          ) : (
            <div style={{
              backgroundColor: 'rgba(24, 24, 24, 0.7)', borderRadius: '24px', padding: '16px',
              border: '1px solid rgba(255, 255, 255, 0.1)', boxShadow: 'inset 0 0 15px rgba(0,0,0,0.5)',
            }}>
              {/* Header Grid */}
              <div style={{
                display: 'grid', gridTemplateColumns: '40px 5fr 3fr 2fr 1fr', gap: '16px', padding: '12px 24px',
                color: '#737373', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.2em',
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
