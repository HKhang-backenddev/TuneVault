import React from 'react';
import { Location, NavigateFunction } from 'react-router-dom';
import {
  Search as SearchIcon, Plus, Home as HomeIcon, Bell, LogOut, User as UserIcon, Camera, Image as ImageIcon, Moon, Sun
} from 'lucide-react';
import { User } from '@shared-types/user';
import { useTheme } from '../Contexts/ThemeContext';

interface AppHeaderProps {
  user: User | null;
  handleLogout: () => void;
  goHome: () => void;
  showUserMenu: boolean;
  setShowUserMenu: (show: boolean) => void;
  avatarInputRef: React.RefObject<HTMLInputElement>;
  bannerInputRef: React.RefObject<HTMLInputElement>;
  handleMenuUpload: (type: 'avatar' | 'banner', e: React.ChangeEvent<HTMLInputElement>) => void;
  navigate: NavigateFunction;
  location: Location;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const AppHeader = ({ user, handleLogout, goHome, showUserMenu, setShowUserMenu, avatarInputRef, bannerInputRef, handleMenuUpload, navigate, location, searchQuery, setSearchQuery }: AppHeaderProps) => {
  const { theme, toggleTheme } = useTheme();
  return (
  <header style={{
    zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    height: '64px', padding: '0 24px', backgroundColor: 'rgba(0, 0, 0, 0.9)',
    backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
  }}>
    <div style={{ flex: '1', display: 'flex', alignItems: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', cursor: 'pointer' }} onClick={goHome} className="group">
        <div className="w-10 h-10 neon-logo-box rounded-lg flex items-center justify-center transition-transform group-hover:scale-110">
          {/* Arctic Fox Logo SVG */}
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ filter: 'drop-shadow(0 0 3px rgba(255, 255, 255, 0.7))' }}
          >
            <path d="M2.5 8.5L6 11L2.5 13.5" />
            <path d="M21.5 8.5L18 11L21.5 13.5" />
            <path d="M12 2L2 7V17L12 22L22 17V7L12 2Z" />
          </svg>
        </div>
        <h1 className="text-2xl font-black tracking-tighter text-white drop-shadow-[0_0_10px_rgba(59,130,246,0.7)] transition-all group-hover:tracking-normal group-hover:text-blue-100">TuneVault</h1>
      </div>
    </div>

    <div style={{ flex: '2', display: 'flex', justifyContent: 'center' }}>
      <div style={{ position: 'relative', width: '100%', maxWidth: '600px' }}>
        <SearchIcon style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#737373' }} size={18} />
        <input
          type="text" placeholder="Tìm kiếm bài hát, nghệ sĩ, hoặc người dùng..."
          style={{ width: '100%', backgroundColor: '#242424', borderRadius: '24px', padding: '10px 16px 10px 48px', fontSize: '14px', color: 'white', outline: 'none' }}
          className="neon-search-input"
          value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
    </div>

    <div style={{ flex: '1', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '12px' }}>
      <nav style={{ display: 'flex', alignItems: 'center', gap: '10px', marginRight: '12px' }}>
        <button
          onClick={() => navigate('/app/import')}
          style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: location.pathname.includes('/import') ? '#3b82f6' : 'transparent', color: location.pathname.includes('/import') ? 'white' : '#3b82f6', border: '1px solid #3b82f6' }}
          className="flex items-center justify-center transition shadow-lg shadow-blue-500/20 neon-nav-button neon-button-active-effect"
        >
          <Plus size={24} />
        </button>

        <button
          onClick={goHome}
          style={{
            width: '40px', height: '40px', borderRadius: '50%',
            backgroundColor: (location.pathname === '/app' || location.pathname === '/app/') ? '#3b82f6' : 'transparent',
            color: (location.pathname === '/app' || location.pathname === '/app/') ? 'white' : '#3b82f6',
            border: '1px solid #3b82f6'
          }} className="flex items-center justify-center transition shadow-lg shadow-blue-500/20 neon-nav-button neon-button-active-effect"
        >
          <HomeIcon size={20} fill="currentColor" />
        </button>
      </nav>
      <button
        onClick={() => navigate('/app/notifications')}
        style={{
          position: 'relative',
          width: '40px', height: '40px', borderRadius: '50%',
          backgroundColor: location.pathname.includes('/notifications') ? '#3b82f6' : 'transparent',
          color: location.pathname.includes('/notifications') ? 'white' : '#3b82f6',
          border: '1px solid #3b82f6'
        }}
        className="flex items-center justify-center transition shadow-lg shadow-blue-500/20 neon-nav-button neon-button-active-effect"
      >
        <Bell size={20} fill={location.pathname === '/notifications' ? "currentColor" : "none"} />
        {user?.hasUnreadNotifications && (
          <span style={{
            position: 'absolute', top: '6px', right: '6px', width: '10px', height: '10px',
            borderRadius: '50%', backgroundColor: '#ef4444', border: '2px solid #000',
            animation: 'pulse-red 2s infinite'
          }}></span>
        )}
      </button>

      <button
        onClick={toggleTheme}
        style={{
          width: '40px', height: '40px', borderRadius: '50%',
          backgroundColor: 'transparent', color: '#a855f7',
          border: '1px solid #a855f7'
        }}
        className="flex items-center justify-center transition shadow-lg shadow-purple-500/20"
        title={theme === 'dark' ? 'Chuyển sang chế độ sáng' : 'Chuyển sang chế độ tối'}
      >
        {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
      </button>

      <div className="relative user-menu-container" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={(e) => {
            e.stopPropagation(); // Ngăn không cho menu đóng ngay lập tức
            setShowUserMenu(!showUserMenu);
          }}
          style={{ width: '40px', height: '40px', borderRadius: '50%', border: '1px solid rgba(59, 130, 246, 0.7)' }}
          className="user-menu-button bg-gradient-to-tr from-blue-600 to-blue-900 flex-shrink-0 flex items-center justify-center font-bold text-sm cursor-pointer transition-all text-white overflow-hidden neon-blue-profile-button neon-button-active-effect"
          title="Xem hồ sơ của bạn"
        >
          {user?.avatarUrl ? (
            <img src={user.avatarUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <span>{user?.displayName?.charAt(0).toUpperCase() || 'U'}</span>
          )}
        </button>

        {showUserMenu && (
          <div style={{
            position: 'absolute', top: '56px', right: 0, width: '280px', zIndex: 1001,
            backgroundColor: '#121212', borderRadius: '12px',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            boxShadow: '0 8px 32px rgba(59, 130, 246, 0.2)',
            overflow: 'hidden'
          }}
            className="animate-in fade-in zoom-in-95 duration-200 user-menu-dropdown">
            <div style={{ padding: '20px', textAlign: 'center', borderBottom: '1px solid rgba(59, 130, 246, 0.15)' }}>

              <div style={{ width: '64px', height: '64px', borderRadius: '50%', overflow: 'hidden', border: '2px solid #3b82f6', margin: '0 auto 12px', boxShadow: '0 0 15px rgba(59, 130, 246, 0.5)' }}>
                {user?.avatarUrl ? <img src={user.avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', background: 'linear-gradient(to bottom, #2563eb, #1e40af)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 'bold' }}>{user?.displayName?.charAt(0).toUpperCase() || 'U'}</div>}
              </div>
              <p
                style={{ fontSize: '16px', fontWeight: 'bold', color: 'white', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', cursor: 'pointer' }}
                onClick={(e) => {
                  e.stopPropagation();
                  if (user?.username) {
                    setShowUserMenu(false);
                    navigate(`/app/profile/${user.username}`);
                  }
                }}
              >
                {user?.displayName || 'Người dùng'}
              </p>
              <p style={{ fontSize: '12px', color: '#a3a3a3', margin: '4px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email || `@${user?.username}`}</p>
            </div>
            <div style={{ padding: '8px' }}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  setShowUserMenu(false);
                  if (user?.username) {
                    // Route trong App.tsx là: /app/profile/:username
                    navigate(`/app/profile/${user.username}`);
                  }
                }}
                style={{ width: '100%', textAlign: 'left', padding: '10px 12px', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '12px', borderRadius: '6px', transition: 'all 0.2s ease', color: '#d4d4d4', fontWeight: '500', background: 'transparent', border: 'none', cursor: 'pointer', }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.1)'; e.currentTarget.style.color = 'white'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#d4d4d4'; }}
              >
                <UserIcon size={16} style={{ color: '#60a5fa' }} /> Hồ sơ của tôi
              </button>
              <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                <button onClick={() => { setShowUserMenu(false); avatarInputRef.current?.click(); }} style={{ flex: 1, padding: '8px', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', borderRadius: '6px', transition: 'all 0.2s ease', color: '#d4d4d4', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer' }} onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#60a5fa'; e.currentTarget.style.color = '#60a5fa'; }} onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#d4d4d4'; }}>
                  <Camera size={14} /> Avatar
                </button>
                <button onClick={() => { setShowUserMenu(false); bannerInputRef.current?.click(); }} style={{ flex: 1, padding: '8px', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', borderRadius: '6px', transition: 'all 0.2s ease', color: '#d4d4d4', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer' }} onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#60a5fa'; e.currentTarget.style.color = '#60a5fa'; }} onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#d4d4d4'; }}>
                  <ImageIcon size={14} /> Ảnh bìa
                </button>
              </div>
            </div>
            <div style={{ borderTop: '1px solid rgba(59, 130, 246, 0.15)', margin: '0 8px' }}></div>
            <div style={{ padding: '8px' }}>
              <button onClick={handleLogout} style={{ width: '100%', textAlign: 'left', padding: '10px 12px', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '12px', borderRadius: '6px', transition: 'all 0.2s ease', color: '#f87171', fontWeight: 'bold', background: 'transparent', border: 'none', cursor: 'pointer' }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)'; e.currentTarget.style.color = '#ef4444'; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#f87171'; }}>
                <LogOut size={16} /> Đăng xuất
              </button>
            </div>
          </div>
        )}
        <input type="file" ref={avatarInputRef} style={{ display: 'none' }} accept="image/*" onChange={(e) => handleMenuUpload('avatar', e)} />
        <input type="file" ref={bannerInputRef} style={{ display: 'none' }} accept="image/*" onChange={(e) => handleMenuUpload('banner', e)} />
      </div>
    </div>
  </header>
  );
};