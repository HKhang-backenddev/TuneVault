import { useEffect, useState } from 'react';
import api from '../axios';
import { Trash2, Check } from 'lucide-react';

interface NotificationItem {
  id: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  message: string;
  payloadJson?: string;
}

const Notifications = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data || []);
    } catch (error) {
      console.error("Lỗi:", error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (error) {
      console.error("Lỗi:", error);
    }
  };

  const deleteNotification = async (id: string) => {
    if (!confirm('Xóa?')) return;
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (error) {
      console.error("Lỗi:", error);
    }
  };

  const markAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (error) {
      console.error("Lỗi:", error);
    }
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

  return (
    <div className="p-6 max-w-xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-white">Thông báo</h1>
        {notifications.some(n => !n.isRead) && (
          <button onClick={markAllRead} className="text-sm text-blue-400 hover:underline">
            Đọc tất cả
          </button>
        )}
      </div>

      {/* List */}
      {loading ? (
        <p className="text-center text-gray-500 py-10">Đang tải...</p>
      ) : notifications.length === 0 ? (
        <p className="text-center text-gray-500 py-10">Không có thông báo</p>
      ) : (
        <div className="border border-gray-700 rounded-lg overflow-hidden">
          {notifications.map((item, index) => (
            <div
              key={item.id}
              className={`flex items-center gap-3 p-3 border-b border-gray-800 last:border-b-0 ${
                !item.isRead ? 'bg-gray-800/50' : ''
              } ${index === 0 ? 'rounded-t-lg' : ''} ${index === notifications.length - 1 ? 'rounded-b-lg' : ''}`}
            >
              {/* Dot */}
              {!item.isRead && (
                <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
              )}
              
              {/* Text */}
              <div className="flex-1 min-w-0">
                <p className={`text-sm ${item.isRead ? 'text-gray-400' : 'text-white'}`}>
                  {item.message}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">{formatTime(item.createdAt)}</p>
              </div>

              {/* Mark read */}
              {!item.isRead && (
                <button
                  onClick={() => markAsRead(item.id)}
                  className="p-1.5 text-gray-500 hover:text-green-400"
                  title="Đánh dấu đã đọc"
                >
                  <Check size={14} />
                </button>
              )}

              {/* Delete */}
              <button
                onClick={() => deleteNotification(item.id)}
                className="p-1.5 text-gray-500 hover:text-red-400"
                title="Xóa"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;
