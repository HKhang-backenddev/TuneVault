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
    { name: 'Pop', color: 'linear-gradient(135deg, #FF00FF, #00FFFF)', emoji: '🎵' },
    { name: 'Hip-Hop', color: 'linear-gradient(135deg, #FF6600, #FF00FF)', emoji: '🎤' },
    { name: 'Rock', color: 'linear-gradient(135deg, #FF0044, #FF6600)', emoji: '🎸' },
    { name: 'Jazz', color: 'linear-gradient(135deg, #00FF88, #00FFFF)', emoji: '🎷' },
    { name: 'Electronic', color: 'linear-gradient(135deg, #00FFFF, #0066FF)', emoji: '🎹' },
    { name: 'Classical', color: 'linear-gradient(135deg, #FFD700, #FF00FF)', emoji: '🎻' },
    { name: 'R&B', color: 'linear-gradient(135deg, #FF00FF, #FF0088)', emoji: '🎧' },
    { name: 'Country', color: 'linear-gradient(135deg, #00FF00, #FFFF00)', emoji: '🤠' },
    { name: 'Latin', color: 'linear-gradient(135deg, #FF3300, #FF00FF)', emoji: '💃' },
    { name: 'Metal', color: 'linear-gradient(135deg, #8800FF, #FF0088)', emoji: '🤘' },
    { name: 'Indie', color: 'linear-gradient(135deg, #00FF00, #00FFFF)', emoji: '🌿' },
    { name: 'Workout', color: 'linear-gradient(135deg, #FF6600, #FFFF00)', emoji: '💪' },
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
      {/* Search Bar - Neon Cyberpunk Style */}
      <div style={{ 
        position: 'relative', 
        maxWidth: '600px', 
        marginBottom: '40px' 
      }}>
        <div style={{
          position: 'absolute',
          left: '20px',
          top: '50%',
          transform: 'translateY(-50%)',
          color: '#FF00FF',
          zIndex: 1,
          pointerEvents: 'none',
          filter: 'drop-shadow(0 0 10px rgba(255, 0, 255, 0.8))',
        }}>
          <SearchIcon size={24} />
        </div>
        <input
          type="text"
          placeholder="What do you want to listen to?"
          style={{
            width: '100%',
            backgroundColor: '#1a1a2e',
            borderRadius: '50px',
            border: '2px solid transparent',
            outline: 'none',
            padding: '16px 20px 16px 56px',
            fontSize: '16px',
            color: '#fff',
            transition: 'all 0.3s ease',
            boxShadow: '0 0 20px rgba(255, 0, 255, 0.3)',
          }}
          onFocus={(e) => { 
            e.target.style.borderColor = '#FF00FF';
            e.target.style.boxShadow = '0 0 30px rgba(255, 0, 255, 0.5), 0 0 60px rgba(0, 255, 255, 0.3)';
          }}
          onBlur={(e) => { 
            e.target.style.borderColor = 'transparent';
            e.target.style.boxShadow = '0 0 20px rgba(255, 0, 255, 0.3)';
          }}
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
          <h2 style={{ fontSize: '28px', fontWeight: '700', color: '#00FFFF', marginBottom: '24px', textShadow: '0 0 10px rgba(0, 255, 255, 0.5)' }}>
            Browse All
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '20px',
            marginBottom: '40px'
          }}>
            {categories.map((cat, i) => (
              <Link
                key={cat.name}
                to={`/app/search?q=${cat.name}`}
                style={{
                  background: cat.color,
                  borderRadius: '12px',
                  padding: '24px',
                  fontSize: '20px',
                  fontWeight: '700',
                  color: '#fff',
                  textDecoration: 'none',
                  aspectRatio: '1/1',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 0 20px rgba(255, 0, 255, 0.4), 0 0 40px rgba(0, 255, 255, 0.2)',
                  overflow: 'hidden',
                  position: 'relative',
                }}
                onMouseEnter={(e) => { 
                  (e.currentTarget as HTMLElement).style.transform = 'scale(1.08)'; 
                  (e.currentTarget as HTMLElement).style.boxShadow = '0 0 30px rgba(255, 0, 255, 0.8), 0 0 60px rgba(0, 255, 255, 0.4)';
                }}
                onMouseLeave={(e) => { 
                  (e.currentTarget as HTMLElement).style.transform = 'scale(1)'; 
                  (e.currentTarget as HTMLElement).style.boxShadow = '0 0 20px rgba(255, 0, 255, 0.4), 0 0 40px rgba(0, 255, 255, 0.2)';
                }}
              >
                <span style={{ fontSize: '40px', filter: 'drop-shadow(0 0 10px rgba(255,255,255,0.5))' }}>{cat.emoji}</span>
                <span style={{ textShadow: '0 0 10px rgba(255,255,255,0.5)' }}>{cat.name}</span>
              </Link>
            ))}
          </div>

          {/* Recent Searches placeholder */}
          <div style={{
            backgroundColor: '#1a1a2e',
            borderRadius: '12px',
            padding: '32px',
            boxShadow: '0 0 20px rgba(255, 0, 255, 0.2)',
            border: '1px solid rgba(255, 0, 255, 0.3)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <Clock size={24} color="#FF00FF" style={{ filter: 'drop-shadow(0 0 10px rgba(255, 0, 255, 0.8))' }} />
              <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#FF00FF', textShadow: '0 0 10px rgba(255, 0, 255, 0.5)' }}>Recent Searches</h3>
            </div>
            <div style={{ textAlign: 'center', padding: '40px', color: '#b3b3b3' }}>
              <Music size={48} style={{ marginBottom: '16px', color: '#00FFFF', filter: 'drop-shadow(0 0 15px rgba(0, 255, 255, 0.5))' }} />
              <p style={{ color: '#b3b3b3' }}>Your recent searches will appear here</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Search;