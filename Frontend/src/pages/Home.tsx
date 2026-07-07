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
  const [sections, setSections] = useState<{ title: string, items: MediaItem[] }[]>([]);
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
    } catch (err) { console.error("Lỗi khi thả tim:", err); }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        console.log("🔍 Home: Đang fetch dữ liệu...");
        const libraryRes = await api.get('/media/library?pageSize=100');
        console.log("📦 Library response:", libraryRes.data);
        
        const sectionsData = [];
        
        // Lấy items từ response - có thể là array trực tiếp hoặc trong property items
        let libraryItems = [];
        if (Array.isArray(libraryRes.data)) {
          libraryItems = libraryRes.data;
        } else if (libraryRes.data?.items) {
          libraryItems = libraryRes.data.items;
        } else if (libraryRes.data?.data) {
          libraryItems = libraryRes.data.data;
        }
        
        console.log("🎵 Library items:", libraryItems);
        
        if (libraryItems.length > 0) sectionsData.push({ title: 'Thư viện của bạn', items: libraryItems });
        
        // Thử lấy favorites
        try {
          const likedRes = await api.get('/favorites');
          let likedItems = [];
          if (Array.isArray(likedRes.data)) likedItems = likedRes.data;
          else if (likedRes.data?.items) likedItems = likedRes.data.items;
          else if (likedRes.data?.songs) likedItems = likedRes.data.songs;
          
          if (likedItems.length > 0) sectionsData.push({ title: 'Bài hát đã thích', items: likedItems });
        } catch (e) { console.log("Không lấy được favorites:", e); }
        
        setSections(sectionsData);
        console.log("✅ Sections cuối cùng:", sectionsData);
      } catch (err) { 
        console.error("❌ Lỗi fetch data:", err); 
        // Nếu lỗi, thử fetch riêng lẻ
        try {
          const libraryRes = await api.get('/media/library?pageSize=100');
          let items = libraryRes.data?.items || libraryRes.data || [];
          if (items.length > 0) {
            setSections([{ title: 'Thư viện của bạn', items: items }]);
          }
        } catch (e2) {
          console.error("❌ Lỗi fetch library riêng:", e2);
        }
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
      } catch (err) { console.error("Lỗi tìm kiếm:", err); }
    };
    const timer = setTimeout(search, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const SongCard = ({ song, showArtist = true }: { song: MediaItem; showArtist?: boolean }) => {
    const isCurrent = currentTrack?.id === song.id;
    return (
      <div
        onClick={() => playTrack(song, searchResults.length > 0 ? searchResults : sections.flatMap(s => s.items))}
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
        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#282828'; e.currentTarget.querySelector('.play-btn')?.setAttribute('style', 'opacity:1 !important; transform: translateY(0) !important'); }}
        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#181818'; e.currentTarget.querySelector('.play-btn')?.setAttribute('style', 'opacity:0; transform: translateY(8px)'); }}
      >
        <div style={{ position: 'relative', marginBottom: '16px' }}>
          <img src={song.thumbnailUrl} style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover', borderRadius: '4px', boxShadow: '0 8px 24px rgba(0,0,0,0.5)' }} alt="" />
          <button
            className="play-btn"
            onClick={(e) => { e.stopPropagation(); playTrack(song, searchResults.length > 0 ? searchResults : sections.flatMap(s => s.items)); }}
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
        <div style={{ fontSize: '16px', fontWeight: '600', color: '#fff', marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{song.title}</div>
        {showArtist && <div style={{ fontSize: '14px', color: '#b3b3b3', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{song.artist || 'Nghệ sĩ'}</div>}
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
      <div style={{ fontSize: '12px', color: '#b3b3b3', textAlign: 'center', marginTop: '4px' }}>Người dùng</div>
    </Link>
  );

  const SectionRow = ({ section }: { section: { title: string; items: MediaItem[] } }) => (
    <div style={{ marginBottom: '32px' }}>
      <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#fff', marginBottom: '16px' }}>{section.title}</h2>
      <div style={{ display: 'flex', gap: '24px', overflowX: 'auto', paddingBottom: '16px' }}>
        {section.items.slice(0, 10).map(song => <SongCard key={song.id} song={song} />)}
      </div>
    </div>
  );

  return (
    <div style={{ color: 'white', padding: '24px 32px', minHeight: '100%' }}>
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
          <p style={{ color: '#b3b3b3', fontSize: '16px' }}>Đang tải nhạc...</p>
        </div>
      ) : searchQuery ? (
        <div>
          <h2 style={{ fontSize: '28px', fontWeight: '700', color: '#fff', marginBottom: '24px' }}>Kết quả tìm kiếm cho "{searchQuery}"</h2>
          {userResults.length > 0 && (
            <div style={{ marginBottom: '32px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#fff', marginBottom: '16px' }}>Nghệ sĩ</h3>
              <div style={{ display: 'flex', gap: '24px', overflowX: 'auto', paddingBottom: '16px' }} className="spotify-scroll">
                {userResults.map(u => <UserCard key={u.id} user={u} />)}
              </div>
            </div>
          )}
          {searchResults.length > 0 ? (
            <div>
              <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#fff', marginBottom: '16px' }}>Bài hát</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '24px' }}>
                {searchResults.map(song => <SongCard key={song.id} song={song} />)}
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '80px 0' }}>
              <SearchIcon size={64} style={{ color: '#535353', marginBottom: '16px' }} />
              <p style={{ color: '#b3b3b3', fontSize: '18px' }}>Không tìm thấy kết quả nào</p>
            </div>
          )}
        </div>
      ) : (
        <div>
          <h1 style={{ fontSize: '36px', fontWeight: '900', color: '#fff', marginBottom: '32px' }}>
            Xin chào, {user?.displayName || 'bạn'}!
          </h1>

          {/* HIỂN THỊ TẤT CẢ BÀI HÁT */}
          {sections.length > 0 && sections[0]?.items && sections[0].items.length > 0 && (
            <div style={{ marginBottom: '32px' }}>
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#fff' }}>Tất cả bài hát</h2>
                <button 
                  onClick={() => playTrack(sections[0].items[0], sections[0].items)}
                  style={{ 
                    backgroundColor: '#1DB954', 
                    color: 'black', 
                    border: 'none', 
                    borderRadius: '50%', 
                    width: '40px', 
                    height: '40px', 
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'transform 0.1s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                  <Play size={18} fill="black" />
                </button>
              </div>
              
              {/* Hàng 1 - Cuộn ngang */}
              <div style={{ 
                display: 'flex', 
                gap: '16px',
                overflowX: 'auto',
                paddingBottom: '16px',
              }}
              className="spotify-scroll"
              >
                {sections[0].items.map((song) => {
                  const isCurrent = currentTrack?.id === song.id;
                  return (
                    <div
                      key={song.id}
                      onClick={() => playTrack(song, sections[0].items)}
                      style={{
                        backgroundColor: '#181818',
                        borderRadius: '8px',
                        padding: '16px',
                        cursor: 'pointer',
                        transition: 'background-color 0.2s ease',
                        position: 'relative',
                        minWidth: '180px',
                        maxWidth: '180px',
                        flexShrink: 0,
                      }}
                      onMouseEnter={(e) => { 
                        e.currentTarget.style.backgroundColor = '#282828';
                        const btn = e.currentTarget.querySelector('.play-btn');
                        if (btn) btn.setAttribute('style', 'opacity:1 !important; transform: translateY(0) !important');
                      }}
                      onMouseLeave={(e) => { 
                        e.currentTarget.style.backgroundColor = '#181818';
                        const btn = e.currentTarget.querySelector('.play-btn');
                        if (btn) btn.setAttribute('style', 'opacity:0; transform: translateY(8px)');
                      }}
                    >
                      <div style={{ position: 'relative', marginBottom: '12px' }}>
                        <img 
                          src={song.thumbnailUrl} 
                          style={{ 
                            width: '100%', 
                            aspectRatio: '1/1', 
                            objectFit: 'cover', 
                            borderRadius: '4px',
                            boxShadow: '0 8px 24px rgba(0,0,0,0.5)'
                          }} 
                          alt={song.title}
                        />
                        <button
                          className="play-btn"
                          onClick={(e) => { e.stopPropagation(); playTrack(song, sections[0].items); }}
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
                      <div style={{ 
                        fontSize: '14px', 
                        fontWeight: '600', 
                        color: isCurrent ? '#1DB954' : '#fff', 
                        whiteSpace: 'nowrap', 
                        overflow: 'hidden', 
                        textOverflow: 'ellipsis',
                        marginBottom: '4px'
                      }}>
                        {song.title}
                      </div>
                      <div style={{ 
                        fontSize: '12px', 
                        color: '#b3b3b3', 
                        whiteSpace: 'nowrap', 
                        overflow: 'hidden', 
                        textOverflow: 'ellipsis' 
                      }}>
                        {song.artist || 'Nghệ sĩ'}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Các section khác (Đã thích, Nghe gần đây) */}
          {sections.filter((s, idx) => idx > 0 && s.items.length > 0).map((section, idx) => (
            <div key={idx} style={{ marginBottom: '32px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#fff' }}>{section.title}</h2>
                <button 
                  onClick={() => playTrack(section.items[0], section.items)}
                  style={{ 
                    backgroundColor: '#1DB954', 
                    color: 'black', 
                    border: 'none', 
                    borderRadius: '50%', 
                    width: '40px', 
                    height: '40px', 
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'transform 0.1s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                  <Play size={18} fill="black" />
                </button>
              </div>
              
              <div style={{ display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '16px' }} className="spotify-scroll">
                {section.items.map((song) => {
                  const isCurrent = currentTrack?.id === song.id;
                  return (
                    <div
                      key={song.id}
                      onClick={() => playTrack(song, section.items)}
                      style={{
                        backgroundColor: '#181818',
                        borderRadius: '8px',
                        padding: '16px',
                        cursor: 'pointer',
                        transition: 'background-color 0.2s ease',
                        position: 'relative',
                        minWidth: '180px',
                        maxWidth: '180px',
                        flexShrink: 0,
                      }}
                      onMouseEnter={(e) => { 
                        e.currentTarget.style.backgroundColor = '#282828';
                        const btn = e.currentTarget.querySelector('.play-btn');
                        if (btn) btn.setAttribute('style', 'opacity:1 !important; transform: translateY(0) !important');
                      }}
                      onMouseLeave={(e) => { 
                        e.currentTarget.style.backgroundColor = '#181818';
                        const btn = e.currentTarget.querySelector('.play-btn');
                        if (btn) btn.setAttribute('style', 'opacity:0; transform: translateY(8px)');
                      }}
                    >
                      <div style={{ position: 'relative', marginBottom: '12px' }}>
                        <img 
                          src={song.thumbnailUrl} 
                          style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover', borderRadius: '4px', boxShadow: '0 8px 24px rgba(0,0,0,0.5)' }} 
                          alt={song.title}
                        />
                        <button
                          className="play-btn"
                          onClick={(e) => { e.stopPropagation(); playTrack(song, section.items); }}
                          style={{
                            position: 'absolute', right: '8px', bottom: '8px', width: '48px', height: '48px',
                            backgroundColor: '#1DB954', borderRadius: '50%', border: 'none', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            opacity: 0, transform: 'translateY(8px)', transition: 'all 0.3s ease',
                          }}
                        >
                          {isCurrent && isPlaying ? <Pause size={22} fill="black" color="black" /> : <Play size={22} fill="black" color="black" style={{ marginLeft: '2px' }} />}
                        </button>
                      </div>
                      <div style={{ fontSize: '14px', fontWeight: '600', color: isCurrent ? '#1DB954' : '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: '4px' }}>
                        {song.title}
                      </div>
                      <div style={{ fontSize: '12px', color: '#b3b3b3', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {song.artist || 'Nghệ sĩ'}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {sections.length === 0 && (
            <div style={{ textAlign: 'center', padding: '100px 32px', backgroundColor: '#181818', borderRadius: '8px' }}>
              <div style={{ width: '200px', height: '200px', backgroundColor: '#282828', borderRadius: '50%', margin: '0 auto 32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Music size={80} style={{ color: '#535353' }} />
              </div>
              <h2 style={{ fontSize: '32px', fontWeight: '700', color: '#fff', marginBottom: '8px' }}>Chào mừng đến với TuneVault</h2>
              <p style={{ color: '#b3b3b3', fontSize: '16px', marginBottom: '24px' }}>Hãy khám phá và thêm nhạc vào thư viện của bạn</p>
              <Link to="/app/import" style={{ display: 'inline-block', backgroundColor: '#1DB954', color: 'black', padding: '14px 32px', borderRadius: '24px', fontWeight: '700', fontSize: '16px', textDecoration: 'none' }}>
                Bắt đầu ngay
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
