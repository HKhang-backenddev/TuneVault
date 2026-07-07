import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Library, History, Heart, Home, Search, Plus, Music, ListMusic, ChevronLeft, ChevronRight } from 'lucide-react';
import { User } from '@shared-types/user';
import { ShareSidebar } from './ShareSidebar';

const SidebarLibrary = ({ user }: { user: User | null }) => {
  const location = useLocation();

  const menuItems = [
    { name: 'Home', icon: Home, path: '/app' },
    { name: 'Search', icon: Search, path: '/app/search' },
  ];

  const libraryItems = [
    { name: 'Liked Songs', icon: Heart, path: '/app/liked', color: '#1ed760' },
    { name: 'Your Library', icon: Library, path: '/app/library', color: '#00FFFF' },
    { name: 'Download History', icon: History, path: '/app/history', color: '#b3b3b3' },
    { name: 'Shared With Me', icon: ListMusic, path: '/app/shared-with-me', color: '#b3b3b3' },
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

      {/* Main Menu with Neon Hover */}
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
                color: isActive ? '#fff' : '#b3b3b3',
                backgroundColor: isActive ? 'rgba(131, 58, 180, 0.25)' : 'transparent',
                textDecoration: 'none',
                transition: 'all 0.3s ease',
                fontWeight: isActive ? '700' : '500',
                fontSize: '16px',
                position: 'relative',
                overflow: 'hidden',
              }}
              onMouseEnter={(e) => { 
                if (!isActive) { 
                  (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(131, 58, 180, 0.15)'; 
                  (e.currentTarget as HTMLElement).style.color = '#fff';
                  (e.currentTarget as HTMLElement).style.boxShadow = '0 0 20px rgba(131, 58, 180, 0.3)';
                }
              }}
              onMouseLeave={(e) => { 
                if (!isActive) { 
                  (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'; 
                  (e.currentTarget as HTMLElement).style.color = '#b3b3b3'; 
                  (e.currentTarget as HTMLElement).style.boxShadow = 'none';
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
                  background: 'linear-gradient(180deg, #833ab4, #fd1d1d)',
                  borderRadius: '0 4px 4px 0',
                  boxShadow: '0 0 15px rgba(131, 58, 180, 0.8)',
                }} />
              )}
              <item.icon size={24} style={{ 
                filter: isActive ? 'drop-shadow(0 0 8px rgba(131, 58, 180, 0.8))' : 'none'
              }} />
              <span style={{ 
                textShadow: isActive ? '0 0 10px rgba(131, 58, 180, 0.5)' : 'none'
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
                  color: isActive ? '#fff' : '#b3b3b3',
                  backgroundColor: isActive ? 'rgba(131, 58, 180, 0.2)' : 'transparent',
                  textDecoration: 'none',
                  transition: 'all 0.3s ease',
                  marginBottom: '4px',
                  border: isActive ? '1px solid rgba(131, 58, 180, 0.4)' : '1px solid transparent',
                }}
                onMouseEnter={(e) => { 
                  if (!isActive) { 
                    (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(131, 58, 180, 0.15)'; 
                    (e.currentTarget as HTMLElement).style.color = '#fff';
                    (e.currentTarget as HTMLElement).style.borderColor = 'rgba(131, 58, 180, 0.3)';
                    (e.currentTarget as HTMLElement).style.boxShadow = '0 0 15px rgba(131, 58, 180, 0.2)';
                  }
                }}
                onMouseLeave={(e) => { 
                  if (!isActive) { 
                    (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'; 
                    (e.currentTarget as HTMLElement).style.color = '#b3b3b3'; 
                    (e.currentTarget as HTMLElement).style.borderColor = 'transparent';
                    (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                  }
                }}
              >
                <div style={{
                  width: '52px',
                  height: '52px',
                  background: item.name === 'Liked Songs'
                    ? 'linear-gradient(135deg, #833ab4, #fd1d1d)'
                    : item.name === 'Your Library'
                    ? 'linear-gradient(135deg, #00FFFF, #00d4aa)'
                    : 'linear-gradient(135deg, #333, #444)',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  boxShadow: item.name === 'Liked Songs' || item.name === 'Your Library'
                    ? '0 4px 15px rgba(131, 58, 180, 0.4)'
                    : '0 4px 8px rgba(0,0,0,0.3)',
                }}>
                  <item.icon 
                    size={24} 
                    color={item.color} 
                    fill={item.color === '#1ed760' || item.color === '#00FFFF' ? item.color : 'none'}
                    style={{
                      filter: item.color === '#1ed760' || item.color === '#00FFFF' 
                        ? `drop-shadow(0 0 5px ${item.color})` 
                        : 'none'
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
                    color: isActive ? '#fff' : '#b3b3b3',
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
                        <span style={{ color: '#1ed760' }}>♥</span> Playlist • 
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
