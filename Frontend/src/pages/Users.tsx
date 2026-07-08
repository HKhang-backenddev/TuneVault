import { useState, useEffect } from 'react';
import { Search as SearchIcon, User as UserIcon, UserPlus, UserCheck, Music, Loader2, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../axios';
import { useAudio } from '../Contexts/AudioContext';

interface UserResult {
  id: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  isFollowing?: boolean;
  followerCount?: number;
}

interface UsersProps {
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}

const Users = ({ searchQuery = '', onSearchChange }: UsersProps) => {
  const [query, setQuery] = useState(searchQuery);
  const [results, setResults] = useState<UserResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [followingLoading, setFollowingLoading] = useState<string | null>(null);
  const navigate = useNavigate();
  const { playTrack } = useAudio();

  // Sync with external searchQuery from AppHeader
  useEffect(() => {
    if (searchQuery && searchQuery.length >= 2) {
      setQuery(searchQuery);
      handleSearch(searchQuery);
    }
  }, [searchQuery]);

  // Handle local query change
  const handleQueryChange = (newQuery: string) => {
    setQuery(newQuery);
    onSearchChange?.(newQuery);
    if (newQuery.length >= 2) {
      handleSearch(newQuery);
    } else {
      setResults([]);
    }
  };

  const handleSearch = async (searchQuery: string) => {
    if (searchQuery.length < 2) return;
    
    setLoading(true);
    try {
      const res = await api.get(`/user/search?query=${encodeURIComponent(searchQuery)}`);
      setResults(res.data || []);
    } catch (err) {
      console.error('Search users error:', err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async (userId: string, isCurrentlyFollowing: boolean) => {
    setFollowingLoading(userId);
    try {
      const res = await api.post(`/user/${userId}/follow`);
      const { isFollowing } = res.data;
      
      setResults(prev => prev.map(u => 
        u.id === userId 
          ? { ...u, isFollowing } 
          : u
      ));
    } catch (err) {
      console.error('Follow error:', err);
    } finally {
      setFollowingLoading(null);
    }
  };

  const handleUserClick = (username: string) => {
    navigate(`/app/profile/${username}`);
  };

  return (
    <div style={{ 
      padding: '24px 32px', 
      minHeight: '100%',
      background: 'linear-gradient(180deg, rgba(26, 26, 46, 0.8) 0%, rgba(18, 18, 18, 1) 100%)'
    }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ 
          fontSize: '32px', 
          fontWeight: '900', 
          color: '#fff',
          marginBottom: '8px',
          background: 'linear-gradient(90deg, #833ab4, #fd1d1d)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          Find Users
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px' }}>
          Search for people to follow and share music with
        </p>
      </div>

      {/* Search Bar */}
      <div style={{
        position: 'relative',
        maxWidth: '600px',
        marginBottom: '32px'
      }}>
        <div style={{
          position: 'absolute',
          left: '20px',
          top: '50%',
          transform: 'translateY(-50%)',
          color: '#833ab4',
          zIndex: 1,
          pointerEvents: 'none',
          filter: 'drop-shadow(0 0 10px rgba(131, 58, 180, 0.8))',
        }}>
          <SearchIcon size={24} />
        </div>
        <input
          type="text"
          placeholder="Search by username, name, or email..."
          style={{
            width: '100%',
            backgroundColor: 'rgba(26, 26, 46, 0.8)',
            borderRadius: '50px',
            border: '2px solid rgba(131, 58, 180, 0.4)',
            outline: 'none',
            padding: '16px 60px 16px 56px',
            fontSize: '16px',
            color: '#fff',
            transition: 'all 0.3s ease',
            boxShadow: '0 0 20px rgba(131, 58, 180, 0.2)',
          }}
          onFocus={(e) => {
            e.target.style.borderColor = '#833ab4';
            e.target.style.boxShadow = '0 0 30px rgba(131, 58, 180, 0.4), 0 0 60px rgba(253, 29, 29, 0.2)';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = 'rgba(131, 58, 180, 0.4)';
            e.target.style.boxShadow = '0 0 20px rgba(131, 58, 180, 0.2)';
          }}
          value={query}
          onChange={(e) => handleQueryChange(e.target.value)}
        />
        {query && (
          <button
            onClick={() => handleQueryChange('')}
            style={{
              position: 'absolute',
              right: '16px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'rgba(255,255,255,0.1)',
              border: 'none',
              borderRadius: '50%',
              width: '28px',
              height: '28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#b3b3b3',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
              e.currentTarget.style.color = '#fff';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
              e.currentTarget.style.color = '#b3b3b3';
            }}
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          padding: '60px 0',
          color: '#833ab4'
        }}>
          <Loader2 size={32} style={{ animation: 'spin 1s linear infinite' }} />
          <style>{`
            @keyframes spin {
              100% { transform: rotate(360deg); }
            }
          `}</style>
          <span style={{ marginLeft: '12px', fontSize: '16px' }}>Searching...</span>
        </div>
      )}

      {/* Results */}
      {!loading && results.length > 0 && (
        <div>
          <h2 style={{ 
            fontSize: '18px', 
            fontWeight: '700', 
            color: 'rgba(255,255,255,0.8)', 
            marginBottom: '20px' 
          }}>
            {results.length} result{results.length !== 1 ? 's' : ''} found
          </h2>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '16px'
          }}>
            {results.map(user => (
              <div
                key={user.id}
                style={{
                  background: 'linear-gradient(145deg, rgba(26, 26, 46, 0.9), rgba(18, 18, 18, 0.95))',
                  borderRadius: '16px',
                  border: '1px solid rgba(131, 58, 180, 0.3)',
                  padding: '20px',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(131, 58, 180, 0.7)';
                  e.currentTarget.style.boxShadow = '0 0 30px rgba(131, 58, 180, 0.3), 0 0 60px rgba(253, 29, 29, 0.15)';
                  e.currentTarget.style.transform = 'translateY(-4px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(131, 58, 180, 0.3)';
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
                onClick={() => handleUserClick(user.username)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  {/* Avatar */}
                  <div style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    overflow: 'hidden',
                    border: '3px solid',
                    borderImage: 'linear-gradient(135deg, #833ab4, #fd1d1d) 1',
                    boxShadow: '0 0 20px rgba(131, 58, 180, 0.4)',
                    flexShrink: 0,
                  }}>
                    {user.avatarUrl ? (
                      <img 
                        src={user.avatarUrl} 
                        alt={user.displayName}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <div style={{
                        width: '100%',
                        height: '100%',
                        background: 'linear-gradient(135deg, #833ab4, #fd1d1d)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <UserIcon size={28} style={{ color: '#fff' }} />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 style={{ 
                      fontSize: '16px', 
                      fontWeight: '700', 
                      color: '#fff',
                      marginBottom: '4px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {user.displayName}
                    </h3>
                    <p style={{ 
                      fontSize: '13px', 
                      color: '#b3b3b3',
                      marginBottom: '8px'
                    }}>
                      @{user.username}
                    </p>
                    {user.followerCount !== undefined && (
                      <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '4px 10px',
                        backgroundColor: 'rgba(131, 58, 180, 0.2)',
                        borderRadius: '20px',
                        fontSize: '12px',
                        color: '#c084fc'
                      }}>
                        <UserIcon size={12} />
                        {user.followerCount} followers
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Button */}
                <div 
                  style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid rgba(131, 58, 180, 0.2)' }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => handleFollow(user.id, user.isFollowing || false)}
                    disabled={followingLoading === user.id}
                    style={{
                      width: '100%',
                      padding: '10px 16px',
                      borderRadius: '10px',
                      border: 'none',
                      background: user.isFollowing 
                        ? 'linear-gradient(135deg, rgba(131, 58, 180, 0.3), rgba(253, 29, 29, 0.2))'
                        : 'linear-gradient(135deg, #833ab4, #fd1d1d)',
                      color: '#fff',
                      fontWeight: '600',
                      fontSize: '14px',
                      cursor: followingLoading === user.id ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      transition: 'all 0.3s ease',
                      opacity: followingLoading === user.id ? 0.7 : 1,
                      boxShadow: user.isFollowing ? 'none' : '0 4px 15px rgba(131, 58, 180, 0.4)',
                    }}
                    onMouseEnter={(e) => {
                      if (followingLoading !== user.id) {
                        e.currentTarget.style.transform = 'scale(1.02)';
                        e.currentTarget.style.boxShadow = '0 6px 25px rgba(131, 58, 180, 0.6)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1)';
                      e.currentTarget.style.boxShadow = user.isFollowing ? 'none' : '0 4px 15px rgba(131, 58, 180, 0.4)';
                    }}
                  >
                    {followingLoading === user.id ? (
                      <>
                        <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                        Processing...
                      </>
                    ) : user.isFollowing ? (
                      <>
                        <UserCheck size={16} />
                        Following
                      </>
                    ) : (
                      <>
                        <UserPlus size={16} />
                        Follow
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State - No Query */}
      {!loading && !query && (
        <div style={{
          textAlign: 'center',
          padding: '80px 40px',
          background: 'rgba(26, 26, 46, 0.5)',
          borderRadius: '20px',
          border: '1px solid rgba(131, 58, 180, 0.2)',
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(131, 58, 180, 0.3), rgba(253, 29, 29, 0.2))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px',
            boxShadow: '0 0 40px rgba(131, 58, 180, 0.3)',
          }}>
            <SearchIcon size={36} style={{ color: '#833ab4' }} />
          </div>
          <h3 style={{ 
            fontSize: '20px', 
            fontWeight: '700', 
            color: '#fff',
            marginBottom: '12px'
          }}>
            Search for Users
          </h3>
          <p style={{ 
            color: 'rgba(255,255,255,0.6)',
            fontSize: '14px',
            maxWidth: '400px',
            margin: '0 auto'
          }}>
            Enter a username, display name, or email to find and follow other users on TuneVault
          </p>
        </div>
      )}

      {/* Empty State - No Results */}
      {!loading && query.length >= 2 && results.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '80px 40px',
          background: 'rgba(26, 26, 46, 0.5)',
          borderRadius: '20px',
          border: '1px solid rgba(131, 58, 180, 0.2)',
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(253, 29, 29, 0.3), rgba(252, 176, 69, 0.2))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px',
          }}>
            <UserIcon size={36} style={{ color: '#fd1d1d' }} />
          </div>
          <h3 style={{ 
            fontSize: '20px', 
            fontWeight: '700', 
            color: '#fff',
            marginBottom: '12px'
          }}>
            No Users Found
          </h3>
          <p style={{ 
            color: 'rgba(255,255,255,0.6)',
            fontSize: '14px',
            maxWidth: '400px',
            margin: '0 auto'
          }}>
            No users match "{query}". Try a different search term.
          </p>
        </div>
      )}
    </div>
  );
};

export default Users;
