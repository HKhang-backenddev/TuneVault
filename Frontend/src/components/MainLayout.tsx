import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Library, History, Heart, Home, Search, Plus, Music, ListMusic, ChevronLeft, ChevronRight } from 'lucide-react';
import { User } from '@shared-types/user';

const SidebarLibrary = ({ user }: { user: User | null }) => {
  const location = useLocation();

  const menuItems = [
    { name: 'Home', icon: Home, path: '/app' },
    { name: 'Search', icon: Search, path: '/app/search' },
  ];

  const libraryItems = [
    { name: 'Liked Songs', icon: Heart, path: '/app/liked', color: '#1DB954' },
    { name: 'Your Library', icon: Library, path: '/app/library', color: '#1DB954' },
    { name: 'Download History', icon: History, path: '/app/history', color: '#b3b3b3' },
    { name: 'Shared With Me', icon: ListMusic, path: '/app/shared-with-me', color: '#b3b3b3' },
  ];

  return (
    <div style={{
      width: '320px',
      height: '100%',
      backgroundColor: '#000000',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>

      {/* Main Menu */}
      <div style={{ padding: '0 12px', marginBottom: '8px' }}>
        {menuItems.map(item => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.name}
              to={item.path}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                padding: '12px 16px',
                borderRadius: '8px',
                color: isActive ? '#fff' : '#b3b3b3',
                backgroundColor: isActive ? '#282828' : 'transparent',
                textDecoration: 'none',
                transition: 'all 0.2s ease',
                fontWeight: isActive ? '700' : '500',
              }}
              onMouseEnter={(e) => { if (!isActive) { (e.currentTarget as HTMLElement).style.backgroundColor = '#282828'; (e.currentTarget as HTMLElement).style.color = '#fff'; }}}
              onMouseLeave={(e) => { if (!isActive) { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#b3b3b3'; }}}
            >
              <item.icon size={24} />
              <span style={{ fontSize: '16px' }}>{item.name}</span>
            </Link>
          );
        })}
      </div>

      {/* Library Section */}
      <div style={{ 
        flex: 1,
        backgroundColor: '#121212',
        borderRadius: '8px',
        margin: '0 8px',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Header */}
        <div style={{ 
          padding: '12px 16px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
        }}>
          <Link 
            to="/app/library" 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px', 
              color: '#b3b3b3', 
              textDecoration: 'none',
              transition: 'color 0.2s',
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = '#fff'; (e.currentTarget.querySelector('span') as HTMLElement).style.color = '#fff'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = '#b3b3b3'; }}
          >
            <Library size={22} />
            <span style={{ fontSize: '15px', fontWeight: '700' }}>Your Library</span>
          </Link>
          <div style={{ display: 'flex', gap: '4px' }}>
            <button 
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                border: 'none',
                backgroundColor: 'transparent',
                color: '#b3b3b3',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s',
              }}
              title="Create playlist"
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = '#282828'; (e.currentTarget as HTMLElement).style.color = '#fff'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#b3b3b3'; }}
            >
              <Plus size={22} />
            </button>
          </div>
        </div>

        {/* Library items */}
        <div style={{ 
          flex: 1,
          overflowY: 'auto',
          padding: '0 8px 8px',
        }}>
          {libraryItems.map(item => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  color: isActive ? '#fff' : '#b3b3b3',
                  backgroundColor: isActive ? 'rgba(255,255,255,0.1)' : 'transparent',
                  textDecoration: 'none',
                  transition: 'all 0.2s ease',
                  marginBottom: '2px',
                }}
                onMouseEnter={(e) => { if (!isActive) { (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(255,255,255,0.1)'; (e.currentTarget as HTMLElement).style.color = '#fff'; } }}
                onMouseLeave={(e) => { if (!isActive) { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#b3b3b3'; } }}
              >
                <div style={{
                  width: '48px',
                  height: '48px',
                  backgroundColor: item.name === 'Liked Songs' 
                    ? 'linear-gradient(135deg, #450af5, #e81b76)' 
                    : '#333',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
                }}>
                  <item.icon size={24} color={item.color} fill={item.color === '#1DB954' ? item.color : 'none'} />
                </div>
                <div style={{ overflow: 'hidden' }}>
                  <span style={{ fontSize: '15px', fontWeight: '500', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</span>
                  <span style={{ fontSize: '11px', color: '#b3b3b3', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                    {item.name === 'Liked Songs' && 'Playlist • '}
                    {item.name === 'Your Library' && 'Playlist • '}
                    {item.name === 'Download History' && 'Personal • '}
                    {item.name === 'Shared With Me' && 'Personal • '}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Playlist divider line */}
      <div style={{ 
        height: '1px', 
        backgroundColor: '#282828', 
        margin: '8px 16px' 
      }} />

      {/* Playlist list (placeholder) */}
      <div style={{ 
        flex: 1,
        overflowY: 'auto',
        padding: '0 8px 16px',
      }}>
        <p style={{ fontSize: '12px', color: '#b3b3b3', padding: '8px 8px', textAlign: 'center' }}>
          Create playlists to organize your music
        </p>
      </div>
    </div>
  );
};

const MainLayout = ({ user, children }: { user: User | null, children: React.ReactNode }) => {
    return (
        <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden', backgroundColor: '#121212' }}>
            {/* Sidebar trai */}
            <SidebarLibrary user={user} />
            
            {/* Noi dung chinh */}
            <div style={{ 
              flex: 1, 
              overflowY: 'auto',
              overflowX: 'hidden',
            }} className="custom-scrollbar">
              {children}
            </div>
        </div>
    );
};

export default MainLayout;
