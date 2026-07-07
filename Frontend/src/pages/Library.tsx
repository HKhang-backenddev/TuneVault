import { useEffect, useState, MouseEvent, DragEvent } from 'react';
import api from '../axios';
import { Music, Play, Trash2, ListPlus, Heart } from 'lucide-react';
import { useAudio } from '../Contexts/AudioContext';

interface MediaItem {
  id: string;
  title: string;
  artist: string;
  url: string;
  thumbnailUrl: string;
  durationInSeconds?: number;
  isLiked?: boolean;
}

const Library = () => {
  const [mySongs, setMySongs] = useState<MediaItem[]>([]);
  const [menuConfig, setMenuConfig] = useState<{ x: number, y: number, song: MediaItem } | null>(null);
  const { playTrack, currentTrack } = useAudio();
  const [hearts, setHearts] = useState<{ id: number; x: number; y: number; color: string }[]>([]);

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
    if (window.confirm(`Bạn có chắc chắn muốn xóa bài hát "${title}"?`)) {
      try {
        await api.delete(`/media/${id}`);
        fetchSongs();
      } catch (error: any) {
        console.error("Failed to delete song", error);
        alert(error.response?.data?.message || "Không thể xóa bài hát.");
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
        .spotify-row { display: grid; grid-template-columns: 40px 5fr 3fr 100px; gap: 16px; padding: 8px 16px; border-radius: 4px; cursor: pointer; align-items: center; transition: background-color 0.2s ease; }
        .spotify-row:hover { background-color: #282828; }
        .spotify-row:hover .hover-opacity { opacity: 1; }
        .spotify-row:hover .hide-on-hover { opacity: 0; }
        .hover-opacity { opacity: 0; transition: opacity 0.2s; }
        .hide-on-hover { transition: opacity 0.2s; }
      `}</style>

      <div style={{ padding: '24px 32px', background: 'linear-gradient(180deg, #2a2a2a 0%, #121212 100%)', borderBottom: '1px solid #282828' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '24px' }}>
          <div style={{ width: '192px', height: '192px', backgroundColor: '#282828', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 60px rgba(0,0,0,0.5)' }}>
            <Music size={80} style={{ color: '#b3b3b3' }} />
          </div>
          <div style={{ paddingBottom: '16px' }}>
            <p style={{ fontSize: '14px', fontWeight: '500', color: '#fff', margin: 0 }}>Playlist</p>
            <h1 style={{ fontSize: '72px', fontWeight: '900', color: '#fff', margin: '8px 0', lineHeight: 1 }}>Thư viện</h1>
            <p style={{ fontSize: '16px', color: '#b3b3b3', margin: 0 }}>{mySongs.length} bài hát</p>
          </div>
        </div>
      </div>

      {mySongs.length > 0 && (
        <div style={{ padding: '24px 32px 8px' }}>
          <button style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: '#1DB954', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'transform 0.1s ease' }} className="hover:scale-105" onClick={() => playTrack(mySongs[0], mySongs)}>
            <Play size={24} fill="black" color="black" style={{ marginLeft: '4px' }} />
          </button>
        </div>
      )}

      <div style={{ padding: '16px 32px 8px', borderBottom: '1px solid #282828' }}>
        <div className="spotify-row" style={{ cursor: 'default' }}>
          <span style={{ color: '#b3b3b3', fontSize: '14px' }}>#</span>
          <span style={{ color: '#b3b3b3', fontSize: '14px' }}>Tiêu đề</span>
          <span style={{ color: '#b3b3b3', fontSize: '14px' }}>Album</span>
          <span style={{ color: '#b3b3b3', fontSize: '14px', textAlign: 'right' }}>⏱</span>
        </div>
      </div>

      <div style={{ padding: '0 16px' }}>
        {mySongs.length > 0 ? mySongs.map((song, index) => {
          const isCurrent = currentTrack?.id === song.id;
          return (
            <div key={song.id} onClick={() => playTrack(song, mySongs)} onContextMenu={(e) => handleContextMenu(e, song)} draggable onDragStart={(e) => handleDragStart(e, index)} onDragOver={(e) => handleDragOver(e, index)} onDragLeave={handleDragLeave} onDrop={(e) => handleDrop(e, index)} onDragEnd={handleDragEnd} className="spotify-row" style={{ backgroundColor: 'transparent' }}>
              <div style={{ color: '#b3b3b3', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                <span className="hide-on-hover" style={{ color: isCurrent ? '#1DB954' : '#b3b3b3' }}>{index + 1}</span>
                <button className="hover-opacity" style={{ position: 'absolute', background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', padding: 0 }} onClick={(e) => { e.stopPropagation(); playTrack(song, mySongs); }}>
                  <Play size={16} fill="currentColor" />
                </button>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <img src={song.thumbnailUrl} style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '4px' }} alt="" />
                <div style={{ fontSize: '16px', fontWeight: '500', color: isCurrent ? '#1DB954' : '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '300px' }}>{song.title}</div>
              </div>
              <div style={{ color: '#b3b3b3', fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{song.artist || 'Nghệ sĩ không xác định'}</div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                <button onClick={(e) => handleToggleLike(e, song)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', color: song.isLiked ? '#1DB954' : '#b3b3b3' }} onMouseEnter={(e) => { if (!song.isLiked) e.currentTarget.style.color = '#fff'; }} onMouseLeave={(e) => { if (!song.isLiked) e.currentTarget.style.color = '#b3b3b3'; }}>
                  <Heart size={18} fill={song.isLiked ? "currentColor" : "none"} />
                </button>
                <span style={{ color: '#b3b3b3', fontSize: '14px', minWidth: '40px', textAlign: 'right' }}>{formatTime(song.durationInSeconds)}</span>
                <button onClick={(e) => { e.stopPropagation(); handleDelete(song.id, song.title); }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', color: '#b3b3b3' }} onMouseEnter={(e) => e.currentTarget.style.color = '#ef4444'} onMouseLeave={(e) => e.currentTarget.style.color = '#b3b3b3'}>
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          );
        }) : (
          <div style={{ textAlign: 'center', padding: '80px 32px' }}>
            <div style={{ width: '200px', height: '200px', backgroundColor: '#282828', borderRadius: '50%', margin: '0 auto 32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Music size={80} style={{ color: '#535353' }} />
            </div>
            <p style={{ color: '#fff', fontSize: '32px', fontWeight: '700', margin: '0 0 8px' }}>Thư viện của bạn đang trống</p>
            <p style={{ color: '#b3b3b3', fontSize: '16px', margin: '0 0 24px' }}>Hãy thêm nhạc để xây dựng bộ sưu tập của bạn</p>
            <button onClick={() => window.location.href = '/import'} style={{ backgroundColor: '#1DB954', color: 'black', border: 'none', padding: '14px 32px', borderRadius: '24px', fontWeight: '700', fontSize: '14px', cursor: 'pointer' }}>Tải nhạc ngay</button>
          </div>
        )}
      </div>

      {menuConfig && (
        <div style={{ position: 'fixed', backgroundColor: '#282828', border: '1px solid #404040', borderRadius: '4px', padding: '4px 0', zIndex: 100, minWidth: '180px', left: menuConfig.x, top: menuConfig.y, boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }}>
          <button onClick={() => { console.log("Thêm vào hàng chờ:", menuConfig.song.title); }} style={{ width: '100%', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px', color: '#fff', backgroundColor: 'transparent', border: 'none', cursor: 'pointer', fontSize: '14px', textAlign: 'left' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#3e3e3e'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
            <ListPlus size={18} /> Thêm vào hàng chờ
          </button>
          <div style={{ height: '1px', backgroundColor: '#404040', margin: '4px 0' }}></div>
          <button onClick={() => handleDelete(menuConfig.song.id, menuConfig.song.title)} style={{ width: '100%', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px', color: '#ff4d4d', backgroundColor: 'transparent', border: 'none', cursor: 'pointer', fontSize: '14px', textAlign: 'left' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#3e3e3e'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
            <Trash2 size={18} /> Xóa khỏi thư viện
          </button>
        </div>
      )}

      {hearts.map(h => (<Heart key={h.id} className="floating-heart" style={{ left: h.x, top: h.y, color: h.color }} size={24} fill="currentColor" />))}
    </div>
  );
};

export default Library;
