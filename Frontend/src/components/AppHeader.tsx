import React from 'react';
import { Location, NavigateFunction } from 'react-router-dom';
import {
  Search as SearchIcon, Plus, Home as HomeIcon, Bell, LogOut, User as UserIcon, Camera, Image as ImageIcon
} from 'lucide-react';
import { User } from '@shared-types/user';

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

export const AppHeader = ({ user, handleLogout, goHome, showUserMenu, setShowUserMenu, avatarInputRef, bannerInputRef, handleMenuUpload, navigate, location, searchQuery, setSearchQuery }: AppHeaderProps) => (
  <header style={{
    zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    height: '64px', padding: '0 24px', backgroundColor: '#181818',
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
        <h1 className="text-2xl font-black tracking-tighter text-white drop-shadow-[0_0_10px_rgba(29,185,84,0.5)] transition-all group-hover:tracking-normal group-hover:text-green-100">TuneVault</h1>
      </div>
    </div>

    <div style={{ flex: '2', display: 'flex', justifyContent: 'center' }}>
      <div style={{ position: 'relative', width: '100%', maxWidth: '600px' }}>
        <SearchIcon style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#b3b3b3' }} size={18} />
        <input
          type="text" placeholder="Search songs, artists..."
          style={{ width: '100%', backgroundColor: '#242424', borderRadius: '24px', padding: '10px 16px 10px 48px', fontSize: '14px', color: 'white', outline: 'none' }}
          value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
    </div>

    <div style={{ flex: '1', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '12px' }}>
      <nav style={{ display: 'flex', alignItems: 'center', gap: '10px', marginRight: '12px' }}>
        <button
          onClick={() => navigate('/app/import')}
          style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: location.pathname.includes('/import') ? '#1DB954' : 'transparent', color: location.pathname.includes('/import') ? 'black' : '#b3b3b3', border: '1px solid #b3b3b3' }}
          className="flex items-center justify-center transition hover:scale-110"
        >
          <Plus size={24} />
        </button>

        <button
          onClick={goHome}
          style={{
            width: '40px', height: '40px', borderRadius: '50%',
            backgroundColor: (location.pathname === '/app' || location.pathname === '/app/') ? '#1DB954' : 'transparent',
            color: (location.pathname === '/app' || location.pathname === '/app/') ? 'black' : '#b3b3b3',
            border: '1px solid #b3b3b3'
          }} className="flex items-center justify-center transition hover:scale-110"
        >
          <HomeIcon size={20} fill="currentColor" />
        </button>
      </nav>
      <button
        onClick={() => navigate('/app/notifications')}
        style={{
          position: 'relative',
          width: '40px', height: '40px', borderRadius: '50%',
          backgroundColor: location.pathname.includes('/notifications') ? '#1DB954' : 'transparent',
          color: location.pathname.includes('/notifications') ? 'black' : '#b3b3b3',
          border: '1px solid #b3b3b3'
        }}
        className="flex items-center justify-center transition hover:scale-110"
      >
        <Bell size={20} fill={location.pathname === '/notifications' ? "currentColor" : "none"} />
        {user?.hasUnreadNotifications && (
          <span style={{
            position: 'absolute', top: '6px', right: '6px', width: '10px', height: '10px',
            borderRadius: '50%', backgroundColor: '#1DB954', border: '2px solid #181818'
          }}></span>
        )}
      </button>

      <div className="relative" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowUserMenu(!showUserMenu);
          }}
          style={{ width: '40px', height: '40px', borderRadius: '50%', border: '2px solid #1DB954' }}
          className="flex-shrink-0 flex items-center justify-center font-bold text-sm cursor-pointer transition-all text-white overflow-hidden hover:scale-110"
          title="View your profile"
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
            backgroundColor: '#181818', borderRadius: '8px',
            border: '1px solid #282828',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)',
            overflow: 'hidden'
          }}
            className="animate-in fade-in zoom-in-95 duration-200">
            <div style={{ padding: '20px', textAlign: 'center', borderBottom: '1px solid #282828' }}>

              <div style={{ width: '64px', height: '64px', borderRadius: '50%', overflow: 'hidden', border: '2px solid #1DB954', margin: '0 auto 12px' }}>
                {user?.avatarUrl ? <img src={user.avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #1DB954, #169c46)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 'bold', color: 'white' }}>{user?.displayName?.charAt(0).toUpperCase() || 'U'}</div>}
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
                {user?.displayName || 'User'}
              </p>
              <p style={{ fontSize: '12px', color: '#b3b3b3', margin: '4px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email || `@${user?.username}`}</p>
            </div>
            <div style={{ padding: '8px' }}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  setShowUserMenu(false);
                  if (user?.username) {
                    navigate(`/app/profile/${user.username}`);
                  }
                }}
                style={{ width: '100%', textAlign: 'left', padding: '10px 12px', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '12px', borderRadius: '4px', transition: 'all 0.2s ease', color: '#b3b3b3', fontWeight: '500', background: 'transparent', border: 'none', cursor: 'pointer', }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#282828'; e.currentTarget.style.color = 'white'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#b3b3b3'; }}
              >
                <UserIcon size={16} style={{ color: '#1DB954' }} /> My Profile
              </button>
              <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                <button onClick={() => { setShowUserMenu(false); avatarInputRef.current?.click(); }} style={{ flex: 1, padding: '8px', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', borderRadius: '4px', transition: 'all 0.2s ease', color: '#b3b3b3', background: '#282828', border: 'none', cursor: 'pointer' }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#333'; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#282828'; }}>
                  <Camera size={14} /> Avatar
                </button>
                <button onClick={() => { setShowUserMenu(false); bannerInputRef.current?.click(); }} style={{ flex: 1, padding: '8px', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', borderRadius: '4px', transition: 'all 0.2s ease', color: '#b3b3b3', background: '#282828', border: 'none', cursor: 'pointer' }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#333'; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#282828'; }}>
                  <ImageIcon size={14} /> Banner
                </button>
              </div>
            </div>
            <div style={{ borderTop: '1px solid #282828', margin: '0 8px' }}></div>
            <div style={{ padding: '8px' }}>
              <button onClick={handleLogout} style={{ width: '100%', textAlign: 'left', padding: '10px 12px', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '12px', borderRadius: '4px', transition: 'all 0.2s ease', color: '#f87171', fontWeight: 'bold', background: 'transparent', border: 'none', cursor: 'pointer' }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#282828'; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}>
                <LogOut size={16} /> Log Out
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