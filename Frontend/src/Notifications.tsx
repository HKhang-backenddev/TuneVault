import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from './axios';
import { Bell, UserPlus, Download, Check, Trash2, Loader2, Share2, Play, Save } from 'lucide-react';
import { useAudio } from './Contexts/AudioContext';

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
      return { icon: <UserPlus style={{ ...baseClasses, color: '#c084fc' }} />, text: "Theo dõi mới", color: '#c084fc' };
    case 'download_success':
      return { icon: <Download style={{ ...baseClasses, color: '#4ade80' }} />, text: "Tải xuống thành công", color: '#4ade80' };
    case 'share':
      return { icon: <Share2 style={{ ...baseClasses, color: '#60a5fa' }} />, text: "Chia sẻ bài hát", color: '#60a5fa' };
    case 'error':
      return { icon: <Bell style={{ ...baseClasses, color: '#f87171' }} />, text: "Lỗi hệ thống", color: '#f87171' };
    default:
      return { icon: <Bell style={{ ...baseClasses, color: colorClass }} />, text: "Thông báo chung", color: '#a3a3a3' };
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

  if (seconds < 5) return "vừa xong";
  if (seconds < 60) return `${seconds} giây trước`;
  if (minutes < 60) return `${minutes} phút trước`;
  if (hours < 24) return `${hours} giờ trước`;
  if (days === 1) return `hôm qua lúc ${date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`;
  if (days < 7) return `${days} ngày trước`;

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

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await api.get('/notifications'); 
      setNotifications(response.data);
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
      alert("Không thể xóa thông báo. Vui lòng thử lại.");
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
      console.error("Lỗi parse JSON từ payload thông báo:", e);
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
          artist: songData.artist || 'Nghệ sĩ không xác định',
          url: songData.url || `/api/media/stream/${songData.id}`,
          thumbnailUrl: songData.thumbnailUrl || '',
          durationSeconds: songData.durationInSeconds,
          isLiked: songData.isLiked
        });
      } else {
        throw new Error("Không tìm thấy dữ liệu bài hát.");
      }
    } catch (error) {
      console.error("Không thể phát bài hát được chia sẻ:", error);
      alert("Không tìm thấy bài hát này. Có thể nó đã bị xóa.");
    }
    markAsRead(notification.id);
  };

  const handleSaveSharedSong = async (notification: NotificationItem) => {
    if (!notification.payloadJson) return;

    let mediaId: string | null = null;
    try {
      mediaId = JSON.parse(notification.payloadJson).mediaId;
    } catch (e) {
      console.error("Lỗi parse JSON từ payload thông báo:", e);
      return;
    }

    if (!mediaId) return;

    try {
      await api.post(`/media/save/${mediaId}`);
      alert('Đã lưu bài hát vào thư viện của bạn!');
      navigate('/'); // Chuyển hướng về trang chủ
    } catch (error) {
      console.error("Không thể lưu bài hát:", error);
      alert("Không thể lưu bài hát này. Có thể nó đã có trong thư viện của bạn.");
    }
  };
  return (
    <div style={{
      maxWidth: '56rem', // Tăng nhẹ độ rộng
      margin: '2rem auto',
      padding: '2rem',
      paddingBottom: '6rem',
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      borderRadius: '1.5rem',
      border: '2px solid rgba(59, 130, 246, 0.3)',
      boxShadow: '0 0 50px rgba(59, 130, 246, 0.15), inset 0 0 20px rgba(0,0,0,0.4)',
      backdropFilter: 'blur(5px)',
      transition: 'all 0.3s ease'
    }}>
      <style>{`
        @keyframes slide-up-fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      <h1 style={{ fontSize: '2.25rem', fontWeight: '900', marginBottom: '2.5rem', letterSpacing: '-0.05em', color: 'white', textAlign: 'center', textShadow: '0 0 15px rgba(59, 130, 246, 0.5)' }}>
        Hộp thư đến
      </h1>
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '5rem 0' }}>
          <Loader2 style={{ width: '2.5rem', height: '2.5rem', color: '#3b82f6' }} className="animate-spin" />
        </div>
      ) : notifications.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '5rem 0', backgroundColor: 'rgba(38, 38, 38, 0.5)', borderRadius: '1rem', border: '1px solid #262626', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <Bell size={48} style={{ color: '#404040' }} />
          <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#a3a3a3' }}>Hộp thư của bạn trống</h3>
          <p style={{ fontSize: '0.875rem', color: '#737373' }}>Các thông báo mới sẽ xuất hiện ở đây.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {notifications.map((n) => (
            <div
              key={n.id}
              style={{
                position: 'relative',
                  borderRadius: '1rem', // Giữ nguyên
                  transition: 'all 0.4s ease', // Làm chậm animation
                  backgroundColor: n.isRead ? 'rgba(38, 38, 38, 0.6)' : 'rgba(20, 83, 158, 0.15)', // Nền xanh cho unread
                  border: n.isRead ? '1px solid #262626' : `1px solid rgba(59, 130, 246, 0.4)`, // Viền xanh cho unread
                  boxShadow: n.isRead ? 'none' : '0 0 20px rgba(59, 130, 246, 0.2)', // Hiệu ứng glow xanh
                opacity: deletingId === n.id ? 0.5 : 1,
                animation: 'slide-up-fade-in 0.5s ease-out forwards',
              }}
            >
              {/* Header của thẻ thông báo */}
              <div style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{
                    padding: '0.5rem',
                    borderRadius: '9999px',
                    backgroundColor: n.isRead ? '#262626' : 'rgba(59, 130, 246, 0.1)',
                  }}>
                    {getIconForType(n.type, n.isRead).icon}
                  </div>
                  <span style={{
                    fontSize: '0.75rem',
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    color: n.isRead ? '#737373' : '#60a5fa',
                  }}>
                    {getIconForType(n.type, n.isRead).text}
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
                  color: n.isRead ? '#a3a3a3' : 'white',
                }}>
                  {n.message || 'Thông báo không có nội dung.'}
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
                          backgroundColor: '#2563eb',
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
                    >
                        <Play size={14} fill="currentColor" />
                      Phát nhạc
                    </button>
                    <button
                      onClick={() => handleSaveSharedSong(n)}
                      title="Lưu vào thư viện và về trang chủ"
                      style={{
                        backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#60a5fa', fontSize: '0.75rem', fontWeight: 'bold', padding: '0.5rem 0.75rem', borderRadius: '9999px', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'all 0.2s ease', border: 'none', cursor: 'pointer'
                      }}
                      className="hover:bg-green-500/20 hover:text-green-400"
                    >
                      <Save size={14} />
                      Lưu
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
                        title="Đánh dấu đã đọc"
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
                      title="Xóa thông báo"
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
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;