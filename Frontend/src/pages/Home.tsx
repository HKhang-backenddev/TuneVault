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

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

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
    } catch (err) { console.error("Error toggling like:", err); }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch all songs using /media endpoint (AllowAnonymous)
        const [mediaRes, adminRes] = await Promise.all([
          api.get('/media?pageSize=100'),
          api.get('/media/admin-songs?pageSize=50').catch(() => ({ data: { items: [] } }))
        ]);

        // Parse admin songs
        let adminItems: MediaItem[] = [];
        if (adminRes?.data?.items) {
          adminItems = adminRes.data.items;
        } else if (Array.isArray(adminRes?.data)) {
          adminItems = adminRes.data;
        }

        // Parse library songs
        let libraryItems: MediaItem[] = [];
        if (Array.isArray(mediaRes?.data)) {
          libraryItems = mediaRes.data;
        } else if (mediaRes?.data?.items) {
          libraryItems = mediaRes.data.items;
        } else if (mediaRes?.data?.data) {
          libraryItems = mediaRes.data.data;
        }
        const genreMap = new Map<string, MediaItem[]>();
        
        libraryItems.forEach(song => {
          const genre = song.genre || song.genreName || 'Other';
          if (!genreMap.has(genre)) {
            genreMap.set(genre, []);
          }
          genreMap.get(genre)!.push(song);
        });
        
        // Create sections from genre map
        const sectionsData: { title: string; items: MediaItem[] }[] = [];

        // Add Admin's Featured Songs section at the top if admin has songs
        if (adminItems.length > 0) {
          sectionsData.push({ title: "🎵 Admin's Picks", items: adminItems });
        }
        
        genreMap.forEach((items, genre) => {
          if (items.length > 0) {
            sectionsData.push({ title: genre, items });
          }
        });
        
        setSections(sectionsData);
      } catch (err) { 
        console.error("Error fetching data:", err); 
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
      } catch (err) { console.error("Error searching:", err); }
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
          backgroundColor: '#1a1a2e',
          borderRadius: '12px',
          padding: '16px',
          cursor: 'pointer',
          width: '180px',
          minWidth: '180px',
          transition: 'all 0.3s ease',
          position: 'relative',
          border: '1px solid transparent',
          boxShadow: '0 0 15px rgba(255, 0, 255, 0.2)',
        }}
        onMouseEnter={(e) => { 
          e.currentTarget.style.backgroundColor = '#2a2a4e'; 
          e.currentTarget.style.borderColor = '#FF00FF';
          e.currentTarget.style.boxShadow = '0 0 25px rgba(255, 0, 255, 0.5), 0 0 50px rgba(0, 255, 255, 0.3)';
          const btn = e.currentTarget.querySelector('.play-btn') as HTMLElement;
          if (btn) btn.style.opacity = '1';
          if (btn) btn.style.transform = 'translateY(0)';
        }}
        onMouseLeave={(e) => { 
          e.currentTarget.style.backgroundColor = '#1a1a2e';
          e.currentTarget.style.borderColor = 'transparent';
          e.currentTarget.style.boxShadow = '0 0 15px rgba(255, 0, 255, 0.2)';
          const btn = e.currentTarget.querySelector('.play-btn') as HTMLElement;
          if (btn) btn.style.opacity = '0';
          if (btn) btn.style.transform = 'translateY(8px)';
        }}
      >
        <div style={{ position: 'relative', marginBottom: '16px' }}>
          <img src={song.thumbnailUrl} style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover', borderRadius: '8px', boxShadow: '0 0 20px rgba(0, 255, 255, 0.3)' }} alt="" />
          <button
            className="play-btn"
            onClick={(e) => { e.stopPropagation(); playTrack(song, playlist); }}
            style={{
              position: 'absolute', right: '8px', bottom: '8px', width: '48px', height: '48px',
              backgroundColor: '#00FFFF', borderRadius: '50%', border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              opacity: 0, transform: 'translateY(8px)', transition: 'all 0.3s ease',
              boxShadow: '0 0 20px rgba(0, 255, 255, 0.8)',
            }}
          >
            {isCurrent && isPlaying ? <Pause size={22} fill="black" color="black" /> : <Play size={22} fill="black" color="black" style={{ marginLeft: '2px' }} />}
          </button>
        </div>
        <div style={{ fontSize: '16px', fontWeight: '600', color: isCurrent ? '#00FFFF' : '#fff', marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', textShadow: isCurrent ? '0 0 10px rgba(0, 255, 255, 0.5)' : 'none' }}>{song.title}</div>
        <div style={{ fontSize: '14px', color: '#b3b3b3', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{song.artist || 'Unknown Artist'}</div>
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
          <p style={{ color: '#b3b3b3', fontSize: '16px' }}>Loading music...</p>
        </div>
      ) : searchQuery ? (
        <div>
          <h2 style={{ fontSize: '28px', fontWeight: '700', color: '#fff', marginBottom: '24px' }}>Search results for "{searchQuery}"</h2>
          {userResults.length > 0 && (
            <div style={{ marginBottom: '32px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#fff', marginBottom: '16px' }}>Artists</h3>
              <div style={{ display: 'flex', gap: '24px', overflowX: 'auto', paddingBottom: '16px' }} className="spotify-scroll">
                {userResults.map(u => <UserCard key={u.id} user={u} />)}
              </div>
            </div>
          )}
          {searchResults.length > 0 ? (
            <div>
              <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#fff', marginBottom: '16px' }}>Songs</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '24px' }}>
                {searchResults.map(song => <SongCard key={song.id} song={song} playlist={searchResults} />)}
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '80px 0' }}>
              <SearchIcon size={64} style={{ color: '#535353', marginBottom: '16px' }} />
              <p style={{ color: '#b3b3b3', fontSize: '18px' }}>No results found</p>
            </div>
          )}
        </div>
      ) : (
        <div>
          <h1 style={{ fontSize: '36px', fontWeight: '900', color: '#fff', marginBottom: '32px' }}>
            {getGreeting()}
          </h1>

          {/* Quick Access Cards - Neon Cyberpunk Style */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
            gap: '16px', 
            marginBottom: '40px' 
          }}>
            <Link 
              to="/app/liked"
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0',
                background: 'linear-gradient(135deg, #FF00FF, #00FFFF)',
                borderRadius: '8px',
                overflow: 'hidden',
                textDecoration: 'none',
                boxShadow: '0 0 20px rgba(255, 0, 255, 0.5), 0 0 40px rgba(0, 255, 255, 0.3)',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = 'scale(1.05)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 0 30px rgba(255, 0, 255, 0.8), 0 0 60px rgba(0, 255, 255, 0.5)'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 0 20px rgba(255, 0, 255, 0.5), 0 0 40px rgba(0, 255, 255, 0.3)'; }}
            >
              <div style={{ padding: '20px', flex: 1 }}>
                <div style={{ fontSize: '16px', fontWeight: '700', color: '#fff', marginBottom: '8px', textShadow: '0 0 10px rgba(255,255,255,0.5)' }}>Liked Songs</div>
                <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.8)' }}>Your favorite tracks</div>
              </div>
              <div style={{ width: '100px', height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.3)', marginRight: '16px', borderRadius: '4px' }}>
                <Heart size={48} fill="white" color="white" style={{ filter: 'drop-shadow(0 0 10px rgba(255,0,255,0.8))' }} />
              </div>
            </Link>

            <Link 
              to="/app/library"
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0',
                background: 'linear-gradient(135deg, #00FF00, #FFFF00)',
                borderRadius: '8px',
                overflow: 'hidden',
                textDecoration: 'none',
                boxShadow: '0 0 20px rgba(0, 255, 0, 0.5), 0 0 40px rgba(255, 255, 0, 0.3)',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = 'scale(1.05)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 0 30px rgba(0, 255, 0, 0.8), 0 0 60px rgba(255, 255, 0, 0.5)'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 0 20px rgba(0, 255, 0, 0.5), 0 0 40px rgba(255, 255, 0, 0.3)'; }}
            >
              <div style={{ padding: '20px', flex: 1 }}>
                <div style={{ fontSize: '16px', fontWeight: '700', color: '#000', marginBottom: '8px' }}>Your Library</div>
                <div style={{ fontSize: '13px', color: 'rgba(0,0,0,0.7)' }}>Browse your collection</div>
              </div>
              <div style={{ width: '100px', height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.2)', marginRight: '16px', borderRadius: '4px' }}>
                <Music size={48} color="#000" style={{ filter: 'drop-shadow(0 0 10px rgba(0,255,0,0.8))' }} />
              </div>
            </Link>

            <Link 
              to="/app/search"
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0',
                background: 'linear-gradient(135deg, #FF6600, #FF00FF)',
                borderRadius: '8px',
                overflow: 'hidden',
                textDecoration: 'none',
                boxShadow: '0 0 20px rgba(255, 102, 0, 0.5), 0 0 40px rgba(255, 0, 255, 0.3)',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = 'scale(1.05)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 0 30px rgba(255, 102, 0, 0.8), 0 0 60px rgba(255, 0, 255, 0.5)'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 0 20px rgba(255, 102, 0, 0.5), 0 0 40px rgba(255, 0, 255, 0.3)'; }}
            >
              <div style={{ padding: '20px', flex: 1 }}>
                <div style={{ fontSize: '16px', fontWeight: '700', color: '#fff', marginBottom: '8px', textShadow: '0 0 10px rgba(255,255,255,0.5)' }}>Browse All</div>
                <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.8)' }}>Discover new music</div>
              </div>
              <div style={{ width: '100px', height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.2)', marginRight: '16px', borderRadius: '4px' }}>
                <SearchIcon size={48} color="white" style={{ filter: 'drop-shadow(0 0 10px rgba(255,102,0,0.8))' }} />
              </div>
            </Link>

            <Link 
              to="/app/import"
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0',
                background: 'linear-gradient(135deg, #00FFFF, #0066FF)',
                borderRadius: '8px',
                overflow: 'hidden',
                textDecoration: 'none',
                boxShadow: '0 0 20px rgba(0, 255, 255, 0.5), 0 0 40px rgba(0, 102, 255, 0.3)',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = 'scale(1.05)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 0 30px rgba(0, 255, 255, 0.8), 0 0 60px rgba(0, 102, 255, 0.5)'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 0 20px rgba(0, 255, 255, 0.5), 0 0 40px rgba(0, 102, 255, 0.3)'; }}
            >
              <div style={{ padding: '20px', flex: 1 }}>
                <div style={{ fontSize: '16px', fontWeight: '700', color: '#000', marginBottom: '8px' }}>Add Music</div>
                <div style={{ fontSize: '13px', color: 'rgba(0,0,0,0.7)' }}>Import from YouTube</div>
              </div>
              <div style={{ width: '100px', height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.2)', marginRight: '16px', borderRadius: '4px' }}>
                <Music size={48} color="#000" style={{ filter: 'drop-shadow(0 0 10px rgba(0,255,255,0.8))' }} />
              </div>
            </Link>
          </div>

          {/* All Songs - Horizontal scroll like Spotify */}
          {(() => {
            const allSongs = sections.flatMap(s => s.items);
            return allSongs.length > 0 && (
              <div style={{ marginBottom: '40px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#fff', margin: 0 }}>All Songs</h2>
                  <button 
                    onClick={() => playTrack(allSongs[0], allSongs)}
                    style={{ backgroundColor: '#1DB954', color: 'black', border: 'none', borderRadius: '50%', width: '36px', height: '36px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'transform 0.2s' }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = 'scale(1.1)'; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)'; }}
                  >
                    <Play size={16} fill="black" />
                  </button>
                </div>
                {/* Horizontal scroll */}
                <div style={{ 
                  display: 'flex', 
                  gap: '16px',
                  overflowX: 'auto',
                  paddingBottom: '16px',
                }}
                className="spotify-scroll"
                >
                  {allSongs.slice(0, 10).map(song => (
                    <div key={song.id} 
                      style={{ 
                        backgroundColor: '#1a1a1a', 
                        borderRadius: '8px', 
                        padding: '16px', 
                        cursor: 'pointer',
                        minWidth: '160px',
                        width: '160px',
                        transition: 'all 0.3s ease',
                        position: 'relative',
                      }}
                      onMouseEnter={(e) => { 
                        e.currentTarget.style.backgroundColor = '#282828';
                        const btn = e.currentTarget.querySelector('.mini-play-btn') as HTMLElement;
                        if (btn) { btn.style.opacity = '1'; btn.style.transform = 'translateY(0)'; }
                      }}
                      onMouseLeave={(e) => { 
                        e.currentTarget.style.backgroundColor = '#1a1a1a';
                        const btn = e.currentTarget.querySelector('.mini-play-btn') as HTMLElement;
                        if (btn) { btn.style.opacity = '0'; btn.style.transform = 'translateY(8px)'; }
                      }}
                      onClick={() => playTrack(song, allSongs)}
                    >
                      <div style={{ position: 'relative', marginBottom: '12px' }}>
                        <img src={song.thumbnailUrl} style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover', borderRadius: '6px', boxShadow: '0 8px 24px rgba(0,0,0,0.5)' }} alt="" />
                        <button
                          className="mini-play-btn"
                          onClick={(e) => { e.stopPropagation(); playTrack(song, allSongs); }}
                          style={{
                            position: 'absolute', right: '8px', bottom: '8px', width: '40px', height: '40px',
                            backgroundColor: '#1DB954', borderRadius: '50%', border: 'none', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            opacity: 0, transform: 'translateY(8px)', transition: 'all 0.3s ease',
                            boxShadow: '0 8px 16px rgba(0,0,0,0.3)',
                          }}
                        >
                          {currentTrack?.id === song.id && isPlaying ? <Pause size={18} fill="black" color="black" /> : <Play size={18} fill="black" color="black" />}
                        </button>
                      </div>
                      <div style={{ fontSize: '14px', fontWeight: '600', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: '4px' }}>{song.title}</div>
                      <div style={{ fontSize: '12px', color: '#b3b3b3', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{song.artist || 'Unknown Artist'}</div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}

          {/* Genre sections - Horizontal scroll like Spotify */}
          {sections.map((section, idx) => (
            <div key={idx} style={{ marginBottom: '40px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#fff', margin: 0 }}>{section.title}</h2>
                <button 
                  onClick={() => playTrack(section.items[0], section.items)}
                  style={{ backgroundColor: '#1DB954', color: 'black', border: 'none', borderRadius: '50%', width: '36px', height: '36px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'transform 0.2s' }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = 'scale(1.1)'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)'; }}
                >
                  <Play size={16} fill="black" />
                </button>
              </div>
              {/* Horizontal scroll */}
              <div style={{ 
                display: 'flex', 
                gap: '16px',
                overflowX: 'auto',
                paddingBottom: '16px',
              }}
              className="spotify-scroll"
              >
                {section.items.slice(0, 8).map(song => (
                  <div key={song.id} 
                    style={{ 
                      backgroundColor: '#1a1a1a', 
                      borderRadius: '8px', 
                      padding: '16px', 
                      cursor: 'pointer',
                      minWidth: '180px',
                      width: '180px',
                      transition: 'all 0.3s ease',
                      position: 'relative',
                    }}
                    onMouseEnter={(e) => { 
                      e.currentTarget.style.backgroundColor = '#282828';
                      const btn = e.currentTarget.querySelector('.genre-play-btn') as HTMLElement;
                      if (btn) { btn.style.opacity = '1'; btn.style.transform = 'translateY(0)'; }
                    }}
                    onMouseLeave={(e) => { 
                      e.currentTarget.style.backgroundColor = '#1a1a1a';
                      const btn = e.currentTarget.querySelector('.genre-play-btn') as HTMLElement;
                      if (btn) { btn.style.opacity = '0'; btn.style.transform = 'translateY(8px)'; }
                    }}
                    onClick={() => playTrack(song, section.items)}
                  >
                    <div style={{ position: 'relative', marginBottom: '12px' }}>
                      <img src={song.thumbnailUrl} style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover', borderRadius: '6px', boxShadow: '0 8px 24px rgba(0,0,0,0.5)' }} alt="" />
                      <button
                        className="genre-play-btn"
                        onClick={(e) => { e.stopPropagation(); playTrack(song, section.items); }}
                        style={{
                          position: 'absolute', right: '8px', bottom: '8px', width: '48px', height: '48px',
                          backgroundColor: '#1DB954', borderRadius: '50%', border: 'none', cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          opacity: 0, transform: 'translateY(8px)', transition: 'all 0.3s ease',
                          boxShadow: '0 8px 16px rgba(0,0,0,0.3)',
                        }}
                      >
                        {currentTrack?.id === song.id && isPlaying ? <Pause size={20} fill="black" color="black" /> : <Play size={20} fill="black" color="black" />}
                      </button>
                    </div>
                    <div style={{ fontSize: '15px', fontWeight: '600', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: '4px' }}>{song.title}</div>
                    <div style={{ fontSize: '13px', color: '#b3b3b3', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{song.artist || 'Unknown Artist'}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {sections.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px 40px', backgroundColor: '#1a1a2e', borderRadius: '12px', marginTop: '20px', border: '1px solid rgba(131, 58, 180, 0.3)' }}>
              <div style={{ width: '120px', height: '120px', backgroundColor: 'rgba(131, 58, 180, 0.2)', borderRadius: '50%', margin: '0 auto 24px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 30px rgba(131, 58, 180, 0.3)' }}>
                <Music size={60} style={{ color: '#833ab4' }} />
              </div>
              <h2 style={{ fontSize: '28px', fontWeight: '700', color: '#c084fc', marginBottom: '12px', textShadow: '0 0 10px rgba(131, 58, 180, 0.5)' }}>Chưa có nhạc</h2>
              <p style={{ color: '#b3b3b3', marginBottom: '24px', fontSize: '15px' }}>Admin hãy thêm nhạc để mọi người cùng nghe nhé!</p>
              <Link to="/app/import" style={{ backgroundColor: '#833ab4', color: 'white', padding: '14px 32px', borderRadius: '24px', fontWeight: '700', textDecoration: 'none', display: 'inline-block', boxShadow: '0 0 20px rgba(131, 58, 180, 0.5)' }}>
                + Thêm nhạc
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
