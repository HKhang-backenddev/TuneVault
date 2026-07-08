import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Library, History, Heart, Home, Search, Plus, Music, ListMusic, ChevronLeft, ChevronRight, Users, User as UserIcon } from 'lucide-react';
import { User } from '@shared-types/user';
import { ShareSidebar } from './ShareSidebar';

const SidebarLibrary = ({ user }: { user: User | null }) => {
  const location = useLocation();

  // Neon color palette for menu items
  const neonColors = {
    home: '#00FFFF',       // Cyan neon
    search: '#FF00FF',      // Magenta neon
    users: '#FFFF00',       // Yellow neon
    profile: '#FF6B6B',     // Coral neon
    liked: '#FF1493',       // Deep Pink neon
    library: '#00FF7F',     // Spring Green neon
    history: '#FFD700',     // Gold neon
    shared: '#FF69B4',      // Hot Pink neon
  };

  const menuItems = [
    { name: 'Home', icon: Home, path: '/app', color: neonColors.home, glow: 'rgba(0, 255, 255, 0.5)' },
    { name: 'Search Songs', icon: Search, path: '/app/search', color: neonColors.search, glow: 'rgba(255, 0, 255, 0.5)' },
    { name: 'Find Users', icon: Users, path: '/app/users', color: neonColors.users, glow: 'rgba(255, 255, 0, 0.5)' },
    { name: 'My Profile', icon: UserIcon, path: user ? `/app/profile/${user.username}` : '/app', color: neonColors.profile, glow: 'rgba(255, 107, 107, 0.5)' },
  ];

  const libraryItems = [
    { name: 'Liked Songs', icon: Heart, path: '/app/liked', color: neonColors.liked, glow: 'rgba(255, 20, 147, 0.5)' },
    { name: 'Your Library', icon: Library, path: '/app/library', color: neonColors.library, glow: 'rgba(0, 255, 127, 0.5)' },
    { name: 'Download History', icon: History, path: '/app/history', color: neonColors.history, glow: 'rgba(255, 215, 0, 0.5)' },
    { name: 'Shared With Me', icon: ListMusic, path: '/app/shared-with-me', color: neonColors.shared, glow: 'rgba(255, 105, 180, 0.5)' },
  ];

  return (
    <div style={{
      width: '320px',
      height: '100%',
      background: 'linear-gradient(180deg, rgba(18, 18, 18, 1) 0%, rgba(26, 26, 46, 0.9) 100%)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      borderRight: '1px solid rgba(131, 58, 180, 0.3)',
      boxShadow: '5px 0 30px rgba(131, 58, 180, 0.15)',
    }}>

      {/* Main Menu with Neon Effects */}
      <div style={{ padding: '16px 12px 8px' }}>
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
                padding: '14px 18px',
                borderRadius: '10px',
                color: isActive ? item.color : '#b3b3b3',
                backgroundColor: isActive ? `${item.color}20` : 'transparent',
                textDecoration: 'none',
                transition: 'all 0.3s ease',
                fontWeight: isActive ? '700' : '500',
                fontSize: '16px',
                position: 'relative',
                overflow: 'hidden',
                border: isActive ? `1px solid ${item.color}50` : '1px solid transparent',
              }}
              onMouseEnter={(e) => { 
                (e.currentTarget as HTMLElement).style.backgroundColor = `${item.color}15`;
                (e.currentTarget as HTMLElement).style.color = item.color;
                (e.currentTarget as HTMLElement).style.boxShadow = `0 0 20px ${item.glow}, inset 0 0 15px ${item.glow}`;
                (e.currentTarget as HTMLElement).style.borderColor = `${item.color}40`;
              }}
              onMouseLeave={(e) => { 
                if (!isActive) {
                  (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
                  (e.currentTarget as HTMLElement).style.color = '#b3b3b3';
                  (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                  (e.currentTarget as HTMLElement).style.borderColor = 'transparent';
                } else {
                  (e.currentTarget as HTMLElement).style.backgroundColor = `${item.color}20`;
                  (e.currentTarget as HTMLElement).style.color = item.color;
                  (e.currentTarget as HTMLElement).style.borderColor = `${item.color}50`;
                  (e.currentTarget as HTMLElement).style.boxShadow = `0 0 15px ${item.glow}`;
                }
              }}
            >
              {isActive && (
                <div style={{
                  position: 'absolute',
                  left: 0,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '4px',
                  height: '60%',
                  background: item.color,
                  borderRadius: '0 4px 4px 0',
                  boxShadow: `0 0 15px ${item.color}`,
                }} />
              )}
              <item.icon size={24} style={{
                filter: `drop-shadow(0 0 8px ${item.color})`,
                color: item.color,
              }} />
              <span style={{
                textShadow: isActive ? `0 0 10px ${item.glow}` : 'none'
              }}>{item.name}</span>
            </Link>
          );
        })}
      </div>

      {/* Library Section with Neon Border */}
      <div style={{
        flex: 1,
        background: 'linear-gradient(145deg, rgba(24, 24, 36, 0.8), rgba(26, 26, 46, 0.6))',
        borderRadius: '12px',
        margin: '0 8px',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        border: '1px solid rgba(131, 58, 180, 0.2)',
        boxShadow: 'inset 0 0 30px rgba(131, 58, 180, 0.05)',
      }}>
        {/* Header */}
        <div style={{
          padding: '16px',
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
            onMouseEnter={(e) => { 
              (e.currentTarget as HTMLElement).style.color = '#fff'; 
            }}
            onMouseLeave={(e) => { 
              (e.currentTarget as HTMLElement).style.color = '#b3b3b3'; 
            }}
          >
            <Library size={22} style={{ 
              filter: 'drop-shadow(0 0 5px rgba(0, 255, 255, 0.5))'
            }} />
            <span style={{ 
              fontSize: '15px', 
              fontWeight: '700',
              textShadow: '0 0 10px rgba(0, 255, 255, 0.3)'
            }}>Your Library</span>
          </Link>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                border: 'none',
                backgroundColor: 'transparent',
                color: '#b3b3b3',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.3s',
              }}
              title="Create playlist"
              onMouseEnter={(e) => { 
                (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(131, 58, 180, 0.3)'; 
                (e.currentTarget as HTMLElement).style.color = '#fff';
                (e.currentTarget as HTMLElement).style.boxShadow = '0 0 15px rgba(131, 58, 180, 0.5)';
              }}
              onMouseLeave={(e) => { 
                (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'; 
                (e.currentTarget as HTMLElement).style.color = '#b3b3b3';
                (e.currentTarget as HTMLElement).style.boxShadow = 'none';
              }}
            >
              <Plus size={22} />
            </button>
          </div>
        </div>

        {/* Library items with Neon Effects */}
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
                  padding: '10px 12px',
                  borderRadius: '8px',
                  color: isActive ? item.color : '#b3b3b3',
                  backgroundColor: isActive ? `${item.color}15` : 'transparent',
                  textDecoration: 'none',
                  transition: 'all 0.3s ease',
                  marginBottom: '4px',
                  border: isActive ? `1px solid ${item.color}40` : '1px solid transparent',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.backgroundColor = `${item.color}10`;
                  (e.currentTarget as HTMLElement).style.color = item.color;
                  (e.currentTarget as HTMLElement).style.borderColor = `${item.color}30`;
                  (e.currentTarget as HTMLElement).style.boxShadow = `0 0 15px ${item.glow}`;
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
                    (e.currentTarget as HTMLElement).style.color = '#b3b3b3';
                    (e.currentTarget as HTMLElement).style.borderColor = 'transparent';
                    (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                  } else {
                    (e.currentTarget as HTMLElement).style.backgroundColor = `${item.color}15`;
                    (e.currentTarget as HTMLElement).style.color = item.color;
                    (e.currentTarget as HTMLElement).style.borderColor = `${item.color}40`;
                    (e.currentTarget as HTMLElement).style.boxShadow = `0 0 10px ${item.glow}`;
                  }
                }}
              >
                <div style={{
                  width: '52px',
                  height: '52px',
                  background: `linear-gradient(135deg, ${item.color}, ${item.color}80)`,
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  boxShadow: `0 4px 15px ${item.glow}`,
                  border: `1px solid ${item.color}60`,
                }}>
                  <item.icon
                    size={24}
                    color="#fff"
                    fill="#fff"
                    style={{
                      filter: `drop-shadow(0 0 5px ${item.color})`,
                    }}
                  />
                </div>
                <div style={{ overflow: 'hidden' }}>
                  <span style={{
                    fontSize: '15px',
                    fontWeight: '500',
                    display: 'block',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    color: isActive ? item.color : '#b3b3b3',
                    textShadow: isActive ? `0 0 10px ${item.glow}` : 'none',
                  }}>{item.name}</span>
                  <span style={{
                    fontSize: '11px',
                    color: '#888',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    marginTop: '2px'
                  }}>
                    {item.name === 'Liked Songs' && (
                      <>
                        <span style={{ color: item.color }}>♥</span> Playlist •
                      </>
                    )}
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

      {/* Playlist divider line with neon glow */}
      <div style={{
        height: '1px',
        background: 'linear-gradient(90deg, transparent, rgba(131, 58, 180, 0.5), transparent)',
        margin: '12px 16px',
        boxShadow: '0 0 10px rgba(131, 58, 180, 0.3)',
      }} />

      {/* Playlist list */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '0 8px 16px',
      }}>
        <p style={{ 
          fontSize: '13px', 
          color: '#888', 
          padding: '12px 12px', 
          textAlign: 'center',
          background: 'rgba(131, 58, 180, 0.05)',
          borderRadius: '8px',
          border: '1px solid rgba(131, 58, 180, 0.1)',
        }}>
          Create playlists to organize your music
        </p>
      </div>
    </div>
  );
};

const MainLayout = ({ user, children }: { user: User | null, children: React.ReactNode }) => {
    return (
        <div style={{ 
          display: 'flex', 
          height: '100vh', 
          width: '100vw', 
          overflow: 'hidden', 
          backgroundColor: '#121212',
          position: 'relative'
        }}>
            {/* Background ambient glow */}
            <div style={{
              position: 'absolute',
              top: '0',
              left: '320px',
              width: '500px',
              height: '500px',
              background: 'radial-gradient(circle, rgba(131, 58, 180, 0.1) 0%, transparent 70%)',
              pointerEvents: 'none',
              zIndex: 0,
            }} />
            
            {/* Sidebar */}
            <SidebarLibrary user={user} />

            {/* Main content */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              overflowX: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
              zIndex: 1,
            }} className="custom-scrollbar neon-scrollbar">
              <div style={{ flex: 1 }}>
                {children}
              </div>
              <ShareSidebar user={user} />
            </div>
        </div>
    );
};

export default MainLayout;
