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
    } catch (error) {
      console.error("Lỗi:", error);
    }
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

  const getTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      follow: '👤', share: '📤', download_success: '📥', comment: '💬', like: '❤️', error: '⚠️'
    };
    return icons[type.toLowerCase()] || '🔔';
  };

  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#e5e7eb', margin: 0 }}>Thông báo</h1>
        {notifications.some(n => !n.isRead) && (
          <button
            onClick={markAllRead}
            style={{ padding: '8px 16px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' }}
          >
            Đọc tất cả
          </button>
        )}
      </div>

      {/* Loading */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>Đang tải...</div>
      ) : notifications.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', backgroundColor: '#1f2937', borderRadius: '8px', border: '1px solid #374151' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔔</div>
          <p style={{ color: '#9ca3af', fontSize: '16px', margin: 0 }}>Không có thông báo nào</p>
        </div>
      ) : (
        /* Table Header */
        <div style={{ display: 'flex', padding: '12px 16px', backgroundColor: '#374151', borderRadius: '8px 8px 0 0', color: '#9ca3af', fontSize: '13px', fontWeight: '600' }}>
          <div style={{ width: '50px', textAlign: 'center' }}>#</div>
          <div style={{ width: '60px', textAlign: 'center' }}>Loại</div>
          <div style={{ flex: 1 }}>Nội dung</div>
          <div style={{ width: '100px' }}>Thời gian</div>
          <div style={{ width: '80px', textAlign: 'center' }}>Hành động</div>
        </div>
      )}

      {/* Table Body */}
      {!loading && notifications.length > 0 && notifications.map((item, index) => (
        <div
          key={item.id}
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '12px 16px',
            borderBottom: index < notifications.length - 1 ? '1px solid #374151' : 'none',
            borderLeft: '1px solid #374151',
            borderRight: '1px solid #374151',
            backgroundColor: item.isRead ? '#1a1a2e' : '#1f2937',
          }}
        >
          {/* Index */}
          <div style={{ width: '50px', textAlign: 'center', color: '#6b7280', fontSize: '14px' }}>
            {index + 1}
          </div>

          {/* Icon */}
          <div style={{ width: '60px', textAlign: 'center', fontSize: '20px' }}>
            {getTypeIcon(item.type)}
          </div>

          {/* Message */}
          <div style={{ flex: 1, color: item.isRead ? '#9ca3af' : '#e5e7eb', fontSize: '14px' }}>
            {item.message}
          </div>

          {/* Time */}
          <div style={{ width: '100px', color: '#6b7280', fontSize: '13px' }}>
            {formatTime(item.createdAt)}
          </div>

          {/* Actions */}
          <div style={{ width: '80px', display: 'flex', justifyContent: 'center', gap: '8px' }}>
            {!item.isRead && (
              <span style={{ width: '8px', height: '8px', backgroundColor: '#3b82f6', borderRadius: '50%', display: 'inline-block' }} />
            )}
            <button
              onClick={() => markAsRead(item.id)}
              style={{ padding: '4px 8px', backgroundColor: '#374151', color: '#9ca3af', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
              title="Đánh dấu đã đọc"
            >
              ✓
            </button>
            <button
              onClick={() => deleteNotification(item.id)}
              style={{ padding: '4px 8px', backgroundColor: '#374151', color: '#ef4444', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
              title="Xóa"
            >
              ✕
            </button>
          </div>
        </div>
      ))}

      {/* Table Footer */}
      {!loading && notifications.length > 0 && (
        <div style={{ display: 'flex', padding: '12px 16px', backgroundColor: '#374151', borderRadius: '0 0 8px 8px', borderTop: '1px solid #4b5563', color: '#9ca3af', fontSize: '13px' }}>
          <span>Tổng cộng: <strong style={{ color: '#e5e7eb' }}>{notifications.length}</strong> thông báo</span>
          <span style={{ marginLeft: '24px' }}>Chưa đọc: <strong style={{ color: '#3b82f6' }}>{notifications.filter(n => !n.isRead).length}</strong></span>
        </div>
      )}
    </div>
  );
};

export default Notifications;
