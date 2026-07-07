import React, { useState, useRef, useEffect } from 'react';
import { User, Calendar, ShieldCheck, Music, ListMusic, Camera, Globe, Twitter, Github, MapPin, Edit, Save, X, UserPlus, UserCheck, LogOut, ExternalLink, Play } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../axios';
import { useAudio } from '../Contexts/AudioContext';

interface ProfileProps {
  currentUser: {
    displayName: string;
    email?: string;
    id: string;
    username: string;
    avatarUrl?: string;
    bannerUrl?: string;
    createdAt?: string;
    bio?: string;
    location?: string;
    websiteUrl?: string;
    twitterUrl?: string;
    githubUrl?: string;
    gender?: string;
    dateOfBirth?: string;
    lastUpdatedAt?: string;
    followerCount?: number;
    followingCount?: number;
    isFollowing?: boolean;
  } | null;
  onUpdate?: () => void;
  onLogout?: () => void;
}

interface MediaItem {
  id: string;
  title: string;
  artist: string;
  url: string;
  thumbnailUrl: string;
  durationInSeconds?: number;
  isLiked?: boolean;
}

interface PlaylistItem {
  id: string;
  title: string;
  description?: string;
  coverUrl?: string;
}

const Profile = ({ currentUser, onUpdate, onLogout }: ProfileProps) => {
  const navigate = useNavigate();
  const { username } = useParams<{ username: string }>();
  const [profileUser, setProfileUser] = useState<ProfileProps['currentUser']>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [uploading, setUploading] = useState(false);
  const [isHoveringAvatar, setIsHoveringAvatar] = useState(false);
  const [isHoveringBanner, setIsHoveringBanner] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info', text: string } | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedBio, setEditedBio] = useState('');
  const [editedLocation, setEditedLocation] = useState('');
  const [editedWebsite, setEditedWebsite] = useState('');
  const [userSongs, setUserSongs] = useState<MediaItem[]>([]);
  const [userPlaylists, setUserPlaylists] = useState<PlaylistItem[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const { playTrack, currentTrack, isPlaying } = useAudio();

  const isOwnProfile = currentUser?.username === username;

  const formatTime = (seconds?: number) => {
    if (!seconds || isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const fetchProfileData = async () => {
    if (!username && currentUser) {
      setProfileUser(currentUser);
      setIsFollowing(currentUser?.isFollowing || false);
      setFollowerCount(currentUser?.followerCount || 0);
      setIsLoading(false);
      return;
    }
    
    if (!username) {
      setIsLoading(false);
      return;
    }
    
    if (isOwnProfile && currentUser) {
      setProfileUser(currentUser);
      setIsFollowing(currentUser?.isFollowing || false);
      setFollowerCount(currentUser?.followerCount || 0);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.get(`/User/profile/${username}`);
      setProfileUser(res.data);
      setIsFollowing(res.data.isFollowing || false);
      setFollowerCount(res.data.followerCount || 0);
    } catch (error) {
      console.error("Unable to load user profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, [username, currentUser]);

  useEffect(() => {
    const fetchDataForTabs = async () => {
      if (profileUser) {
        try {
          const songsRes = await api.get('/media');
          setUserSongs(songsRes.data?.items || []);
          const endpoint = isOwnProfile ? '/playlists/mine' : `/playlists/user/${profileUser.id}`;
          const playlistsRes = await api.get(endpoint);
          setUserPlaylists(playlistsRes.data || []);
        } catch (error) {
          console.warn("Error loading tab data:", error);
        }
      }
    };
    if (profileUser) {
      fetchDataForTabs();
    }
  }, [profileUser]);

  useEffect(() => {
    if (statusMessage) {
      const timer = setTimeout(() => setStatusMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [statusMessage]);

  const handleAvatarClick = () => fileInputRef.current?.click();
  const handleBannerClick = () => bannerInputRef.current?.click();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const currentToken = localStorage.getItem('token');
    if (!currentToken || currentToken === "dev-token-bypass") {
      setStatusMessage({ type: 'error', text: "Please log in to upload avatar!" });
      e.target.value = '';
      return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      await api.post('/User/avatar', formData);
      setStatusMessage({ type: 'success', text: "Avatar updated!" });
      if (onUpdate) onUpdate();
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: "Cannot upload avatar" });
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleBannerChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      await api.post('/User/banner', formData);
      setStatusMessage({ type: 'success', text: "Banner updated!" });
      if (onUpdate) onUpdate();
    } catch (err) {
      setStatusMessage({ type: 'error', text: "Cannot upload banner" });
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleFollowToggle = async () => {
    if (!profileUser || !currentUser) {
      navigate('/app/login');
      return;
    }
    const newFollowingState = !isFollowing;
    setIsFollowing(newFollowingState);
    setFollowerCount(prev => newFollowingState ? prev + 1 : prev - 1);
    try {
      await api.post(`/User/${profileUser.id}/follow`);
      fetchProfileData();
    } catch (error) {
      setIsFollowing(!newFollowingState);
      setFollowerCount(prev => newFollowingState ? prev - 1 : prev + 1);
    }
  };

  const handleSaveProfile = async () => {
    try {
      await api.put('/User/profile', {
        bio: editedBio,
        location: editedLocation,
        websiteUrl: editedWebsite
      });
      setIsEditing(false);
      setStatusMessage({ type: 'success', text: "Profile updated!" });
      if (onUpdate) onUpdate();
    } catch (err) {
      setStatusMessage({ type: 'error', text: "Cannot update profile" });
    }
  };

  if (isLoading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        backgroundColor: '#121212', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        <div style={{ 
          width: '48px', 
          height: '48px', 
          border: '4px solid #333', 
          borderTopColor: '#1ed760',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const displayUser = isOwnProfile ? currentUser : profileUser;
  const bannerUrl = displayUser?.bannerUrl || null;
  const avatarUrl = displayUser?.avatarUrl || null;
  const displayName = displayUser?.displayName || displayUser?.username || 'User';
  const userBio = displayUser?.bio || 'No bio yet';
  const userLocation = displayUser?.location || null;
  const totalSongs = userSongs.length;
  const totalPlaylists = userPlaylists.length;

  if (!displayUser && !isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#121212',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff'
      }}>
        <h1 style={{ fontSize: '48px', marginBottom: '16px' }}>User not found</h1>
        <button 
          onClick={() => navigate('/app')}
          style={{
            padding: '12px 32px',
            borderRadius: '24px',
            backgroundColor: '#1ed760',
            border: 'none',
            color: '#000',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          Go Home
        </button>
      </div>
    );
  }

  if (!displayUser) return null;

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#121212',
      color: '#fff'
    }}>
      <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" style={{ display: 'none' }} />
      <input type="file" ref={bannerInputRef} onChange={handleBannerChange} accept="image/*" style={{ display: 'none' }} />

      {statusMessage && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          padding: '16px 24px',
          borderRadius: '8px',
          backgroundColor: statusMessage.type === 'success' ? 'rgba(30, 215, 96, 0.95)' : 
                           statusMessage.type === 'error' ? 'rgba(255, 59, 48, 0.95)' : 
                           'rgba(30, 132, 255, 0.95)',
          color: '#fff',
          fontWeight: 'bold',
          zIndex: 1000,
          boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
        }}>
          {statusMessage.text}
        </div>
      )}

      {/* Profile Header */}
      <div style={{
        position: 'relative',
        background: `linear-gradient(180deg, rgba(131, 58, 180, 0.9) 0%, rgba(225, 48, 108, 0.6) 30%, rgba(245, 130, 131, 0.4) 60%, #121212 100%)`,
        paddingBottom: '32px'
      }}>
        <div 
          style={{
            height: '400px',
            background: bannerUrl ? `url(${bannerUrl}) center/cover` : 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
            position: 'relative',
            cursor: isOwnProfile ? 'pointer' : 'default'
          }}
          onClick={isOwnProfile ? handleBannerClick : undefined}
          onMouseEnter={() => setIsHoveringBanner(true)}
          onMouseLeave={() => setIsHoveringBanner(false)}
        >
          {isOwnProfile && isHoveringBanner && (
            <div style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: 'rgba(0,0,0,0.6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              gap: '8px'
            }}>
              <Camera size={48} style={{ color: '#fff' }} />
              <span style={{ color: '#fff', fontSize: '14px' }}>Change Banner</span>
            </div>
          )}
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '200px',
            background: 'linear-gradient(transparent, rgba(18,18,18,0.95))'
          }} />
        </div>

        <div style={{ 
          position: 'absolute', 
          bottom: '32px', 
          left: '32px', 
          display: 'flex', 
          alignItems: 'flex-end', 
          gap: '24px' 
        }}>
          <div 
            style={{ 
              position: 'relative',
              cursor: isOwnProfile ? 'pointer' : 'default'
            }}
            onClick={isOwnProfile ? handleAvatarClick : undefined}
            onMouseEnter={() => setIsHoveringAvatar(true)}
            onMouseLeave={() => setIsHoveringAvatar(false)}
          >
            <div style={{
              width: '240px',
              height: '240px',
              borderRadius: '50%',
              background: avatarUrl ? `url(${avatarUrl}) center/cover` : 'linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045)',
              border: '5px solid #121212',
              boxShadow: '0 0 50px rgba(131, 58, 180, 0.8), 0 0 100px rgba(253, 29, 29, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {!avatarUrl && <User size={110} style={{ color: '#fff', opacity: 0.9 }} />}
            </div>
            {isOwnProfile && isHoveringAvatar && (
              <div style={{
                position: 'absolute',
                inset: '5px',
                borderRadius: '50%',
                backgroundColor: 'rgba(0,0,0,0.6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Camera size={40} style={{ color: '#fff' }} />
              </div>
            )}
          </div>

          <div style={{ paddingBottom: '8px' }}>
            <p style={{ fontSize: '14px', fontWeight: 'bold', color: '#fff', margin: 0 }}>Profile</p>
            <h1 style={{ 
              fontSize: '72px', 
              fontWeight: '900', 
              color: '#fff', 
              margin: '0 0 12px 0',
              textShadow: '0 0 40px rgba(131, 58, 180, 0.9)',
              lineHeight: 1
            }}>{displayName}</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#e0e0e0', fontSize: '14px' }}>
              <span style={{ color: '#1ed760', fontSize: '10px' }}>●</span>
              <span>{totalSongs} songs</span>
              <span> - </span>
              <span>{totalPlaylists} playlists</span>
              <span> - </span>
              <span style={{ fontWeight: 'bold' }}>{followerCount} followers</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ 
        padding: '24px 32px', 
        display: 'flex', 
        alignItems: 'center', 
        gap: '16px',
        backgroundColor: '#121212'
      }}>
        {!isOwnProfile && (
          <button
            onClick={handleFollowToggle}
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '50%',
              backgroundColor: '#1ed760',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 30px rgba(30, 215, 96, 0.6)'
            }}
          >
            {isFollowing ? <UserCheck size={26} style={{ color: '#000' }} /> : <UserPlus size={26} style={{ color: '#000' }} />}
          </button>
        )}
        
        {isOwnProfile && (
          <>
            <button
              onClick={() => { setIsEditing(true); setEditedBio(userBio || ''); setEditedLocation(userLocation || ''); setEditedWebsite(displayUser?.websiteUrl || ''); }}
              style={{
                padding: '12px 32px',
                borderRadius: '24px',
                backgroundColor: 'transparent',
                border: '2px solid #b3b3b3',
                color: '#fff',
                fontWeight: 'bold',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <Edit size={18} /> Edit Profile
            </button>
            <button
              onClick={onLogout}
              style={{
                padding: '12px 32px',
                borderRadius: '24px',
                backgroundColor: 'transparent',
                border: '2px solid #b3b3b3',
                color: '#fff',
                fontWeight: 'bold',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <LogOut size={18} /> Logout
            </button>
          </>
        )}
      </div>

      {/* Tabs */}
      <div style={{ 
        padding: '0 32px', 
        display: 'flex', 
        gap: '40px',
        borderBottom: '1px solid #282828',
        backgroundColor: '#121212'
      }}>
        {['overview', 'songs', 'playlists'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '20px 0',
              backgroundColor: 'transparent',
              border: 'none',
              color: activeTab === tab ? '#fff' : '#b3b3b3',
              fontWeight: 'bold',
              fontSize: '16px',
              cursor: 'pointer',
              position: 'relative',
              textTransform: 'capitalize'
            }}
          >
            {tab}
            {activeTab === tab && (
              <div style={{
                position: 'absolute',
                bottom: '-1px',
                left: 0,
                right: 0,
                height: '3px',
                background: 'linear-gradient(90deg, #833ab4, #fd1d1d, #fcb045)',
                boxShadow: '0 0 15px rgba(131, 58, 180, 0.8)'
              }} />
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ padding: '32px' }}>
        {activeTab === 'overview' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
            
            {/* TOP TRACKS - Horizontal Scroll */}
            {userSongs.length > 0 && (
              <div>
                <h2 style={{ 
                  fontSize: '32px', 
                  fontWeight: 'bold', 
                  marginBottom: '24px', 
                  color: '#fff',
                  textShadow: '0 0 30px rgba(131, 58, 180, 0.6)'
                }}>
                  Top Tracks
                </h2>
                <div style={{
                  display: 'flex',
                  gap: '20px',
                  overflowX: 'auto',
                  paddingBottom: '24px',
                  paddingLeft: '4px',
                  scrollSnapType: 'x mandatory'
                }}>
                  <style>{`
                    div::-webkit-scrollbar { height: 6px; }
                    div::-webkit-scrollbar-track { background: #1a1a1a; border-radius: 3px; }
                    div::-webkit-scrollbar-thumb { background: #444; border-radius: 3px; }
                    .track-card:hover .play-overlay { opacity: 1 !important; transform: translateY(0) scale(1) !important; }
                    @keyframes bounce { from { height: 4px; } to { height: 14px; } }
                  `}</style>
                  {userSongs.slice(0, 12).map((song, index) => {
                    const isCurrent = currentTrack?.id === song.id;
                    return (
                      <div
                        key={song.id}
                        onClick={() => playTrack(song, userSongs)}
                        className="track-card"
                        style={{
                          minWidth: '180px',
                          maxWidth: '180px',
                          background: isCurrent 
                            ? 'linear-gradient(145deg, rgba(30, 215, 96, 0.15), rgba(131, 58, 180, 0.15))' 
                            : 'linear-gradient(145deg, #1e1e1e, #252525)',
                          padding: '14px',
                          borderRadius: '12px',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          border: isCurrent ? '1px solid rgba(30, 215, 96, 0.5)' : '1px solid transparent',
                          boxShadow: isCurrent ? '0 0 25px rgba(30, 215, 96, 0.25)' : 'none',
                          scrollSnapAlign: 'start',
                          position: 'relative'
                        }}
                        onMouseEnter={(e) => {
                          if (!isCurrent) {
                            e.currentTarget.style.transform = 'translateY(-10px) scale(1.03)';
                            e.currentTarget.style.borderColor = 'rgba(131, 58, 180, 0.5)';
                            e.currentTarget.style.boxShadow = '0 15px 35px rgba(131, 58, 180, 0.35), 0 0 50px rgba(253, 29, 29, 0.15)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isCurrent) {
                            e.currentTarget.style.transform = 'translateY(0) scale(1)';
                            e.currentTarget.style.borderColor = 'transparent';
                            e.currentTarget.style.boxShadow = 'none';
                          }
                        }}
                      >
                        {/* Rank Badge */}
                        <div style={{
                          position: 'absolute',
                          top: '8px',
                          left: '8px',
                          width: '26px',
                          height: '26px',
                          borderRadius: '50%',
                          background: index === 0 ? 'linear-gradient(135deg, #FFD700, #FFA500)' : 
                                     index === 1 ? 'linear-gradient(135deg, #C0C0C0, #A8A8A8)' :
                                     index === 2 ? 'linear-gradient(135deg, #CD7F32, #A0522D)' :
                                     'rgba(0,0,0,0.6)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 'bold',
                          fontSize: '11px',
                          color: index < 3 ? '#000' : '#fff',
                          zIndex: 2,
                          boxShadow: index < 3 ? '0 2px 8px rgba(0,0,0,0.4)' : 'none'
                        }}>
                          {index + 1}
                        </div>
                        
                        {/* Now Playing Animation */}
                        {isCurrent && (
                          <div style={{
                            position: 'absolute',
                            top: '8px',
                            right: '8px',
                            display: 'flex',
                            gap: '2px',
                            alignItems: 'flex-end',
                            height: '16px'
                          }}>
                            <div style={{ width: '3px', height: '6px', backgroundColor: '#1ed760', animation: 'bounce 0.4s infinite alternate', borderRadius: '1px' }} />
                            <div style={{ width: '3px', height: '12px', backgroundColor: '#1ed760', animation: 'bounce 0.4s 0.1s infinite alternate', borderRadius: '1px' }} />
                            <div style={{ width: '3px', height: '8px', backgroundColor: '#1ed760', animation: 'bounce 0.4s 0.2s infinite alternate', borderRadius: '1px' }} />
                          </div>
                        )}
                        
                        {/* Thumbnail */}
                        <div style={{
                          width: '100%',
                          aspectRatio: '1/1',
                          background: `url(${song.thumbnailUrl}) center/cover`,
                          borderRadius: '8px',
                          marginBottom: '14px',
                          position: 'relative',
                          boxShadow: '0 6px 20px rgba(0,0,0,0.5)'
                        }}>
                          <div style={{
                            position: 'absolute',
                            inset: 0,
                            borderRadius: '8px',
                            background: 'linear-gradient(180deg, transparent 50%, rgba(0,0,0,0.5) 100%)'
                          }} />
                          
                          {/* Play Button */}
                          <div 
                            className="play-overlay"
                            style={{
                              position: 'absolute',
                              bottom: '6px',
                              right: '6px',
                              width: '46px',
                              height: '46px',
                              borderRadius: '50%',
                              background: 'linear-gradient(135deg, #1ed760, #00d4aa)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              opacity: 0,
                              transform: 'translateY(8px) scale(0.9)',
                              transition: 'all 0.3s ease',
                              boxShadow: '0 6px 20px rgba(30, 215, 96, 0.5)'
                            }}
                          >
                            <Play size={22} fill="#000" style={{ color: '#000', marginLeft: '2px' }} />
                          </div>
                        </div>
                        
                        <p style={{ 
                          fontWeight: 'bold', 
                          color: isCurrent ? '#1ed760' : '#fff', 
                          margin: '0 0 6px 0', 
                          whiteSpace: 'nowrap', 
                          overflow: 'hidden', 
                          textOverflow: 'ellipsis',
                          fontSize: '14px'
                        }}>
                          {song.title}
                        </p>
                        
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ 
                            fontSize: '12px', 
                            color: '#999',
                            flex: 1,
                            overflow: 'hidden', 
                            textOverflow: 'ellipsis', 
                            whiteSpace: 'nowrap',
                            maxWidth: '110px'
                          }}>
                            {song.artist}
                          </span>
                          <span style={{ 
                            fontSize: '11px', 
                            color: isCurrent ? '#1ed760' : '#666',
                            fontFamily: 'monospace'
                          }}>
                            {formatTime(song.durationInSeconds)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                {/* View All Button */}
                <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center' }}>
                  <button
                    onClick={() => setActiveTab('songs')}
                    style={{
                      padding: '14px 48px',
                      borderRadius: '30px',
                      background: 'linear-gradient(135deg, rgba(131, 58, 180, 0.25), rgba(253, 29, 29, 0.25))',
                      border: '1px solid rgba(131, 58, 180, 0.4)',
                      color: '#fff',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      transition: 'all 0.3s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'linear-gradient(135deg, rgba(131, 58, 180, 0.45), rgba(253, 29, 29, 0.45))';
                      e.currentTarget.style.transform = 'scale(1.03)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'linear-gradient(135deg, rgba(131, 58, 180, 0.25), rgba(253, 29, 29, 0.25))';
                      e.currentTarget.style.transform = 'scale(1)';
                    }}
                  >
                    View All {userSongs.length} Songs
                  </button>
                </div>
              </div>
            )}

            {/* About Section */}
            <div>
              <h2 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '20px', color: '#fff' }}>
                About
              </h2>
              <div style={{
                backgroundColor: '#181818',
                padding: '28px',
                borderRadius: '12px',
                maxWidth: '700px',
                border: '1px solid #282828'
              }}>
                <p style={{ color: '#e0e0e0', lineHeight: 1.8, margin: 0, fontSize: '16px' }}>
                  {userBio}
                </p>
                
                {(displayUser?.websiteUrl || displayUser?.twitterUrl || displayUser?.githubUrl) && (
                  <div style={{ display: 'flex', gap: '16px', marginTop: '24px', flexWrap: 'wrap' }}>
                    {displayUser?.websiteUrl && (
                      <a href={displayUser.websiteUrl} target="_blank" rel="noopener noreferrer" style={{
                        display: 'flex', alignItems: 'center', gap: '8px',
                        color: '#1ed760', textDecoration: 'none', fontSize: '14px',
                        padding: '8px 16px', backgroundColor: 'rgba(30, 215, 96, 0.1)',
                        borderRadius: '20px'
                      }}>
                        <Globe size={18} /> Website <ExternalLink size={12} />
                      </a>
                    )}
                    {displayUser?.twitterUrl && (
                      <a href={displayUser.twitterUrl} target="_blank" rel="noopener noreferrer" style={{
                        display: 'flex', alignItems: 'center', gap: '8px',
                        color: '#1da1f2', textDecoration: 'none', fontSize: '14px',
                        padding: '8px 16px', backgroundColor: 'rgba(29, 161, 242, 0.1)',
                        borderRadius: '20px'
                      }}>
                        <Twitter size={18} /> Twitter
                      </a>
                    )}
                    {displayUser?.githubUrl && (
                      <a href={displayUser.githubUrl} target="_blank" rel="noopener noreferrer" style={{
                        display: 'flex', alignItems: 'center', gap: '8px',
                        color: '#fff', textDecoration: 'none', fontSize: '14px',
                        padding: '8px 16px', backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        borderRadius: '20px'
                      }}>
                        <Github size={18} /> GitHub
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Details */}
            <div>
              <h2 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '20px', color: '#fff' }}>
                Details
              </h2>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                gap: '16px',
                maxWidth: '800px'
              }}>
                {displayUser?.createdAt && (
                  <div style={{ backgroundColor: '#181818', padding: '24px', borderRadius: '12px', border: '1px solid #282828' }}>
                    <p style={{ fontSize: '12px', color: '#b3b3b3', fontWeight: 'bold', marginBottom: '10px', letterSpacing: '1px' }}>MEMBER SINCE</p>
                    <p style={{ color: '#fff', fontSize: '18px', fontWeight: '600' }}>
                      {new Date(displayUser.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                )}
                {userLocation && (
                  <div style={{ backgroundColor: '#181818', padding: '24px', borderRadius: '12px', border: '1px solid #282828' }}>
                    <p style={{ fontSize: '12px', color: '#b3b3b3', fontWeight: 'bold', marginBottom: '10px', letterSpacing: '1px' }}>LOCATION</p>
                    <p style={{ color: '#fff', fontSize: '18px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <MapPin size={20} style={{ color: '#ff6b6b' }} /> {userLocation}
                    </p>
                  </div>
                )}
                <div style={{ backgroundColor: '#181818', padding: '24px', borderRadius: '12px', border: '1px solid #282828' }}>
                  <p style={{ fontSize: '12px', color: '#b3b3b3', fontWeight: 'bold', marginBottom: '10px', letterSpacing: '1px' }}>FOLLOWERS</p>
                  <p style={{ color: '#fff', fontSize: '18px', fontWeight: '600' }}>{followerCount.toLocaleString()}</p>
                </div>
                <div style={{ backgroundColor: '#181818', padding: '24px', borderRadius: '12px', border: '1px solid #282828' }}>
                  <p style={{ fontSize: '12px', color: '#b3b3b3', fontWeight: 'bold', marginBottom: '10px', letterSpacing: '1px' }}>TOTAL SONGS</p>
                  <p style={{ color: '#fff', fontSize: '18px', fontWeight: '600' }}>{totalSongs}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'songs' && (
          <div>
            <h2 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '24px', color: '#fff' }}>
              Songs
            </h2>
            {userSongs.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '50px 6fr 4fr 1fr',
                  gap: '16px',
                  padding: '12px 16px',
                  borderBottom: '1px solid #282828',
                  color: '#b3b3b3',
                  fontSize: '14px'
                }}>
                  <span>#</span>
                  <span>Title</span>
                  <span>Album</span>
                  <span style={{ textAlign: 'right' }}>Duration</span>
                </div>
                {userSongs.map((song, index) => {
                  const isCurrent = currentTrack?.id === song.id;
                  return (
                    <div
                      key={song.id}
                      onClick={() => playTrack(song, userSongs)}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '50px 6fr 4fr 1fr',
                        gap: '16px',
                        padding: '12px 16px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        alignItems: 'center',
                        transition: 'all 0.2s',
                        backgroundColor: isCurrent ? 'rgba(30, 215, 96, 0.15)' : 'transparent'
                      }}
                      onMouseEnter={(e) => { if (!isCurrent) e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)'; }}
                      onMouseLeave={(e) => { if (!isCurrent) e.currentTarget.style.backgroundColor = 'transparent'; }}
                    >
                      <div style={{ 
                        color: isCurrent ? '#1ed760' : '#b3b3b3', 
                        fontSize: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        {isCurrent && isPlaying ? (
                          <div style={{ display: 'flex', gap: '2px', alignItems: 'flex-end', height: '16px' }}>
                            <div style={{ width: '3px', height: '6px', backgroundColor: '#1ed760', animation: 'bounce 0.4s infinite alternate' }} />
                            <div style={{ width: '3px', height: '12px', backgroundColor: '#1ed760', animation: 'bounce 0.4s 0.1s infinite alternate' }} />
                            <div style={{ width: '3px', height: '8px', backgroundColor: '#1ed760', animation: 'bounce 0.4s 0.2s infinite alternate' }} />
                          </div>
                        ) : index + 1}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <img src={song.thumbnailUrl} style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '4px' }} alt={song.title} />
                        <div>
                          <p style={{ fontWeight: '600', color: isCurrent ? '#1ed760' : '#fff', margin: 0 }}>{song.title}</p>
                          <p style={{ fontSize: '14px', color: '#b3b3b3', margin: 0 }}>{song.artist}</p>
                        </div>
                      </div>
                      <div style={{ fontSize: '14px', color: '#b3b3b3' }}>Single</div>
                      <div style={{ fontSize: '14px', color: '#b3b3b3', textAlign: 'right' }}>
                        {formatTime(song.durationInSeconds)}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '100px', color: '#b3b3b3', backgroundColor: '#181818', borderRadius: '12px' }}>
                <Music size={72} style={{ marginBottom: '20px', opacity: 0.5 }} />
                <p style={{ fontSize: '20px', margin: 0 }}>No songs uploaded yet</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'playlists' && (
          <div>
            <h2 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '24px', color: '#fff' }}>
              Playlists
            </h2>
            {userPlaylists.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '24px' }}>
                {userPlaylists.map((playlist) => (
                  <div
                    key={playlist.id}
                    onClick={() => navigate(`/playlist/${playlist.id}`)}
                    style={{
                      backgroundColor: '#181818',
                      padding: '16px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      transition: 'all 0.3s'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#282828'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#181818'; }}
                  >
                    {playlist.coverUrl ? (
                      <img src={playlist.coverUrl} alt={playlist.title} style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover', borderRadius: '4px', marginBottom: '16px', boxShadow: '0 8px 24px rgba(0,0,0,0.5)' }} />
                    ) : (
                      <div style={{ width: '100%', aspectRatio: '1/1', background: 'linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045)', borderRadius: '4px', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <ListMusic size={56} color="#fff" />
                      </div>
                    )}
                    <p style={{ fontWeight: 'bold', color: '#fff', margin: '0 0 6px 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {playlist.title}
                    </p>
                    <p style={{ fontSize: '14px', color: '#b3b3b3', margin: 0 }}>
                      {playlist.description || 'Playlist'}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '100px', color: '#b3b3b3', backgroundColor: '#181818', borderRadius: '12px' }}>
                <ListMusic size={72} style={{ marginBottom: '20px', opacity: 0.5 }} />
                <p style={{ fontSize: '20px', margin: 0 }}>No playlists created yet</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {isEditing && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.85)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          backdropFilter: 'blur(15px)'
        }} onClick={() => setIsEditing(false)}>
          <div style={{
            backgroundColor: '#1a1a2e',
            borderRadius: '16px',
            padding: '40px',
            width: '100%',
            maxWidth: '520px',
            boxShadow: '0 0 60px rgba(131, 58, 180, 0.5)',
            border: '1px solid rgba(131, 58, 180, 0.4)'
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
              <h2 style={{ margin: 0, fontSize: '28px', fontWeight: 'bold', color: '#fff' }}>
                Edit Profile
              </h2>
              <button onClick={() => setIsEditing(false)} style={{ background: 'none', border: 'none', color: '#b3b3b3', cursor: 'pointer', padding: '8px' }}>
                <X size={28} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '10px', color: '#00FFFF', fontSize: '14px', fontWeight: 'bold' }}>Bio</label>
                <textarea
                  value={editedBio}
                  onChange={(e) => setEditedBio(e.target.value)}
                  placeholder="Tell something about yourself..."
                  style={{
                    width: '100%',
                    height: '120px',
                    padding: '16px',
                    backgroundColor: '#121212',
                    border: '1px solid rgba(131, 58, 180, 0.4)',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '14px',
                    resize: 'none',
                    outline: 'none'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '10px', color: '#00FFFF', fontSize: '14px', fontWeight: 'bold' }}>Location</label>
                <input
                  type="text"
                  value={editedLocation}
                  onChange={(e) => setEditedLocation(e.target.value)}
                  placeholder="Where are you from?"
                  style={{
                    width: '100%',
                    padding: '16px',
                    backgroundColor: '#121212',
                    border: '1px solid rgba(131, 58, 180, 0.4)',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '10px', color: '#00FFFF', fontSize: '14px', fontWeight: 'bold' }}>Website</label>
                <input
                  type="url"
                  value={editedWebsite}
                  onChange={(e) => setEditedWebsite(e.target.value)}
                  placeholder="https://yourwebsite.com"
                  style={{
                    width: '100%',
                    padding: '16px',
                    backgroundColor: '#121212',
                    border: '1px solid rgba(131, 58, 180, 0.4)',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '16px', marginTop: '32px' }}>
              <button
                onClick={() => setIsEditing(false)}
                style={{
                  flex: 1,
                  padding: '16px',
                  borderRadius: '30px',
                  backgroundColor: 'transparent',
                  border: '2px solid #b3b3b3',
                  color: '#fff',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProfile}
                style={{
                  flex: 1,
                  padding: '16px',
                  borderRadius: '30px',
                  background: 'linear-gradient(135deg, #1ed760, #00FFFF)',
                  border: 'none',
                  color: '#000',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  boxShadow: '0 0 30px rgba(30, 215, 96, 0.5)'
                }}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
