import { useEffect, useState, MouseEvent, DragEvent } from 'react'; // Import DragEvent
import api from '../axios';
import { Music, Play, Pause, Trash2, ListPlus, Heart, Clock } from 'lucide-react'; // Import Pause
import { useAudio } from '../Contexts/AudioContext';

// Define a more specific type for MediaItem to match the backend and AudioContext
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
  const [mySongs, setMySongs] = useState<MediaItem[]>([]); // Use MediaItem type
  const [menuConfig, setMenuConfig] = useState<{ x: number, y: number, song: MediaItem } | null>(null); // Use MediaItem type
  const { playTrack, currentTrack, isPlaying } = useAudio();
  const [hearts, setHearts] = useState<{ id: number; x: number; y: number; color: string }[]>([]);

  const formatTime = (seconds?: number) => {
    if (!seconds || isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // State to manage drag and drop
  const [draggedItemIndex, setDraggedItemIndex] = useState<number | null>(null);

  const token = localStorage.getItem('token'); // Lấy token để theo dõi thay đổi người dùng

  const fetchSongs = () => {
    // Yêu cầu nhiều kết quả hơn để hiển thị toàn bộ thư viện (mặc định backend phân trang)
    api.get('/media?pageSize=1000').then(res => setMySongs(res.data?.items || []));
  };

  useEffect(() => {
    fetchSongs();
  }, [token]); // Tải lại danh sách bài hát khi token thay đổi (đăng nhập/đăng xuất)

  // Lắng nghe sự kiện khi danh sách favorites thay đổi (ví dụ thả tim ở Home)
  useEffect(() => {
    const handler = () => fetchSongs();
    window.addEventListener('favoritesUpdated', handler as EventListener);
    return () => window.removeEventListener('favoritesUpdated', handler as EventListener);
  }, []);

  const handleContextMenu = (e: MouseEvent, song: MediaItem) => { // Use MediaItem type
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
      } catch (error) {
        console.error("Failed to delete song", error);
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
      
      setTimeout(() => {
        setHearts(prev => prev.filter(h => h.id !== newHeart.id));
      }, 1000);

      const res = await api.post(`/favorites/toggle/${song.id}`);
      setMySongs(prev => prev.map(s => 
        s.id === song.id ? { ...s, isLiked: res.data.isLiked } : s
      ));
    } catch (error) {
      console.error("Failed to toggle favorite", error);
    }
  };

  // --- Drag and Drop Handlers ---
  const handleDragStart = (e: DragEvent<HTMLDivElement>, index: number) => {
    setDraggedItemIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    // For visual feedback, you might want to set a drag image
    // e.dataTransfer.setDragImage(e.currentTarget, 0, 0);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault(); // Necessary to allow dropping
    if (draggedItemIndex === null || draggedItemIndex === index) return;

    // Optional: Add visual feedback for the drop target
    e.currentTarget.style.borderTop = '2px solid #FF0000'; // Red border on top
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    // Optional: Remove visual feedback
    e.currentTarget.style.borderTop = '';
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>, dropIndex: number) => {
    e.preventDefault();
    // e.currentTarget.style.borderTop = ''; // Remove visual feedback

    if (draggedItemIndex === null || draggedItemIndex === dropIndex) {
      setDraggedItemIndex(null);
      return;
    }

    const newSongs = [...mySongs];
    const [draggedItem] = newSongs.splice(draggedItemIndex, 1);
    newSongs.splice(dropIndex, 0, draggedItem);

    setMySongs(newSongs);
    setDraggedItemIndex(null);

    // TODO: Implement API call to persist the new order on the backend
    // This would require a new endpoint on the backend to accept an ordered list of song IDs.
    console.log("New song order:", newSongs.map(s => s.id));
  };

  const handleDragEnd = () => {
    setDraggedItemIndex(null);
  };

  return (
    <div className="min-h-screen pb-32 flex justify-center">
      <style>{` /* Renamed animation to avoid potential conflicts */
        @keyframes wave-library {
          0%, 100% { height: 4px; }
          50% { height: 12px; }
        }
        .visualizer-bar {
          width: 2px;
          background-color: #3b82f6;
          border-radius: 1px;
          transition: height 0.2s ease;
          box-shadow: 0 0 5px #3b82f6;
        }
        .animate-wave-1 { animation: wave-library 0.6s ease-in-out infinite; }
        .animate-wave-2 { animation: wave-library 0.8s ease-in-out infinite 0.1s; }
        .animate-wave-3 { animation: wave-library 0.7s ease-in-out infinite 0.2s; }
        .dragging {
          opacity: 0.5;
          border: 1px dashed #FF0000 !important;
          background-color: rgba(255, 0, 0, 0.1) !important;
        }
        .song-item-neon {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
        }
        @keyframes float-heart-lib { /* Đổi tên animation để tránh xung đột */
          0% { transform: translate(-50%, -50%) scale(0.5); opacity: 1; }
          25% { transform: translate(calc(-50% - 20px), calc(-50% - 50px)) scale(1); opacity: 0.8; }
          50% { transform: translate(calc(-50% + 20px), calc(-50% - 100px)) scale(1.5); opacity: 0.6; }
          75% { transform: translate(calc(-50% - 10px), calc(-50% - 150px)) scale(1.8); opacity: 0.3; }
          100% { transform: translate(-50%, calc(-50% - 200px)) scale(2); opacity: 0; }
        }
        .floating-heart {
          position: fixed;
          pointer-events: none;
          z-index: 9999;
          animation: float-heart-lib 1s ease-out forwards;
        }
        .custom-scrollbar::-webkit-scrollbar { width: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 8px; }
        .custom-scrollbar { scrollbar-width: thin; scrollbar-color: rgba(255,255,255,0.08) transparent; }
        /* Keyframes cho viền chuyển động */
        @keyframes animated-border-library {
          0% { background-position: 0% center; }
          100% { background-position: 200% center; }
        }
      `}</style>

      {/* Main Content Card - Đồng bộ với LikedSongs và DownloadHistory */}
      <div style={{
        width: '100%',
        maxWidth: '900px',
        margin: '24px auto',
        backgroundColor: 'rgba(0,0,0,0.5)',
        border: '2px solid transparent',
        borderRadius: '24px',
        backgroundImage: 'linear-gradient(rgba(0,0,0,0.8), rgba(0,0,0,0.8)), linear-gradient(135deg, #c084fc, #3b82f6, #10b981, #c084fc)',
        backgroundOrigin: 'border-box',
        backgroundClip: 'padding-box, border-box',
        backgroundSize: '200% 100%',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.8), 0 0 40px rgba(59, 130, 246, 0.2)',
        animation: 'animated-border-library 8s linear infinite',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Hero Header */}
        <div style={{
          padding: '32px',
          paddingTop: '48px',
          display: 'flex',
          alignItems: 'flex-end',
          gap: '24px',
          background: 'linear-gradient(to bottom, rgba(30, 64, 175, 0.4) 0%, rgba(0, 0, 0, 0.5) 100%)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
        }}>
          <div style={{
            width: '160px',
            height: '160px',
            background: 'linear-gradient(to bottom right, #3b82f6, #1e40af)',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5), 0 0 20px rgba(59, 130, 246, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '16px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            position: 'relative',
            overflow: 'hidden',
          }}>
            <Music size={70} style={{ color: 'white', filter: 'drop-shadow(0 0 5px rgba(0,0,0,0.5))' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.2)', borderRadius: '16px' }}></div>
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.2em', color: '#FF6B6B', marginBottom: '8px' }}>
              Bộ sưu tập
            </p>
            <h1 style={{ fontSize: '48px', fontWeight: '900', letterSpacing: '-0.05em', color: 'white', marginBottom: '12px' }}>
              Thư viện của bạn
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 'bold', color: '#B0B0B0' }}>
              <div style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: 'white' }}>TV</div>
              <span>TuneVault User</span>
              <span style={{ color: '#555' }}>•</span>
              <span style={{ color: 'white' }}>{mySongs.length} bài hát</span>
            </div>
          </div>
        </div>

        {/* Actions Bar */}
        <div style={{
          padding: '24px 32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
        }}>
          <button
            onClick={() => mySongs.length > 0 && playTrack(mySongs[0], mySongs)}
            style={{
              width: '56px',
              height: '56px',
              backgroundColor: '#3b82f6',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 20px rgba(59, 130, 246, 0.6), inset 0 0 10px rgba(255, 255, 255, 0.2)',
              transition: 'all 0.3s ease',
              cursor: 'pointer',
              border: 'none',
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            <Play size={28} fill="white" style={{ color: 'white', marginLeft: '3px' }} />
          </button>

          <button 
            onClick={() => window.location.href = '/import'}
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              color: 'white',
              padding: '8px 20px',
              borderRadius: '24px',
              fontSize: '12px',
              fontWeight: '900',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#3b82f6'; e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.1)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'; }}
          >
            Nhập thêm nhạc
          </button>
        </div>

        {/* List Frame */}
        <div style={{ padding: '0 32px 32px' }}>
          <div style={{
            backgroundColor: 'rgba(24, 24, 24, 0.7)',
            borderRadius: '24px',
            padding: '16px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: 'inset 0 0 15px rgba(0,0,0,0.5)',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            marginTop: '24px',
            maxHeight: '60vh',
            overflowY: 'auto'
          }} className="custom-scrollbar">
            {/* Header Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '40px 5fr 3fr 1fr',
              gap: '16px',
              padding: '12px 24px',
              color: '#737373',
              fontSize: '10px',
              fontWeight: '900',
              textTransform: 'uppercase',
              letterSpacing: '0.2em',
              borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
              marginBottom: '8px',
            }}>
              <div style={{ textAlign: 'center' }}>#</div>
              <div>Tiêu đề</div>
              <div>Nghệ sĩ</div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', paddingRight: '8px' }}><Clock size={16} /></div>
            </div>

            {mySongs.length > 0 ? (
              mySongs.map((song: MediaItem, index: number) => {
                const isCurrent = currentTrack?.id === song.id;
                return (
                  <div 
                    key={song.id} 
                    onClick={() => playTrack(song, mySongs)}
                    onContextMenu={(e) => handleContextMenu(e, song)}
                    draggable="true"
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDrop={(e) => handleDrop(e, index)}
                    onDragLeave={handleDragLeave}
                    onDragEnd={handleDragEnd}
                    className={`song-item-neon ${draggedItemIndex === index ? 'dragging' : ''}`}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '40px 5fr 3fr 1fr',
                      gap: '16px',
                      padding: '8px 24px',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      alignItems: 'center',
                      transition: 'all 0.2s ease',
                      border: '1px solid transparent',
                      backgroundColor: isCurrent ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
                    }}
                    onMouseEnter={(e) => {
                      if (!isCurrent) {
                        e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.08)';
                        e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.2)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isCurrent) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.borderColor = 'transparent';
                      }
                    }}
                  >
                    <div style={{ color: '#737373', fontSize: '12px', fontFamily: 'monospace', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {isCurrent && isPlaying ? (
                        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '2px', height: '16px', width: '16px' }}>
                          <div className="visualizer-bar animate-wave-1" style={{ height: isPlaying ? undefined : '6px' }} />
                          <div className="visualizer-bar animate-wave-2" style={{ height: isPlaying ? undefined : '10px' }} />
                          <div className="visualizer-bar animate-wave-3" style={{ height: isPlaying ? undefined : '5px' }} />
                        </div>
                      ) : (
                        <span style={{ color: isCurrent ? '#3b82f6' : '#737373' }}>{(index + 1).toString().padStart(2, '0')}</span>
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <img src={song.thumbnailUrl} style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '8px', boxShadow: '0 4px 15px rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)' }} alt="" />
                      <div style={{ overflow: 'hidden' }}>
                        <div style={{ fontWeight: '600', fontSize: '15px', color: isCurrent ? '#60a5fa' : 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{song.title}</div>
                      </div>
                    </div>

                    <div style={{ color: '#B0B0B0', fontSize: '13px', fontWeight: '500', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'flex', alignItems: 'center' }}>
                      {song.artist || 'Nghệ sĩ không xác định'}
                    </div> 

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '12px', color: '#737373', fontSize: '12px', fontWeight: '900', letterSpacing: '0.05em', paddingRight: '4px' }}>
                      <button 
                        onClick={(e) => handleToggleLike(e, song)}
                        style={{
                          color: song.isLiked ? '#3b82f6' : '#737373',
                          opacity: song.isLiked ? 1 : 0,
                          transition: 'all 0.2s ease',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                        }}
                        onMouseEnter={(e) => { if (!song.isLiked) e.currentTarget.style.color = 'white'; e.currentTarget.style.opacity = '1'; }}
                        onMouseLeave={(e) => { if (!song.isLiked) e.currentTarget.style.color = '#737373'; e.currentTarget.style.opacity = '0'; }}
                      >
                        <Heart size={16} fill={song.isLiked ? "currentColor" : "none"} />
                      </button>
                      <span style={{ fontFamily: 'monospace' }}>{formatTime(song.durationInSeconds)}</span>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleDelete(song.id, song.title); }} 
                        style={{ background: 'none', border: 'none', color: '#737373', cursor: 'pointer', transition: 'color 0.2s', padding: '4px' }}
                        onMouseEnter={(e) => e.currentTarget.style.color = '#ef4444'}
                        onMouseLeave={(e) => e.currentTarget.style.color = '#737373'}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div style={{ textAlign: 'center', padding: '80px' }}>
                <Music size={64} style={{ color: '#262626', marginBottom: '24px' }} />
                <p style={{ color: '#737373', fontWeight: 'bold' }}>Thư viện của bạn đang trống.</p>
                <button onClick={() => window.location.href = '/import'} style={{ marginTop: '24px', backgroundColor: '#3b82f6', color: 'white', border: 'none', padding: '12px 32px', borderRadius: '24px', fontWeight: 'bold', cursor: 'pointer' }}>Tải nhạc ngay</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {menuConfig && (
        <div style={{
          position: 'fixed',
          backgroundColor: 'rgba(24, 24, 24, 0.85)',
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
          borderRadius: '8px',
          padding: '4px 0',
          zIndex: 100,
          minWidth: '200px',
          left: menuConfig.x,
          top: menuConfig.y,
          backdropFilter: 'blur(10px)',
        }}>
          <button 
            onClick={() => { console.log("Thêm vào hàng chờ:", menuConfig.song.title); }}
            style={{ width: '100%', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '12px', color: 'white', backgroundColor: 'transparent', border: 'none', cursor: 'pointer', fontSize: '14px' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <ListPlus size={16} /> Thêm vào hàng chờ
          </button>
          <div style={{ height: '1px', backgroundColor: 'rgba(255,255,255,0.05)', margin: '4px 0' }}></div>
          <button 
            onClick={() => handleDelete(menuConfig.song.id, menuConfig.song.title)}
            style={{ width: '100%', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '12px', color: '#f87171', backgroundColor: 'transparent', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.1)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <Trash2 size={16} /> Xóa bài hát khỏi thư viện
          </button>
        </div>
      )}

      {/* Render Floating Hearts */}
      {hearts.map(h => (
        <Heart 
          key={h.id} 
          className="floating-heart"
          style={{ left: h.x, top: h.y, color: h.color }}
          size={24}
          fill="currentColor"
        />
      ))}
    </div>
  );
};

export default Library;