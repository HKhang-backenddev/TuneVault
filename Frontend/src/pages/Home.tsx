import React, { useEffect, useState } from 'react';
import api from '../axios';
import { Play, Pause, Music, Heart, Search as SearchIcon, User, Loader2 } from 'lucide-react';
import { useAudio } from '../Contexts/AudioContext';
import { Link } from 'react-router-dom';

interface MediaItem {
  id: string;
  title: string;
  artist: string;
  url: string;
  thumbnailUrl: string;
  genre?: string;
  genreName?: string;
  isLiked?: boolean;
  isOwner?: boolean;
}

interface UserResult {
  id: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
}

interface HomeProps {
  user: { displayName: string } | null;
  searchQuery: string;
  lastRefreshTime: number;
}

const Home = ({ user, searchQuery, lastRefreshTime }: HomeProps) => {
  const { playTrack, togglePlay, currentTrack, isPlaying, updateLikedStatus } = useAudio();
  const [sections, setSections] = useState<{ title: string; items: MediaItem[] }[]>([]);
  const [userResults, setUserResults] = useState<UserResult[]>([]);
  const [searchResults, setSearchResults] = useState<MediaItem[]>([]);
  const [hearts, setHearts] = useState<{ id: number; x: number; y: number; color: string }[]>([]);
  const [loading, setLoading] = useState(true);

  const toggleLike = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      const randomColors = ['#FF0000', '#FF1493', '#FF4500', '#FFD700', '#FF6B6B', '#E91E63'];
      const randomColor = randomColors[Math.floor(Math.random() * randomColors.length)];
      const newHeart = { id: Date.now(), x: e.clientX, y: e.clientY, color: randomColor };
      setHearts(prev => [...prev, newHeart]);
      setTimeout(() => { setHearts(prev => prev.filter(h => h.id !== newHeart.id)); }, 1000);
      const res = await api.post(`/favorites/toggle/${id}`);
      const liked = res.data.isLiked;
      setSections(prev => prev.map(sec => ({ ...sec, items: sec.items.map(item => item.id === id ? { ...item, isLiked: liked } : item) })));
      setSearchResults(prev => prev.map(item => item.id === id ? { ...item, isLiked: liked } : item));
      if (currentTrack?.id === id) updateLikedStatus(liked);
      try { window.dispatchEvent(new CustomEvent('favoritesUpdated')); } catch {}
    } catch (err) { console.error("Loi khi tha tim:", err); }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const libraryRes = await api.get('/media/library?pageSize=500');
        
        let libraryItems: MediaItem[] = [];
        if (Array.isArray(libraryRes.data)) {
          libraryItems = libraryRes.data;
        } else if (libraryRes.data?.items) {
          libraryItems = libraryRes.data.items;
        } else if (libraryRes.data?.data) {
          libraryItems = libraryRes.data.data;
        }
        
        // GROUP SONGS BY GENRE
        const genreMap = new Map<string, MediaItem[]>();
        
        libraryItems.forEach(song => {
          const genre = song.genre || song.genreName || 'Khac';
          if (!genreMap.has(genre)) {
            genreMap.set(genre, []);
          }
          genreMap.get(genre)!.push(song);
        });
        
        // Create sections from genre map
        const sectionsData: { title: string; items: MediaItem[] }[] = [];
        
        genreMap.forEach((items, genre) => {
          if (items.length > 0) {
            sectionsData.push({ title: genre, items });
          }
        });
        
        setSections(sectionsData);
      } catch (err) { 
        console.error("Loi fetch data:", err); 
      }
      setLoading(false);
    };
    fetchData();
  }, [lastRefreshTime]);

  useEffect(() => {
    if (!searchQuery.trim()) { setSearchResults([]); setUserResults([]); return; }
    const search = async () => {
      try {
        const [songRes, userRes] = await Promise.all([
          api.get(`/media/search?query=${encodeURIComponent(searchQuery)}`),
          api.get(`/users/search?query=${encodeURIComponent(searchQuery)}`)
        ]);
        setSearchResults(songRes.data?.items || []);
        setUserResults(userRes.data || []);
      } catch (err) { console.error("Loi tim kiem:", err); }
    };
    const timer = setTimeout(search, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const SongCard = ({ song, playlist }: { song: MediaItem; playlist: MediaItem[] }) => {
    const isCurrent = currentTrack?.id === song.id;
    return (
      <div
        onClick={() => playTrack(song, playlist)}
        style={{
          backgroundColor: '#181818',
          borderRadius: '8px',
          padding: '16px',
          cursor: 'pointer',
          width: '180px',
          minWidth: '180px',
          transition: 'background-color 0.3s ease',
          position: 'relative',
        }}
        onMouseEnter={(e) => { 
          e.currentTarget.style.backgroundColor = '#282828'; 
          const btn = e.currentTarget.querySelector('.play-btn') as HTMLElement;
          if (btn) btn.style.opacity = '1';
          if (btn) btn.style.transform = 'translateY(0)';
        }}
        onMouseLeave={(e) => { 
          e.currentTarget.style.backgroundColor = '#181818';
          const btn = e.currentTarget.querySelector('.play-btn') as HTMLElement;
          if (btn) btn.style.opacity = '0';
          if (btn) btn.style.transform = 'translateY(8px)';
        }}
      >
        <div style={{ position: 'relative', marginBottom: '16px' }}>
          <img src={song.thumbnailUrl} style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover', borderRadius: '4px', boxShadow: '0 8px 24px rgba(0,0,0,0.5)' }} alt="" />
          <button
            className="play-btn"
            onClick={(e) => { e.stopPropagation(); playTrack(song, playlist); }}
            style={{
              position: 'absolute', right: '8px', bottom: '8px', width: '48px', height: '48px',
              backgroundColor: '#1DB954', borderRadius: '50%', border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              opacity: 0, transform: 'translateY(8px)', transition: 'all 0.3s ease',
              boxShadow: '0 8px 16px rgba(0,0,0,0.3)',
            }}
          >
            {isCurrent && isPlaying ? <Pause size={22} fill="black" color="black" /> : <Play size={22} fill="black" color="black" style={{ marginLeft: '2px' }} />}
          </button>
        </div>
        <div style={{ fontSize: '16px', fontWeight: '600', color: isCurrent ? '#1DB954' : '#fff', marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{song.title}</div>
        <div style={{ fontSize: '14px', color: '#b3b3b3', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{song.artist || 'Nghe si'}</div>
      </div>
    );
  };

  const UserCard = ({ user: u }: { user: UserResult }) => (
    <Link to={`/app/profile/${u.username}`} style={{ textDecoration: 'none', backgroundColor: '#181818', borderRadius: '8px', padding: '16px', cursor: 'pointer', width: '180px', minWidth: '180px', transition: 'background-color 0.3s ease', display: 'block' }}
      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#282828'}
      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#181818'}>
      <div style={{ width: '100%', aspectRatio: '1/1', borderRadius: '50%', overflow: 'hidden', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#282828', boxShadow: '0 8px 24px rgba(0,0,0,0.5)' }}>
        {u.avatarUrl ? <img src={u.avatarUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" /> : <User size={60} style={{ color: '#b3b3b3' }} />}
      </div>
      <div style={{ fontSize: '16px', fontWeight: '600', color: '#fff', textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{u.displayName}</div>
      <div style={{ fontSize: '12px', color: '#b3b3b3', textAlign: 'center', marginTop: '4px' }}>Nguoi dung</div>
    </Link>
  );

  return (
    <div style={{ color: 'white', padding: '20px', minHeight: '100%', boxSizing: 'border-box' }}>
      <style>{`
        .spotify-scroll::-webkit-scrollbar { height: 8px; }
        .spotify-scroll::-webkit-scrollbar-track { background: transparent; }
        .spotify-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 4px; }
        .spotify-scroll::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.3); }
        @keyframes float-heart-home {
          0% { transform: translate(-50%, -50%) scale(0.5); opacity: 1; }
          25% { transform: translate(calc(-50% - 20px), calc(-50% - 50px)) scale(1); opacity: 0.8; }
          50% { transform: translate(calc(-50% + 20px), calc(-50% - 100px)) scale(1.5); opacity: 0.6; }
          75% { transform: translate(calc(-50% - 10px), calc(-50% - 150px)) scale(1.8); opacity: 0.3; }
          100% { transform: translate(-50%, calc(-50% - 200px)) scale(2); opacity: 0; }
        }
        .floating-heart { position: fixed; pointer-events: none; z-index: 9999; animation: float-heart-home 1s ease-out forwards; }
      `}</style>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '16px' }}>
          <Loader2 size={48} style={{ color: '#1DB954', animation: 'spin 1s linear infinite' }} />
          <p style={{ color: '#b3b3b3', fontSize: '16px' }}>Dang tai nhac...</p>
        </div>
      ) : searchQuery ? (
        <div>
          <h2 style={{ fontSize: '28px', fontWeight: '700', color: '#fff', marginBottom: '24px' }}>Ket qua tim kiem cho "{searchQuery}"</h2>
          {userResults.length > 0 && (
            <div style={{ marginBottom: '32px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#fff', marginBottom: '16px' }}>Nghe si</h3>
              <div style={{ display: 'flex', gap: '24px', overflowX: 'auto', paddingBottom: '16px' }} className="spotify-scroll">
                {userResults.map(u => <UserCard key={u.id} user={u} />)}
              </div>
            </div>
          )}
          {searchResults.length > 0 ? (
            <div>
              <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#fff', marginBottom: '16px' }}>Bai hat</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '24px' }}>
                {searchResults.map(song => <SongCard key={song.id} song={song} playlist={searchResults} />)}
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '80px 0' }}>
              <SearchIcon size={64} style={{ color: '#535353', marginBottom: '16px' }} />
              <p style={{ color: '#b3b3b3', fontSize: '18px' }}>Khong tim thay ket qua nao</p>
            </div>
          )}
        </div>
      ) : (
        <div>
          <h1 style={{ fontSize: '36px', fontWeight: '900', color: '#fff', marginBottom: '32px' }}>
            Xin chao, {user?.displayName || 'ban'}!
          </h1>

          {/* HIEN THI TAT CA - GRID CO SCROLL DOC */}
          {(() => {
            const allSongs = sections.flatMap(s => s.items);
            return allSongs.length > 0 && (
              <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#fff', margin: 0 }}>Tat ca bai hat</h2>
                  <button 
                    onClick={() => playTrack(allSongs[0], allSongs)}
                    style={{ backgroundColor: '#1DB954', color: 'black', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <Play size={14} fill="black" />
                  </button>
                </div>
                {/* Grid co scroll doc */}
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', 
                  gap: '10px',
                  maxHeight: 'calc(100vh - 280px)',
                  overflowY: 'auto',
                  paddingRight: '8px',
                }}
                className="spotify-scrollbar"
                >
                  {allSongs.map(song => (
                    <div key={song.id} style={{ backgroundColor: '#181818', borderRadius: '6px', padding: '10px', cursor: 'pointer' }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#282828'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#181818'}
                      onClick={() => playTrack(song, allSongs)}
                    >
                      <img src={song.thumbnailUrl} style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover', borderRadius: '4px', marginBottom: '8px' }} alt="" />
                      <div style={{ fontSize: '12px', fontWeight: '600', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{song.title}</div>
                      <div style={{ fontSize: '10px', color: '#b3b3b3', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{song.artist || 'Nghe si'}</div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}

          {/* HIEN THI THEO THE LOAI - MOI HANG MOT THE LOAI */}
          {sections.map((section, idx) => (
            <div key={idx} style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#fff', margin: 0 }}>{section.title}</h2>
                <button 
                  onClick={() => playTrack(section.items[0], section.items)}
                  style={{ backgroundColor: '#1DB954', color: 'black', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <Play size={14} fill="black" />
                </button>
              </div>
              {/* Grid co scroll doc */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', 
                gap: '10px',
                maxHeight: 'calc(100vh - 280px)',
                overflowY: 'auto',
                paddingRight: '8px',
              }}
              className="spotify-scrollbar"
              >
                {section.items.map(song => (
                  <div key={song.id} style={{ backgroundColor: '#181818', borderRadius: '6px', padding: '10px', cursor: 'pointer' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#282828'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#181828'}
                    onClick={() => playTrack(song, section.items)}
                  >
                    <img src={song.thumbnailUrl} style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover', borderRadius: '4px', marginBottom: '8px' }} alt="" />
                    <div style={{ fontSize: '12px', fontWeight: '600', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{song.title}</div>
                    <div style={{ fontSize: '10px', color: '#b3b3b3', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{song.artist || 'Nghe si'}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {sections.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px', backgroundColor: '#181818', borderRadius: '8px' }}>
              <Music size={64} style={{ color: '#535353', marginBottom: '16px' }} />
              <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#fff', marginBottom: '8px' }}>Chua co nhac</h2>
              <p style={{ color: '#b3b3b3', marginBottom: '16px' }}>Hay them nhac de bat dau</p>
              <Link to="/app/import" style={{ backgroundColor: '#1DB954', color: 'black', padding: '12px 24px', borderRadius: '20px', fontWeight: '700', textDecoration: 'none' }}>
                Them nhac
              </Link>
            </div>
          )}
        </div>
      )}

      {hearts.map(h => (<Heart key={h.id} className="floating-heart" style={{ left: h.x, top: h.y, color: h.color }} size={24} fill="currentColor" />))}
    </div>
  );
};

export default Home;
