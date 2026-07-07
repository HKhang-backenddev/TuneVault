import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Library, History, Heart, Home, Search, Plus, Music } from 'lucide-react';
import { User } from '@shared-types/user';

const SidebarLibrary = ({ user }: { user: User | null }) => {
  const location = useLocation();

  const menuItems = [
    { name: 'Trang chu', icon: Home, path: '/app' },
    { name: 'Tim kiem', icon: Search, path: '/app/search' },
  ];

  const libraryItems = [
    { name: 'Thu vien cua ban', icon: Library, path: '/app/library', color: '#1DB954' },
    { name: 'Da thich', icon: Heart, path: '/app/liked', color: '#1DB954' },
    { name: 'Lich su nghe', icon: History, path: '/app/history', color: '#b3b3b3' },
  ];

  return (
    <div style={{
      width: '280px',
      height: '100%',
      backgroundColor: '#000000',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>
      {/* Logo */}
      <div style={{ padding: '24px 24px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          width: '36px',
          height: '36px',
          backgroundColor: '#1DB954',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Music size={22} color="black" />
        </div>
        <span style={{ fontSize: '20px', fontWeight: '700', color: '#fff' }}>TuneVault</span>
      </div>

      {/* Menu chinh */}
      <div style={{ padding: '8px 12px', marginBottom: '8px' }}>
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
                borderRadius: '6px',
                color: '#b3b3b3',
                textDecoration: 'none',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = '#282828'; (e.currentTarget as HTMLElement).style.color = '#fff'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#b3b3b3'; }}
            >
              <item.icon size={24} />
              <span style={{ fontSize: '15px', fontWeight: '500' }}>{item.name}</span>
            </Link>
          );
        })}
      </div>

      {/* Thu vien */}
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
          padding: '16px 16px 12px', 
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
            }}
            onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.color = '#fff'}
            onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.color = '#b3b3b3'}
          >
            <Library size={22} />
            <span style={{ fontSize: '14px', fontWeight: '700' }}>Thu vien</span>
          </Link>
          <button style={{
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
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = '#282828'; (e.currentTarget as HTMLElement).style.color = '#fff'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#b3b3b3'; }}
          >
            <Plus size={20} />
          </button>
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
                  backgroundColor: isActive ? '#282828' : 'transparent',
                  textDecoration: 'none',
                  transition: 'all 0.2s ease',
                  marginBottom: '4px',
                }}
                onMouseEnter={(e) => { if (!isActive) { (e.currentTarget as HTMLElement).style.backgroundColor = '#282828'; (e.currentTarget as HTMLElement).style.color = '#fff'; } }}
                onMouseLeave={(e) => { if (!isActive) { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#b3b3b3'; } }}
              >
                <div style={{
                  width: '48px',
                  height: '48px',
                  backgroundColor: '#333',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <item.icon size={24} color={item.color} />
                </div>
                <span style={{ fontSize: '14px', fontWeight: '500', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</span>
              </Link>
            );
          })}
        </div>
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
