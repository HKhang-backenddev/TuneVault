import { useState, useEffect, useRef } from 'react';
import { Trophy, Play, TrendingUp, Loader2, Flame, Music2, Zap, ChevronUp, Crown } from 'lucide-react';
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
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const genres = [
    { name: 'Tất cả', icon: <Music2 size={14} /> },
    { name: 'YouTube', icon: <Zap size={14} /> },
    { name: 'Lofi', icon: <Flame size={14} /> },
    { name: 'Pop', icon: <TrendingUp size={14} /> },
    { name: 'Rock', icon: <Flame size={14} /> },
    { name: 'EDM', icon: <Zap size={14} /> },
  ];

  useEffect(() => {
    fetchCharts();
  }, [genre]);

  const fetchCharts = async () => {
    setLoading(true);
    try {
      const url = genre && genre !== 'Tất cả' 
        ? `/media/top?limit=30&genre=${encodeURIComponent(genre)}`
        : '/media/top?limit=30';
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

  const formatViews = (count: number) => {
    if (count >= 1000000) return (count / 1000000).toFixed(1) + 'M';
    if (count >= 1000) return (count / 1000).toFixed(1) + 'K';
    return count.toString();
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

  const getRankStyle = (index: number) => {
    if (index === 0) return 'from-amber-400 to-yellow-500 shadow-[0_0_30px_rgba(250,204,21,0.5)]';
    if (index === 1) return 'from-slate-300 to-gray-400 shadow-[0_0_20px_rgba(156,163,175,0.4)]';
    if (index === 2) return 'from-amber-600 to-amber-700 shadow-[0_0_20px_rgba(180,83,9,0.4)]';
    return 'bg-gradient-to-br from-slate-800 to-slate-900';
  };

  const getRankIcon = (index: number) => {
    if (index === 0) return <Crown size={20} className="text-amber-300" />;
    if (index < 3) return null;
    return null;
  };

  return (
    <div className="pb-24 min-h-screen">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-violet-950 via-purple-900 to-indigo-950">
          <div className="absolute inset-0 opacity-30">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 bg-yellow-400 rounded-full animate-pulse"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${2 + Math.random() * 2}s`
                }}
              />
            ))}
          </div>
        </div>
        
        {/* Glass effect overlay */}
        <div className="absolute inset-0 backdrop-blur-xl" />
        
        {/* Content */}
        <div className="relative pt-16 pb-12 px-8">
          <div className="flex items-center gap-6">
            {/* Trophy with glow */}
            <div className="relative">
              <div className="absolute inset-0 bg-yellow-500 rounded-full blur-2xl opacity-50 animate-pulse" />
              <div className="relative w-36 h-36 rounded-3xl bg-gradient-to-br from-yellow-400 via-amber-500 to-orange-500 flex items-center justify-center shadow-2xl transform rotate-6 hover:rotate-0 transition-transform duration-500">
                <Trophy size={72} className="text-white drop-shadow-2xl" />
              </div>
            </div>
            
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-400 text-xs font-bold uppercase tracking-widest">
                  🔥 Hot Trending
                </span>
              </div>
              <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-400 to-orange-400 mb-3 drop-shadow-lg">
                Bảng Xếp Hạng
              </h1>
              <p className="text-white/60 text-lg">Những bài hát thịnh hành nhất • Cập nhật liên tục</p>
              
              {/* Stats */}
              <div className="flex gap-6 mt-4">
                <div className="text-center">
                  <p className="text-2xl font-black text-white">{items.length}</p>
                  <p className="text-xs text-white/50 uppercase tracking-wider">Bài hát</p>
                </div>
                <div className="w-px h-10 bg-white/20" />
                <div className="text-center">
                  <p className="text-2xl font-black text-yellow-400">{formatViews(items.reduce((a, b) => a + b.playCount, 0))}</p>
                  <p className="text-xs text-white/50 uppercase tracking-wider">Tổng lượt nghe</p>
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

      {/* Genre Filter - Modern Pills */}
      <div className="px-8 py-6">
        <div className="flex gap-3 flex-wrap">
          {genres.map((g, i) => (
            <button
              key={g.name}
              onClick={() => setGenre(g.name === 'Tất cả' ? '' : g.name)}
              className={`group relative px-5 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 transition-all duration-300 ${
                (g.name === 'Tất cả' ? '' : g.name) === genre
                  ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-[0_4px_20px_rgba(249,115,22,0.4)] scale-105'
                  : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white border border-white/10 hover:border-white/20'
              }`}
            >
              {g.icon}
              {g.name}
              {(g.name === 'Tất cả' ? '' : g.name) === genre && (
                <span className="absolute -inset-0.5 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl blur opacity-30 -z-10" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Chart Content */}
      <div className="px-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="relative w-20 h-20">
              <div className="absolute inset-0 border-4 border-yellow-500/30 rounded-full" />
              <div className="absolute inset-0 border-4 border-transparent border-t-yellow-500 rounded-full animate-spin" />
            </div>
            <p className="mt-6 text-white/60 font-medium">Đang tải bảng xếp hạng...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-24 bg-white/5 rounded-3xl border border-white/10">
            <TrendingUp size={80} className="mx-auto mb-4 text-white/20" />
            <p className="text-xl text-white/60 font-medium">Chưa có dữ liệu</p>
            <p className="text-white/40 mt-2">Hãy nghe nhiều bài hát hơn để xuất hiện trên bảng xếp hạng!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Top 3 Highlight */}
            {items.slice(0, 3).length > 0 && (
              <div className="grid grid-cols-3 gap-4 mb-8">
                {items.slice(0, 3).map((item, index) => (
                  <div
                    key={item.id}
                    onClick={() => handlePlay(item, index)}
                    className={`group relative cursor-pointer rounded-2xl overflow-hidden transition-all duration-300 hover:scale-[1.02] ${
                      index === 0 ? 'col-span-2 row-span-2' : ''
                    } ${getRankStyle(index)}`}
                  >
                    {/* Rank Badge */}
                    <div className="absolute top-3 left-3 z-20 flex items-center gap-2">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        index === 0 ? 'bg-gradient-to-br from-amber-400 to-yellow-500' :
                        index === 1 ? 'bg-gradient-to-br from-slate-300 to-gray-400' :
                        'bg-gradient-to-br from-amber-600 to-amber-700'
                      }`}>
                        <span className="text-white font-black text-lg">{index + 1}</span>
                      </div>
                      {getRankIcon(index)}
                    </div>
                    
                    {/* Image */}
                    <img
                      src={item.thumbnailUrl}
                      alt={item.title}
                      className={`w-full object-cover ${index === 0 ? 'h-64' : 'h-32'}`}
                    />
                    
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                    
                    {/* Content */}
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h3 className={`font-bold text-white mb-1 ${index === 0 ? 'text-xl' : 'text-sm'}`}>
                        {item.title}
                      </h3>
                      <p className="text-white/70 text-xs mb-2">{item.artist}</p>
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1 text-yellow-400 text-xs font-semibold">
                          <TrendingUp size={12} />
                          {formatViews(item.playCount)}
                        </span>
                        <span className="text-white/50 text-xs">{formatTime(item.durationInSeconds)}</span>
                      </div>
                    </div>
                    
                    {/* Play Button */}
                    <div className={`absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity ${index === 0 ? '' : ''}`}>
                      <div className="w-16 h-16 rounded-full bg-yellow-500 flex items-center justify-center shadow-2xl transform group-hover:scale-110 transition-transform">
                        <Play size={28} className="text-black ml-1" fill="currentColor" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Rest of the list */}
            <div className="bg-gradient-to-b from-white/[0.03] to-transparent rounded-2xl border border-white/5 overflow-hidden">
              <div className="grid grid-cols-12 gap-4 p-4 text-xs font-bold text-white/40 uppercase tracking-wider border-b border-white/5">
                <div className="col-span-1 text-center">#</div>
                <div className="col-span-6">Bài hát</div>
                <div className="col-span-2">Album</div>
                <div className="col-span-2 text-center">Lượt nghe</div>
                <div className="col-span-1"></div>
              </div>

              {items.slice(3).map((item, index) => (
                <div
                  key={item.id}
                  className="grid grid-cols-12 gap-4 p-3 items-center hover:bg-white/[0.03] transition-all group cursor-pointer"
                  onMouseEnter={() => setHoveredIndex(index + 3)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  onClick={() => handlePlay(item, index + 3)}
                >
                  <div className="col-span-1 text-center">
                    <span className="text-lg font-black text-white/30 group-hover:text-yellow-500 transition-colors">
                      {index + 4}
                    </span>
                  </div>
                  <div className="col-span-6 flex items-center gap-3">
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 shadow-lg">
                      <img src={item.thumbnailUrl} alt={item.title} className="w-full h-full object-cover" />
                      <div className={`absolute inset-0 bg-black/50 flex items-center justify-center transition-opacity ${hoveredIndex === index + 3 ? 'opacity-100' : 'opacity-0'}`}>
                        <Play size={18} className="text-white ml-0.5" fill="currentColor" />
                      </div>
                    </div>
                    <div className="overflow-hidden">
                      <p className="font-semibold text-white truncate group-hover:text-yellow-400 transition-colors">{item.title}</p>
                      <p className="text-sm text-white/50 truncate">{item.artist}</p>
                    </div>
                  </div>
                  <div className="col-span-2">
                    <span className="text-neutral-500 text-sm truncate block">{item.genre || 'Single'}</span>
                  </div>
                  <div className="col-span-2 text-center">
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-500/10 text-green-400 text-xs font-bold">
                      <TrendingUp size={10} />
                      {formatViews(item.playCount)}
                    </span>
                  </div>
                  <div className="col-span-1 flex justify-end">
                    <button
                      onClick={(e) => { e.stopPropagation(); handlePlay(item, index + 3); }}
                      className="p-2 rounded-full bg-white/5 text-white/50 hover:bg-yellow-500 hover:text-black transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Play size={14} fill="currentColor" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TopCharts;
