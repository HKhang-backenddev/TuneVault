import { useEffect, useState } from 'react';
import api from '../axios';

interface NotificationItem {
  id: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  message: string;
}

const Notifications = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchNotifications(); }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data || []);
    } catch (error) { console.error("Lỗi:", error); }
    setLoading(false);
  };

  const markAsRead = async (id: string) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (error) { console.error("Lỗi:", error); }
  };

  const deleteNotification = async (id: string) => {
    if (!confirm('Xóa thông báo?')) return;
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (error) { console.error("Lỗi:", error); }
  };

  const markAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (error) { console.error("Lỗi:", error); }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const diff = Date.now() - date.getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (mins < 1) return 'Bây giờ';
    if (mins < 60) return `${mins} phút`;
    if (hours < 24) return `${hours} giờ`;
    if (days < 7) return `${days} ngày`;
    return date.toLocaleDateString('vi-VN');
  };

  const getTypeStyle = (type: string) => {
    const styles: Record<string, { bg: string; icon: string; label: string }> = {
      follow: { bg: '#10b981', icon: '👤', label: 'Theo dõi' },
      share: { bg: '#8b5cf6', icon: '📤', label: 'Chia sẻ' },
      download_success: { bg: '#3b82f6', icon: '📥', label: 'Tải xuống' },
      comment: { bg: '#f59e0b', icon: '💬', label: 'Bình luận' },
      like: { bg: '#ec4899', icon: '❤️', label: 'Thích' },
      error: { bg: '#ef4444', icon: '⚠️', label: 'Lỗi' },
    };
    return styles[type.toLowerCase()] || { bg: '#6b7280', icon: '🔔', label: 'Khác' };
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div style={{ padding: '24px', maxWidth: '900px', margin: '0 auto' }}>
      
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '20px',
        padding: '20px 24px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(102, 126, 234, 0.3)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '28px' }}>🔔</span>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: 'white', margin: 0 }}>Thông báo</h1>
          {unreadCount > 0 && (
            <span style={{ 
              backgroundColor: '#ef4444', 
              color: 'white', 
              padding: '2px 10px', 
              borderRadius: '12px', 
              fontSize: '12px', 
              fontWeight: 'bold' 
            }}>
              {unreadCount} mới
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            style={{ 
              padding: '10px 20px', 
              backgroundColor: 'white', 
              color: '#667eea', 
              border: 'none', 
              borderRadius: '8px', 
              cursor: 'pointer', 
              fontSize: '14px',
              fontWeight: 'bold',
              boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
            }}
          >
            Đọc tất cả ✓
          </button>
        )}
      </div>

      {/* Loading */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', backgroundColor: '#1e1e2e', borderRadius: '12px' }}>
          <div style={{ 
            width: '40px', height: '40px', 
            border: '4px solid #667eea', 
            borderTopColor: 'transparent', 
            borderRadius: '50%', 
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }} />
          <p style={{ color: '#9ca3af' }}>Đang tải thông báo...</p>
        </div>
      ) : notifications.length === 0 ? (
        /* Empty State */
        <div style={{ 
          textAlign: 'center', 
          padding: '60px', 
          background: 'linear-gradient(180deg, #1e1e2e 0%, #252536 100%)',
          borderRadius: '12px',
          border: '1px solid #3b3b5c'
        }}>
          <span style={{ fontSize: '64px', display: 'block', marginBottom: '16px' }}>📭</span>
          <p style={{ color: '#9ca3af', fontSize: '18px', margin: 0 }}>Không có thông báo nào</p>
        </div>
      ) : (
        <>
          {/* Table Header */}
          <div style={{ 
            display: 'flex', 
            padding: '14px 20px', 
            background: 'linear-gradient(90deg, #f472b6 0%, #c084fc 50%, #60a5fa 100%)',
            borderRadius: '12px 12px 0 0',
            color: 'white',
            fontSize: '13px',
            fontWeight: 'bold',
            textTransform: 'uppercase'
          }}>
            <div style={{ width: '50px', textAlign: 'center' }}>#</div>
            <div style={{ width: '50px', textAlign: 'center' }}>Loại</div>
            <div style={{ flex: 1 }}>Nội dung</div>
            <div style={{ width: '100px' }}>Thời gian</div>
            <div style={{ width: '90px', textAlign: 'center' }}>Hành động</div>
          </div>

          {/* Table Body */}
          {notifications.map((item, index) => {
            const typeStyle = getTypeStyle(item.type);
            const isLast = index === notifications.length - 1;
            return (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '16px 20px',
                  backgroundColor: item.isRead ? '#1a1a2e' : '#252536',
                  borderLeft: `4px solid ${typeStyle.bg}`,
                  borderRight: '1px solid #3b3b5c',
                  borderBottom: isLast ? '1px solid #3b3b5c' : 'none',
                }}
              >
                {/* Index */}
                <div style={{ width: '50px', textAlign: 'center', color: '#6b7280', fontSize: '14px' }}>
                  {index + 1}
                </div>

                {/* Type Icon */}
                <div style={{ width: '50px', textAlign: 'center' }}>
                  <span style={{ 
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '36px', 
                    height: '36px', 
                    backgroundColor: typeStyle.bg,
                    borderRadius: '8px',
                    fontSize: '18px',
                    boxShadow: `0 2px 10px ${typeStyle.bg}40`
                  }}>
                    {typeStyle.icon}
                  </span>
                </div>

                {/* Message */}
                <div style={{ flex: 1 }}>
                  <p style={{ 
                    color: item.isRead ? '#9ca3af' : '#f3f4f6', 
                    fontSize: '14px',
                    margin: 0,
                    fontWeight: item.isRead ? 'normal' : '500'
                  }}>
                    {item.message}
                  </p>
                  <p style={{ 
                    color: typeStyle.bg, 
                    fontSize: '11px', 
                    margin: '4px 0 0',
                    fontWeight: 'bold'
                  }}>
                    {typeStyle.label}
                  </p>
                </div>

                {/* Time */}
                <div style={{ 
                  width: '100px', 
                  color: '#9ca3af', 
                  fontSize: '13px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <span style={{ fontSize: '14px' }}>🕐</span>
                  {formatTime(item.createdAt)}
                </div>

                {/* Actions */}
                <div style={{ width: '90px', display: 'flex', justifyContent: 'center', gap: '8px' }}>
                  {!item.isRead && (
                    <span style={{ 
                      width: '10px', height: '10px', 
                      backgroundColor: '#3b82f6', 
                      borderRadius: '50%', 
                      display: 'inline-block',
                      boxShadow: '0 0 10px #3b82f6'
                    }} />
                  )}
                  <button
                    onClick={() => markAsRead(item.id)}
                    style={{ 
                      padding: '6px 12px', 
                      backgroundColor: item.isRead ? '#374151' : '#3b82f6',
                      color: 'white', 
                      border: 'none', 
                      borderRadius: '6px', 
                      cursor: 'pointer', 
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}
                    title="Đánh dấu đã đọc"
                  >
                    ✓
                  </button>
                  <button
                    onClick={() => deleteNotification(item.id)}
                    style={{ 
                      padding: '6px 12px', 
                      backgroundColor: '#374151', 
                      color: '#ef4444', 
                      border: 'none', 
                      borderRadius: '6px', 
                      cursor: 'pointer', 
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}
                    title="Xóa"
                  >
                    ✕
                  </button>
                </div>
              </div>
            );
          })}

          {/* Table Footer */}
          <div style={{ 
            display: 'flex', 
            padding: '16px 20px', 
            background: 'linear-gradient(180deg, #252536 0%, #1e1e2e 100%)',
            borderRadius: '0 0 12px 12px',
            border: '1px solid #3b3b5c',
            borderTop: 'none',
            color: '#9ca3af',
            fontSize: '13px'
          }}>
            <div style={{ 
              padding: '8px 16px', 
              backgroundColor: '#667eea20', 
              borderRadius: '6px',
              border: '1px solid #667eea40'
            }}>
              Tổng: <strong style={{ color: '#667eea' }}>{notifications.length}</strong>
            </div>
            <div style={{ 
              padding: '8px 16px', 
              backgroundColor: '#10b98120', 
              borderRadius: '6px',
              border: '1px solid #10b98140',
              marginLeft: '12px'
            }}>
              Đã đọc: <strong style={{ color: '#10b981' }}>{notifications.filter(n => n.isRead).length}</strong>
            </div>
            <div style={{ 
              padding: '8px 16px', 
              backgroundColor: '#ef444420', 
              borderRadius: '6px',
              border: '1px solid #ef444440',
              marginLeft: '12px'
            }}>
              Chưa đọc: <strong style={{ color: '#ef4444' }}>{unreadCount}</strong>
            </div>
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

export default Notifications;
