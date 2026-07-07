import { useEffect, useState, MouseEvent, DragEvent } from 'react';
import api from '../axios';
import { Music, Play, Trash2, ListPlus, Heart, Pencil } from 'lucide-react';
import { useAudio } from '../Contexts/AudioContext';
import EditSongModal from '../components/EditSongModal';

interface MediaItem {
  id: string;
  title: string;
  artist: string;
  artistName?: string;
  url: string;
  thumbnailUrl: string;
  durationInSeconds?: number;
  isLiked?: boolean;
  isOwner?: boolean;
  canDelete?: boolean;
  genre?: string;
}

const Library = () => {
  const [mySongs, setMySongs] = useState<MediaItem[]>([]);
  const [menuConfig, setMenuConfig] = useState<{ x: number, y: number, song: MediaItem } | null>(null);
  const { playTrack, currentTrack } = useAudio();
  const [hearts, setHearts] = useState<{ id: number; x: number; y: number; color: string }[]>([]);
  const [editingSong, setEditingSong] = useState<MediaItem | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // Check if user is admin (from API)
  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const res = await api.get('/user/my-role');
        console.log('Role check:', res.data);
        setIsAdmin(res.data.role === 'Admin');
        // Also update localStorage
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const user = JSON.parse(userStr);
          user.role = res.data.role;
          localStorage.setItem('user', JSON.stringify(user));
        }
      } catch (e) {
        console.error('Role check failed:', e);
        setIsAdmin(false);
      }
    };
    checkAdmin();
  }, []);

  // Debug: show current status
  console.log('isAdmin:', isAdmin);

  const formatTime = (seconds?: number) => {
    if (!seconds || isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const [draggedItemIndex, setDraggedItemIndex] = useState<number | null>(null);
  const token = localStorage.getItem('token');

  const fetchSongs = () => {
    api.get('/media/library?pageSize=1000').then(res => setMySongs(res.data?.items || []));
  };

  useEffect(() => {
    fetchSongs();
  }, [token]);

  useEffect(() => {
    const handler = () => fetchSongs();
    window.addEventListener('favoritesUpdated', handler as EventListener);
    return () => window.removeEventListener('favoritesUpdated', handler as EventListener);
  }, []);

  const handleContextMenu = (e: MouseEvent, song: MediaItem) => {
    e.preventDefault();
    setMenuConfig({ x: e.clientX, y: e.clientY, song });
  };

  useEffect(() => {
    const closeMenu = () => setMenuConfig(null);
    window.addEventListener('click', closeMenu);
    return () => window.removeEventListener('click', closeMenu);
  }, []);

  const handleDelete = async (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      try {
        await api.delete(`/media/${id}`);
        fetchSongs();
      } catch (error: any) {
        console.error("Failed to delete song", error);
        alert(error.response?.data?.message || "Cannot delete song.");
      }
    }
  };

  const handleToggleLike = async (e: React.MouseEvent, song: MediaItem) => {
    e.stopPropagation();
    try {
      const randomColors = ['#FF0000', '#FF1493', '#FF4500', '#FFD700', '#FF6B6B', '#E91E63'];
      const randomColor = randomColors[Math.floor(Math.random() * randomColors.length)];
      const newHeart = { id: Date.now(), x: e.clientX, y: e.clientY, color: randomColor };
      setHearts(prev => [...prev, newHeart]);
      setTimeout(() => { setHearts(prev => prev.filter(h => h.id !== newHeart.id)); }, 1000);
      const res = await api.post(`/favorites/toggle/${song.id}`);
      setMySongs(prev => prev.map(s => s.id === song.id ? { ...s, isLiked: res.data.isLiked } : s));
    } catch (error) {
      console.error("Failed to toggle favorite", error);
    }
  };

  const handleDragStart = (e: DragEvent<HTMLDivElement>, index: number) => {
    setDraggedItemIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault();
    if (draggedItemIndex === null || draggedItemIndex === index) return;
    e.currentTarget.style.borderTop = '2px solid #1DB954';
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.currentTarget.style.borderTop = '';
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>, dropIndex: number) => {
    e.preventDefault();
    if (draggedItemIndex === null || draggedItemIndex === dropIndex) {
      setDraggedItemIndex(null);
      return;
    }
    const newSongs = [...mySongs];
    const [draggedItem] = newSongs.splice(draggedItemIndex, 1);
    newSongs.splice(dropIndex, 0, draggedItem);
    setMySongs(newSongs);
    setDraggedItemIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedItemIndex(null);
  };

  return (
    <div className="min-h-screen pb-32">
      <style>{`
        @keyframes float-heart-lib {
          0% { transform: translate(-50%, -50%) scale(0.5); opacity: 1; }
          25% { transform: translate(calc(-50% - 20px), calc(-50% - 50px)) scale(1); opacity: 0.8; }
          50% { transform: translate(calc(-50% + 20px), calc(-50% - 100px)) scale(1.5); opacity: 0.6; }
          75% { transform: translate(calc(-50% - 10px), calc(-50% - 150px)) scale(1.8); opacity: 0.3; }
          100% { transform: translate(-50%, calc(-50% - 200px)) scale(2); opacity: 0; }
        }
        .floating-heart { position: fixed; pointer-events: none; z-index: 9999; animation: float-heart-lib 1s ease-out forwards; }
        .neon-row { display: grid; grid-template-columns: 40px 5fr 3fr 100px; gap: 16px; padding: 8px 16px; border-radius: 8px; cursor: pointer; align-items: center; transition: all 0.3s ease; }
        .neon-row:hover { background-color: #2a2a4e; box-shadow: 0 0 15px rgba(0, 255, 136, 0.3); }
        .neon-row:hover .hover-opacity { opacity: 1; }
        .neon-row:hover .hide-on-hover { opacity: 0; }
        .hover-opacity { opacity: 0; transition: opacity 0.2s; }
        .hide-on-hover { transition: opacity 0.2s; }
      `}</style>

      {/* DEBUG: Show role status */}
      <div style={{ 
        padding: '12px 24px', 
        backgroundColor: isAdmin ? 'rgba(0, 255, 136, 0.2)' : 'rgba(255, 77, 77, 0.2)',
        borderBottom: `1px solid ${isAdmin ? '#00FF88' : '#ff4d4d'}`,
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        <span style={{ color: isAdmin ? '#00FF88' : '#ff4d4d', fontWeight: 'bold' }}>
          {isAdmin ? '✅ BẠN LÀ ADMIN' : '❌ BẠN KHÔNG PHẢI ADMIN'}
        </span>
        <span style={{ color: '#888' }}>|</span>
        <a 
          href="/app/admin" 
          style={{ color: '#00FFFF', textDecoration: 'underline', fontSize: '14px' }}
        >
          {isAdmin ? 'Chỉnh sửa bài hát' : 'Nhấn vào đây để trở thành Admin'}
        </a>
      </div>

      {/* Header - Neon Purple/Pink */}
      <div style={{ padding: '24px 32px', background: 'linear-gradient(180deg, #8800FF 0%, #1a1a2e 100%)', borderBottom: '1px solid rgba(136, 0, 255, 0.3)', boxShadow: '0 0 30px rgba(136, 0, 255, 0.3)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '24px' }}>
          <div style={{ width: '192px', height: '192px', background: 'linear-gradient(135deg, #8800FF, #FF0088)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 30px rgba(136, 0, 255, 0.8), 0 0 60px rgba(255, 0, 136, 0.5)' }}>
            <Music size={80} style={{ color: 'white', filter: 'drop-shadow(0 0 10px rgba(255,255,255,0.5))' }} />
          </div>
          <div style={{ paddingBottom: '16px' }}>
            <p style={{ fontSize: '12px', fontWeight: '700', color: '#00FFFF', textTransform: 'uppercase', margin: 0, textShadow: '0 0 10px rgba(0, 255, 255, 0.5)' }}>Playlist</p>
            <h1 style={{ fontSize: '72px', fontWeight: '900', color: '#fff', margin: '8px 0', lineHeight: 1, textShadow: '0 0 20px rgba(136, 0, 255, 0.8), 0 0 40px rgba(255, 0, 136, 0.6)' }}>Library</h1>
            <p style={{ fontSize: '16px', color: '#b3b3b3', margin: 0 }}>{mySongs.length} songs</p>
          </div>
        </div>
      </div>

      {/* Top Tracks Section */}
      {mySongs.length >= 4 && (
        <div style={{ padding: '24px 32px 8px' }}>
          <h2 style={{
            fontSize: '24px',
            fontWeight: 'bold',
            marginBottom: '20px',
            color: '#fff',
            textShadow: '0 0 20px rgba(131, 58, 180, 0.6)'
          }}>
            ⭐ Top Tracks
          </h2>
          <div style={{
            display: 'flex',
            gap: '16px',
            overflowX: 'auto',
            paddingBottom: '24px',
            scrollSnapType: 'x mandatory'
          }}>
            <style>{`
              .top-track-card { min-width: 160px; max-width: 160px; scroll-snap-align: start; }
              .top-track-card:hover .play-overlay { opacity: 1 !important; transform: translateY(0) scale(1) !important; }
            `}</style>
            {mySongs.slice(0, 8).map((song, index) => {
              const isCurrent = currentTrack?.id === song.id;
              const rankColors = ['#FFD700', '#C0C0C0', '#CD7F32'];
              const rankColor = rankColors[index] || null;
              return (
                <div
                  key={song.id}
                  onClick={() => playTrack(song, mySongs)}
                  className="top-track-card"
                  style={{
                    background: isCurrent
                      ? 'linear-gradient(145deg, rgba(30, 215, 96, 0.2), rgba(131, 58, 180, 0.2))'
                      : 'linear-gradient(145deg, #1e1e2e, #252540)',
                    padding: '12px',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    border: isCurrent ? '1px solid rgba(30, 215, 96, 0.5)' : '1px solid rgba(131, 58, 180, 0.2)',
                    boxShadow: isCurrent ? '0 0 20px rgba(30, 215, 96, 0.3)' : '0 4px 15px rgba(0,0,0,0.3)',
                    position: 'relative'
                  }}
                  onMouseEnter={(e) => {
                    if (!isCurrent) {
                      e.currentTarget.style.transform = 'translateY(-8px)';
                      e.currentTarget.style.borderColor = 'rgba(131, 58, 180, 0.6)';
                      e.currentTarget.style.boxShadow = '0 15px 30px rgba(131, 58, 180, 0.3)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isCurrent) {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.borderColor = 'rgba(131, 58, 180, 0.2)';
                      e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.3)';
                    }
                  }}
                >
                  {/* Rank Badge */}
                  <div style={{
                    position: 'absolute',
                    top: '6px',
                    left: '6px',
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    background: rankColor 
                      ? `linear-gradient(135deg, ${rankColor}, ${rankColor}dd)` 
                      : 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    fontSize: '10px',
                    color: rankColor ? '#000' : '#fff',
                    zIndex: 2,
                    boxShadow: rankColor ? '0 2px 6px rgba(0,0,0,0.4)' : 'none'
                  }}>
                    {index + 1}
                  </div>
                  
                  {/* Thumbnail */}
                  <div style={{ position: 'relative', marginBottom: '10px' }}>
                    {song.thumbnailUrl ? (
                      <img 
                        src={song.thumbnailUrl} 
                        alt={song.title}
                        style={{
                          width: '100%',
                          aspectRatio: '1',
                          objectFit: 'cover',
                          borderRadius: '8px'
                        }}
                      />
                    ) : (
                      <div style={{
                        width: '100%',
                        aspectRatio: '1',
                        background: 'linear-gradient(135deg, #833ab4, #fd1d1d)',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <Music size={40} style={{ color: '#fff' }} />
                      </div>
                    )}
                    {/* Play Button Overlay */}
                    <div 
                      className="play-overlay"
                      style={{
                        position: 'absolute',
                        bottom: '8px',
                        right: '8px',
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #1ed760, #00d4aa)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        opacity: 0,
                        transform: 'translateY(8px) scale(0.9)',
                        transition: 'all 0.3s ease',
                        boxShadow: '0 4px 15px rgba(30, 215, 96, 0.5)'
                      }}
                    >
                      <Play size={20} fill="black" color="black" style={{ marginLeft: '2px' }} />
                    </div>
                  </div>
                  
                  {/* Info */}
                  <h4 style={{
                    fontSize: '13px',
                    fontWeight: '600',
                    color: '#fff',
                    margin: '0 0 4px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {song.title}
                  </h4>
                  <p style={{
                    fontSize: '11px',
                    color: '#b3b3b3',
                    margin: 0,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {song.artist || 'Unknown'}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {mySongs.length > 0 && (
        <div style={{ padding: '8px 32px' }}>
          <button style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'linear-gradient(135deg, #00FF00, #FFFF00)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s ease', boxShadow: '0 0 20px rgba(0, 255, 0, 0.6), 0 0 40px rgba(255, 255, 0, 0.4)' }} className="hover:scale-105" onClick={() => playTrack(mySongs[0], mySongs)} onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = 'scale(1.1)'; }} onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)'; }}>
            <Play size={24} fill="black" color="black" style={{ marginLeft: '4px' }} />
          </button>
        </div>
      )}

      <div style={{ padding: '16px 32px 8px', borderBottom: '1px solid rgba(0, 255, 136, 0.2)' }}>
        <div className="neon-row" style={{ cursor: 'default' }}>
          <span style={{ color: '#00FFFF', fontSize: '14px', textShadow: '0 0 5px rgba(0, 255, 255, 0.5)' }}>#</span>
          <span style={{ color: '#00FFFF', fontSize: '14px', textShadow: '0 0 5px rgba(0, 255, 255, 0.5)' }}>Title</span>
          <span style={{ color: '#00FFFF', fontSize: '14px', textShadow: '0 0 5px rgba(0, 255, 255, 0.5)' }}>Album</span>
          <span style={{ color: '#00FFFF', fontSize: '14px', textAlign: 'right', textShadow: '0 0 5px rgba(0, 255, 255, 0.5)' }}>⏱</span>
        </div>
      </div>

      <div style={{ padding: '0 16px' }}>
        {mySongs.length > 0 ? mySongs.map((song, index) => {
          const isCurrent = currentTrack?.id === song.id;
          return (
            <div key={song.id} onClick={() => playTrack(song, mySongs)} onContextMenu={(e) => handleContextMenu(e, song)} draggable onDragStart={(e) => handleDragStart(e, index)} onDragOver={(e) => handleDragOver(e, index)} onDragLeave={handleDragLeave} onDrop={(e) => handleDrop(e, index)} onDragEnd={handleDragEnd} className="neon-row" style={{ backgroundColor: 'transparent' }}>
              <div style={{ color: '#b3b3b3', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                <span className="hide-on-hover" style={{ color: isCurrent ? '#FF00FF' : '#b3b3b3', textShadow: isCurrent ? '0 0 10px rgba(255, 0, 255, 0.8)' : 'none' }}>{index + 1}</span>
                <button className="hover-opacity" style={{ position: 'absolute', background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', padding: 0 }}>
                  <Play size={16} fill="currentColor" />
                </button>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <img src={song.thumbnailUrl} style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '8px', boxShadow: '0 0 10px rgba(0, 255, 136, 0.3)' }} alt="" />
                <div style={{ fontSize: '16px', fontWeight: '500', color: isCurrent ? '#FF00FF' : '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '300px', textShadow: isCurrent ? '0 0 10px rgba(255, 0, 255, 0.5)' : 'none' }}>{song.title}</div>
              </div>
              <div style={{ color: '#b3b3b3', fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{song.artist || 'Unknown Artist'}</div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                <button onClick={(e) => handleToggleLike(e, song)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', color: song.isLiked ? '#FF00FF' : '#b3b3b3', filter: song.isLiked ? 'drop-shadow(0 0 5px rgba(255, 0, 255, 0.8))' : 'none' }} onMouseEnter={(e) => { if (!song.isLiked) e.currentTarget.style.color = '#fff'; }} onMouseLeave={(e) => { if (!song.isLiked) e.currentTarget.style.color = '#b3b3b3'; }}>
                  <Heart size={18} fill={song.isLiked ? "currentColor" : "none"} />
                </button>
                <span style={{ color: '#00FF00', fontSize: '14px', minWidth: '40px', textAlign: 'right', textShadow: '0 0 5px rgba(0, 255, 0, 0.5)' }}>{formatTime(song.durationInSeconds)}</span>
                {isAdmin && (
                  <button onClick={(e) => { e.stopPropagation(); setEditingSong(song); }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', color: '#00FFFF' }} onMouseEnter={(e) => e.currentTarget.style.color = '#00FF88'} onMouseLeave={(e) => e.currentTarget.style.color = '#00FFFF'}>
                    <Pencil size={16} style={{ filter: 'drop-shadow(0 0 5px rgba(0, 255, 255, 0.5))' }} />
                  </button>
                )}
                <button onClick={(e) => { e.stopPropagation(); handleDelete(song.id, song.title); }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', color: '#b3b3b3' }} onMouseEnter={(e) => e.currentTarget.style.color = '#ff4d4d'} onMouseLeave={(e) => e.currentTarget.style.color = '#b3b3b3'}>
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          );
        }) : (
          <div style={{ textAlign: 'center', padding: '80px 32px', backgroundColor: '#1a1a2e', borderRadius: '12px', margin: '20px', boxShadow: '0 0 30px rgba(136, 0, 255, 0.3)' }}>
            <div style={{ width: '200px', height: '200px', background: 'linear-gradient(135deg, #8800FF, #FF0088)', borderRadius: '50%', margin: '0 auto 32px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 30px rgba(136, 0, 255, 0.6)' }}>
              <Music size={80} style={{ color: 'white', filter: 'drop-shadow(0 0 10px rgba(255,255,255,0.5))' }} />
            </div>
            <p style={{ color: '#fff', fontSize: '32px', fontWeight: '700', margin: '0 0 8px', textShadow: '0 0 20px rgba(136, 0, 255, 0.5)' }}>Your library is empty</p>
            <p style={{ color: '#b3b3b3', fontSize: '16px', margin: '0 0 24px' }}>Add music to build your collection</p>
            <button onClick={() => window.location.href = '/app/import'} style={{ background: 'linear-gradient(135deg, #00FF00, #FFFF00)', color: 'black', border: 'none', padding: '14px 32px', borderRadius: '24px', fontWeight: '700', fontSize: '14px', cursor: 'pointer', boxShadow: '0 0 20px rgba(0, 255, 0, 0.5)' }}>Upload Music</button>
          </div>
        )}
      </div>

      {menuConfig && (
        <div style={{ position: 'fixed', backgroundColor: '#1a1a2e', border: '1px solid rgba(255, 0, 255, 0.5)', borderRadius: '8px', padding: '8px 0', zIndex: 100, minWidth: '200px', left: menuConfig.x, top: menuConfig.y, boxShadow: '0 0 20px rgba(255, 0, 255, 0.5), 0 0 40px rgba(0, 255, 136, 0.3)' }}>
          <button onClick={() => { console.log("Add to queue:", menuConfig.song.title); }} style={{ width: '100%', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px', color: '#fff', backgroundColor: 'transparent', border: 'none', cursor: 'pointer', fontSize: '14px', textAlign: 'left' }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#2a2a4e'; e.currentTarget.style.boxShadow = '0 0 10px rgba(0, 255, 136, 0.3)'; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.boxShadow = 'none'; }}>
            <ListPlus size={18} style={{ color: '#00FF00' }} /> Add to queue
          </button>
          <div style={{ height: '1px', backgroundColor: 'rgba(255, 0, 255, 0.3)', margin: '4px 0' }}></div>
          <button onClick={() => handleDelete(menuConfig.song.id, menuConfig.song.title)} style={{ width: '100%', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px', color: '#ff4d4d', backgroundColor: 'transparent', border: 'none', cursor: 'pointer', fontSize: '14px', textAlign: 'left' }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#2a2a4e'; e.currentTarget.style.boxShadow = '0 0 10px rgba(255, 0, 136, 0.3)'; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.boxShadow = 'none'; }}>
            <Trash2 size={18} /> Remove from library
          </button>
        </div>
      )}

      {hearts.map(h => (<Heart key={h.id} className="floating-heart" style={{ left: h.x, top: h.y, color: h.color }} size={24} fill="currentColor" />))}

      {editingSong && (
        <EditSongModal
          song={editingSong}
          onClose={() => setEditingSong(null)}
          onSave={(updatedSong) => {
            setMySongs(prev => prev.map(s => s.id === updatedSong.id ? updatedSong : s));
          }}
        />
      )}
    </div>
  );
};

export default Library;
