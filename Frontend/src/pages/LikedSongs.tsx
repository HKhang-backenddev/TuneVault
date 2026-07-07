import React, { useEffect, useState } from 'react';
import api from '../axios';
import { Heart, Play, Pause, Music, Clock, Trash2, ListFilter } from 'lucide-react';
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

interface LikedSongsProps {
  lastRefreshTime: number;
}

const LikedSongs = ({ lastRefreshTime }: LikedSongsProps) => {
  const [songs, setSongs] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('recent');
  const { playTrack, currentTrack, isPlaying, updateLikedStatus } = useAudio();
  const token = localStorage.getItem('token'); // Lấy token để theo dõi thay đổi người dùng
  const [hearts, setHearts] = useState<{ id: number; x: number; y: number; color: string }[]>([]);

  const fetchLikedSongs = async () => {
    try {
      const res = await api.get(`/favorites?sortBy=${sortBy}`);
      setSongs(res.data);
    } catch (error) {
      console.error("Failed to fetch liked songs", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLikedSongs();
  }, [sortBy, lastRefreshTime, token]); // Thêm token vào dependency

  const handleToggleLike = async (e: React.MouseEvent, song: MediaItem) => {
    e.stopPropagation();
    const randomColors = ['#FF0000', '#FF1493', '#FF4500', '#FFD700', '#FF6B6B', '#E91E63'];
    const randomColor = randomColors[Math.floor(Math.random() * randomColors.length)];
    const newHeart = { id: Date.now(), x: e.clientX, y: e.clientY, color: randomColor };
    setHearts(prev => [...prev, newHeart]);
    
    setTimeout(() => {
      setHearts(prev => prev.filter(h => h.id !== newHeart.id));
    }, 1000);

    try {
      await api.post(`/favorites/toggle/${song.id}`);
      // Xóa bài hát khỏi danh sách hiển thị vì đây là trang "Liked Songs"
      setSongs(prev => prev.filter(s => s.id !== song.id));
      if (currentTrack?.id === song.id) {
        updateLikedStatus(false);
      }
    } catch (error) {
      console.error("Error toggling like", error);
    }
  };

  const formatTime = (seconds?: number) => {
    if (!seconds) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen pb-32 flex justify-center">
      <style>{`
        @keyframes wave-liked {
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

        /* Custom scrollbar for lists */
        .custom-scrollbar::-webkit-scrollbar { width: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 8px; }
        .custom-scrollbar { scrollbar-width: thin; scrollbar-color: rgba(255,255,255,0.08) transparent; }
        .animate-wave-1 { animation: wave-liked 0.6s ease-in-out infinite; }
        .animate-wave-2 { animation: wave-liked 0.8s ease-in-out infinite 0.1s; }
        .animate-wave-3 { animation: wave-liked 0.7s ease-in-out infinite 0.2s; }

        .song-item-neon:hover {
          background-color: rgba(59, 130, 246, 0.1) !important;
          border-color: #3b82f6 !important;
          box-shadow: 0 0 20px rgba(59, 130, 246, 0.4) !important;
          transform: scale(1.01);
          z-index: 10;
        }
        .song-item-neon {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
          border: 1px solid transparent;
        }
        @keyframes float-heart-liked {
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
          animation: float-heart-liked 1s ease-out forwards;
        }
        /* Keyframes cho viền chuyển động */
        @keyframes animated-border-liked {
          0% { background-position: 0% center; }
          100% { background-position: 200% center; }
        }
      `}</style>

      {/* Main Content Card */}
      <div style={{
        width: '100%',
        maxWidth: '900px', // Keep the wider width for the list
        margin: '24px auto', // Center the card and add margin
        backgroundColor: 'rgba(0,0,0,0.5)',
        border: '2px solid transparent',
        borderRadius: '24px', // Rounded corners
        backgroundImage: 'linear-gradient(rgba(0,0,0,0.8), rgba(0,0,0,0.8)), linear-gradient(135deg, #c084fc, #3b82f6, #10b981, #c084fc)',
        backgroundOrigin: 'border-box',
        backgroundClip: 'padding-box, border-box',
        backgroundSize: '200% 100%',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.8), 0 0 40px rgba(59, 130, 246, 0.2)', // Neon glow,
        animation: 'animated-border-liked 8s linear infinite',
        overflow: 'hidden', // Ensure content stays within bounds
        display: 'flex',
        flexDirection: 'column',
      }}>
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
            <Heart size={70} fill="white" style={{ color: 'white', filter: 'drop-shadow(0 0 5px rgba(0,0,0,0.5))' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.2)', borderRadius: '16px' }}></div>
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.2em', color: '#93c5fd', marginBottom: '8px' }}>
              Personal Library
            </p>
            <h1 style={{ fontSize: '48px', fontWeight: '900', letterSpacing: '-0.05em', color: 'white', marginBottom: '12px' }}>
              Liked Songs
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 'bold', color: '#B0B0B0' }}>
              <div style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: 'white' }}>TV</div>
              <span>TuneVault User</span>
              <span style={{ color: '#555' }}>•</span>
              <span style={{ color: 'white' }}>{songs.length} tracks</span>
            </div>
          </div>
        </div>

        <div style={{
          padding: '24px 32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
        }}>
          <button 
            onClick={() => songs.length > 0 && playTrack(songs[0], songs)}
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
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.1)';
              e.currentTarget.style.boxShadow = '0 0 30px rgba(59, 130, 246, 0.8), inset 0 0 15px rgba(255, 255, 255, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 0 20px rgba(59, 130, 246, 0.6), inset 0 0 10px rgba(255, 255, 255, 0.2)';
            }}
          >
            <Play size={28} fill="white" style={{ color: 'white', marginLeft: '3px' }} />
          </button>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            padding: '6px 16px',
            borderRadius: '24px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={(e) => e.currentTarget.style.borderColor = '#3b82f6'}
          onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
          >
            <ListFilter size={16} style={{ color: '#60a5fa' }} />
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                fontSize: '12px',
                fontWeight: '900',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                color: '#B0B0B0',
                outline: 'none',
                cursor: 'pointer',
                paddingRight: '24px', // Để tạo khoảng trống cho mũi tên tùy chỉnh
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23B0B0B0'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 8px center',
                backgroundSize: '16px',
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'white'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#B0B0B0'}
            >
              <option value="recent" style={{ backgroundColor: '#181818', color: 'white' }}>Newest</option>
              <option value="oldest" style={{ backgroundColor: '#181818', color: 'white' }}>Oldest</option>
              <option value="title_asc" style={{ backgroundColor: '#181818', color: 'white' }}>Title (A-Z)</option>
              <option value="title_desc" style={{ backgroundColor: '#181818', color: 'white' }}>Title (Z-A)</option>
            </select>
          </div>
        </div>

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
              maxHeight: '60vh', // Giữ nguyên hoặc điều chỉnh nếu cần
              paddingBottom: '120px', // Thêm khoảng đệm dưới để không bị PlayerBar che
              overflowY: 'auto'
            }} className="custom-scrollbar">
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
              <div>Title</div>
              <div>Artist</div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', paddingRight: '8px' }}><Clock size={16} /></div>
            </div>

          {loading ? (
            <div className="text-center py-20 text-neutral-500 font-bold tracking-widest text-xs animate-pulse">LOADING YOUR TRACKS...</div>
          ) : songs.length === 0 && !loading ? (
            <div className="text-center py-20">
              <Music size={64} className="mx-auto mb-4 text-neutral-800" />
              <h3 className="text-xl font-bold">You haven't liked any songs yet</h3>
              <p className="text-neutral-500 mt-2">Songs you like will appear here.</p>
            </div>
          ) : (
            songs.map((song, index) => {
              const isCurrent = currentTrack?.id === song.id;
              return (
                <div 
                  key={song.id}
                  onClick={() => playTrack(song, songs)}
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
                      <span style={{ color: isCurrent ? '#3b82f6' : '#737373' }}>{index + 1}</span>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <img src={song.thumbnailUrl} style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '8px', boxShadow: '0 4px 15px rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)' }} alt="" />
                    <div style={{ overflow: 'hidden' }}>
                      <div style={{ fontWeight: '600', fontSize: '15px', color: isCurrent ? '#60a5fa' : 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{song.title}</div>
                    </div>
                  </div>

                  {/* Cột Artist: Bây giờ đã hiển thị dữ liệu */}
                  <div style={{ color: '#B0B0B0', fontSize: '13px', fontWeight: '500', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'flex', alignItems: 'center' }}>
                    {song.artist || 'Unknown Artist'}
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
                      <Heart size={16} fill="currentColor" />
                    </button>
                    {formatTime(song.durationInSeconds)}
                  </div>
                </div>
              );
            })
          )}
          </div>
        </div>
      </div>

      {/* Floating Hearts */}
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

export default LikedSongs;