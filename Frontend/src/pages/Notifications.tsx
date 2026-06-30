import { useEffect, useState } from 'react';
import api from '../axios';
import { Trash2, Check, UserPlus, Download, Share2, Bell, FileText } from 'lucide-react';

interface NotificationItem {
  id: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  message: string;
  payloadJson?: string;
}

const getIcon = (type: string) => {
  switch (type.toLowerCase()) {
    case 'follow': return { icon: <UserPlus size={16} />, bg: 'bg-green-500', text: 'text-green-500' };
    case 'download_success': return { icon: <Download size={16} />, bg: 'bg-blue-500', text: 'text-blue-500' };
    case 'share': return { icon: <Share2 size={16} />, bg: 'bg-purple-500', text: 'text-purple-500' };
    case 'comment': return { icon: <FileText size={16} />, bg: 'bg-yellow-500', text: 'text-yellow-500' };
    default: return { icon: <Bell size={16} />, bg: 'bg-gray-500', text: 'text-gray-500' };
  }
};

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
    if (!confirm('Xóa thông báo này?')) return;
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
    if (mins < 60) return `${mins} phút trước`;
    if (hours < 24) return `${hours} giờ trước`;
    if (days < 7) return `${days} ngày trước`;
    return date.toLocaleDateString('vi-VN');
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      {/* Title */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-100">Thông báo</h1>
        {notifications.some(n => !n.isRead) && (
          <button 
            onClick={markAllRead} 
            className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Đọc tất cả
          </button>
        )}
      </div>

      {/* Loading */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : notifications.length === 0 ? (
        /* Empty State */
        <div className="bg-gray-800 rounded-xl p-12 text-center border border-gray-700">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-700 rounded-full flex items-center justify-center">
            <Bell size={32} className="text-gray-500" />
          </div>
          <p className="text-gray-400 text-lg">Không có thông báo nào</p>
        </div>
      ) : (
        /* List */
        <div className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700">
          {notifications.map((item, index) => {
            const iconInfo = getIcon(item.type);
            return (
              <div 
                key={item.id}
                className={`flex items-center gap-4 p-4 hover:bg-gray-750 transition-colors cursor-pointer ${
                  index !== 0 ? 'border-t border-gray-700' : ''
                } ${!item.isRead ? 'bg-blue-500/5' : ''}`}
                onClick={() => !item.isRead && markAsRead(item.id)}
              >
                {/* Icon */}
                <div className={`w-10 h-10 ${iconInfo.bg} rounded-full flex items-center justify-center text-white flex-shrink-0`}>
                  {iconInfo.icon}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${item.isRead ? 'text-gray-400' : 'text-gray-200'}`}>
                    {item.message}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{formatTime(item.createdAt)}</p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  {!item.isRead && (
                    <span className="w-2 h-2 bg-blue-500 rounded-full" />
                  )}
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteNotification(item.id); }}
                    className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                    title="Xóa"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Notifications;
