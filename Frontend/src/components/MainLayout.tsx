import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Library, History, Heart, ChevronsLeft, ChevronsRight, User as UserIcon, Share2, Users, Trophy, Headphones } from 'lucide-react';
import { useAudio } from '../Contexts/AudioContext';
import { AppHeader } from './AppHeader';
import PlayerBar from './PlayerBar';
import { NowPlayingSidebar } from './NowPlayingSidebar';
import { ShareSidebar } from './ShareSidebar';
import { User } from '@shared-types/user';

const MenuBox = ({ user }: { user: User | null }) => {
  const location = useLocation();
  const [isMenuCollapsed, setIsMenuCollapsed] = useState(false);

  const menuItems = [
    // Cập nhật path để nó là một hàm có thể tạo link động
    { name: 'Hồ sơ', icon: UserIcon, path: (u: User | null) => u?.username ? `/app/profile/${u.username}` : '/login', color: '#8b5cf6' }, // Purple
    { name: 'Thư viện', icon: Library, path: '/app/library', color: '#f97316' }, // Orange
    { name: 'Top Charts', icon: Trophy, path: '/app/top-charts', color: '#f59e0b' }, // Amber
    { name: 'Lịch sử nghe', icon: Headphones, path: '/app/listen-history', color: '#a855f7' }, // Purple
    { name: 'Lịch sử', icon: History, path: '/app/history', color: '#eab308' }, // Yellow
    { name: 'Bài hát đã thích', icon: Heart, path: '/app/liked', color: '#ec4899' }, // Pink
    { name: 'Được chia sẻ', icon: Users, path: '/app/shared-with-me', color: '#10b981' }, // Green
  ];

  const { selectSongForShare, currentTrack } = useAudio();
  const handleShareClick = () => {
    if (currentTrack) {
      selectSongForShare(currentTrack);
    }
  };

  return (
    <div style={Object.assign({
      width: isMenuCollapsed ? '88px' : '240px',
      flexShrink: 0,
      backgroundColor: '#121212',
      borderRadius: '12px',
      padding: '16px',
      border: '1px solid rgba(59, 130, 246, 0.15)',
      alignSelf: 'stretch',
      transition: 'width 0.3s ease',
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
    })}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', paddingBottom: '12px', marginBottom: '12px' }}>
        {!isMenuCollapsed && (
          <h2 style={{
            fontSize: '12px',
            fontWeight: '900',
            color: '#60a5fa',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            padding: '0 12px',
            margin: 0,
            whiteSpace: 'nowrap',
            opacity: isMenuCollapsed ? 0 : 1,
            transition: 'all 0.3s ease',
            textShadow: '0 0 8px rgba(59, 130, 246, 0.7)',
          }}>
            Thư viện
          </h2>
        )}
        <button
          onClick={() => setIsMenuCollapsed(!isMenuCollapsed)}
          style={{ background: 'transparent', border: 'none', color: '#a7a7a7', cursor: 'pointer', padding: '8px', borderRadius: '50%', marginLeft: isMenuCollapsed ? 'auto' : '0', marginRight: isMenuCollapsed ? 'auto' : '0' }}
          className="hover:bg-neutral-800 hover:text-white"
          title={isMenuCollapsed ? "Mở rộng" : "Thu gọn"}
        >
          {isMenuCollapsed ? <ChevronsRight size={20} /> : <ChevronsLeft size={20} />}
        </button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
        {menuItems.map(item => {
          const isActive = location.pathname === item.path;
          // Tạo đường dẫn dựa trên việc path là chuỗi hay hàm
          const finalPath = typeof item.path === 'function' ? item.path(user) : item.path;
          return (
            <Link
              key={item.name}
              to={finalPath}
              title={isMenuCollapsed ? item.name : ''}
              style={Object.assign({
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                padding: '12px',
                borderRadius: '8px',
                transition: 'all 0.2s ease',
                color: isActive ? 'white' : '#a7a7a7',
                backgroundColor: isActive ? item.color : 'transparent',
                fontWeight: isActive ? 'bold' : '600',
                border: '1px solid transparent',
                justifyContent: isMenuCollapsed ? 'center' : 'flex-start',
              })}
              className={isActive ? 'shadow-lg' : ''}
              onMouseEnter={(e) => { if (!isActive) { e.currentTarget.style.backgroundColor = `${item.color}20`; e.currentTarget.style.color = item.color; } }}
              onMouseLeave={(e) => { if (!isActive) { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#a7a7a7'; } }}
            >
              <item.icon 
                size={22} 
                style={{ color: isActive ? 'white' : item.color, transition: 'color 0.2s' }} 
              />
              {!isMenuCollapsed && <span style={{ whiteSpace: 'nowrap' }}>{item.name}</span>}
            </Link>
          );
        })}
      </div>
      {/* Nút chia sẻ mới */}
      <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '12px', marginTop: '12px' }}>
        <button
          onClick={handleShareClick}
          disabled={!currentTrack}
          title={isMenuCollapsed ? (currentTrack ? "Chia sẻ bài hát đang phát" : "Phát một bài hát để chia sẻ") : ''}
          style={Object.assign({
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            padding: '12px',
            borderRadius: '8px',
            transition: 'all 0.3s ease',
            color: currentTrack ? '#a7a7a7' : '#555',
            backgroundColor: 'transparent',
            fontWeight: '600',
            border: '1px solid transparent',
            justifyContent: isMenuCollapsed ? 'center' : 'flex-start',
            width: '100%',
            cursor: currentTrack ? 'pointer' : 'not-allowed',
          })}
          className={currentTrack ? 'menu-item-rainbow-hover' : ''}
        >
          <Share2 size={22} />
          {!isMenuCollapsed && <span style={{ whiteSpace: 'nowrap' }}>Chia sẻ bài hát</span>}
        </button>
      </div>
    </div>
  );
};

const MainLayout = ({ user, children }: { user: User | null, children: React.ReactNode }) => {
    return (
        <div className="flex-1 flex min-h-0" style={{ display: 'flex', gap: '24px', padding: '24px', color: 'white', height: '100%' }}>
            <MenuBox user={user} />
            {/* SỬA LỖI: Thêm position và z-index để đảm bảo nó nằm dưới AppHeader */}
            <div style={{ 
              flex: 1, 
              minWidth: 0, 
              overflowY: 'auto',
              position: 'relative', // Tạo stacking context
              zIndex: 1 // Đảm bảo nó nằm dưới header (có z-index cao hơn)
            }} className="custom-scrollbar">{children}</div>
            <ShareSidebar user={user} />
            <NowPlayingSidebar /> {/* Thêm sidebar mới vào đây */}
        </div>
    );
};

export default MainLayout;