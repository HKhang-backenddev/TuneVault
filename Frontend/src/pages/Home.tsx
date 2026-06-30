import React, { useEffect, useState, useRef } from 'react';
import api from '../axios';
import { Play, Pause, Music, ChevronLeft, ChevronRight, Heart, Search as SearchIcon, Share2, Trash2, User, Clock, Disc3 } from 'lucide-react';
import { useAudio } from '../Contexts/AudioContext';
import { Link, useLocation, useNavigate } from 'react-router-dom';

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
}

interface UserResult {
  id: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
}

interface HomeProps {
  user: {
    displayName: string;
  } | null;
  searchQuery: string;
  lastRefreshTime: number;
}

const Home = ({ user, searchQuery, lastRefreshTime }: HomeProps) => {
  const { playTrack, togglePlay, currentTrack, isPlaying, updateLikedStatus, selectSongForShare } = useAudio();
  const [sections, setSections] = useState<{ title: string, items: MediaItem[] }[]>([]);
  const [userResults, setUserResults] = useState<UserResult[]>([]);
  const [searchResults, setSearchResults] = useState<MediaItem[]>([]);
  const [hearts, setHearts] = useState<{ id: number; x: number; y: number; color: string }[]>([]);
  const [greeting, setGreeting] = useState('Chào bạn');
  const frameRef = useRef<HTMLDivElement>(null);
  const [canScrollUp, setCanScrollUp] = useState(false);
  const [canScrollDown, setCanScrollDown] = useState(false);
  const [isFrameHovered, setIsFrameHovered] = useState(false);

  const checkFrameScroll = () => {
    const el = frameRef.current;
    if (!el) return;
    setCanScrollUp(el.scrollTop > 10);
    setCanScrollDown(el.scrollTop + el.clientHeight < el.scrollHeight - 10);
  };

  const scrollFrame = (direction: 'up' | 'down') => {
    const el = frameRef.current;
    if (!el) return;
    const amount = Math.max(200, el.clientHeight * 0.6);
    el.scrollBy({ top: direction === 'down' ? amount : -amount, behavior: 'smooth' });
  };

  const handleDelete = async (e: React.MouseEvent, songId: string, songTitle: string) => {
    e.stopPropagation(); // Ngăn không cho sự kiện click của card cha được kích hoạt
    if (window.confirm(`Bạn có chắc chắn muốn xóa bài hát "${songTitle}" không?`)) {
      try {
        await api.delete(`/media/${songId}`);
        
        // Xóa bài hát khỏi tất cả các section trên giao diện
        setSections(prev => prev.map(sec => ({
          ...sec,
          items: sec.items.filter(item => item.id !== songId)
        })).filter(sec => sec.items.length > 0)); // Xóa luôn section nếu nó rỗng

        // Xóa khỏi kết quả tìm kiếm nếu có
        setSearchResults(prev => prev.filter(item => item.id !== songId));

      } catch (err: any) {
        console.error("Lỗi khi xóa bài hát:", err);
        const msg = err.response?.data?.message || "Không thể xóa bài hát. Vui lòng thử lại.";
        alert(msg);
      }
    }
  };
  // Hàm xử lý Thích/Bỏ thích bài hát
  const toggleLike = async (e: React.MouseEvent, id: string) => {
    try {
      const randomColors = ['#FF0000', '#FF1493', '#FF4500', '#FFD700', '#FF6B6B', '#E91E63'];
      const randomColor = randomColors[Math.floor(Math.random() * randomColors.length)];
      // Tạo hiệu ứng trái tim bay lên tại vị trí click
      const newHeart = { id: Date.now(), x: e.clientX, y: e.clientY, color: randomColor };
      setHearts(prev => [...prev, newHeart]);
      
      // Xóa trái tim sau khi hoàn thành animation (1s)
      setTimeout(() => {
        setHearts(prev => prev.filter(h => h.id !== newHeart.id));
      }, 1000);

      const res = await api.post(`/favorites/toggle/${id}`);
      const liked = res.data.isLiked;
      
      // Cập nhật trạng thái trong các danh sách hiện có trên trang Home
      setSections(prev => prev.map(sec => ({
        ...sec,
        items: sec.items.map(item => item.id === id ? { ...item, isLiked: liked } : item)
      })));
      setSearchResults(prev => prev.map(item => item.id === id ? { ...item, isLiked: liked } : item));

      // Nếu bài đang thả tim là bài đang phát, cập nhật luôn thanh PlayerBar
      if (currentTrack?.id === id) {
        updateLikedStatus(liked);
      }
      // Thông báo cho toàn app rằng danh sách yêu thích đã thay đổi (dùng khi không có SignalR)
      try { window.dispatchEvent(new CustomEvent('favoritesUpdated')); } catch {};
    } catch (err) {
      console.error("Lỗi khi thả tim:", err);
    }
  };

  const styles = {
    container: {
      position: "relative",
      zIndex: 60 !important, 
      color: 'white',
      background: 'linear-gradient(180deg, #1a1a2e 0%, #121212 100%)',
      minHeight: '100vh',
      paddingBottom: '80px',
    },
    header: {
      padding: '16px 32px 0 32px',
      background: 'linear-gradient(180deg, rgba(29, 185, 84, 0.15) 0%, transparent 100%)',
      marginBottom: '12px',
      position: 'relative',
      zIndex: 61,
    },
    greeting: { fontSize: '24px', fontWeight: 'bold', marginBottom: '12px' },
    quickPicks: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
      gap: '12px',
      marginBottom: '16px',
      minHeight: "auto",
      position: "relative",
      zIndex: 61 !important,
    },
    quickCard: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      background: 'rgba(255, 255, 255, 0.07)',
      borderRadius: '6px',
      padding: '10px 14px',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      overflow: 'hidden',
      position: 'relative',
      zIndex: 60 !important,
    },
    quickCardText: { fontWeight: 'bold', fontSize: '14px', flex: 1, color: 'white' },
    section: { marginBottom: '20px', padding: '0 32px' },
    sectionTitle: { fontSize: '18px', fontWeight: 'bold', marginBottom: '12px', letterSpacing: '-0.5px' },
    grid: {
      display: 'flex',
      gap: '24px',
      overflowX: 'auto' as const,
      paddingBottom: '12px',
      msOverflowStyle: 'none' as const,
      scrollbarWidth: 'none' as const,
    },
    card: {
      backgroundColor: '#181818',
      padding: '16px',
      borderRadius: '8px',
      cursor: 'pointer',
      width: '200px',
      minWidth: '200px',
      flexShrink: 0,
      position: 'relative' as const,
      transition: 'all 0.3s ease',
    },
    // Styles cho nút cuộn trái/phải
    buttonScroll: {
      position: 'absolute' as const,
      top: '45%',
      transform: 'translateY(-50%)',
      zIndex: 50,
      backgroundColor: '#1db954',
      padding: '12px',
      borderRadius: '9999px',
      transition: 'all 0.3s ease',
      boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
      color: 'black',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      visibility: 'visible' as const,
    },
    buttonScrollLeft: {
      left: '16px',
      transform: 'translateY(-50%) translateX(8px)',
    },
    buttonScrollRight: {
      right: '16px',
      transform: 'translateY(-50%) translateX(-8px)',
    },
    thumbnailWrapper: {
      position: 'relative' as const,
      width: '100%',
      aspectRatio: '1/1',
      marginBottom: '16px',
      boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
      borderRadius: '8px',
      overflow: 'hidden',
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
      boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
      opacity: 0,
      transform: 'translateY(8px)',
      zIndex: 10,
      transition: 'all 0.3s ease',
      color: 'black',
    },
    cardTitle: { fontSize: '16px', fontWeight: 'bold', marginBottom: '8px', whiteSpace: 'nowrap' as const, overflow: 'hidden', textOverflow: 'ellipsis' },
    cardArtist: { fontSize: '14px', color: '#b3b3b3', whiteSpace: 'nowrap' as const, overflow: 'hidden', textOverflow: 'ellipsis' },

    sectionContainer: {
    marginBottom: '20px',
    padding: '24px',
    backgroundColor: 'rgba(10, 10, 10, 0.6)', // Màu nền tối cho khung
    borderRadius: '16px',
    border: '1px solid rgba(255, 255, 255, 0.08)', // Viền mờ bao quanh
    transition: 'all 0.3s ease',
  },
    
  sectionTitleRow: {
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: '20px' 
  },

  };

  const SongCard = ({ song }: { song: MediaItem }) => {
    const isCurrent = currentTrack?.id === song.id;
    return (
      <div 
        style={styles.card} 
        className="group neon-card hover:bg-[#1a1a1a] neon-card-active-effect"
        role="button"
        tabIndex={0}
        aria-label={`Phát ${song.title} - ${song.artist || 'Nghệ sĩ không xác định'}`}
        onClick={() => { playTrack(song, searchResults.length > 0 ? searchResults : sections.flatMap(s => s.items)); api.post(`/media/history/${song.id}`).catch(err => console.log("Lỗi ghi lịch sử:", err?.response?.status, "song.id:", song.id, "data:", JSON.stringify(err?.response?.data))); }}
        onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); playTrack(song); } }}
      >
        <div style={styles.thumbnailWrapper}>
          <img src={song.thumbnailUrl || "/assets/default-cover.png"} alt={song.title} style={styles.thumbnail} />
          <button
            type="button"
            // Ngăn việc click vào nút play kích hoạt click của card cha
            // Điều này đảm bảo togglePlay() được gọi thay vì playTrack(song) một lần nữa
            onClick={(e) => { e.stopPropagation(); togglePlay(); }}
            aria-label={isCurrent ? `Tạm dừng ${song.title}` : `Phát ${song.title}`}
            style={styles.playButton}
            className="group-hover:opacity-100 group-hover:translate-y-0"
          >
            {isCurrent && isPlaying ? <Pause size={24} fill="black" /> : <Play size={20} fill="black" className="ml-1" />}
          </button>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ overflow: 'hidden', flex: 1 }}>
            <h3 style={styles.cardTitle}>{song.title}</h3>
            <p style={styles.cardArtist}>{song.artist || 'Nghệ sĩ không xác định'}</p>
          </div>
          <div className="flex flex-col items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button
              onClick={(e) => { e.stopPropagation(); toggleLike(e, song.id); }}
              aria-label={song.isLiked ? 'Bỏ thích' : 'Yêu thích'}
              className={`transition-all ${song.isLiked ? 'text-blue-500' : 'text-neutral-500 hover:text-white'}`}
              title={song.isLiked ? "Bỏ thích" : "Yêu thích"}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
            >
              <Heart size={18} fill={song.isLiked ? "currentColor" : "none"} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); selectSongForShare(song); }}
              aria-label={`Chia sẻ ${song.title}`}
              className="text-neutral-500 hover:text-white transition-all"
              title="Chia sẻ bài hát này"
            >
              <Share2 size={16} />
            </button>
            <button
              onClick={(e) => handleDelete(e, song.id, song.title)}
              aria-label={`Xóa ${song.title}`}
              className="text-neutral-500 hover:text-blue-500 transition-all"
              title="Xóa bài hát này"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      </div>
    );
  };

  const UserCard = ({ user }: { user: UserResult }) => {
    const navigate = useNavigate();
    return (
      <div
        style={{...styles.card, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px', textAlign: 'center'}}
        className="group neon-card hover:bg-[#1a1a1a]"
        role="button"
        onClick={() => navigate(`/app/profile/${user.username}`)}
      >
        <div style={{
          width: '100px', height: '100px', borderRadius: '50%', overflow: 'hidden',
          border: '3px solid rgba(59, 130, 246, 0.5)',
          boxShadow: '0 0 20px rgba(59, 130, 246, 0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          backgroundColor: '#1a1a1a'
        }}>
          {user.avatarUrl ? (
            <img src={user.avatarUrl} alt={user.displayName} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
          ) : (
            <User size={40} className="text-neutral-500" />
          )}
        </div>
        <div>
          <h3 style={{...styles.cardTitle, marginBottom: '4px'}}>{user.displayName}</h3>
          <p style={{...styles.cardArtist, fontSize: '12px'}}>@{user.username}</p>
        </div>
      </div>
    );
  };

  // Component con để xử lý cuộn cho từng Section
  const SectionRow = ({ section, index }: { section: { title: string, items: MediaItem[] }, index: number }) => {
    const scrollRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const [isHovered, setIsHovered] = useState(false);
    const [canScroll, setCanScroll] = useState({ left: false, right: false });
    const [translate, setTranslate] = useState(0);

    // Kiểm tra có thể cuộn
    const checkScroll = () => {
      if (!scrollRef.current || !contentRef.current) return;
      const outer = scrollRef.current;
      const inner = contentRef.current;
      const scrollLeft = translate;
      const scrollWidth = inner.scrollWidth;
      const clientWidth = outer.clientWidth;
      // Use smaller epsilon to be more permissive when widths are near-equal
      const eps = 5;
      setCanScroll({
        left: scrollLeft > eps,
        right: scrollLeft + clientWidth < scrollWidth - eps
      });
    };

    useEffect(() => {
      // Run several delayed checks to catch late image loads/layout changes
      const t1 = setTimeout(checkScroll, 50);
      const t2 = setTimeout(checkScroll, 200);
      const t3 = setTimeout(checkScroll, 500);
      window.addEventListener('resize', checkScroll);

      let roOuter: ResizeObserver | null = null;
      let roInner: ResizeObserver | null = null;
      if (typeof ResizeObserver !== 'undefined') {
        try {
          if (scrollRef.current) {
            roOuter = new ResizeObserver(() => setTimeout(checkScroll, 50));
            roOuter.observe(scrollRef.current);
          }
        } catch {}
        try {
          if (contentRef.current) {
            roInner = new ResizeObserver(() => setTimeout(checkScroll, 50));
            roInner.observe(contentRef.current);
          }
        } catch {}
      }

      // If images in the row load after render, trigger checkScroll when they finish
      const imgs: HTMLImageElement[] = contentRef.current ? Array.from(contentRef.current.querySelectorAll('img')) as HTMLImageElement[] : [];
      const onImgLoad = () => setTimeout(checkScroll, 30);
      imgs.forEach(img => {
        if (img.complete) return;
        img.addEventListener('load', onImgLoad);
        img.addEventListener('error', onImgLoad);
      });

      return () => {
        clearTimeout(t1); clearTimeout(t2); clearTimeout(t3);
        window.removeEventListener('resize', checkScroll);
        if (roOuter) roOuter.disconnect();
        if (roInner) roInner.disconnect();
        imgs.forEach(img => {
          try { img.removeEventListener('load', onImgLoad); img.removeEventListener('error', onImgLoad); } catch {}
        });
      };
    }, [section.items]);

    // Core scroll performer used by mouse and keyboard handlers
    const performScroll = async (direction: 'left' | 'right', outerEl?: HTMLElement | null) => {
      const outer = outerEl ?? scrollRef.current;
      const inner = contentRef.current;
      if (!outer || !inner) return;

      const scrollAmount = Math.max(120, outer.clientWidth * 0.8);
      const maxTranslate = Math.max(0, inner.scrollWidth - outer.clientWidth);
      let newTranslate = translate + (direction === 'right' ? scrollAmount : -scrollAmount);
      newTranslate = Math.max(0, Math.min(maxTranslate, newTranslate));

      if (inner.scrollWidth <= outer.clientWidth) {
        setCanScroll({ left: false, right: false });
        return;
      }

      setTranslate(newTranslate);
      try {
        const eps = 5;
        setCanScroll({
          left: newTranslate > eps,
          right: newTranslate + outer.clientWidth < inner.scrollWidth - eps
        });
      } catch {}

      // If inner still had no overflow, attempt temporary debug clones to allow movement (very rare)
      try {
        const scrollBefore = inner.scrollWidth;
        let createdClones = false;
        if (inner.scrollWidth <= outer.clientWidth && inner.children.length > 0) {
          createdClones = true;
          const toClone = Math.min(6, inner.children.length);
          for (let i = 0; i < toClone; i++) {
            const clone = inner.children[i].cloneNode(true) as HTMLElement;
            clone.setAttribute('data-debug-clone', '1');
            inner.appendChild(clone);
          }
          await awaitTick(40);
          if (inner.scrollWidth === scrollBefore) {
            for (let i = 0; i < toClone; i++) {
              const ph = document.createElement('div');
              ph.setAttribute('data-debug-clone', '1');
              ph.setAttribute('aria-hidden', 'true');
              ph.style.width = '200px'; ph.style.minWidth = '200px'; ph.style.flex = '0 0 auto'; ph.style.marginRight = '24px';
              inner.appendChild(ph);
            }
            await awaitTick(40);
          }

          // cleanup clones shortly after
          window.setTimeout(() => {
            try { Array.from(inner.querySelectorAll('[data-debug-clone]')).forEach(c => c.remove()); setTimeout(checkScroll, 50); } catch {}
          }, 800);
        }
      } catch (err) { console.debug('performScroll debug clone error', err); }

      setTimeout(checkScroll, 400);
    };

    const handleScroll = (e: React.MouseEvent, direction: 'left' | 'right') => {
      e.preventDefault();
      e.stopPropagation();
      // Try to find the row relative to the clicked button; fallback to ref
      const btn = e.currentTarget as HTMLElement | null;
      let targetRow: HTMLElement | null = null;
      try { const wrapper = btn?.parentElement ?? null; if (wrapper) targetRow = wrapper.querySelector('.no-scrollbar') as HTMLElement | null; } catch {}
      if (!targetRow) targetRow = scrollRef.current;
      performScroll(direction, targetRow);
    };

    // small helper to await a layout tick
    const awaitTick = (ms = 0) => new Promise(resolve => setTimeout(resolve, ms));

    return (
      <div
        style={{ 
          marginBottom: '20px', 
          padding: '24px',
          borderRadius: '16px', 
          border: '1px solid rgba(29, 185, 84, 0.2)',
          backgroundColor: 'transparent',
          transition: 'all 0.3s ease',
          position: 'relative',
        }}
        onMouseEnter={() => { setIsHovered(true); setTimeout(checkScroll, 50); }}
        onMouseLeave={() => setIsHovered(false)}
        onFocus={() => { setIsHovered(true); setTimeout(checkScroll, 50); }}
        onBlur={(e: React.FocusEvent) => {
          const related = e.relatedTarget as Node | null;
          if (related && (e.currentTarget as Element).contains(related)) return;
          setIsHovered(false);
        }}
        tabIndex={-1}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '20px' }}>
          <h2 style={{ ...styles.sectionTitle, marginBottom: 0 }} className="section-title-neon">{section.title}</h2>
          <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#b3b3b3', cursor: 'pointer' }} className="hover:underline">HIỆN TẤT CẢ</span>
        </div>

        <div
          className="relative"
          role="group"
          aria-label={section.title}
          onKeyDown={(e: React.KeyboardEvent) => {
            if (e.key === 'ArrowLeft') { e.preventDefault(); performScroll('left'); }
            if (e.key === 'ArrowRight') { e.preventDefault(); performScroll('right'); }
          }}
        >
          {/* Nút cuộn trái */}
          <button
            type="button"
            onClick={(e) => handleScroll(e, 'left')}
            disabled={!canScroll.left}
            style={{
              ...styles.buttonScroll,
              ...styles.buttonScrollLeft,
              opacity: (canScroll.left && isHovered) ? 1 : 0,
              visibility: (canScroll.left && isHovered) ? 'visible' as const : 'hidden' as const,
              pointerEvents: (canScroll.left && isHovered) ? 'auto' : 'none',
              filter: canScroll.left ? undefined : 'grayscale(60%)',
              transition: 'all 0.25s ease'
            }}
            className="neon-button"
            title={canScroll.left ? 'Cuộn sang trái' : 'Không thể cuộn trái'}
          >
            <ChevronLeft size={24} />
          </button>

          <div
            ref={scrollRef}
            style={{ ...styles.grid, overflowX: 'hidden', paddingLeft: '16px', paddingRight: '16px' }}
            className="no-scrollbar"
            onScroll={checkScroll}
          >
            <div
              id={`section-content-${index}`}
              ref={contentRef}
              style={{
                display: 'flex',
                gap: '24px',
                willChange: 'transform',
                transform: `translateX(-${translate}px)`,
                transition: 'transform 360ms cubic-bezier(0.4,0,0.2,1)'
              }}
            >
              {section.items.map(song => <SongCard key={song.id} song={song} />)}
            </div>
          </div>

          {/* Nút cuộn phải */}
          <button
            type="button"
            onClick={(e) => handleScroll(e, 'right')}
            aria-controls={`section-content-${index}`}
            disabled={!canScroll.right}
            style={{
              ...styles.buttonScroll,
              ...styles.buttonScrollRight,
              opacity: (canScroll.right && isHovered) ? 1 : 0,
              visibility: (canScroll.right && isHovered) ? 'visible' as const : 'hidden' as const,
              pointerEvents: (canScroll.right && isHovered) ? 'auto' : 'none',
              filter: canScroll.right ? undefined : 'grayscale(60%)',
              transition: 'all 0.25s ease'
            }}
            className="neon-button"
            title={canScroll.right ? 'Cuộn sang phải' : 'Không thể cuộn phải'}
          >
            <ChevronRight size={24} />
          </button>
        </div>
      </div>
    );
  };

  // Khi có sự kiện share mới, reload Home để người nhận thấy thay đổi ngay trên route '/'
  useEffect(() => {
    const handler = () => {
      // Home component có sẵn dependency lastRefreshTime ở useEffect bên dưới
      // nên chỉ cần trigger lại việc load bằng cách đổi lastRefreshTime thông qua prop.
      // Vì lastRefreshTime nằm ngoài Home, ta reload bằng cách gọi setSections/searchResults tại đây.
      // Cách đơn giản nhất: tăng cục bộ bằng cách tái gọi luồng hiện tại.
      // (Ở đây ta gọi lại bằng cách dispatch lại lastRefreshTime theo cơ chế sẵn có.)
      try { window.dispatchEvent(new CustomEvent('favoritesUpdated')); } catch {}
    };
    window.addEventListener('sharedListUpdated', handler as EventListener);
    return () => window.removeEventListener('sharedListUpdated', handler as EventListener);
  }, []);

  useEffect(() => {
    if (searchQuery) {
      // Tìm kiếm cả bài hát và người dùng
      const searchAll = async () => {
        const [songsRes, usersRes] = await Promise.all([
          api.get(`/media?query=${searchQuery}`),
          api.get(`/User/search?query=${searchQuery}`)
        ]);
        setSearchResults(songsRes.data?.items || []);
        setUserResults(usersRes.data || []);
      };
      searchAll();
    } else {
      // Tải dữ liệu cho các khung thể loại khác nhau(Cac khung the loai nhac trong Home)
      const loadHomeData = async () => {
        const genres = ['YouTube', 'Lofi', 'Pop', 'Rock', 'EDM', 'Acoustic', 'Chill Music', 'Rap'];
        const results = await Promise.all([
          api.get('/media?pageSize=20'), // Mới nhất
          ...genres.map(g => api.get(`/media?genre=${g}&pageSize=20`))
        ]);

        const newSections = [
          { title: 'Mới cập nhật', items: results[0].data?.items || [] },
          ...genres.map((g, i) => ({ title: g, items: results[i+1].data?.items || [] }))
        ].filter(s => s.items.length > 0);

        setSections(newSections);
      };
      loadHomeData();
    }
  }, [searchQuery, lastRefreshTime]);

  useEffect(() => {
    const getGreeting = () => {
      const hour = new Date().getHours();
      if (hour >= 5 && hour < 11) {
        return 'Chào buổi sáng';
      } else if (hour >= 11 && hour < 13) {
        return 'Chào buổi trưa';
      } else if (hour >= 13 && hour < 18) {
        return 'Chào buổi chiều';
      } else {
        return 'Chào buổi tối';
      }
    };
    setGreeting(getGreeting());
  }, []);

  // Debug listeners removed for production; diagnostics were used during development.

  // Debug UI removed after verification


  return (
    <div style={styles.container}>
      <style>{`
        .group:hover .play-button-trigger {
          opacity: 1;
          transform: translateY(0);
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-thin::-webkit-scrollbar {
          width: 8px;
        }
        .scrollbar-thin::-webkit-scrollbar-track {
          background: transparent;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.3);
          border-radius: 4px;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.5);
        }
        .home-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .home-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .home-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 3px;
        }
        .home-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.4);
        }
        .section-title-neon {
          transition: all 0.4s ease;
        }
        .section-title-neon:hover {
          color: #1db954;
        }
        .neon-card:hover {
          border-color: #1db954 !important;
          box-shadow: 0 0 20px rgba(59, 130, 246, 0.5) !important;
          transform: translateY(-8px) scale(1.02);
        }
        @keyframes neon-shift {
          0% { background-position: 0% center; }
          100% { background-position: 200% center; }
        }
        .neon-title-blue {
          background: linear-gradient(
            90deg, 
            #1db954 0%, 
            #1db954 25%, 
            #1db954 50%, 
            #1db954 75%, 
            #1db954 100%
          );
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: neon-shift 4s linear infinite;
          filter: drop-shadow(0 0 10px rgba(255, 0, 0, 0.6));
          display: inline-block;
        }
        .neon-button:hover {
          background-color: #1db954 !important;
          color: white !important;
          box-shadow: 0 0 25px #1db954, 0 0 50px rgba(59, 130, 246, 0.5) !important;
          border-color: #1db954 !important;
          /* Kết hợp scale với transform hiện tại của inline style */
          filter: brightness(1.2);
          z-index: 60;
        }
        @keyframes float-heart-home {
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
          animation: float-heart-home 1s ease-out forwards;
        }
        /* --- Tùy chỉnh thanh cuộn cho khung danh sách nhạc --- */
        .song-list-frame::-webkit-scrollbar {
          width: 12px;
        }
        .song-list-frame::-webkit-scrollbar-track {
          background: transparent; /* Nền trong suốt */
        }
        .song-list-frame::-webkit-scrollbar-thumb {
          background-color: rgba(59, 130, 246, 0.4); /* Màu xanh neon bán trong suốt */
          border-radius: 10px;
          border: 3px solid transparent; /* Tạo khoảng cách với cạnh */
          background-clip: content-box;
        }
        .song-list-frame::-webkit-scrollbar-thumb:hover {
          background-color: rgba(59, 130, 246, 0.7); /* Đậm hơn khi di chuột vào */
        }
        /* Keyframes cho viền chuyển động */
        @keyframes animated-border-home {
          0% { background-position: 0% center; }
          100% { background-position: 200% center; }
        }
      `}</style>

      {searchQuery ? (
        <div className="flex flex-col gap-10">
          {/* Kết quả tìm kiếm người dùng */}
          {userResults.length > 0 && (
            <div style={styles.section}>
              <h2 style={styles.sectionTitle} className="section-title-neon">Người dùng</h2>
              <div style={styles.grid}>
                {userResults.map(user => <UserCard key={user.id} user={user} />)}
              </div>
            </div>
          )}
          {/* Kết quả tìm kiếm bài hát */}
          <div style={styles.section}>
            <h2 style={styles.sectionTitle} className="section-title-neon">Bài hát</h2>
            {searchResults.length > 0 ? (
              <div style={styles.grid}>
                {searchResults.map(song => <SongCard key={song.id} song={song} />)}
              </div>
            ) : (
              <p style={{ color: '#a7a7a7' }}>Không tìm thấy bài hát nào khớp với "{searchQuery}".</p>
            )}
          </div>
        </div>
      ) : (
        <>
          {/* Header - Spotify Style */}
          <div style={styles.header}>
            <h1 style={styles.greeting}>
              {greeting}{user ? `, ${user.displayName}` : ''}!
            </h1>

            {/* Quick Picks */}
          <div style={styles.quickPicks}>
            <div style={{ ...styles.quickCard, background: 'linear-gradient(135deg, #2a4a6d 0%, #1a1a2e 100%)' }} onClick={() => sections[0]?.items && playAll(sections[0].items)}>
              <Disc3 size={36} style={{ color: '#1db954' }} />
              <span style={styles.quickCardText}>Dành cho {user?.displayName || 'bạn'}</span>
              <Play size={20} style={{ color: '#1db954' }} />
            </div>
              <div style={{ ...styles.quickCard, background: 'linear-gradient(135deg, #4a1942 0%, #1a1a2e 100%)' }} onClick={() => sections.find(s => s.title.includes('Thích'))?.items && playAll(sections.find(s => s.title.includes('Thích'))!.items)}>
                <Heart size={36} style={{ color: '#e91e63' }} />
                <span style={styles.quickCardText}>Bài hát đã thích</span>
                <Play size={20} style={{ color: '#e91e63' }} />
              </div>
              <div style={{ ...styles.quickCard, background: 'linear-gradient(135deg, #1a3a1a 0%, #1a1a2e 100%)' }} onClick={() => sections.find(s => s.title.includes('Gần'))?.items && playAll(sections.find(s => s.title.includes('Gần'))!.items)}>
                <Clock size={36} style={{ color: '#1db954' }} />
                <span style={styles.quickCardText}>Nghe gần đây</span>
                <Play size={20} style={{ color: '#1db954' }} />
              </div>
            </div>
          </div>

          {/* Sections - Scrollable */}
          <div
            ref={frameRef}
            style={{
              padding: '0 32px',
              paddingBottom: '120px',
              maxHeight: 'calc(100vh - 220px)',
              overflowY: 'auto',
            }}
            className="home-scrollbar"
          >
            {sections.map((section, idx) => <SectionRow key={idx} section={section} index={idx} />)}
          </div>

          {sections.length === 0 && (
             <div style={{ textAlign: 'center', padding: '100px 0' }}>
                <Music size={64} style={{ color: '#282828', marginBottom: '24px' }} />
                <h2 style={{ fontSize: '24px', fontWeight: 'bold' }}>Chưa có nhạc trong thư viện</h2>
                <p style={{ color: '#a7a7a7', marginTop: '8px' }}>Hãy bắt đầu thêm nhạc từ YouTube để tạo nên thế giới âm nhạc của bạn.</p>
             </div>
          )}
        </>
      )}

      {/* Render các trái tim đang bay */}
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

export default Home;
