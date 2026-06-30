import { useState, useEffect } from 'react';
import { Trophy, Play, Heart, Clock, Music, TrendingUp, Loader2 } from 'lucide-react';
import api from '../axios';
import { useAudio } from '../Contexts/AudioContext';

interface ChartItem {
  id: string;
  title: string;
  artist: string;
  url: string;
  thumbnailUrl: string;
  durationInSeconds: number;
  genre: string;
  playCount: number;
}

const TopCharts = () => {
  const { playTrack } = useAudio();
  const [items, setItems] = useState<ChartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [genre, setGenre] = useState<string>('');
  const [genres] = useState(['Tất cả', 'YouTube', 'Lofi', 'Pop', 'Rock', 'EDM', 'Acoustic', 'Chill Music', 'Rap']);

  useEffect(() => {
    fetchCharts();
  }, [genre]);

  const fetchCharts = async () => {
    setLoading(true);
    try {
      const url = genre && genre !== 'Tất cả' 
        ? `/media/top?limit=50&genre=${encodeURIComponent(genre)}`
        : '/media/top?limit=50';
      const res = await api.get(url);
      setItems(res.data || []);
    } catch (error) {
      console.error("Lỗi khi tải Top Charts:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePlay = (item: ChartItem, index: number) => {
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

  return (
    <div className="pb-24 min-h-screen">
      {/* Header */}
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-gradient-to-b from-yellow-900/50 to-transparent h-48" />
        <div className="relative pt-12 px-6 flex items-center gap-6">
          <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-yellow-500 to-orange-600 flex items-center justify-center shadow-2xl">
            <Trophy size={64} className="text-white drop-shadow-lg" />
          </div>
          <div>
            <p className="text-xs font-bold text-yellow-400 uppercase tracking-widest mb-1">Bảng xếp hạng</p>
            <h1 className="text-4xl font-black text-white mb-2">Top Bài Hát</h1>
            <p className="text-neutral-400 text-sm">Những bài hát được nghe nhiều nhất</p>
          </div>
        </div>
      </div>

      {/* Genre Filter */}
      <div className="px-6 mb-6">
        <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
          {genres.map(g => (
            <button
              key={g}
              onClick={() => setGenre(g === 'Tất cả' ? '' : g)}
              className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
                (g === 'Tất cả' ? '' : g) === genre
                  ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg shadow-yellow-500/30'
                  : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      {/* Chart List */}
      <div className="px-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={40} className="animate-spin text-yellow-500" />
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-20">
            <TrendingUp size={64} className="mx-auto mb-4 text-neutral-700" />
            <p className="text-neutral-500">Chưa có dữ liệu. Hãy nghe nhiều bài hát hơn!</p>
          </div>
        ) : (
          <div className="bg-black/30 backdrop-blur-sm rounded-3xl border border-white/5 overflow-hidden">
            {/* Header */}
            <div className="grid grid-cols-12 gap-4 p-4 text-xs font-bold text-neutral-500 uppercase tracking-wider border-b border-white/5">
              <div className="col-span-1 text-center">#</div>
              <div className="col-span-5">Bài hát</div>
              <div className="col-span-2">Lượt nghe</div>
              <div className="col-span-2">Thời lượng</div>
              <div className="col-span-2 text-right">Hành động</div>
            </div>

            {/* Items */}
            {items.map((item, index) => (
              <div
                key={item.id}
                className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-white/5 transition-colors group"
              >
                <div className="col-span-1 text-center">
                  <span className={`font-black text-lg ${
                    index < 3 ? `text-${index === 0 ? 'yellow-400' : index === 1 ? 'neutral-300' : 'amber-600'}` : 'text-neutral-500'
                  }`}>
                    {index + 1}
                  </span>
                </div>
                <div 
                  className="col-span-5 flex items-center gap-3 cursor-pointer"
                  onClick={() => handlePlay(item, index)}
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
                <div className="col-span-2 flex items-center gap-2">
                  <TrendingUp size={16} className="text-green-500" />
                  <span className="text-neutral-400 font-mono">{item.playCount.toLocaleString()}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-neutral-500 font-mono">{formatTime(item.durationInSeconds)}</span>
                </div>
                <div className="col-span-2 flex justify-end gap-2">
                  <button
                    onClick={() => handlePlay(item, index)}
                    className="p-2 rounded-full bg-green-500/20 text-green-500 hover:bg-green-500 hover:text-white transition-all"
                    title="Phát"
                  >
                    <Play size={16} fill="currentColor" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TopCharts;
