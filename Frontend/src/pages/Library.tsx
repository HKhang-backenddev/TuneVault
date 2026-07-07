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

  // Check if user is admin
  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setIsAdmin(user.role === 'Admin');
      } catch (e) {
        setIsAdmin(false);
      }
    }
  }, []);

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

      {mySongs.length > 0 && (
        <div style={{ padding: '24px 32px 8px' }}>
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
