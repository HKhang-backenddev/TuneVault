import React, { useEffect, useState, useRef } from 'react';
import api from '../axios';
import { Play, Pause, Music, ChevronLeft, ChevronRight, Heart, Search as SearchIcon, Share2, Trash2, User, Clock, Disc3 } from 'lucide-react';
import { useAudio } from '../Contexts/AudioContext';
import { Link, useNavigate } from 'react-router-dom';

declare global {
  interface Window { runScrollDiagnostics?: () => void; }
}

interface MediaItem {
  id: string;
  title: string;
  artist: string;
  url: string;
  thumbnailUrl: string;
  genre?: string;
  isLiked?: boolean;
  isOwner?: boolean;
  durationInSeconds?: number;
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

const Home = ({ user, searchQuery }: HomeProps) => {
  const { playTrack, togglePlay, currentTrack, isPlaying, updateLikedStatus, selectSongForShare } = useAudio();
  const [sections, setSections] = useState<{ title: string, items: MediaItem[] }[]>([]);
  const [userResults, setUserResults] = useState<UserResult[]>([]);
  const [searchResults, setSearchResults] = useState<MediaItem[]>([]);
  const [hearts, setHearts] = useState<{ id: number; x: number; y: number; color: string }[]>([]);
  const frameRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [lastRefreshTime]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [libraryRes, likedRes, recentRes] = await Promise.allSettled([
        api.get('/media/library?pageSize=30'),
        api.get('/favorites'),
        api.get('/media/recent?pageSize=20')
      ]);

      const newSections: { title: string, items: MediaItem[] }[] = [];

      if (libraryRes.status === 'fulfilled') {
        const data = libraryRes.value.data?.items || libraryRes.value.data || [];
        if (data.length > 0) {
          newSections.push({ title: 'Thư Viện Của Bạn', items: data });
        }
      }

      if (likedRes.status === 'fulfilled') {
        const liked = likedRes.value.data?.items || likedRes.value.data || [];
        if (liked.length > 0) {
          newSections.push({ title: 'Bài Hát Đã Thích', items: liked });
        }
      }

      if (recentRes.status === 'fulfilled') {
        const recent = recentRes.value.data?.items || recentRes.value.data || [];
        if (recent.length > 0) {
          newSections.push({ title: 'Nghe Gần Đây', items: recent });
        }
      }

      if (newSections.length === 0) {
        const allRes = await api.get('/media?pageSize=50');
        const allData = allRes.data?.items || allRes.data || [];
        if (allData.length > 0) {
          newSections.push({ title: 'Khám Phá', items: allData });
        }
      }

      setSections(newSections);
    } catch (err) {
      console.error('Lỗi load data:', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (searchQuery.trim()) {
      searchMedia(searchQuery);
      searchUsers(searchQuery);
    } else {
      setSearchResults([]);
      setUserResults([]);
    }
  }, [searchQuery]);

  const searchMedia = async (query: string) => {
    try {
      const res = await api.get(`/media?query=${encodeURIComponent(query)}&pageSize=20`);
      setSearchResults(res.data?.items || res.data || []);
    } catch (err) {
      console.error('Lỗi tìm kiếm:', err);
    }
  };

  const searchUsers = async (query: string) => {
    try {
      const res = await api.get(`/users/search?query=${encodeURIComponent(query)}`);
      setUserResults(res.data || []);
    } catch (err) {
      console.error('Lỗi tìm người dùng:', err);
    }
  };

  const toggleLike = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      const randomColors = ['#FF0000', '#FF1493', '#FF4500', '#FFD700', '#FF6B6B', '#E91E63'];
      const newHeart = { id: Date.now(), x: e.clientX, y: e.clientY, color: randomColors[Math.floor(Math.random() * randomColors.length)] };
      setHearts(prev => [...prev, newHeart]);
      setTimeout(() => setHearts(prev => prev.filter(h => h.id !== newHeart.id)), 1000);

      const res = await api.post(`/favorites/toggle/${id}`);
      const liked = res.data.isLiked;
      updateLikedStatus?.(id, liked);
      
      setSearchResults(prev => prev.map(item => item.id === id ? { ...item, isLiked: liked } : item));
      setSections(prev => prev.map(sec => ({
        ...sec,
        items: sec.items.map(item => item.id === id ? { ...item, isLiked: liked } : item)
      })));
    } catch (err) {
      console.error('Lỗi toggle like:', err);
    }
  };

  const handleDelete = async (e: React.MouseEvent, songId: string, songTitle: string) => {
    e.stopPropagation();
    if (window.confirm(`Xóa bài hát "${songTitle}"?`)) {
      try {
        await api.delete(`/media/${songId}`);
        setSections(prev => prev.map(sec => ({ ...sec, items: sec.items.filter(item => item.id !== songId) })).filter(sec => sec.items.length > 0));
        setSearchResults(prev => prev.filter(item => item.id !== songId));
      } catch (err: any) {
        alert(err.response?.data?.message || 'Không thể xóa');
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Chào buổi sáng';
    if (hour < 18) return 'Chào buổi chiều';
    return 'Chào buổi tối';
  };

  const playAll = (items: MediaItem[]) => {
    if (items.length > 0) {
      playTrack(items[0], items);
      api.post(`/media/history/${items[0].id}`).catch(() => {});
    }
  };

  // Spotify-like styles
  const styles = {
    container: {
      color: 'white',
      minHeight: '100%',
      background: 'linear-gradient(180deg, #1a1a2e 0%, #0a0a0a 30%)',
      paddingBottom: '100px',
    },
    header: {
      padding: '24px 32px',
      background: 'linear-gradient(180deg, rgba(77, 48, 96, 0.8) 0%, transparent 100%)',
    },
    greeting: {
      fontSize: '32px',
      fontWeight: 'bold',
      marginBottom: '24px',
      background: 'linear-gradient(90deg, #1db954, #1ed760)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
    },
    quickPicks: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
      gap: '16px',
      marginBottom: '32px',
    },
    quickCard: {
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      background: 'rgba(255, 255, 255, 0.07)',
      borderRadius: '8px',
      padding: '16px',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      overflow: 'hidden',
    },
    section: {
      marginBottom: '40px',
      padding: '0 32px',
    },
    sectionHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '20px',
    },
    sectionTitle: {
      fontSize: '22px',
      fontWeight: 'bold',
      color: 'white',
    },
    seeAll: {
      color: '#b3b3b3',
      fontSize: '14px',
      textDecoration: 'none',
      cursor: 'pointer',
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
      gap: '24px',
    },
    card: {
      background: 'rgba(18, 18, 18, 0.8)',
      borderRadius: '12px',
      padding: '16px',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      position: 'relative' as const,
    },
    thumbnailWrapper: {
      position: 'relative' as const,
      width: '100%',
      aspectRatio: '1/1',
      marginBottom: '16px',
      borderRadius: '8px',
      overflow: 'hidden',
      boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
    },
    thumbnail: { width: '100%', height: '100%', objectFit: 'cover' as const },
    playButton: {
      position: 'absolute' as const,
      right: '8px',
      bottom: '8px',
      width: '48px',
      height: '48px',
      backgroundColor: '#1db954',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
      transition: 'all 0.3s ease',
      transform: 'translateY(8px)',
    },
    cardTitle: { fontSize: '14px', fontWeight: 'bold', marginBottom: '8px', whiteSpace: 'nowrap' as const, overflow: 'hidden', textOverflow: 'ellipsis' },
    cardArtist: { fontSize: '12px', color: '#b3b3b3', whiteSpace: 'nowrap' as const, overflow: 'hidden', textOverflow: 'ellipsis' },
    loadingContainer: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '400px',
      flexDirection: 'column' as const,
      gap: '16px',
    },
    loadingText: { color: '#b3b3b3', fontSize: '14px' },
    emptyState: {
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '400px',
      textAlign: 'center' as const,
    },
    scrollButton: {
      position: 'absolute' as const,
      top: '50%',
      transform: 'translateY(-50%)',
      width: '40px',
      height: '40px',
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      border: 'none',
      color: 'white',
      zIndex: 10,
      transition: 'opacity 0.3s',
    },
  };

  const SongCard = ({ song, index }: { song: MediaItem; index: number }) => {
    const [isHovered, setIsHovered] = useState(false);
    const isCurrent = currentTrack?.id === song.id;

    return (
      <div
        style={{
          ...styles.card,
          background: isCurrent ? 'rgba(29, 185, 84, 0.15)' : (isHovered ? 'rgba(40, 40, 40, 1)' : 'rgba(18, 18, 18, 0.8)'),
          border: isCurrent ? '1px solid #1db954' : '1px solid transparent',
        }}
        className="group"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => {
          const allItems = searchResults.length > 0 ? searchResults : sections.flatMap(s => s.items);
          playTrack(song, allItems);
          api.post(`/media/history/${song.id}`).catch(() => {});
        }}
      >
        <div style={styles.thumbnailWrapper}>
          <img src={song.thumbnailUrl || "/assets/default-cover.png"} alt={song.title} style={styles.thumbnail} />
          
          <div
            className="play-btn"
            style={{
              ...styles.playButton,
              opacity: isHovered ? 1 : (isCurrent ? 1 : 0),
              transform: isHovered || isCurrent ? 'translateY(0)' : 'translateY(8px)',
            }}
            onClick={(e) => {
              e.stopPropagation();
              const allItems = searchResults.length > 0 ? searchResults : sections.flatMap(s => s.items);
              playTrack(song, allItems);
            }}
          >
            {isCurrent && isPlaying ? <Pause size={24} fill="black" /> : <Play size={24} fill="black" className="ml-1" />}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <h3 style={{ ...styles.cardTitle, color: isCurrent ? '#1db954' : 'white' }}>{song.title}</h3>
            <p style={styles.cardArtist}>{song.artist || 'Nghệ sĩ'}</p>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', opacity: isHovered ? 1 : 0, transition: 'opacity 0.2s' }}>
            <button
              onClick={(e) => toggleLike(e, song.id)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: song.isLiked ? '#1db954' : '#b3b3b3' }}
              title={song.isLiked ? 'Bỏ thích' : 'Yêu thích'}
            >
              <Heart size={18} fill={song.isLiked ? '#1db954' : 'none'} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); selectSongForShare?.(song); }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: '#b3b3b3' }}
              title="Chia sẻ"
            >
              <Share2 size={16} />
            </button>
            <button
              onClick={(e) => handleDelete(e, song.id, song.title)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: '#b3b3b3' }}
              title="Xóa"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      </div>
    );
  };

  const SectionRow = ({ section }: { section: { title: string; items: MediaItem[] } }) => {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);

    const checkScroll = () => {
      if (!scrollRef.current) return;
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
    };

    useEffect(() => {
      checkScroll();
      window.addEventListener('resize', checkScroll);
      return () => window.removeEventListener('resize', checkScroll);
    }, [section.items]);

    const scroll = (direction: 'left' | 'right') => {
      if (!scrollRef.current) return;
      const amount = scrollRef.current.clientWidth * 0.6;
      scrollRef.current.scrollBy({ left: direction === 'left' ? -amount : amount, behavior: 'smooth' });
    };

    return (
      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>{section.title}</h2>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => scroll('left')}
              style={{ ...styles.scrollButton, opacity: canScrollLeft ? 1 : 0, pointerEvents: canScrollLeft ? 'auto' : 'none', left: 0 }}
            >
              <ChevronLeft size={24} />
            </button>
            <button
              onClick={() => scroll('right')}
              style={{ ...styles.scrollButton, opacity: canScrollRight ? 1 : 0, pointerEvents: canScrollRight ? 'auto' : 'none', right: 0 }}
            >
              <ChevronRight size={24} />
            </button>
          </div>
        </div>
        
        <div
          ref={scrollRef}
          onScroll={checkScroll}
          style={{ display: 'flex', gap: '24px', overflowX: 'auto', paddingBottom: '20px', scrollSnapType: 'x mandatory' }}
          className="hide-scrollbar"
        >
          {section.items.map((song, index) => (
            <div key={song.id || index} style={{ minWidth: '180px', scrollSnapAlign: 'start' }}>
              <SongCard song={song} index={index} />
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div style={styles.container}>
      {/* Header with greeting */}
      <div style={styles.header}>
        <h1 style={styles.greeting}>{getGreeting()}, {user?.displayName || 'Khách'}</h1>
        
        {/* Quick picks */}
        <div style={styles.quickPicks}>
          <div style={{ ...styles.quickCard, background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)' }}
            onClick={() => sections[0] && playAll(sections[0].items)}
          >
            <Disc3 size={48} style={{ color: '#1db954' }} />
            <span style={{ fontWeight: 'bold' }}>Dành cho {user?.displayName || 'bạn'}</span>
          </div>
          <div style={{ ...styles.quickCard, background: 'linear-gradient(135deg, #4a1942 0%, #1a1a2e 100%)' }}
            onClick={() => sections.find(s => s.title.includes('Thích'))?.items && playAll(sections.find(s => s.title.includes('Thích'))!.items)}
          >
            <Heart size={48} style={{ color: '#e91e63' }} />
            <span style={{ fontWeight: 'bold' }}>Bài hát đã thích</span>
          </div>
          <div style={{ ...styles.quickCard, background: 'linear-gradient(135deg, #1a3a1a 0%, #0a0a0a 100%)' }}
            onClick={() => sections.find(s => s.title.includes('Gần'))?.items && playAll(sections.find(s => s.title.includes('Gần'))!.items)}
          >
            <Clock size={48} style={{ color: '#1db954' }} />
            <span style={{ fontWeight: 'bold' }}>Nghe gần đây</span>
          </div>
        </div>
      </div>

      {/* Search Results */}
      {searchQuery && (
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Kết quả tìm kiếm</h2>
          {searchResults.length > 0 ? (
            <div style={styles.grid}>
              {searchResults.map((song, index) => (
                <SongCard key={song.id || index} song={song} index={index} />
              ))}
            </div>
          ) : (
            <p style={{ color: '#b3b3b3', marginTop: '16px' }}>Không tìm thấy kết quả</p>
          )}
        </div>
      )}

      {/* Loading */}
      {loading && !searchQuery && (
        <div style={styles.loadingContainer}>
          <Disc3 size={48} style={{ color: '#1db954', animation: 'spin 1s linear infinite' }} />
          <p style={styles.loadingText}>Đang tải...</p>
        </div>
      )}

      {/* Sections */}
      {!loading && !searchQuery && sections.map((section, index) => (
        <SectionRow key={index} section={section} />
      ))}

      {/* Empty State */}
      {!loading && !searchQuery && sections.length === 0 && (
        <div style={styles.emptyState}>
          <Music size={64} style={{ color: '#b3b3b3', marginBottom: '24px' }} />
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>Chưa có nhạc</h2>
          <p style={{ color: '#b3b3b3' }}>Thêm nhạc từ YouTube để bắt đầu nghe</p>
          <Link to="/app/import" style={{ marginTop: '24px', color: '#1db954', textDecoration: 'none', fontWeight: 'bold' }}>
            Thêm nhạc ngay →
          </Link>
        </div>
      )}

      {/* Floating Hearts */}
      {hearts.map(h => (
        <Heart
          key={h.id}
          style={{
            position: 'fixed',
            left: h.x,
            top: h.y,
            color: h.color,
            animation: 'floatUp 1s ease-out forwards',
            pointerEvents: 'none',
            zIndex: 9999,
          }}
          size={24}
          fill="currentColor"
        />
      ))}

      {/* CSS Animations */}
      <style>{`
        @keyframes floatUp {
          0% { transform: translateY(0) scale(1); opacity: 1; }
          100% { transform: translateY(-100px) scale(1.5); opacity: 0; }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .play-btn {
          opacity: 0;
          transform: translateY(8px);
        }
        .group:hover .play-btn {
          opacity: 1 !important;
          transform: translateY(0) !important;
        }
      `}</style>
    </div>
  );
};

export default Home;
