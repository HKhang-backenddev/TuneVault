import { useState, useEffect } from 'react';
import { History, Play, Trash2, Clock, Music, Loader2, Calendar, Headphones } from 'lucide-react';
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

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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

  // Group by date
  const groupedItems = items.reduce((acc, item) => {
    const date = new Date(item.playedAt).toLocaleDateString('vi-VN');
    if (!acc[date]) acc[date] = [];
    acc[date].push(item);
    return acc;
  }, {} as Record<string, HistoryItem[]>);

  return (
    <div className="pb-24 min-h-screen">
      {/* Header */}
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/50 to-transparent h-48" />
        <div className="relative pt-12 px-6 flex items-center gap-6">
          <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-2xl">
            <History size={64} className="text-white drop-shadow-lg" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-bold text-purple-400 uppercase tracking-widest mb-1">Cá nhân</p>
            <h1 className="text-4xl font-black text-white mb-2">Lịch sử nghe</h1>
            <p className="text-neutral-400 text-sm">{items.length} bài hát đã nghe</p>
          </div>
          {items.length > 0 && (
            <button
              onClick={handleClearHistory}
              className="px-4 py-2 rounded-full bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white transition-all flex items-center gap-2 text-sm font-semibold"
            >
              <Trash2 size={16} />
              Xóa lịch sử
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="px-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={40} className="animate-spin text-purple-500" />
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-20">
            <Headphones size={64} className="mx-auto mb-4 text-neutral-700" />
            <p className="text-neutral-500 mb-2">Chưa có lịch sử nghe</p>
            <p className="text-neutral-600 text-sm">Hãy bắt đầu nghe nhạc!</p>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedItems).map(([date, dateItems]) => (
              <div key={date}>
                <div className="flex items-center gap-3 mb-4">
                  <Calendar size={18} className="text-purple-400" />
                  <h2 className="text-lg font-bold text-white">{date}</h2>
                  <span className="text-neutral-500 text-sm">{dateItems.length} bài</span>
                </div>
                <div className="bg-black/30 backdrop-blur-sm rounded-2xl border border-white/5 overflow-hidden">
                  {dateItems.map((item, index) => (
                    <div
                      key={`${item.id}-${index}`}
                      className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-white/5 transition-colors group"
                    >
                      <div className="col-span-1 flex items-center justify-center">
                        <Clock size={16} className="text-neutral-600" />
                      </div>
                      <div 
                        className="col-span-6 flex items-center gap-3 cursor-pointer"
                        onClick={() => handlePlay(item, items.indexOf(item))}
                      >
                        <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                          <img src={item.thumbnailUrl} alt={item.title} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Play size={20} className="text-white fill-white" />
                          </div>
                        </div>
                        <div className="overflow-hidden">
                          <p className="font-semibold text-white truncate">{item.title}</p>
                          <p className="text-sm text-neutral-400 truncate">{item.artist}</p>
                        </div>
                      </div>
                      <div className="col-span-2 text-neutral-500 text-sm">
                        {new Date(item.playedAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <div className="col-span-2 text-neutral-500 font-mono text-sm">
                        {formatTime(item.durationInSeconds)}
                      </div>
                      <div className="col-span-1 flex justify-end">
                        <button
                          onClick={() => handlePlay(item, items.indexOf(item))}
                          className="p-2 rounded-full bg-purple-500/20 text-purple-400 hover:bg-purple-500 hover:text-white transition-all"
                          title="Phát lại"
                        >
                          <Play size={16} fill="currentColor" />
                        </button>
                      </div>
                    </div>
                  ))}
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
