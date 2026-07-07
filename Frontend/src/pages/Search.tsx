import { useState, useEffect } from 'react';
import { Search as SearchIcon, Play, Pause, Heart, X, Loader2 } from 'lucide-react';
import api from '../axios';
import { useAudio } from '../Contexts/AudioContext';
import { Link, useSearchParams } from 'react-router-dom';

interface SearchProps {
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}

interface MediaItem {
  id: string;
  title: string;
  artist: string;
  url: string;
  thumbnailUrl: string;
  isLiked?: boolean;
}

const Search = ({ searchQuery = '', onSearchChange }: SearchProps) => {
  const [query, setQuery] = useState(searchQuery);
  const [results, setResults] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { playTrack, currentTrack, isPlaying, updateLikedStatus } = useAudio();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const qParam = searchParams.get('q');
    if (qParam) {
      setQuery(qParam);
    } else if (searchQuery) {
      setQuery(searchQuery);
    }
  }, [searchQuery, searchParams]);

  const handleQueryChange = (newQuery: string) => {
    setQuery(newQuery);
    onSearchChange?.(newQuery);
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    onSearchChange?.('');
  };

  const toggleLike = async (e: React.MouseEvent, item: MediaItem) => {
    e.stopPropagation();
    try {
      await api.post(`/favorites/toggle/${item.id}`);
      setResults(prev => prev.map(s => s.id === item.id ? { ...s, isLiked: !s.isLiked } : s));
      if (currentTrack?.id === item.id) {
        updateLikedStatus(!item.isLiked);
      }
    } catch (err) {
      console.error("Error toggling like:", err);
    }
  };

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    const delayDebounce = setTimeout(() => {
      api.get(`/media?query=${encodeURIComponent(query)}`)
        .then(res => {
          const items = res.data.items || res.data || [];
          setResults(items);
        })
        .catch(err => {
          console.error("Search error:", err);
          setResults([]);
        })
        .finally(() => setLoading(false));
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [query]);

  const handlePlay = (item: MediaItem) => {
    playTrack(item, results);
  };

  const categories = [
    { name: 'Pop', color: 'linear-gradient(135deg, #833ab4, #fd1d1d)', emoji: '🎵' },
    { name: 'Hip-Hop', color: 'linear-gradient(135deg, #fcb045, #fd1d1d)', emoji: '🎤' },
    { name: 'Rock', color: 'linear-gradient(135deg, #fd1d1d, #833ab4)', emoji: '🎸' },
    { name: 'Jazz', color: 'linear-gradient(135deg, #c084fc, #f472b6)', emoji: '🎷' },
    { name: 'Electronic', color: 'linear-gradient(135deg, #00FFFF, #833ab4)', emoji: '🎹' },
    { name: 'Classical', color: 'linear-gradient(135deg, #ffd700, #fcb045)', emoji: '🎻' },
    { name: 'R&B', color: 'linear-gradient(135deg, #f472b6, #fd1d1d)', emoji: '🎧' },
    { name: 'Country', color: 'linear-gradient(135deg, #f97316, #eab308)', emoji: '🤠' },
    { name: 'Latin', color: 'linear-gradient(135deg, #fd1d1d, #c084fc)', emoji: '💃' },
    { name: 'Metal', color: 'linear-gradient(135deg, #a855f7, #ef4444)', emoji: '🤘' },
    { name: 'Indie', color: 'linear-gradient(135deg, #22c55e, #00FFFF)', emoji: '🌿' },
    { name: 'Workout', color: 'linear-gradient(135deg, #f97316, #eab308)', emoji: '💪' },
  ];

  return (
    <div style={{ padding: '24px 32px', minHeight: '100%' }}>
      {query && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#fff' }}>
            Kết quả cho "{query}"
          </h2>
          <button onClick={clearSearch} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', backgroundColor: 'rgba(131, 58, 180, 0.3)', border: '1px solid rgba(131, 58, 180, 0.5)', borderRadius: '20px', color: '#c084fc', cursor: 'pointer' }}>
            <X size={16} /> Xóa
          </button>
        </div>
      )}

      {loading && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
          <Loader2 size={48} style={{ color: '#833ab4', animation: 'spin 1s linear infinite' }} />
        </div>
      )}

      {!loading && results.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
          {results.map((item) => (
            <div key={item.id} onClick={() => handlePlay(item)} style={{ backgroundColor: '#181818', borderRadius: '12px', padding: '16px', cursor: 'pointer', transition: 'all 0.3s ease', position: 'relative', border: '1px solid transparent' }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = '#282828'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(131, 58, 180, 0.5)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = '#181818'; (e.currentTarget as HTMLElement).style.borderColor = 'transparent'; (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; }}>
              <div style={{ position: 'relative', width: '100%', aspectRatio: '1/1', borderRadius: '8px', overflow: 'hidden', marginBottom: '12px' }}>
                <img src={item.thumbnailUrl || '/placeholder.png'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={item.title} />
                <div className="play-overlay" style={{ position: 'absolute', bottom: '8px', right: '8px', width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#833ab4', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transform: 'translateY(8px)', transition: 'all 0.3s ease' }}>
                  {currentTrack?.id === item.id && isPlaying ? <Pause size={24} fill="white" color="white" /> : <Play size={24} fill="white" color="white" style={{ marginLeft: '2px' }} />}
                </div>
              </div>
              <button onClick={(e) => toggleLike(e, item)} style={{ position: 'absolute', top: '24px', right: '24px', background: 'rgba(0,0,0,0.5)', border: 'none', borderRadius: '50%', width: '36px', height: '36px', cursor: 'pointer', padding: '8px', zIndex: 10 }}>
                <Heart size={18} fill={item.isLiked ? '#fd1d1d' : 'none'} color={item.isLiked ? '#fd1d1d' : '#fff'} />
              </button>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#fff', marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.title}</h3>
              <p style={{ fontSize: '13px', color: '#b3b3b3' }}>{item.artist || 'Unknown Artist'}</p>
            </div>
          ))}
        </div>
      )}

      {!loading && query && results.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 20px', backgroundColor: '#1a1a2e', borderRadius: '12px', border: '1px solid rgba(131, 58, 180, 0.3)' }}>
          <SearchIcon size={64} style={{ color: '#833ab4', marginBottom: '16px' }} />
          <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#fff', marginBottom: '8px' }}>Không tìm thấy kết quả</h3>
          <p style={{ color: '#b3b3b3' }}>Thử tìm kiếm từ khóa khác</p>
        </div>
      )}

      {!query && (
        <>
          <h2 style={{ fontSize: '28px', fontWeight: '700', color: '#c084fc', marginBottom: '24px' }}>Khám phá thể loại</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '16px', marginBottom: '40px' }}>
            {categories.map((cat) => (
              <Link key={cat.name} to={`/app/search?q=${cat.name}`} style={{ background: cat.color, borderRadius: '12px', padding: '24px', fontSize: '18px', fontWeight: '700', color: '#fff', textDecoration: 'none', minHeight: '140px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', transition: 'all 0.3s ease' }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-8px)'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; }}>
                <span style={{ fontSize: '36px' }}>{cat.emoji}</span>
                <span>{cat.name}</span>
              </Link>
            ))}
          </div>
        </>
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } } div:hover .play-overlay { opacity: 1 !important; transform: translateY(0) !important; }`}</style>
    </div>
  );
};

export default Search;
