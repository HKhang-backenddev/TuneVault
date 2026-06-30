import { useState, useEffect } from 'react';
import { Play, Trash2, Clock, Loader2, Calendar, Headphones, RotateCcw, Sparkles, Music } from 'lucide-react';
import api from '../axios';
import { useAudio } from '../Contexts/AudioContext';

interface HistoryItem {
  id: string;
  title: string;
  artist: string;
  url: string;
  thumbnailUrl: string;
  durationInSeconds: number;
  genre: string;
  playedAt: string;
}

const ListenHistory = () => {
  const { playTrack } = useAudio();
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await api.get('/media/history?pageSize=100');
      setItems(res.data || []);
    } catch (error) {
      console.error("Lỗi khi tải lịch sử:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatRelativeTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Vừa xong';
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: 'short' });
  };

  const handlePlay = (item: HistoryItem, index: number) => {
    const trackItems = items.map(i => ({
      id: i.id,
      title: i.title,
      artist: i.artist,
      url: i.url,
      thumbnailUrl: i.thumbnailUrl,
      durationSeconds: i.durationInSeconds
    }));
    playTrack(trackItems[index], trackItems);
  };

  const handleClearHistory = async () => {
    if (!confirm('Bạn có chắc muốn xóa toàn bộ lịch sử nghe?')) return;
    try {
      await api.delete('/media/history');
      setItems([]);
    } catch (error) {
      console.error("Lỗi khi xóa lịch sử:", error);
    }
  };

  const getTimeIcon = (dateStr: string) => {
    const date = new Date(dateStr);
    const hour = date.getHours();
    if (hour < 6) return { icon: '🌙', label: 'Đêm khuya' };
    if (hour < 12) return { icon: '☀️', label: 'Buổi sáng' };
    if (hour < 18) return { icon: '🌤️', label: 'Buổi chiều' };
    return { icon: '🌆', label: 'Buổi tối' };
  };

  // Group by date
  const groupedItems = items.reduce((acc, item) => {
    const date = new Date(item.playedAt);
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();
    const dateKey = isToday ? 'Hôm nay' : date.toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit' });
    if (!acc[dateKey]) acc[dateKey] = { items: [], timestamp: date.getTime() };
    acc[dateKey].items.push(item);
    return acc;
  }, {} as Record<string, { items: HistoryItem[], timestamp: number }>);

  const sortedDates = Object.entries(groupedItems).sort((a, b) => b[1].timestamp - a[1].timestamp);

  // Stats
  const totalListeningTime = items.reduce((acc, item) => acc + (item.durationInSeconds || 0), 0);
  const uniqueArtists = new Set(items.map(i => i.artist)).size;

  return (
    <div className="pb-24 min-h-screen">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-violet-950 via-purple-900 to-fuchsia-950">
          <div className="absolute inset-0">
            {[...Array(15)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-purple-400 rounded-full animate-ping"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 3}s`,
                  animationDuration: `${3 + Math.random() * 2}s`
                }}
              />
            ))}
          </div>
        </div>
        <div className="absolute inset-0 backdrop-blur-xl" />
        
        {/* Content */}
        <div className="relative pt-16 pb-12 px-8">
          <div className="flex items-start gap-8">
            {/* Icon with glow */}
            <div className="relative flex-shrink-0">
              <div className="absolute inset-0 bg-purple-500 rounded-full blur-2xl opacity-50 animate-pulse" />
              <div className="relative w-32 h-32 rounded-3xl bg-gradient-to-br from-purple-500 via-fuchsia-500 to-pink-500 flex items-center justify-center shadow-2xl transform -rotate-6 hover:rotate-0 transition-transform duration-500">
                <Headphones size={60} className="text-white drop-shadow-2xl" />
              </div>
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold uppercase tracking-widest">
                  ✨ Hoạt động của bạn
                </span>
              </div>
              <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-fuchsia-400 to-pink-400 mb-4 drop-shadow-lg">
                Lịch Sử Nghe Nhạc
              </h1>
              
              {/* Stats Cards */}
              <div className="grid grid-cols-3 gap-4 mt-6">
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-fuchsia-500 flex items-center justify-center">
                      <Music size={24} className="text-white" />
                    </div>
                    <div>
                      <p className="text-2xl font-black text-white">{items.length}</p>
                      <p className="text-xs text-white/50">Bài hát đã nghe</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center">
                      <Clock size={24} className="text-white" />
                    </div>
                    <div>
                      <p className="text-2xl font-black text-white">{Math.floor(totalListeningTime / 3600)}h {Math.floor((totalListeningTime % 3600) / 60)}m</p>
                      <p className="text-xs text-white/50">Thời gian nghe</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center">
                      <Sparkles size={24} className="text-white" />
                    </div>
                    <div>
                      <p className="text-2xl font-black text-white">{uniqueArtists}</p>
                      <p className="text-xs text-white/50">Nghệ sĩ đã nghe</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Wave decoration */}
        <svg className="absolute bottom-0 w-full" viewBox="0 0 1440 100" preserveAspectRatio="none">
          <path fill="currentColor" className="text-neutral-950" d="M0,50 C360,100 720,0 1080,50 C1260,75 1350,75 1440,50 L1440,100 L0,100 Z" />
        </svg>
      </div>

      {/* Actions */}
      <div className="px-8 py-6 flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">
          {items.length} bài hát trong lịch sử
        </h2>
        {items.length > 0 && (
          <button
            onClick={handleClearHistory}
            className="group px-5 py-2.5 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all flex items-center gap-2 font-semibold border border-red-500/20 hover:border-red-500"
          >
            <Trash2 size={16} className="group-hover:animate-bounce" />
            Xóa lịch sử
          </button>
        )}
      </div>

      {/* Content */}
      <div className="px-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="relative w-20 h-20">
              <div className="absolute inset-0 border-4 border-purple-500/30 rounded-full" />
              <div className="absolute inset-0 border-4 border-transparent border-t-purple-500 rounded-full animate-spin" />
            </div>
            <p className="mt-6 text-white/60 font-medium">Đang tải lịch sử nghe...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-24 bg-gradient-to-b from-white/[0.03] to-transparent rounded-3xl border border-white/10">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
              <Headphones size={48} className="text-purple-400/50" />
            </div>
            <p className="text-2xl text-white/60 font-bold">Chưa có lịch sử nghe</p>
            <p className="text-white/40 mt-2">Hãy bắt đầu khám phá và nghe nhạc!</p>
            <button className="mt-6 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold hover:shadow-lg hover:shadow-purple-500/30 transition-all">
              Khám phá ngay
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {sortedDates.map(([date, { items: dateItems }]) => (
              <div key={date}>
                {/* Date Header */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                      <Calendar size={20} className="text-purple-400" />
                    </div>
                    <h3 className="text-lg font-bold text-white capitalize">{date}</h3>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 text-xs font-semibold">
                    {dateItems.length} bài hát
                  </span>
                </div>

                {/* Songs Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {dateItems.map((item, index) => {
                    const timeInfo = getTimeIcon(item.playedAt);
                    return (
                      <div
                        key={`${item.id}-${index}`}
                        onClick={() => handlePlay(item, items.indexOf(item))}
                        className="group relative bg-white/[0.03] hover:bg-white/[0.06] rounded-2xl p-4 border border-white/5 hover:border-purple-500/30 transition-all duration-300 cursor-pointer"
                      >
                        <div className="flex gap-4">
                          {/* Thumbnail */}
                          <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 shadow-lg">
                            <img 
                              src={item.thumbnailUrl} 
                              alt={item.title} 
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center">
                                <Play size={18} className="text-white ml-0.5" fill="currentColor" />
                              </div>
                            </div>
                            {/* Time badge */}
                            <div className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/70 text-white text-xs font-mono">
                              {formatTime(item.durationInSeconds)}
                            </div>
                          </div>
                          
                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-white truncate group-hover:text-purple-400 transition-colors">
                              {item.title}
                            </p>
                            <p className="text-sm text-white/50 truncate">{item.artist}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <span className="text-xs">{timeInfo.icon}</span>
                              <span className="text-xs text-white/40">{timeInfo.label}</span>
                              <span className="text-white/30">•</span>
                              <span className="text-xs text-white/40">{formatRelativeTime(item.playedAt)}</span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Play indicator */}
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => { e.stopPropagation(); handlePlay(item, items.indexOf(item)); }}
                            className="p-2 rounded-full bg-purple-500/20 text-purple-400 hover:bg-purple-500 hover:text-white transition-all backdrop-blur-sm"
                            title="Phát lại"
                          >
                            <RotateCcw size={14} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ListenHistory;
