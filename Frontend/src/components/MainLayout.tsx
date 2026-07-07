import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Library, History, Heart, ChevronsLeft, ChevronsRight, User as UserIcon, Share2, Users } from 'lucide-react';
import { useAudio } from '../Contexts/AudioContext';
import { AppHeader } from './AppHeader';
import PlayerBar from './PlayerBar';
import { NowPlayingSidebar } from './NowPlayingSidebar'; // Import component mới
import { ShareSidebar } from './ShareSidebar';
import { User } from '@shared-types/user';

const MenuBox = ({ user }: { user: User | null }) => {
  const location = useLocation();
  const [isMenuCollapsed, setIsMenuCollapsed] = useState(false);

  const menuItems = [
    { name: 'Hồ sơ', icon: UserIcon, path: (u: User | null) => u?.username ? `/app/profile/${u.username}` : '/login' },
    { name: 'Thư viện', icon: Library, path: '/app/library' },
    { name: 'Lịch sử', icon: History, path: '/app/history' },
    { name: 'Bài hát đã thích', icon: Heart, path: '/app/liked' },
    { name: 'Được chia sẻ', icon: Users, path: '/app/shared-with-me' },
  ];

  const { selectSongForShare, currentTrack } = useAudio();
  const handleShareClick = () => {
    if (currentTrack) {
      selectSongForShare(currentTrack);
    }
  };

  return (
    <div style={{
      width: isMenuCollapsed ? '72px' : '220px',
      flexShrink: 0,
      backgroundColor: '#121212',
      borderRadius: '8px',
      padding: '8px',
      alignSelf: 'flex-start',
      transition: 'width 0.2s ease',
      position: 'relative',
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
        {menuItems.map(item => {
          const isActive = location.pathname === item.path;
          const finalPath = typeof item.path === 'function' ? item.path(user) : item.path;
          return (
            <Link
              key={item.name}
              to={finalPath}
              title={isMenuCollapsed ? item.name : ''}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: isMenuCollapsed ? '12px' : '10px 16px',
                borderRadius: '4px',
                transition: 'all 0.2s ease',
                color: isActive ? 'white' : '#b3b3b3',
                backgroundColor: isActive ? '#282828' : 'transparent',
                fontWeight: isActive ? '600' : '500',
                fontSize: '15px',
                justifyContent: isMenuCollapsed ? 'center' : 'flex-start',
                textDecoration: 'none',
              }}
              onMouseEnter={(e) => { if (!isActive) { e.currentTarget.style.backgroundColor = '#282828'; e.currentTarget.style.color = 'white'; } }}
              onMouseLeave={(e) => { if (!isActive) { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#b3b3b3'; } }}
            >
              <item.icon 
                size={24} 
                style={{ flexShrink: 0 }} 
              />
              {!isMenuCollapsed && <span style={{ whiteSpace: 'nowrap' }}>{item.name}</span>}
            </Link>
          );
        })}
      </div>
      <div style={{ borderTop: '1px solid #282828', margin: '8px 0' }}></div>
      <div>
        <button
          onClick={handleShareClick}
          disabled={!currentTrack}
          title={isMenuCollapsed ? (currentTrack ? "Chia sẻ bài hát" : "Phát bài hát để chia sẻ") : ''}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: isMenuCollapsed ? '12px' : '10px 16px',
            borderRadius: '4px',
            transition: 'all 0.2s ease',
            color: currentTrack ? '#b3b3b3' : '#555',
            backgroundColor: 'transparent',
            fontWeight: '500',
            fontSize: '15px',
            border: 'none',
            justifyContent: isMenuCollapsed ? 'center' : 'flex-start',
            width: '100%',
            cursor: currentTrack ? 'pointer' : 'not-allowed',
          }}
          onMouseEnter={(e) => { if (currentTrack) { e.currentTarget.style.backgroundColor = '#282828'; e.currentTarget.style.color = 'white'; } }}
          onMouseLeave={(e) => { if (currentTrack) { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#b3b3b3'; } }}
        >
          <Share2 size={24} />
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