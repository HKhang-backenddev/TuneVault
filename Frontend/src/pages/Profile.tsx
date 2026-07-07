import React, { useState, useRef, useEffect } from 'react';
import { User, Mail, Calendar, ShieldCheck, ArrowLeft, Music, ListMusic, Users, Settings, Camera, Image as ImageIcon, Loader2, Globe, Twitter, Github, MapPin, Info, Edit, Save, X, CheckCircle2, Cake, VenetianMask, Play, Clock, Heart, UserPlus, UserCheck, LogOut } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../axios';
import { useAudio } from '../Contexts/AudioContext'; // Import useAudio

interface ProfileProps {
  currentUser: { // Đổi tên để phân biệt với user đang xem
    displayName: string;
    email?: string;
    // Đảm bảo username luôn có để hiển thị @username
    id: string; // Thêm ID để xử lý follow
    username: string;
    avatarUrl?: string;
    bannerUrl?: string;
    createdAt?: string;
    bio?: string;
    location?: string; // New field
    websiteUrl?: string; // New field
    twitterUrl?: string; // New field
    githubUrl?: string; // New field
    gender?: string; // New field
    dateOfBirth?: string; // New field
    lastUpdatedAt?: string; // New field
    // Thêm các trường thống kê
    followerCount?: number;
    followingCount?: number;
    isFollowing?: boolean;
  } | null; // Người dùng đang đăng nhập
  onUpdate?: () => void; // Hàm để fetch lại profile của currentUser
  onLogout?: () => void; // Thêm prop để nhận hàm đăng xuất
}

// Thêm kiểu dữ liệu cho songs và playlist
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
  const { username } = useParams<{ username: string }>(); // Lấy username từ URL

  const [profileUser, setProfileUser] = useState<ProfileProps['currentUser']>(null); // State cho người dùng đang xem
  const [isLoading, setIsLoading] = useState(true);

  const [activeTab, setActiveTab] = useState('home'); // Đổi mặc định sang 'home' để thấy thông tin ngay
  const [uploading, setUploading] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [isHoveringAvatar, setIsHoveringAvatar] = useState(false);
  const [isHoveringBanner, setIsHoveringBanner] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info', text: string } | null>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [editedUsername, setEditedUsername] = useState('');
  const [editedEmail, setEditedEmail] = useState('');
  const [editedDisplayName, setEditedDisplayName] = useState('');
  const [editedAvatarUrl, setEditedAvatarUrl] = useState('');
  const [editedBannerUrl, setEditedBannerUrl] = useState('');
  const [editedBio, setEditedBio] = useState('');
  const [editedLocation, setEditedLocation] = useState('');
  const [editedWebsite, setEditedWebsite] = useState('');
  const [editedTwitter, setEditedTwitter] = useState('');
  const [editedGithub, setEditedGithub] = useState('');
  const [editedGender, setEditedGender] = useState('');
  const [editedDateOfBirth, setEditedDateOfBirth] = useState('');

  // State cho các tab mới
  const [userSongs, setUserSongs] = useState<MediaItem[]>([]);
  const [userPlaylists, setUserPlaylists] = useState<PlaylistItem[]>([]);
  // State riêng cho trạng thái follow để cập nhật tức thì
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);

  const { playTrack, currentTrack, isPlaying } = useAudio(); // Lấy context từ AudioProvider
  
  // SỬA LỖI: Xác định xem có đang xem hồ sơ của chính mình hay không một cách trực tiếp hơn.
  const isOwnProfile = currentUser?.username === username;

  // Hàm fetch profile của người dùng dựa trên username từ URL
  const fetchProfileData = async () => {
    if (!username || !currentUser) return;
    // Nếu là hồ sơ của chính mình, không cần fetch lại, chỉ cần dùng `currentUser`.
    if (isOwnProfile) {
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
      // Cập nhật state follow
      setIsFollowing(res.data.isFollowing || false);
      setFollowerCount(res.data.followerCount || 0);
    } catch (error) {
      console.error("Unable to load user profile:", error);
      setStatusMessage({ type: 'error', text: 'Unable to load user profile. Please try again.' });
    } finally {
      setIsLoading(false);
    }
    };

  // Effect chính để tải dữ liệu profile khi username thay đổi
  useEffect(() => {
    fetchProfileData();
  }, [username, currentUser]); // Thêm currentUser để re-render khi nó thay đổi

  // Fetch dữ liệu cho các tab khi component được tải
  useEffect(() => {
    const fetchDataForTabs = async () => {
      if (profileUser) {
        try {
          // Lấy danh sách songs đã tải lên (giống trang Library)
          const songsRes = await api.get('/media');
          setUserSongs(songsRes.data?.items || []);

          // SỬA LỖI: Gọi đúng API để lấy playlist của người dùng đang xem, không phải của 'mine'
          // Endpoint này cần được tạo ở backend, ví dụ: /playlists/user/{username}
          // Tạm thời, chúng ta sẽ giả sử nó là /playlists/user/{profileUser.id}
          const endpoint = isOwnProfile ? '/playlists/mine' : `/playlists/user/${profileUser.id}`;
          const playlistsRes = await api.get(endpoint); 
          setUserPlaylists(playlistsRes.data || []);
        } catch (error) {
          console.warn("Error loading tab data (playlist endpoint may not exist):", error);
        }
      }
    };
    if (profileUser) {
      fetchDataForTabs();
    }
  }, [profileUser]); // Chạy lại khi profileUser thay đổi


  // Xóa thông báo sau một khoảng thời gian
  useEffect(() => {
    if (statusMessage) {
      const timer = setTimeout(() => setStatusMessage(null), 5000);
      return () => clearTimeout(timer);
    }
    return () => {};
  }, [statusMessage]);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const currentToken = localStorage.getItem('token');
    if (!currentToken || currentToken === "dev-token-bypass") {
      setStatusMessage({ type: 'error', text: "Guest mode cannot upload images. Please log in!" });
      setUploading(false);
      e.target.value = '';
      return;
    }

    setUploading(true);

    // 1. Xem trước ảnh ngay lập tức để người dùng thấy thay đổi tức thì
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setEditedAvatarUrl(result);
    };
    reader.readAsDataURL(file);

    try {
      const formData = new FormData();
      formData.append('file', file);
      
      // 2. Gửi file lên server - ĐỂ AXIOS TỰ XỬ LÝ CONTENT-TYPE (QUAN TRỌNG)
      const response = await api.post('/User/avatar', formData);
      
      // 3. Nếu thành công, ưu tiên dùng URL từ server trả về
      if (response.data?.url) {
        setEditedAvatarUrl(response.data.url);
        // Đồng bộ ngay vào LocalStorage để không bị mất khi F5
        const savedData = localStorage.getItem('manual_profile_data');
        if (savedData) {
          const parsed = JSON.parse(savedData);
          localStorage.setItem('manual_profile_data', JSON.stringify({ ...parsed, avatarUrl: response.data.url }));
        }
      }

      setStatusMessage({ type: 'success', text: "Avatar updated successfully!" });
      if (onUpdate) onUpdate(); // Làm mới dữ liệu ở App.tsx
    } catch (err: any) {
      console.error("Lỗi upload avatar:", err);
      const errorMsg = err.response?.status === 401 
        ? "Session expired. Please log in again." 
        : "Cannot upload image to server. Image saved locally.";
      setStatusMessage({ type: 'error', text: errorMsg });

      if (onUpdate) onUpdate(); // Vẫn gọi onUpdate để cập nhật UI với Base64
    } finally {
      setUploading(false);
      e.target.value = ''; // Reset input để có thể chọn lại cùng 1 file
    }
  };

  const handleBannerClick = () => {
    bannerInputRef.current?.click();
  };

  const handleBannerChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const currentToken = localStorage.getItem('token');
    if (!currentToken || currentToken === "dev-token-bypass" || currentToken === "null" || currentToken === "undefined") {
      setStatusMessage({ type: 'error', text: "You need to log in to upload a banner image." });
      setUploadingBanner(false);
      e.target.value = '';
      return;
    }

    setUploadingBanner(true);

    const reader = new FileReader();
    reader.onloadend = () => {
      setEditedBannerUrl(reader.result as string);
    };
    reader.readAsDataURL(file);

    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await api.post('/User/banner', formData);
      
      if (response.data?.url) {
        setEditedBannerUrl(response.data.url);
      }

      if (onUpdate) onUpdate();
    } catch (err) {
      console.error("Lỗi upload banner:", err); // Log lỗi chi tiết để debug
      if ((err as any).response?.status === 401) {
        setStatusMessage({ type: 'error', text: "Session expired. Please log in to upload banner." });
        // KHÔNG XÓA TOKEN Ở ĐÂY, ĐỂ APP.TSX QUYẾT ĐỊNH LOGOUT
      } else {
        setStatusMessage({ type: 'info', text: "Server not running or error. Banner saved locally." });
        if (onUpdate) onUpdate();
      }
    } finally {
      setUploadingBanner(false);
      e.target.value = '';
    }
  };

  const handleSaveProfile = async () => {
    const profileData = {
      username: editedUsername,
      email: editedEmail,
      displayName: editedDisplayName,
      bio: editedBio,
      location: editedLocation,
      websiteUrl: editedWebsite,
      twitterUrl: editedTwitter,
      githubUrl: editedGithub,
      avatarUrl: editedAvatarUrl, // Luôn gửi giá trị đã chỉnh sửa, kể cả chuỗi rỗng
      bannerUrl: editedBannerUrl, // Luôn gửi giá trị đã chỉnh sửa, kể cả chuỗi rỗng
      gender: editedGender,
      dateOfBirth: editedDateOfBirth ? new Date(editedDateOfBirth).toISOString() : null
    };

    // Hàm lưu dữ liệu vào localStorage
    const saveToLocalStorage = () => {
      localStorage.setItem(`profile_offline_${currentUser?.id}`, JSON.stringify(profileData));
    };

    try {
      await api.put('/User/profile', profileData);
      setIsEditing(false);
      setStatusMessage({ type: 'success', text: "Profile synced with server!" });
      // Update state user (username/email) ngay để UI header & phần hiển thị email phản ánh đúng sau khi sửa
      if (onUpdate) await onUpdate(); // App.tsx truyền fetchProfile
      // Đồng bộ lại local form model theo user mới (tránh trường hợp UI hiển thị chậm)
      setEditedEmail(profileData.email ?? '');
      setEditedUsername(profileData.username ?? '');
      // Xóa dữ liệu offline sau khi đồng bộ thành công
      localStorage.removeItem(`profile_offline_${currentUser?.id}`);
    } catch (err: any) {
      const isAuthError = err.response?.status === 401;
      if (isAuthError) {
        setStatusMessage({ type: 'error', text: "Session expired. Please log in to save data." });
        if (onUpdate) onUpdate(); // Kích hoạt App.tsx để xử lý logout và redirect
      } else {
        console.warn("Server not responding, data saved locally.");
        saveToLocalStorage(); // Lưu vào localStorage khi có lỗi
        setStatusMessage({ type: 'info', text: "Changes saved locally (Offline Mode)." });
        if (onUpdate) onUpdate();
        setIsEditing(false);
      }
      setEditedAvatarUrl(profileData.avatarUrl || '');
    }
  };

  const handleCancelEdit = () => {
    // Khi hủy, ưu tiên tải lại từ profileUser (dữ liệu từ server hoặc state)
    setIsEditing(false);
    if (profileUser) {
      setEditedUsername(profileUser.username || '');
      setEditedEmail(profileUser.email || '');
      setEditedDisplayName(profileUser.displayName || profileUser.username || '');
      setEditedAvatarUrl(profileUser.avatarUrl || '');
      setEditedBannerUrl(profileUser.bannerUrl || '');
      setEditedBio(profileUser.bio || '');
      setEditedLocation(profileUser.location || 'Việt Nam');
      setEditedWebsite(profileUser.websiteUrl || '');
      setEditedTwitter(profileUser.twitterUrl || '');
      setEditedGithub(profileUser.githubUrl || '');
      setEditedGender(profileUser.gender || '');
      setEditedDateOfBirth(profileUser.dateOfBirth ? new Date(profileUser.dateOfBirth).toISOString().split('T')[0] : '');
    }
  };

  const handleFollowToggle = async () => { 
    if (!profileUser || !currentUser) {
      navigate('/app/login'); // Yêu cầu đăng nhập nếu chưa đăng nhập
      return;
    }
    try {
      // Cập nhật UI ngay lập tức để tạo cảm giác phản hồi nhanh
      const newFollowingState = !isFollowing;
      setIsFollowing(newFollowingState);
      setFollowerCount(prev => newFollowingState ? prev + 1 : prev - 1);

      // Gửi request lên server
      const response = await api.post(`/User/${profileUser.id}/follow`);
      
      // Cập nhật lại state từ server để đảm bảo đồng bộ (nếu cần)
      setIsFollowing(response.data.isFollowing);
      // Gọi lại fetchProfileData để cập nhật followerCount chính xác từ server
      fetchProfileData();
    } catch (error) {
      console.error("Error following:", error);
      // Hoàn tác lại UI nếu có lỗi
      setIsFollowing(prev => !prev);
      setFollowerCount(prev => isFollowing ? prev - 1 : prev + 1);
      setStatusMessage({ type: 'error', text: "An error occurred. Please try again." });
    }
  };

  const handleStartEditing = () => {
    if (profileUser) {
      setEditedUsername(profileUser.username || '');
      setEditedEmail(profileUser.email || '');
      setEditedDisplayName(profileUser.displayName || profileUser.username || '');
      setEditedAvatarUrl(profileUser.avatarUrl || '');
      setEditedBannerUrl(profileUser.bannerUrl || '');
      setEditedBio(profileUser.bio || '');
      setEditedLocation(profileUser.location || 'Việt Nam');
      setEditedWebsite(profileUser.websiteUrl || '');
      setEditedTwitter(profileUser.twitterUrl || '');
      setEditedGithub(profileUser.githubUrl || '');
      setEditedGender(profileUser.gender || '');
      setEditedDateOfBirth(profileUser.dateOfBirth ? new Date(profileUser.dateOfBirth).toISOString().split('T')[0] : '');
    }
    setIsEditing(true);
  };

  const handleFetchLocation = async () => {
    if (!navigator.geolocation) {
      setStatusMessage({ type: 'error', text: 'Your browser does not support geolocation.' });
      return;
    }

    setIsFetchingLocation(true);
    setStatusMessage({ type: 'info', text: 'Getting your location...' });

    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords;
      try {
        // Sử dụng dịch vụ miễn phí để chuyển đổi tọa độ sang địa chỉ
        const response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=vi`);
        const data = await response.json();
        const locationString = `${data.city || ''}, ${data.countryName || ''}`.replace(/^, |, $/g, '');
        setEditedLocation(locationString || 'Undetermined');
        setStatusMessage({ type: 'success', text: 'Location retrieved successfully!' });
      } catch (error) {
        setStatusMessage({ type: 'error', text: 'Không thể chuyển đổi tọa độ.' });
      } finally {
        setIsFetchingLocation(false);
      }
    }, (error) => {
      setStatusMessage({ type: 'error', text: `Lỗi định vị: ${error.message}` });
      setIsFetchingLocation(false);
    });
  };

  // Hàm định dạng thời gian cho songs
  const formatTime = (seconds?: number) => {
    if (!seconds || isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const styles = {
    container: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '0 16px',
      paddingBottom: '120px', // Thêm khoảng đệm dưới để không bị PlayerBar che
    },
    infoGrid: { // Thêm thuộc tính này để sửa lỗi Property 'infoGrid' does not exist
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '20px',
      marginTop: '20px',
    },
    googleCard: {
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      borderRadius: '12px',
      backdropFilter: 'blur(5px)',
      border: '1px solid #333',
      overflow: 'hidden',
      marginBottom: '24px',
    },
    googleRow: {
      display: 'flex',
      padding: '20px 24px',
      borderBottom: '1px solid #262626',
      alignItems: 'center',
      transition: 'background-color 0.2s',
      cursor: 'pointer',
    },
    infoLabel: {
      flex: '0 0 250px',
      fontSize: '14px',
      color: '#aaa',
      fontWeight: 'bold',
      textTransform: 'uppercase' as const,
      letterSpacing: '0.8px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
    },
    infoValue: {
      flex: 1,
      fontSize: '16px',
      color: 'white',
      fontWeight: '500' as const,
    },
    banner: {
      width: '100%',
      height: '240px',
      borderRadius: '12px',
      background: (editedBannerUrl || profileUser?.bannerUrl)
        ? `url(${editedBannerUrl || profileUser?.bannerUrl}) center/cover no-repeat` 
        : 'linear-gradient(90deg, #1f1f1f 0%, #450a0a 100%)',
      marginTop: '16px',
      position: 'relative' as const,
      cursor: 'pointer',
      overflow: 'hidden',
      border: '1px solid rgba(255,255,255,0.1)',
    },
    bannerOverlay: {
      position: 'absolute' as const,
      inset: 0,
      backgroundColor: 'rgba(0,0,0,0.4)',
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'center',
      justifyContent: 'center',
      opacity: isHoveringBanner || uploadingBanner ? 1 : 0.4, // Always visible, but more opaque on hover/upload
      transition: 'opacity 0.3s ease',
      color: 'white',
      gap: '8px',
    },
    profileHeader: {
      padding: '24px 0',
      display: 'flex',
      gap: '24px',
      alignItems: 'flex-start',
      flexWrap: 'wrap' as const,
    },
    avatarContainer: {
      flexShrink: 0,
      position: 'relative' as const,
    },
    avatar: {
      width: '48px',
      height: '48px',
      borderRadius: '50%',
      backgroundColor: '#1f1f1f',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '18px',
      fontWeight: 'bold',
      color: '#ffffff',
      border: '3px solid #3b82f6',
      overflow: 'hidden',
      cursor: 'pointer',
      position: 'relative' as const,
      boxShadow: '0 0 25px rgba(59, 130, 246, 0.6)',
    },
    avatarOverlay: {
      position: 'absolute' as const,
      inset: 0,
      backgroundColor: 'rgba(0,0,0,0.4)', 
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0',
      opacity: isHoveringAvatar || uploading ? 1 : 0, // Ẩn hẳn khi không tương tác để thấy rõ ảnh
      transition: 'opacity 0.2s',
      color: 'white',
    },
    mainInfo: {
      flex: 1,
      minWidth: '300px',
    },
    name: {
      fontSize: '36px',
      fontWeight: '900',
      color: '#ffffff',
      margin: 0,
    },
    handle: {
      fontSize: '14px',
      color: '#aaa',
      margin: '4px 0 12px',
      display: 'flex',
      gap: '8px',
    },
    statsContainer: {
      display: 'flex',
      gap: '16px',
      fontSize: '14px',
      color: '#aaa',
      marginBottom: '16px',
    },
    actionButtons: {
      display: 'flex',
      gap: '12px',
      marginTop: '16px',
      flexWrap: 'wrap' as const,
    },
    btnSecondary: {
      backgroundColor: 'transparent',
      color: 'white',
      padding: '10px 24px',
      borderRadius: '999px',
      fontSize: '14px',
      fontWeight: '600',
      border: '1.5px solid rgba(255,255,255,0.2)',
      cursor: 'pointer',
      transition: 'all 0.25s ease',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      backdropFilter: 'blur(4px)',
      position: 'relative' as const,
      overflow: 'hidden',
    },
    tabsContainer: {
      display: 'flex',
      borderBottom: '1px solid #262626',
      marginBottom: '28px',
      gap: '4px',
    },
    tab: {
      padding: '10px 20px',
      fontSize: '13px',
      fontWeight: '600',
      cursor: 'pointer',
      color: '#777',
      borderBottom: '2px solid transparent',
      transition: 'all 0.2s ease',
      backgroundColor: 'transparent',
      borderTop: 'none',
      borderLeft: 'none',
      borderRight: 'none',
      borderRadius: '8px 8px 0 0',
      marginBottom: '-1px',
      letterSpacing: '0.3px',
    },
    activeTab: {
      color: '#fff',
      borderBottomColor: 'transparent', // Bỏ border dưới
      backgroundColor: 'rgba(59, 130, 246, 0.15)',
    },
    infoSection: {
      display: 'grid',
      gridTemplateColumns: '1fr', // Thay đổi ở đây: chỉ một cột
      gap: '24px',
    },
    infoBox: {
      padding: '24px',
      backgroundColor: 'rgba(18, 18, 18, 0.75)',
      borderRadius: '16px',
      border: '1px solid #262626',
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
    },
    iconWrapper: {
      width: '44px',
      height: '44px',
      borderRadius: '12px',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#60a5fa',
      flexShrink: 0,
    },
    fullWidthInfo: {
      gridColumn: '1 / -1',
      padding: '28px',
      backgroundColor: 'rgba(18, 18, 18, 0.75)',
      backdropFilter: 'blur(8px)',
      borderRadius: '16px',
      border: '1px solid #262626',
    },
    socialLink: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      color: '#aaa',
      textDecoration: 'none',
      fontSize: '14px',
      transition: 'color 0.2s',
    },
    inputField: {
      width: '100%',
      backgroundColor: '#1a1a1a',
      color: 'white',
      border: '2px solid #333',
      borderRadius: '8px',
      padding: '10px 12px',
      fontSize: '16px',
      outline: 'none',
      transition: 'border-color 0.2s, box-shadow 0.2s',
    },
    textareaField: {
      width: '100%',
      backgroundColor: '#1a1a1a',
      color: 'white',
      border: '2px solid #333',
      borderRadius: '8px',
      padding: '10px 12px',
      fontSize: '16px',
      outline: 'none',
      resize: 'vertical' as const,
      minHeight: '100px',
      transition: 'border-color 0.2s, box-shadow 0.2s',
    },
    btnPrimary: {
      backgroundColor: 'transparent', // Chuyển sang trong suốt
      color: 'white',
      padding: '10px 28px',
      borderRadius: '999px',
      fontSize: '14px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.25s ease',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      border: '1.5px solid #3b82f6', // Thêm viền neon
      boxShadow: '0 0 15px rgba(59, 130, 246, 0.3)', // Thêm bóng mờ
      letterSpacing: '0.3px',
    },
    formCard: {
      backgroundColor: 'rgba(18, 18, 18, 0.7)',
      borderRadius: '16px',
      backdropFilter: 'blur(10px)',
      padding: '32px',
      border: '2px solid #60a5fa',
      boxShadow: '0 0 40px rgba(96, 165, 250, 0.3)',
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '20px',
      marginTop: '24px',
    },
    labelHeader: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      color: '#60a5fa',
      fontSize: '12px',
      fontWeight: 'bold',
      textTransform: 'uppercase' as const,
      letterSpacing: '1px',
      marginBottom: '8px',
    },
    formRow: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '20px',
    },
    inputIconGroup: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      backgroundColor: '#1a1a1a',
      borderRadius: '8px',
      padding: '0 12px',
      border: '2px solid #333',
      transition: 'all 0.2s',
    },
    formInputNoBorder: {
      flex: 1,
      backgroundColor: 'transparent',
      border: 'none',
      color: 'white',
      padding: '12px 0',
      fontSize: '15px',
      outline: 'none',
    },
    guestContainer: {
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '70vh',
      color: '#737373',
      gap: '20px',
      textAlign: 'center' as const,
      backgroundColor: 'rgba(0,0,0,0.7)',
      borderRadius: '24px',
      margin: '20px',
      border: '1px solid #262626',
    },
  };

  const token = localStorage.getItem('token') || '';
  const isGuest = !currentUser && (token === '' || token === 'null');

  // Hàm trợ giúp đổi màu border khi focus
  const inputFocusStyle = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.currentTarget.style.borderColor = '#60a5fa';
    e.currentTarget.style.boxShadow = '0 0 15px rgba(96, 165, 250, 0.3)';
  };
  const inputBlurStyle = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.currentTarget.style.borderColor = '#3f3f46';
    e.currentTarget.style.boxShadow = 'none';
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <Loader2 className="animate-spin text-blue-500" size={48} />
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <style>{`
        @keyframes neon-shift-profile {
          0% { background-position: 0% center; }
          100% { background-position: 200% center; }
        }
        .neon-title {
          background: linear-gradient(
            90deg, 
            #3b82f6 0%, 
            #93c5fd 25%, 
            #3b82f6 50%, 
            #93c5fd 75%, 
            #3b82f6 100%
          );
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: neon-shift-profile 4s linear infinite;
          filter: drop-shadow(0 0 10px rgba(59, 130, 246, 0.6));
          display: inline-block;
        }
        .google-row-hover:hover {
          background-color: rgba(255, 255, 255, 0.05) !important;
        }
        .btn-primary-profile {
          background: transparent;
          color: white;
          padding: 10px 28px;
          border-radius: 999px;
          font-size: 14px;
          font-weight: 600;
          border: none;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          letter-spacing: 0.3px;
          border: 1.5px solid #3b82f6;
          box-shadow: 0 0 15px rgba(59, 130, 246, 0.3);
          transition: all 0.25s ease;
        }
        .btn-primary-profile:hover {
          transform: scale(1.04);
          box-shadow: 0 0 25px rgba(59, 130, 246, 0.6);
          background: rgba(59, 130, 246, 0.2);
        }
        .btn-primary-profile:active {
          transform: scale(0.97);
        }
        .btn-secondary-profile, .form-cancel-btn {
          background: transparent;
          color: white;
          padding: 10px 24px;
          border-radius: 999px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          border: 1.5px solid rgba(255,255,255,0.2);
          transition: all 0.25s ease;
          backdrop-filter: blur(4px);
        }
        .btn-secondary-profile:hover {
          border-color: rgba(255,255,255,0.4);
          background: rgba(255,255,255,0.06);
          transform: scale(1.03);
        }
        .btn-secondary-profile:active, .form-cancel-btn:active {
          transform: scale(0.97);
        }
        .btn-following {
          background: rgba(255,255,255,0.1);
          border-color: rgba(255,255,255,0.3);
          color: white;
        }
        .btn-following:hover {
          border-color: #ef4444;
          color: #ef4444;
          background: rgba(239, 68, 68, 0.08);
        }
        .tab-btn-profile:hover {
          color: #aaa !important;
        }
        .stat-item-profile {
          transition: all 0.2s ease;
          cursor: default;
        }
        .stat-item-profile:hover {
          color: white;
          transform: translateY(-1px);
        }
        .form-save-btn {
          background: #16a34a;
          color: white;
          padding: 10px 28px;
          border-radius: 999px;
          font-size: 14px;
          font-weight: 600;
          border: none;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          transition: all 0.25s ease;
          box-shadow: 0 4px 14px rgba(22, 163, 74, 0.35);
        }
        .form-save-btn:hover {
          transform: scale(1.04);
          box-shadow: 0 6px 24px rgba(22, 163, 74, 0.5);
          background: #15803d;
        }
        .form-save-btn:active {
          transform: scale(0.97);
        }
        .form-cancel-btn:hover {
          border-color: #ef4444;
          color: #ef4444;
          background: rgba(239, 68, 68, 0.08);
        }
        .song-row {
          transition: all 0.2s ease;
          cursor: pointer;
        }
        .song-row:hover {
          background-color: rgba(255, 255, 255, 0.04) !important;
        }
        /* Keyframes cho viền chuyển động */
        @keyframes animated-border-profile {
          0% { background-position: 0% center; }
          100% { background-position: 200% center; }
        }
      `}</style>

      {/* Global Notification Toast */}
      {statusMessage && (
        <div className={`fixed top-20 right-8 z-[60] animate-in fade-in slide-in-from-right-4 duration-300`}>
          <div className={`p-4 rounded-xl shadow-2xl border flex items-center gap-3 min-w-[300px] ${statusMessage.type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-400' : statusMessage.type === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-blue-500/10 border-blue-500/20 text-blue-400'}`}>
            {statusMessage.type === 'error' && <X size={20} className="text-red-400" />}
            {statusMessage.type === 'success' && <CheckCircle2 size={20} className="text-green-400" />}
            {statusMessage.type === 'info' && <Info size={20} className="text-blue-400" />}
            <span className="font-bold text-sm">{statusMessage.text}</span>
          </div>
        </div>
      )}

      {/* Banner */}
      <div
        style={{...styles.banner, cursor: isOwnProfile ? 'pointer' : 'default'}}
        onClick={handleBannerClick}
        onMouseEnter={() => setIsHoveringBanner(true)}
        onMouseLeave={() => setIsHoveringBanner(false)}
      >
        <div style={styles.bannerOverlay}>
          {uploadingBanner ? (
            <Loader2 className="animate-spin" size={32} />
          ) : isOwnProfile ? (
            <>
              <Camera size={32} />
              <span style={{ fontSize: '12px', fontWeight: 'bold' }}>Thay đổi ảnh bìa</span>
            </>
          ) : (
            <div /> // Empty div to maintain layout
          )}
        </div>
        <input 
          type="file" 
          ref={bannerInputRef} 
          style={{ display: 'none' }} 
          accept="image/*" 
          onChange={handleBannerChange} 
        />
      </div>

      {/* Profile Header */}
      <div style={styles.profileHeader}>
        <div style={styles.avatarContainer}>
          <div 
            style={{...styles.avatar, cursor: isOwnProfile ? 'pointer' : 'default'}}
            onClick={handleAvatarClick}
            onMouseEnter={() => setIsHoveringAvatar(true)}
            onMouseLeave={() => setIsHoveringAvatar(false)}
          >
            {(editedAvatarUrl || profileUser?.avatarUrl) ? (
              <img src={editedAvatarUrl || profileUser?.avatarUrl} alt="Avatar" style={{ width: '200%', height: '200%', objectFit: 'cover' }} />
            ) : (
              <span style={{ fontSize: '50px', fontWeight: 'bold', color: '#ffffff' }}>
                {String(profileUser?.displayName || editedDisplayName || 'U').charAt(0).toUpperCase()}
              </span>
            )}
            
            <div style={styles.avatarOverlay}> {/* Opacity is now handled directly in styles.avatarOverlay */}
              {uploading ? (
                <Loader2 className="animate-spin" size={90} />
              ) : (
                isOwnProfile && <>
                  <Camera size={50} />
                </>
              )}
            </div>
          </div>
          <input 
            type="file" 
            ref={fileInputRef} 
            style={{ display: 'none' }} 
            accept="image/*" 
            onChange={handleFileChange} 
          />
        </div>
        
        <div style={styles.mainInfo}>
          <h1 style={styles.name}>{(isOwnProfile ? currentUser?.displayName : profileUser?.displayName) || 'New User'}</h1>
          <div style={styles.handle}>
            <span>@{(isOwnProfile ? currentUser?.username : profileUser?.username) || 'username'}</span>
            <span>•</span>
            <span>Thành viên từ {(isOwnProfile ? currentUser?.createdAt : profileUser?.createdAt) ? new Date((isOwnProfile ? currentUser?.createdAt : profileUser?.createdAt)!).toLocaleDateString('vi-VN') : 'gần đây'}</span>
          </div>
          <div style={styles.statsContainer}>
            <span><strong>{userSongs.length}</strong> songs</span>
            <span><strong>{userPlaylists.length}</strong> playlists</span>
            <span><strong>{followerCount}</strong> followers</span>
            <span>Following <strong>{(isOwnProfile ? currentUser?.followingCount : profileUser?.followingCount) || 0}</strong> người dùng</span>
          </div>
          <div style={styles.actionButtons}>
            {!isEditing && isOwnProfile && (
              <>
                <button 
                  className="btn-primary-profile"
                  onClick={handleStartEditing}
                >
                  <Edit size={16} /> Customize Profile
                </button>
              </>
            )}
            {/* Nút Đăng xuất mới */}
            {onLogout && isOwnProfile && (
              <button className="btn-secondary-profile" onClick={onLogout} style={{ borderColor: '#ef4444', color: '#f87171', background: 'rgba(239, 68, 68, 0.05)' }}>
                <LogOut size={16} /> Đăng xuất
              </button>
            )}
            {!isOwnProfile && (
              <button
                className={`btn-secondary-profile ${isFollowing ? 'btn-following' : ''}`}
                onClick={handleFollowToggle}
              >
                {isFollowing ? <UserCheck size={16} /> : <UserPlus size={16} />}
                {isFollowing ? 'Following' : 'Follow'}
              </button>
            )}
            {isOwnProfile && <button className="btn-secondary-profile" onClick={() => navigate('/app/library')}>Quản lý songs</button>}
          </div>
        </div>
      </div>

      {/* Edit Profile Form */}
      {isEditing && (
        <div style={styles.formCard}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 className="section-title-neon" style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>Thông tin cá nhân</h2>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="form-save-btn" onClick={handleSaveProfile}>
                <Save size={16} /> Save Changes
              </button>
              <button className="form-cancel-btn" onClick={handleCancelEdit}>
                <X size={16} /> Hủy
              </button>
            </div>
          </div>

          {/* FORM THÔNG TIN TÀI KHOẢN (EDIT MODE) */}
          <div style={{
            background: 'linear-gradient(145deg, #0a0a0a, #111827)', // Giữ nguyên
            padding: '30px',
            borderRadius: '20px',
            border: '2px solid #60a5fa',
            boxShadow: '0 0 40px rgba(96, 165, 250, 0.3), inset 0 0 15px rgba(96, 165, 250, 0.1)',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
            marginBottom: '30px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <ShieldCheck size={20} color="#60a5fa" />
              <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '900', color: '#60a5fa', letterSpacing: '2px', textTransform: 'uppercase' }}>
                Xác thực tài khoản hệ thống
              </h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', color: '#aaa', fontSize: '11px', fontWeight: 'bold', marginBottom: '8px', textTransform: 'uppercase' }}>
                  Link Ảnh đại diện (URL)
                </label>
                <div style={{ backgroundColor: '#000', border: '1px solid #333', borderRadius: '10px', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Camera size={16} color="#60a5fa" />
                  <input type="text" style={{ background: 'transparent', border: 'none', color: '#fff', outline: 'none', width: '100%', fontSize: '14px' }} value={editedAvatarUrl} onChange={(e) => setEditedAvatarUrl(e.target.value)} placeholder="Dán link ảnh tại đây..." />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', color: '#aaa', fontSize: '11px', fontWeight: 'bold', marginBottom: '8px', textTransform: 'uppercase' }}>
                  Link Ảnh bìa (URL)
                </label>
                <div style={{ backgroundColor: '#000', border: '1px solid #333', borderRadius: '10px', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <ImageIcon size={16} color="#60a5fa" />
                  <input type="text" style={{ background: 'transparent', border: 'none', color: '#fff', outline: 'none', width: '100%', fontSize: '14px' }} value={editedBannerUrl} onChange={(e) => setEditedBannerUrl(e.target.value)} placeholder="Dán link ảnh bìa tại đây..." />
                </div>
              </div>
            </div>
            <p style={{ margin: 0, fontSize: '11px', color: '#555', fontStyle: 'italic' }}>* You can paste an image link directly here if the file upload feature has issues.</p>
          </div>

          <div style={styles.formRow}>
            <div>
              <label style={styles.labelHeader}><User size={14}/> Username (Email)</label>
              <div style={styles.inputIconGroup} className="focus-within-red">
                <input
                  type="email"
                  style={styles.formInputNoBorder}
                  value={editedEmail}
                  onChange={(e) => setEditedEmail(e.target.value)}
                  placeholder="email@example.com"
                />
              </div>
            </div>
            <div>
              <label style={styles.labelHeader}><User size={14}/> Display Name</label>
              <div style={styles.inputIconGroup} className="focus-within-red">
                <input
                  type="text"
                  style={styles.formInputNoBorder}
                  value={editedDisplayName}
                  onChange={(e) => setEditedDisplayName(e.target.value)}
                  placeholder="Your name"
                />
              </div>
            </div>
          </div>

          <div style={styles.formRow}>
            <div>
              <label style={styles.labelHeader}><VenetianMask size={14}/> Giới tính</label>
              <div style={styles.inputIconGroup}>
                <input
                  type="text"
                  style={styles.formInputNoBorder}
                  value={editedGender}
                  onChange={(e) => setEditedGender(e.target.value)}
                  placeholder="Không muốn tiết lộ"
                />
              </div>
            </div>
            <div>
              <label style={styles.labelHeader}><Cake size={14}/> Ngày sinh</label>
              <div style={styles.inputIconGroup}>
                <input
                  type="date"
                  style={{
                    ...styles.formInputNoBorder,
                    colorScheme: 'dark', // Đảm bảo giao diện date picker có nền tối
                  }}
                  value={editedDateOfBirth}
                  onChange={(e) => setEditedDateOfBirth(e.target.value)}
                  placeholder="DD/MM/YYYY"
                />
              </div>
            </div>
          </div>

          <div>
            <label style={styles.labelHeader}><MapPin size={14}/> Location</label>
            <div style={{...styles.inputIconGroup, gap: '4px'}}>
              <input
                type="text"
                style={styles.formInputNoBorder}
                value={editedLocation}
                onChange={(e) => setEditedLocation(e.target.value)}
                placeholder="Thành phố, Quốc gia"
              />
              <button
                onClick={handleFetchLocation}
                disabled={isFetchingLocation}
                style={{
                  background: 'transparent', border: 'none', color: '#60a5fa',
                  padding: '8px', borderRadius: '6px', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: '4px'
                }}
                className="hover:bg-blue-500/10"
                title="Tự động lấy vị trí hiện tại"
              >
                {isFetchingLocation
                  ? <Loader2 size={16} className="animate-spin" />
                  : <MapPin size={16} />
                }
              </button>
            </div>
          </div>
          <div>
            <label style={styles.labelHeader}><Info size={14}/> Bio</label>
            <textarea
              style={{...styles.textareaField, borderColor: '#333'}}
              value={editedBio}
              onChange={(e) => setEditedBio(e.target.value)}
              placeholder="Share a bit about yourself or your music taste..."
              onFocus={inputFocusStyle}
              onBlur={inputBlurStyle}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <label style={styles.labelHeader}>Social Links</label>
            
            <div style={styles.inputIconGroup}>
              <Globe size={18} color="#aaa" />
              <input 
                type="url" style={styles.formInputNoBorder} value={editedWebsite} 
                onChange={e => setEditedWebsite(e.target.value)} placeholder="https://your-website.com" 
              />
            </div>

            <div style={styles.inputIconGroup}>
              <Twitter size={18} color="#1DA1F2" />
              <input 
                type="url" style={styles.formInputNoBorder} value={editedTwitter} 
                onChange={e => setEditedTwitter(e.target.value)} placeholder="https://twitter.com/your-username" 
              />
            </div>

            <div style={styles.inputIconGroup}>
              <Github size={18} color="#fff" />
              <input 
                type="url" style={styles.formInputNoBorder} value={editedGithub} 
                onChange={e => setEditedGithub(e.target.value)} placeholder="https://github.com/your-username" 
              />
            </div>
          </div>
        </div>
      )}

      {!isEditing && (
        <>
          <div style={{ color: '#aaa', fontSize: '14px', maxWidth: '600px', marginTop: '16px', paddingLeft: '24px', fontStyle: (isOwnProfile ? currentUser?.bio : profileUser?.bio) ? 'normal' : 'italic' }}>
            {(isOwnProfile ? currentUser?.bio : profileUser?.bio) || `Welcome to the profile of ${(isOwnProfile ? currentUser?.displayName : profileUser?.displayName) || 'user'}.`}
          </div>

          {/* Tabs */}
          <div style={styles.tabsContainer}>
            {(['home', 'songs', 'playlists', 'about'] as const).map((tab) => (
              <button 
                key={tab}
                style={{ ...styles.tab, ...(activeTab === tab ? styles.activeTab : {}) }}
                onClick={() => setActiveTab(tab)}
              >
                {tab === 'home' ? 'Home' : tab === 'songs' ? 'Songs' : tab === 'playlists' ? 'Playlists' : 'About'}
              </button>
            ))}
          </div>

          {/* Khung chứa nội dung các Tab */}
          <div style={{
            padding: '28px',
            backgroundColor: 'rgba(0, 0, 0, 0.6)', // Tăng độ trong suốt
            borderRadius: '24px',
            border: '2px solid transparent',
            backgroundImage: 'linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), linear-gradient(160deg, #c084fc, #3b82f6, #10b981, #c084fc)',
            backgroundOrigin: 'border-box',
            backgroundClip: 'padding-box, border-box',
            backgroundSize: '200% 100%',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.7), 0 0 40px rgba(59, 130, 246, 0.2)',
            animation: 'animated-border-profile 8s linear infinite',
            marginTop: '1rem',
          }}>
            {/* Tab Content */}
            {activeTab === 'about' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div style={styles.infoSection}>
                <div style={styles.infoBox}>
                  <div style={styles.iconWrapper}><Mail size={20} /></div>
                  <div>
                    <p style={{ fontSize: '12px', color: '#737373', fontWeight: 'bold' }}>EMAIL</p>
                    <p style={{ color: '#fff', margin: 0 }}>{(isOwnProfile ? currentUser?.email : profileUser?.email) || 'Not provided'}</p>
                  </div>
                </div>
                <div style={styles.infoBox}>
                  <div style={styles.iconWrapper}><Calendar size={20} /></div>
                  <div>
                    <p style={{ fontSize: '12px', color: '#737373', fontWeight: 'bold' }}>NGÀY THAM GIA</p>
                    <p style={{ color: '#fff', margin: 0 }}>{(isOwnProfile ? currentUser?.createdAt : profileUser?.createdAt) ? new Date((isOwnProfile ? currentUser?.createdAt : profileUser?.createdAt)!).toLocaleString('vi-VN') : 'Hôm nay'}</p>
                  </div>
                </div>
                {profileUser?.lastUpdatedAt && (
                  <div style={styles.infoBox}>
                    <div style={styles.iconWrapper}><Save size={20} /></div>
                    <div>
                      <p style={{ fontSize: '12px', color: '#737373', fontWeight: 'bold' }}>CẬP NHẬT LẦN CUỐI</p>
                      <p style={{ color: '#fff', margin: 0 }}>{new Date(profileUser.lastUpdatedAt).toLocaleString('vi-VN')}</p>
                    </div>
                  </div>
                )}
                <div style={styles.infoBox}>
                  <div style={styles.iconWrapper}><MapPin size={20} /></div>
                  <div>
                    <p style={{ fontSize: '12px', color: '#737373', fontWeight: 'bold' }}>VỊ TRÍ</p>
                    <p style={{ color: '#fff', margin: 0 }}>{(isOwnProfile ? currentUser?.location : profileUser?.location) || 'Not provided'}</p>
                  </div>
                </div>
                <div style={styles.infoBox}>
                  <div style={styles.iconWrapper}><Cake size={20} /></div>
                  <div>
                    <p style={{ fontSize: '12px', color: '#737373', fontWeight: 'bold' }}>NGÀY SINH</p>
                    <p style={{ color: '#fff', margin: 0 }}>{(isOwnProfile ? currentUser?.dateOfBirth : profileUser?.dateOfBirth) ? new Date((isOwnProfile ? currentUser?.dateOfBirth : profileUser?.dateOfBirth)!).toLocaleDateString('vi-VN') : 'Not provided'}</p>
                  </div>
                </div>
                <div style={styles.infoBox}>
                  <div style={styles.iconWrapper}><VenetianMask size={20} /></div>
                  <div>
                    <p style={{ fontSize: '12px', color: '#737373', fontWeight: 'bold' }}>GIỚI TÍNH</p>
                    <p style={{ color: '#fff', margin: 0 }}>{(isOwnProfile ? currentUser?.gender : profileUser?.gender) || 'Not provided'}</p>
                  </div>
                </div>
                <div style={styles.infoBox}>
                  <div style={styles.iconWrapper}><ShieldCheck size={20} /></div>
                  <div>
                    <p style={{ fontSize: '12px', color: '#737373', fontWeight: 'bold' }}>BẢO MẬT</p>
                    <p style={{ color: '#93c5fd', margin: 0 }}>Verified Account</p>
                  </div>
                </div>
              </div>

              <div style={styles.fullWidthInfo}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                  <Info size={18} style={{ color: '#60a5fa' }} />
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>Bio</h3>
                </div>
                <p style={{ color: '#aaa', lineHeight: '1.6', margin: 0 }}>
                  {(isOwnProfile ? currentUser?.bio : profileUser?.bio) || "User has not updated their bio."}
                </p>
              </div>

              <div style={styles.fullWidthInfo}>
                <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', fontWeight: 'bold' }}>Social Links</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '32px' }}>
                  {profileUser?.websiteUrl && (
                    <a href={profileUser.websiteUrl} target="_blank" rel="noopener noreferrer" style={styles.socialLink}>
                      <Globe size={20} /> <span>Website</span>
                    </a>
                  )}
                  {profileUser?.twitterUrl && (
                    <a href={profileUser.twitterUrl} target="_blank" rel="noopener noreferrer" style={styles.socialLink}>
                      <Twitter size={20} /> <span>Twitter</span>
                    </a>
                  )}
                  {profileUser?.githubUrl && (
                    <a href={profileUser.githubUrl} target="_blank" rel="noopener noreferrer" style={styles.socialLink}>
                      <Github size={20} /> <span>Github</span>
                    </a>
                  )}
                </div>
                </div>
              </div>
            ) : activeTab === 'home' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div>
                <h2 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px' }}>Thông tin cá nhân</h2>
                <p style={{ color: '#aaa', fontSize: '14px', marginBottom: '24px' }}>
                  Basic information like name and photo that you use on TuneVault service.
                </p>
                
                {/* SECTION: THÔNG TIN TÀI KHOẢN THỦ CÔNG (VIEW MODE) */}
                <div style={{
                  background: 'linear-gradient(135deg, rgba(15, 15, 15, 0.7) 0%, rgba(17, 24, 39, 0.7) 100%)',
                  borderRadius: '20px',
                  backdropFilter: 'blur(10px)',
                  border: '2px solid #3b82f6', // Giữ nguyên
                  padding: '30px',
                  marginBottom: '24px',
                  boxShadow: '0 0 40px rgba(59, 130, 246, 0.2)',
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column' as const,
                  gap: '20px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h3 style={{ margin: 0, fontSize: '13px', fontWeight: '900', color: '#60a5fa', display: 'flex', alignItems: 'center', gap: '12px', letterSpacing: '2px' }}>
                      <ShieldCheck size={20} /> HỒ SƠ TÀI KHOẢN THỦ CÔNG
                    </h3>
                    <button 
                      onClick={() => setIsEditing(true)}
                      style={{ ...styles.btnPrimary, padding: '6px 18px', fontSize: '11px', textTransform: 'uppercase' }}
                    >
                      Enter information
                    </button>
                  </div>

                  <div style={{ background: 'rgba(0, 0, 0, 0.6)', padding: '20px', borderRadius: '14px', border: '1px solid #333' }}>
                    <p style={{ margin: '0 0 10px 0', fontSize: '10px', color: '#60a5fa', fontWeight: '900', letterSpacing: '1px', opacity: 0.7 }}>USERNAME OR EMAIL / EMAIL</p>
                    <p style={{ margin: 0, fontSize: '16px', fontWeight: 'bold', color: 'white', display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span>{(isOwnProfile ? currentUser?.email : profileUser?.email) || profileUser?.username || 'chưa_cung_cấp'}</span>
                    </p>
                  </div>
                </div>

                {/* Section: Location */}
                <div style={styles.googleCard}>
                  <div style={{ padding: '20px 24px', borderBottom: '1px solid #333' }}>
                    <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>Location</h3>
                  </div>
                  <div
                    style={{ ...styles.googleRow, borderBottom: 'none' }}
                    className="google-row-hover"
                    onClick={() => setIsEditing(true)}
                  >
                    <div style={{ ...styles.infoValue, fontStyle: (isOwnProfile ? currentUser?.location : profileUser?.location) ? 'normal' : 'italic', color: (isOwnProfile ? currentUser?.location : profileUser?.location) ? 'white' : '#737373' }}>
                      {(isOwnProfile ? currentUser?.location : profileUser?.location) || "Click here to update location."}
                    </div>
                  </div>
                </div>

                {/* Section: Bio */}
                <div style={styles.googleCard}>
                  <div style={{ padding: '20px 24px', borderBottom: '1px solid #333' }}>
                    <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>Bio</h3>
                  </div>
                  <div 
                    style={{...styles.googleRow, borderBottom: 'none'}} 
                    className="google-row-hover"
                    onClick={() => setIsEditing(true)}
                  >
                    <div style={{...styles.infoValue, fontStyle: (isOwnProfile ? currentUser?.bio : profileUser?.bio) ? 'normal' : 'italic', color: (isOwnProfile ? currentUser?.bio : profileUser?.bio) ? 'white' : '#737373'}}>
                      {(isOwnProfile ? currentUser?.bio : profileUser?.bio) || "Click here to enter bio."}
                    </div>
                  </div>
                </div>
                </div>
              </div>
            ) : activeTab === 'songs' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {userSongs.length > 0 ? (
                userSongs.map((song, index) => {
                  const isCurrent = currentTrack?.id === song.id;
                  return (
                    <div
                      key={song.id}
                      onClick={() => playTrack(song)}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '40px 5fr 3fr 1fr',
                        gap: '16px',
                        padding: '12px 20px',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        alignItems: 'center',
                        transition: 'all 0.2s ease',
                        backgroundColor: isCurrent ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
                      }}
                      onMouseEnter={(e) => { if (!isCurrent) e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.08)'; }}
                      onMouseLeave={(e) => { if (!isCurrent) e.currentTarget.style.backgroundColor = 'transparent'; }}
                    >
                      <div style={{ color: isCurrent ? '#60a5fa' : '#737373', fontSize: '14px', fontFamily: 'monospace', textAlign: 'center' }}>
                        {isCurrent && isPlaying ? <Music size={16} className="animate-pulse" /> : index + 1}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <img src={song.thumbnailUrl} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} alt={song.title} />
                        <div>
                          <p style={{ fontWeight: '600', color: isCurrent ? '#93c5fd' : 'white', margin: 0 }}>{song.title}</p>
                          <p style={{ fontSize: '12px', color: '#aaa', margin: 0 }}>{song.artist}</p>
                        </div>
                      </div>
                      <div style={{ fontSize: '14px', color: '#aaa' }}>{song.artist}</div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '16px', color: '#aaa' }}>
                        <Heart size={16} className={song.isLiked ? 'text-blue-500' : 'text-transparent'} fill={song.isLiked ? 'currentColor' : 'none'} />
                        <span style={{ fontSize: '14px', fontFamily: 'monospace' }}>{formatTime(song.durationInSeconds)}</span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div style={{ textAlign: 'center', padding: '60px', color: '#aaa' }}>
                  <Music size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
                  <p>User has not uploaded any songs nào.</p>
                </div>
              )}
              </div>
            ) : activeTab === 'playlists' ? (
              <div>
              {userPlaylists.length > 0 ? (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '24px' }}>
                  {userPlaylists.map(playlist => (
                    <div 
                      key={playlist.id} 
                      onClick={() => navigate(`/playlist/${playlist.id}`)}
                      style={{ backgroundColor: '#181818', padding: '16px', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s' }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#282828'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#181818'}
                    >
                      {playlist.coverUrl ? (
                        <img src={playlist.coverUrl} alt={playlist.title} style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover', borderRadius: '4px', marginBottom: '12px', boxShadow: '0 8px 24px rgba(0,0,0,0.5)' }} />
                      ) : (
                        <div style={{ width: '100%', aspectRatio: '1/1', backgroundColor: '#333', borderRadius: '4px', marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <ListMusic size={48} color="#777" />
                        </div>
                      )}
                      <p style={{ fontWeight: 'bold', color: 'white', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{playlist.title}</p>
                      <p style={{ fontSize: '12px', color: '#aaa', margin: '4px 0 0' }}>{playlist.description || 'Playlist'}</p>
                    </div>
                  ))}
                  </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '60px', color: '#aaa' }}>
                  <ListMusic size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
                  <p>User has not created any playlists nào.</p>
                </div>
              )}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '60px', color: '#aaa' }}>
                <Music size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
                <p>Content for this tab is being updated...</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Profile;
