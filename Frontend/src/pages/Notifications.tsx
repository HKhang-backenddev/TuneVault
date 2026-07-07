import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../axios';
import { Bell, UserPlus, Download, Check, Trash2, Loader2, Share2, Play, Save, ChevronUp, ChevronDown } from 'lucide-react';
import { useAudio } from '../Contexts/AudioContext';

interface NotificationItem {
  id: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  message: string;
  payloadJson?: string;
}

const getIconForType = (type: string, isRead: boolean) => {
  const baseClasses = { width: '24px', height: '24px', transition: 'all 0.3s ease' };
  const colorClass = isRead ? '#737373' : 'white';

  switch (type.toLowerCase()) {
    case 'follow':
      return { icon: <UserPlus style={{ ...baseClasses, color: '#f472b6' }} />, text: "New Follow", color: '#f472b6' }; // Đổi sang màu hồng
    case 'download_success':
      return { icon: <Download style={{ ...baseClasses, color: '#22c55e' }} />, text: "Download Successful", color: '#22c55e' }; // Đổi sang tông xanh lá khác
    case 'share':
      return { icon: <Share2 style={{ ...baseClasses, color: '#22d3ee' }} />, text: "Song Shared", color: '#22d3ee' }; // Đổi sang màu xanh lam
    case 'error':
      return { icon: <Bell style={{ ...baseClasses, color: '#ef4444' }} />, text: "System Error", color: '#ef4444' }; // Đổi sang tông đỏ khác
    default:
      return { icon: <Bell style={{ ...baseClasses, color: colorClass }} />, text: "General Notification", color: '#a3a3a3' };
  }
};

const formatRelativeTime = (dateString: string) => {
  // Đảm bảo chuỗi thời gian được hiểu là UTC bằng cách thêm 'Z' nếu thiếu.
  const utcDateString = dateString.endsWith('Z') ? dateString : dateString + 'Z';
  const date = new Date(utcDateString);
  const now = new Date();
  const seconds = Math.round((now.getTime() - date.getTime()) / 1000);
  const minutes = Math.round(seconds / 60);
  const hours = Math.round(minutes / 60);
  const days = Math.round(hours / 24);

  if (seconds < 5) return "just now";
  if (seconds < 60) return `${seconds} seconds ago`;
  if (minutes < 60) return `${minutes} minutes ago`;
  if (hours < 24) return `${hours} hours ago`;
  if (days === 1) return `hôm qua lúc ${date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`;
  if (days < 7) return `${days} days ago`;

  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};


const Notifications = () => {
  const navigate = useNavigate();
  const { playTrack } = useAudio();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [canScroll, setCanScroll] = useState({ up: false, down: false });
  const [isListHovered, setIsListHovered] = useState(false);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await api.get('/notifications'); 
      setNotifications(response.data);
      // Kiểm tra cuộn sau khi dữ liệu được tải
      setTimeout(checkScroll, 100);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    window.addEventListener('mediaShared', fetchNotifications);
    return () => window.removeEventListener('mediaShared', fetchNotifications);
  }, []);

  const markAsRead = async (id: string) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, isRead: true } : n)
      );
    } catch (error) {
      console.error("Failed to mark as read:", error);
    }
  };

  const deleteNotification = async (id: string) => {
    setDeletingId(id);
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (error) {
      console.error("Failed to delete notification:", error);
      alert("Cannot delete notification. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  const handlePlaySharedSong = async (notification: NotificationItem) => {
    if (!notification.payloadJson) return;

    let mediaId: string | null = null;
    try {
      const payload = JSON.parse(notification.payloadJson);
      mediaId = payload?.mediaId;
    } catch (e) {
      console.error("Error parsing notification payload JSON:", e);
      return;
    }

    if (!mediaId) return;

    try {
      // SỬA LỖI: Dùng API endpoint MediaItems/{id} thay vì /media?id=...
      const response = await api.get(`/MediaItems/${mediaId}`);
      // API /MediaItems/{id} trả về ApiResponse chứa SongDetailDto
      const songData = response.data?.data || response.data;
      if (songData) {
        playTrack({
          id: songData.id,
          title: songData.title,
          artist: songData.artist || 'Unknown Artist',
          url: songData.url || `/api/media/stream/${songData.id}`,
          thumbnailUrl: songData.thumbnailUrl || '',
          durationSeconds: songData.durationInSeconds,
          isLiked: songData.isLiked
        });
      } else {
        throw new Error("Song data not found.");
      }
    } catch (error) {
      console.error("Cannot play shared song:", error);
      alert("This song cannot be found. It may have been deleted.");
    }
    markAsRead(notification.id);
  };

  const handleSaveSharedSong = async (notification: NotificationItem) => {
    if (!notification.payloadJson) return;

    let mediaId: string | null = null;
    try {
      mediaId = JSON.parse(notification.payloadJson).mediaId;
    } catch (e) {
      console.error("Error parsing notification payload JSON:", e);
      return;
    }

    if (!mediaId) return;

    try {
      await api.post(`/media/save/${mediaId}`);
      alert('Song saved to your library!');
      navigate('/'); // Chuyển hướng về trang chủ
    } catch (error) {
      console.error("Cannot save song:", error);
      alert("Cannot save this song. It may already be in your library.");
    }
  };

  const checkScroll = () => {
    const el = listRef.current;
    if (!el) return;
    setCanScroll({
      up: el.scrollTop > 10,
      down: el.scrollTop + el.clientHeight < el.scrollHeight - 10,
    });
  };

  const scrollList = (direction: 'up' | 'down') => {
    const el = listRef.current;
    if (!el) return;
    el.scrollBy({ top: direction === 'down' ? 300 : -300, behavior: 'smooth' });
  };

  return (
    <div style={{
      width: '100%',
      padding: '24px 32px',
      backgroundColor: '#1a1a2e',
      borderRadius: '12px',
      boxShadow: '0 0 30px rgba(255, 0, 255, 0.3)',
    }}>
      <style>{`
        @keyframes slide-up-fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      <h1 style={{ fontSize: '3rem', fontWeight: '900', marginBottom: '2.5rem', letterSpacing: '-0.05em', color: '#FF00FF', textAlign: 'center', textShadow: '0 0 20px rgba(255, 0, 255, 0.8), 0 0 40px rgba(0, 255, 255, 0.6)' }}>
        Inbox
      </h1>
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '5rem 0' }}>
          <Loader2 style={{ width: '2.5rem', height: '2.5rem', color: '#FF00FF', filter: 'drop-shadow(0 0 10px rgba(255, 0, 255, 0.8))' }} className="animate-spin" />
        </div>
      ) : notifications.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '5rem 0', backgroundColor: '#121212', borderRadius: '1rem', border: '1px solid rgba(255, 0, 255, 0.3)', boxShadow: '0 0 20px rgba(255, 0, 255, 0.2)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <Bell size={48} style={{ color: '#FF00FF', filter: 'drop-shadow(0 0 15px rgba(255, 0, 255, 0.8))' }} />
          <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#fff', textShadow: '0 0 10px rgba(255, 0, 255, 0.5)' }}>Your inbox is empty</h3>
          <p style={{ fontSize: '0.875rem', color: '#b3b3b3' }}>New notifications will appear here.</p>
        </div>
      ) : (
        <div 
          ref={listRef}
          onMouseEnter={() => setIsListHovered(true)}
          onMouseLeave={() => setIsListHovered(false)}
          onScroll={checkScroll}
          style={{ 
            position: 'relative',
            display: 'flex', 
            flexDirection: 'column', 
            gap: '1rem',
            maxHeight: '70vh',
            overflowY: 'auto',
            padding: '8px',
            margin: '-8px',
          }}
          className="custom-scrollbar" // Áp dụng thanh cuộn tùy chỉnh nếu có
        >
          {/* Nút cuộn lên */}
          <button
            onClick={() => scrollList('up')}
            style={{
              position: 'sticky', top: 0, zIndex: 10,
              width: '100%', height: '32px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'linear-gradient(to bottom, rgba(0,0,0,0.8), transparent)',
              border: 'none', color: '#3b82f6', cursor: 'pointer',
              opacity: canScroll.up && isListHovered ? 1 : 0,
              transition: 'opacity 0.2s ease',
            }}
          >
            <ChevronUp size={24} />
          </button>

          {notifications.map((n) => {
            const { icon, text, color } = getIconForType(n.type, n.isRead);
            const isUnreadAndColorful = !n.isRead && color !== '#a3a3a3';

            return (
            <div
              key={n.id}
              style={{
                position: 'relative',
                  borderRadius: '1rem', // Giữ nguyên
                  transition: 'all 0.4s ease', // Làm chậm animation
                  backgroundColor: isUnreadAndColorful ? `${color}1A` : 'rgba(10, 10, 10, 0.75)', // 1A là 10% opacity
                  border: `1px solid ${isUnreadAndColorful ? `${color}4D` : 'rgba(255, 255, 255, 0.1)'}`, // 4D là 30% opacity
                  boxShadow: isUnreadAndColorful ? `0 0 20px ${color}33, inset 0 0 10px ${color}1A` : 'inset 0 1px 2px rgba(0,0,0,0.5)', // 33 là 20% opacity
                opacity: deletingId === n.id ? 0.5 : 1,
                animation: 'slide-up-fade-in 0.5s ease-out forwards',
                backdropFilter: 'blur(12px)',
              }}
              className="notification-card-clip"
            >
              {/* Header của thẻ thông báo */}
              <div style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{
                    padding: '0.5rem',
                    borderRadius: '9999px',
                    backgroundColor: isUnreadAndColorful ? `${color}1A` : '#262626',
                  }}>
                    {icon}
                  </div>
                  <span style={{
                    fontSize: '0.75rem',
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    color: isUnreadAndColorful ? color : '#737373',
                  }}>
                    {text}
                  </span>
                </div>
                <span style={{ fontSize: '0.75rem', color: '#737373' }}>
                  {formatRelativeTime(n.createdAt)}
                </span>
              </div>

              {/* Nội dung chính */}
              <div style={{ padding: '1.25rem' }}>
                <p style={{
                  fontSize: '1rem',
                  lineHeight: '1.625',
                  color: n.isRead ? '#a3a3a3' : '#E5E7EB', // Màu sáng hơn cho dễ đọc
                }}>
                  {n.message || 'Notification has no content.'}
                </p>
              </div>

              {/* Vùng hành động (nếu có) */}
              {(n.type.toLowerCase() === 'share' || !n.isRead) && (
                <div style={{ padding: '0.5rem 1.25rem 1rem', borderTop: '1px solid rgba(255, 255, 255, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                  {/* Nút phát nhạc cho thông báo chia sẻ */}
                {n.type.toLowerCase() === 'share' && n.payloadJson && n.payloadJson.includes('mediaId') && (
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={() => handlePlaySharedSong(n)}
                        style={{
                          backgroundColor: '#3b82f6',
                          color: 'white',
                          fontSize: '0.75rem',
                          fontWeight: 'bold',
                          padding: '0.5rem 0.75rem',
                          borderRadius: '9999px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          transition: 'all 0.2s ease',
                          border: 'none',
                          cursor: 'pointer'
                        }}
                        className="hover:bg-blue-500"
                    >
                        <Play size={14} fill="currentColor" />
                      Play Music
                    </button>
                    <button
                      onClick={() => handleSaveSharedSong(n)}
                      title="Save to library and go home"
                      style={{
                        backgroundColor: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', fontSize: '0.75rem', fontWeight: 'bold', padding: '0.5rem 0.75rem', borderRadius: '9999px', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'all 0.2s ease', border: 'none', cursor: 'pointer'
                      }}
                      className="hover:bg-green-500/20 hover:text-green-400"
                    >
                      <Save size={14} />
                      Save
                    </button>
                  </div>
                )}

                  {/* Các nút điều khiển khác */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginLeft: 'auto' }}>
                    {!n.isRead && (
                      <button 
                        onClick={() => markAsRead(n.id)}
                        style={{
                          padding: '0.5rem',
                          borderRadius: '9999px',
                          backgroundColor: 'rgba(52, 52, 52, 0.5)',
                          color: '#a3a3a3',
                          border: 'none',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                        title="Mark as read"
                      >
                        <Check size={14} />
                      </button>
                    )}
                    <button 
                      onClick={() => deleteNotification(n.id)}
                      disabled={deletingId === n.id}
                      style={{
                          padding: '0.5rem',
                          borderRadius: '9999px',
                          backgroundColor: 'rgba(52, 52, 52, 0.5)',
                          color: '#a3a3a3',
                          border: 'none',
                          cursor: deletingId === n.id ? 'not-allowed' : 'pointer',
                          transition: 'all 0.2s ease',
                          opacity: deletingId === n.id ? 0.5 : 1,
                      }}                      
                      title="Delete notification"
                      onMouseEnter={(e) => {
                        if (deletingId !== n.id) {
                          e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.2)';
                          e.currentTarget.style.color = '#ef4444';
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(52, 52, 52, 0.5)';
                        e.currentTarget.style.color = '#a3a3a3';
                      }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )})}
          {/* Nút cuộn xuống */}
          <button
            onClick={() => scrollList('down')}
            style={{
              position: 'sticky', bottom: 0, zIndex: 10,
              width: '100%', height: '32px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
              border: 'none', color: '#3b82f6', cursor: 'pointer',
              opacity: canScroll.down && isListHovered ? 1 : 0,
              transition: 'opacity 0.2s ease',
            }}
          >
            <ChevronDown size={24} />
          </button>
        </div>
      )}
    </div>
  );
};

export default Notifications;
