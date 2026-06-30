import { useEffect, useState } from 'react';
import api from '../axios';
import { Bell, UserPlus, Download, Share2, Play, Trash2, Check, Loader2 } from 'lucide-react';
import { useAudio } from '../Contexts/AudioContext';

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
    case 'follow': return { icon: <UserPlus size={18} />, color: 'text-pink-500 bg-pink-500/10' };
    case 'download_success': return { icon: <Download size={18} />, color: 'text-green-500 bg-green-500/10' };
    case 'share': return { icon: <Share2 size={18} />, color: 'text-blue-500 bg-blue-500/10' };
    default: return { icon: <Bell size={18} />, color: 'text-gray-500 bg-gray-500/10' };
  }
};

const formatTime = (dateStr: string) => {
  const date = new Date(dateStr.endsWith('Z') ? dateStr : dateStr + 'Z');
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return 'Vừa xong';
  if (mins < 60) return `${mins}p`;
  if (hours < 24) return `${hours}h`;
  if (days < 7) return `${days}d`;
  return date.toLocaleDateString('vi-VN', { day: '2-digit', month: 'short' });
};

const Notifications = () => {
  const { playTrack } = useAudio();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data || []);
    } catch (error) {
      console.error("Lỗi tải thông báo:", error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (error) {
      console.error("Lỗi đánh dấu đã đọc:", error);
    }
  };

  const deleteNotification = async (id: string) => {
    if (!confirm('Xóa thông báo?')) return;
    setDeleting(id);
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (error) {
      console.error("Lỗi xóa thông báo:", error);
    } finally {
      setDeleting(null);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (error) {
      console.error("Lỗi đánh dấu tất cả:", error);
    }
  };

  const handlePlaySong = async (notification: NotificationItem) => {
    if (!notification.payloadJson) return;
    try {
      const payload = JSON.parse(notification.payloadJson);
      const mediaId = payload?.mediaId;
      if (!mediaId) return;
      
      const res = await api.get(`/MediaItems/${mediaId}`);
      const song = res.data?.data || res.data;
      if (song) {
        playTrack({
          id: song.id,
          title: song.title,
          artist: song.artist || 'Nghệ sĩ',
          url: song.url || `/api/media/stream/${song.id}`,
          thumbnailUrl: song.thumbnailUrl || '',
          durationSeconds: song.durationInSeconds
        });
      }
    } catch (error) {
      console.error("Lỗi phát bài hát:", error);
    }
    markAsRead(notification.id);
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Bell size={24} className="text-blue-500" />
          <h1 className="text-2xl font-bold text-white">Thông báo</h1>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-blue-500 text-white text-sm font-semibold">
              {unreadCount}
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1"
          >
            <Check size={14} />
            Đánh dấu đã đọc
          </button>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={32} className="animate-spin text-blue-500" />
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-20">
          <Bell size={48} className="mx-auto mb-4 text-gray-600" />
          <p className="text-gray-400">Không có thông báo nào</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((notification) => {
            const iconInfo = getIcon(notification.type);
            const isShare = notification.type.toLowerCase() === 'share';
            
            return (
              <div
                key={notification.id}
                className={`flex items-center gap-3 p-4 rounded-xl transition-all ${
                  notification.isRead 
                    ? 'bg-gray-900/50 opacity-60' 
                    : 'bg-gray-900 border-l-2 border-blue-500'
                } hover:bg-gray-800/50`}
              >
                {/* Icon */}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${iconInfo.color}`}>
                  {iconInfo.icon}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 cursor-pointer" onClick={() => isShare && handlePlaySong(notification)}>
                  <p className="text-white text-sm font-medium truncate">{notification.message}</p>
                  <p className="text-gray-500 text-xs mt-0.5">{formatTime(notification.createdAt)}</p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  {!notification.isRead && (
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                  )}
                  {isShare && notification.isRead && (
                    <button
                      onClick={() => handlePlaySong(notification)}
                      className="p-2 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500 hover:text-white transition-colors"
                      title="Phát"
                    >
                      <Play size={14} fill="currentColor" />
                    </button>
                  )}
                  <button
                    onClick={() => deleteNotification(notification.id)}
                    disabled={deleting === notification.id}
                    className="p-2 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    title="Xóa"
                  >
                    <Trash2 size={14} />
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
