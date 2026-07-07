import { useState, useEffect } from 'react';
import { Search as SearchIcon, Clock, Music, Play, Pause } from 'lucide-react';
import api from '../axios';
import { useAudio } from '../Contexts/AudioContext';
import { Link } from 'react-router-dom';

const Search = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const { playTrack, currentTrack, isPlaying } = useAudio();

  const categories = [
    { name: 'Pop', color: 'linear-gradient(135deg, #1DB954, #1ed760)', emoji: '🎵' },
    { name: 'Hip-Hop', color: 'linear-gradient(135deg, #e8115b, #ff6b35)', emoji: '🎤' },
    { name: 'Rock', color: 'linear-gradient(135deg, #8a4fff, #ff4a8d)', emoji: '🎸' },
    { name: 'Jazz', color: 'linear-gradient(135deg, #1e3a5f, #3d5a80)', emoji: '🎷' },
    { name: 'Electronic', color: 'linear-gradient(135deg, #00d4ff, #7b2ff7)', emoji: '🎹' },
    { name: 'Classical', color: 'linear-gradient(135deg, #d4af37, #b8860b)', emoji: '🎻' },
    { name: 'R&B', color: 'linear-gradient(135deg, #9b59b6, #e74c3c)', emoji: '🎧' },
    { name: 'Country', color: 'linear-gradient(135deg, #f39c12, #d35400)', emoji: '🤠' },
    { name: 'Latin', color: 'linear-gradient(135deg, #e74c3c, #c0392b)', emoji: '💃' },
    { name: 'Metal', color: 'linear-gradient(135deg, #2c3e50, #34495e)', emoji: '🤘' },
    { name: 'Indie', color: 'linear-gradient(135deg, #16a085, #27ae60)', emoji: '🌿' },
    { name: 'Workout', color: 'linear-gradient(135deg, #e67e22, #f39c12)', emoji: '💪' },
  ];

  useEffect(() => {
    if (!query) {
      setResults([]);
      return;
    }
    const delayDebounce = setTimeout(() => {
      api.get(`/media?query=${query}`).then(res => setResults(res.data.items || []));
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [query]);

  const handlePlay = (item: any) => {
    playTrack(item, results);
  };

  return (
    <div style={{ padding: '24px 32px', minHeight: '100%' }}>
      {/* Search Bar - Spotify Style */}
      <div style={{ 
        position: 'relative', 
        maxWidth: '500px', 
        marginBottom: '32px' 
      }}>
        <div style={{
          position: 'absolute',
          left: '16px',
          top: '50%',
          transform: 'translateY(-50%)',
          color: '#b3b3b3',
          zIndex: 1,
          pointerEvents: 'none',
        }}>
          <SearchIcon size={22} />
        </div>
        <input
          type="text"
          placeholder="What do you want to listen to?"
          style={{
            width: '100%',
            backgroundColor: '#242424',
            borderRadius: '50px',
            border: 'none',
            outline: 'none',
            padding: '14px 20px 14px 52px',
            fontSize: '15px',
            color: '#fff',
            transition: 'background-color 0.3s ease',
          }}
          onFocus={(e) => e.target.style.backgroundColor = '#303030'}
          onBlur={(e) => e.target.style.backgroundColor = '#242424'}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {/* Search Results */}
      {results.length > 0 ? (
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#fff', marginBottom: '24px' }}>
            Top result
          </h2>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '24px',
            marginBottom: '40px'
          }}>
            {/* Featured Result */}
            <div style={{
              backgroundColor: '#181818',
              borderRadius: '8px',
              padding: '20px',
              cursor: 'pointer',
              transition: 'background-color 0.3s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.backgroundColor = '#282828'}
            onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.backgroundColor = '#181818'}
            onClick={() => handlePlay(results[0])}
            >
              <div style={{ 
                width: '100px', 
                height: '100px', 
                borderRadius: '8px', 
                overflow: 'hidden', 
                marginBottom: '16px',
                boxShadow: '0 8px 24px rgba(0,0,0,0.5)'
              }}>
                <img 
                  src={results[0].thumbnailUrl} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                  alt="" 
                />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#fff', marginBottom: '8px' }}>
                {results[0].title}
              </h3>
              <p style={{ fontSize: '13px', color: '#b3b3b3', marginBottom: '16px' }}>
                {results[0].artist || 'Unknown Artist'}
              </p>
              <div style={{
                width: '48px',
                height: '48px',
                backgroundColor: '#1DB954',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 16px rgba(0,0,0,0.3)',
              }}>
                {currentTrack?.id === results[0].id && isPlaying ? (
                  <Pause size={24} fill="black" color="black" />
                ) : (
                  <Play size={24} fill="black" color="black" style={{ marginLeft: '2px' }} />
                )}
              </div>
            </div>

            {/* Other Results - Grid */}
            <div>
              <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#b3b3b3', marginBottom: '16px', textTransform: 'uppercase' }}>
                Songs
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {results.slice(1, 6).map((item: any) => (
                  <div 
                    key={item.id}
                    onClick={() => handlePlay(item)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '8px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.backgroundColor = '#282828'}
                    onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'}
                  >
                    <img 
                      src={item.thumbnailUrl} 
                      style={{ width: '48px', height: '48px', borderRadius: '4px', objectFit: 'cover' }} 
                      alt="" 
                    />
                    <div style={{ flex: 1, overflow: 'hidden' }}>
                      <div style={{ fontSize: '14px', fontWeight: '500', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {item.title}
                      </div>
                      <div style={{ fontSize: '12px', color: '#b3b3b3' }}>
                        {item.artist || 'Unknown Artist'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Browse All Section */}
          <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#fff', marginBottom: '24px' }}>
            Browse All
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '16px',
            marginBottom: '40px'
          }}>
            {categories.map((cat, i) => (
              <Link
                key={cat.name}
                to={`/app/search?q=${cat.name}`}
                style={{
                  background: cat.color,
                  borderRadius: '8px',
                  padding: '20px',
                  fontSize: '18px',
                  fontWeight: '700',
                  color: '#fff',
                  textDecoration: 'none',
                  aspectRatio: '1/1',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'transform 0.2s ease',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                  overflow: 'hidden',
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = 'scale(1.05)'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)'; }}
              >
                <span style={{ fontSize: '32px' }}>{cat.emoji}</span>
                <span>{cat.name}</span>
              </Link>
            ))}
          </div>

          {/* Recent Searches placeholder */}
          <div style={{
            backgroundColor: '#121212',
            borderRadius: '8px',
            padding: '24px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <Clock size={20} color="#b3b3b3" />
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#fff' }}>Recent Searches</h3>
            </div>
            <div style={{ textAlign: 'center', padding: '40px', color: '#b3b3b3' }}>
              <Music size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
              <p>Your recent searches will appear here</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Search;