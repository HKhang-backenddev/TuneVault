import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation, Outlet } from 'react-router-dom';
import {
  Search as SearchIcon, Plus, Home as HomeIcon, Library as LibraryIcon,
  History, Bell, Play, LogOut, User as UserIcon, Heart, Camera, Image as ImageIcon, Loader2
} from 'lucide-react';
import api from './axios';
import PlayerBar from './Components/PlayerBar'; // Đảm bảo đường dẫn này đúng
import Home from './pages/Home';
import Notifications from './pages/Notifications';
import Search from './pages/Search';
import DownloadHistory from './pages/DownloadHistory';
import Login from './pages/Login';
import Register from './pages/Register_inform';
import LibraryPage from './pages/Library';
import PlaylistDetail from './pages/PlaylistDetail';
import ImportMusic from './pages/ImportMusic';
import Profile from './pages/Profile';
import MainLayout from './Components/MainLayout';
import LikedSongs from './pages/LikedSongs';
import SharedWithMe from './pages/SharedWithMe';
import { AppHeader } from './Components/AppHeader';
import { AudioProvider } from './Contexts/AudioContext';
import { useEffect, useState, useRef } from 'react';
import * as signalR from '@microsoft/signalr';

const TOAST_STYLES = {
  success: 'bg-green-500/10 border-green-500/20 text-green-400',
  error: 'bg-red-500/10 border-red-500/20 text-red-400',
  info: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
} as const;

type StatusMessage = {
  id: string;
  type: 'success' | 'error' | 'info';
  text: string;
  duration?: number;
};

/**
 * Component này đóng vai trò là "cổng bảo vệ".
 * Nó kiểm tra xem người dùng đã đăng nhập (có token) hay chưa.
 * - Nếu có: Hiển thị nội dung được bảo vệ (children).
 * - Nếu không: Chuyển hướng người dùng về trang đăng nhập.
 */
const ProtectedRoute = ({ token, children }: { token: string | null, children: JSX.Element }) => {
  if (!token) {
    // Người dùng chưa đăng nhập, chuyển hướng về trang login.
    // `replace` để người dùng không thể nhấn "Back" quay lại trang cũ.
    return <Navigate to="/login" replace />;
  }

  // Người dùng đã đăng nhập, hiển thị nội dung trang.
  return children;
};

/**
 * Component hợp nhất các hiệu ứng nền (tia chớp, mưa) để đảm bảo z-index và render đúng cách.
 */
const BackgroundEffects = () => (
  <>
    <style>{`
      /* --- Hiệu ứng Digital Rain --- */
      @keyframes digital-rain-fall {
        0% { transform: translateY(-100%); }
        100% { transform: translateY(100vh); }
      }

      .rain-column {
        position: absolute;
        top: 0;
        writing-mode: vertical-rl;
        text-orientation: upright;
        font-family: 'Courier New', Courier, monospace;
        font-size: 16px;
        user-select: none;
        animation: digital-rain-fall linear infinite;
        text-shadow: 0 0 7px rgba(59, 130, 246, 0.8), 0 0 15px rgba(59, 130, 246, 0.5);
        will-change: transform;
      }
    `}</style>
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', pointerEvents: 'none', zIndex: -1, overflow: 'hidden', background: 'rgba(0,0,0,0.95)' }}>
      {Array.from({ length: 120 }).map((_, i) => {
        const characters = 'アァカサタナハマヤャラワガザダバパイィキシチニヒミリヰギジヂビピウゥクスツヌフムユュルグズブヅプエェケセテネヘメレヱゲゼデベペオォコソトノホモヨョロヲゴゾドボポヴッン0123456789';
        const columnText = Array.from({ length: Math.floor(window.innerHeight / 14) })
          .map(() => characters.charAt(Math.floor(Math.random() * characters.length)))
          .join('');
        const duration = 4 + Math.random() * 8;
        const delay = Math.random() * 12;
        const left = Math.random() * 100;
        const color = `hsl(${195 + Math.random() * 30}, 100%, ${55 + Math.random() * 25}%)`;

        return (
          <div 
            key={`rain-col-${i}`} 
            className="rain-column"
            style={{
              left: `${left}vw`,
              color: color,
              animationDuration: `${duration}s`,
              animationDelay: `${delay}s`,
              fontSize: `${10 + Math.random() * 8}px`,
              opacity: 0.2 + Math.random() * 0.5
            }}
          >{columnText}</div>
        );
      })}
    </div>
  </>
);

/**
 * Layout chính cho các trang được bảo vệ, chứa Header, MainLayout và PlayerBar.
 * Component này sẽ render các trang con (Home, Profile, etc.) thông qua <Outlet />.
 */
const ProtectedLayout = ({ user, handleLogout, goHome, showUserMenu, toggleUserMenu, avatarInputRef, bannerInputRef, handleMenuUpload, navigate, location, searchQuery, setSearchQuery, lastRefreshTime, fetchProfile, onLogout }: any) => {
  return (
    <div className="flex flex-col h-screen w-full bg-transparent text-white overflow-hidden font-sans">
      <AppHeader
        user={user}
        handleLogout={handleLogout}
        goHome={goHome}
        showUserMenu={showUserMenu}
        toggleUserMenu={toggleUserMenu}
        avatarInputRef={avatarInputRef}
        bannerInputRef={bannerInputRef}
        handleMenuUpload={handleMenuUpload}
        navigate={navigate}
        location={location}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />
      <div className="flex-1 flex min-h-0">
        {/* MainLayout chứa menu bên trái và <Outlet /> để render các trang con */}
        <MainLayout user={user}>
          <Routes>
            <Route index element={<Home user={user} searchQuery={searchQuery} lastRefreshTime={lastRefreshTime} />} />
            <Route path="library" element={<LibraryPage />} />
            <Route path="history" element={<DownloadHistory lastRefreshTime={lastRefreshTime} />} />
            <Route path="liked" element={<LikedSongs lastRefreshTime={lastRefreshTime} />} />
            <Route path="search" element={<Search />} />
            <Route path="import" element={<ImportMusic />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="shared-with-me" element={<SharedWithMe />} />
            <Route 
              path="profile/:username" 
              element={<Profile currentUser={user} onUpdate={fetchProfile} onLogout={onLogout} />} 
            />
            <Route path="*" element={<Navigate to="/app" replace />} />
          </Routes>
        </MainLayout>
      </div>
      <PlayerBar />
    </div>
  );
};


function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusMessage, setStatusMessage] = useState<StatusMessage | null>(null);
  const [lastRefreshTime, setLastRefreshTime] = useState(0);
  const [user, setUser] = useState<{
    id: string;
    displayName: string;
    email?: string;
    username: string;
    avatarUrl?: string; bannerUrl?: string; createdAt?: string; lastUpdatedAt?: string; bio?: string; location?: string; websiteUrl?: string; twitterUrl?: string; githubUrl?: string; gender?: string; dateOfBirth?: string;
    // Thêm các thuộc tính mới để khớp với Profile.tsx
    followerCount?: number;
    followingCount?: number;
    isFollowing?: boolean;
    hasUnreadNotifications?: boolean; // Thêm trạng thái thông báo
  } | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true); // Trạng thái chờ kiểm tra Token
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Ref để chặn việc gọi API lấy profile chồng chéo
  const isFetchingProfile = useRef(false);

  // Refs cho việc upload ảnh từ Menu
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const [token, setToken] = useState<string | null>(() => {
    let t = localStorage.getItem('token');
    // Chuẩn hóa: loại bỏ các giá trị rác từ localStorage
    if (t === "undefined" || t === "null" || t === "dev-token-bypass") {
      t = null;
    }

    // Nếu không có token hợp lệ
    if (!t) {
      // Production: để null để render chuyển hướng về /login
      return null;
    }

    // Thiết lập token vào axios ngay lập tức nếu tìm thấy trong localStorage (tránh lỗi 401 khi refresh)
    api.defaults.headers.common['Authorization'] = `Bearer ${t}`;
    return t;
  });

  // Hàm cập nhật token và lưu vào storage đồng bộ
  const handleLoginSuccess = async (newToken: string) => {
    console.log("App: Đăng nhập thành công, đang thiết lập phiên làm việc...");
    localStorage.setItem('token', newToken);
    // Cập nhật ngay lập tức vào header của axios
    api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;

    // Cập nhật token trong state
    setToken(newToken);
    // Quan trọng: Phải `await` cho đến khi fetchProfile hoàn tất rồi mới điều hướng.
    // Điều này đảm bảo state `user` được cập nhật trước khi các trang khác được render.
    await fetchProfile(newToken);
    navigate('/');
  };

  const handleLogout = () => {
    if (location.pathname === '/login') return; // Không logout nếu đã ở trang login
    console.warn("App: Bắt đầu quá trình đăng xuất người dùng...");

    // Dọn dẹp header axios ngay lập tức
    delete api.defaults.headers.common['Authorization'];

    // Xóa tất cả dữ liệu liên quan đến người dùng khỏi localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('userId');

    // Tải lại toàn bộ ứng dụng để đảm bảo trạng thái được làm mới hoàn toàn
    // và chuyển hướng về trang đăng nhập.
    window.location.href = '/login';
  };

  const fetchProfile = async (activeToken?: string) => {
    const tokenToUse = activeToken || token || localStorage.getItem('token');

    if (isFetchingProfile.current) return;
    if (!tokenToUse || tokenToUse === "dev-token-bypass") {
      console.log("App: Bỏ qua fetchProfile - không có token hoặc đang ở chế độ khách.");
      setIsInitialLoading(false);
      return;
    }
    console.log("App: Bắt đầu fetchProfile với token:", tokenToUse ? tokenToUse.substring(0, 10) + "..." : "N/A");

    isFetchingProfile.current = true;

    try {
      console.log("App: Đang xác thực hồ sơ...");
      // Không cần truyền header thủ công vì axios.ts đã lo việc này
      const res = await api.get('/User/profile');

      // Xử lý dữ liệu trả về (hỗ trợ cả trường hợp bị bọc trong res.data.data)
      const rawData = res.data?.data || res.data;
      console.log("App: Raw Profile Data:", rawData);

      // Lấy trạng thái thông báo chưa đọc
      const notificationsRes = await api.get('/notifications');
      const hasUnread = notificationsRes.data?.some((n: any) => !n.isRead) || false;


      const normalizedUser = {
        id: rawData.id,
        displayName: rawData.displayName || rawData.username, // Luôn có tên hiển thị
        username: rawData.username,
        email: rawData.email, // Luôn tin tưởng dữ liệu từ server
        avatarUrl: rawData.avatarUrl,
        bannerUrl: rawData.bannerUrl,
        bio: rawData.bio,
        location: rawData.location,
        websiteUrl: rawData.websiteUrl,
        twitterUrl: rawData.twitterUrl,
        githubUrl: rawData.githubUrl,
        gender: rawData.gender,
        dateOfBirth: rawData.dateOfBirth,
        lastUpdatedAt: rawData.lastUpdatedAt,
        createdAt: rawData.createdAt,
        // Thêm các trường mới
        followerCount: rawData.followerCount,
        followingCount: rawData.followingCount,
        isFollowing: rawData.isFollowing,
        hasUnreadNotifications: hasUnread, // Gán vào user state
      };

      setUser(normalizedUser);
      setIsInitialLoading(false);
    } catch (err: any) {
      const status = err.response?.status;
      console.error(`App: Lỗi xác thực profile (${status}). Đang tiến hành đăng xuất.`);

      if (status === 401) {
        // Nếu token hết hạn hoặc không hợp lệ, luôn đăng xuất để người dùng lấy token mới.
        handleLogout();
      } else {
        // Đối với các lỗi server khác, cũng nên đăng xuất để tránh hiển thị dữ liệu cũ/sai.
        console.warn("App: Không thể tải hồ sơ do lỗi server. Đang đăng xuất.");
        setUser(null);
      }
      setIsInitialLoading(false);
    } finally {
      isFetchingProfile.current = false;
    }
  };

  // Logic upload ảnh dùng chung
  const handleMenuUpload = async (type: 'avatar' | 'banner', e: React.ChangeEvent<HTMLInputElement>) => {
    // 1. Kiểm tra nếu đang ở chế độ khách (Guest Mode)
    if (!token || token === "dev-token-bypass") {
      setStatusMessage({ id: Date.now().toString(), type: 'error', text: "Bạn cần đăng nhập để tải ảnh lên." });
      setTimeout(() => setStatusMessage(null), 3000);
      navigate('/login');
      return;
    }

    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setStatusMessage({ id: Date.now().toString(), type: 'info', text: `Đang tải ${type === 'avatar' ? 'ảnh đại diện' : 'ảnh bìa'} lên...` });

    try {
      // 2. Gửi request - Để Axios tự xử lý Content-Type (tự thêm boundary cho FormData)
      await api.post(`/User/${type}`, formData);

      setStatusMessage({ id: Date.now().toString(), type: 'success', text: "Cập nhật thành công!" });
      fetchProfile(); // Tải lại thông tin user để cập nhật ảnh trên toàn app
      setTimeout(() => setStatusMessage(null), 3000);
    } catch (err: any) {
      if (err.response?.status === 401) {
        setStatusMessage({ id: Date.now().toString(), type: 'error', text: "Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại." });
        handleLogout(); // Tự động đăng xuất để người dùng đăng nhập lại lấy Token mới
      } else {
        setStatusMessage({ id: Date.now().toString(), type: 'error', text: "Lỗi khi tải ảnh lên." });
      }
      setTimeout(() => setStatusMessage(null), 3000);
    } finally {
      // Reset input để có thể chọn lại cùng một file nếu cần
      e.target.value = '';
    }
  };

  useEffect(() => {
    if (token) {
      fetchProfile(token);
    } else {
      // Nếu không có token, chỉ cần dừng trạng thái loading
      setIsInitialLoading(false);
    }
  }, [token]);

  useEffect(() => {
    let connection: signalR.HubConnection | null = null;

    const setupSignalR = async () => {
      // Chỉ kết nối khi có token thật (độ dài lớn hơn bypass token)
      const currentToken = localStorage.getItem('token');
      if (!currentToken || currentToken === "dev-token-bypass" || currentToken === "null") {
        console.log("SignalR: Đang đợi đăng nhập hợp lệ...");
        return;
      }

      try {
        // Thêm /api/ để đi qua Proxy Vite tới đúng Backend
        connection = new signalR.HubConnectionBuilder()
          .withUrl("/api/notificationHub", {
            skipNegotiation: false,
            // Đảm bảo luôn lấy token mới nhất từ storage
            accessTokenFactory: () => currentToken
          })
          .withAutomaticReconnect()
          .build();

        connection.on("ReceiveNotification", (data: any) => {
          console.log("SignalR: Received data", data);
          if (data.message) {
            // Hiển thị toast message cho tất cả các loại thông báo có message
            // TYPE: share/follow/download_success/... từ backend
            setStatusMessage({
              id: Date.now().toString(),
              type: (data.type || 'info') as StatusMessage['type'],
              text: data.message
            });
          }
          // Xử lý các loại sự kiện khác nhau
          if (data.refresh) { // Chỉ làm mới toàn cục khi có cờ 'refresh' rõ ràng
            setLastRefreshTime(Date.now());
            fetchProfile(); // Tải lại profile để cập nhật trạng thái thông báo
          } else if (data.type === 'share') {
            window.dispatchEvent(new CustomEvent('mediaShared'));
            window.dispatchEvent(new CustomEvent('sharedListUpdated'));
          }

          // Tránh lỗi: nếu SignalR gửi cho nhiều sự kiện liên tiếp, không clear toast quá sớm/khác user.
          // Chỉ tự tắt toast khi là notification "đơn" (không kèm refresh chia sẻ hàng loạt).
          if (data.type !== 'info' && !data.refresh) {
            setTimeout(() => setStatusMessage(null), 5000);
          }
        });

        await connection.start();
        console.log("SignalR: Connected");
      } catch (e: any) {
        const errStr = e.toString();
        // Chỉ cảnh báo nhẹ nếu là 401, không làm đỏ console
        if (errStr.includes("401") || errStr.toLowerCase().includes("unauthorized")) {
          console.warn("SignalR: Chờ cấu hình xác thực từ URL trên Backend...");
        } else {
          console.error("SignalR Error:", e);
        }
      }
    };

    setupSignalR();
    return () => { connection?.stop(); };
  }, [token]);

  // Lắng nghe sự kiện cục bộ khi các component khác (ví dụ Home) dispatch 'favoritesUpdated'
  useEffect(() => {
    const handler = () => setLastRefreshTime(Date.now());
    window.addEventListener('favoritesUpdated', handler as EventListener);
    return () => window.removeEventListener('favoritesUpdated', handler as EventListener);
  }, []);
  
  // Lắng nghe sự kiện khi thông báo được cập nhật ở trang Notifications
  useEffect(() => {
    // Tạo một hàm bao để gọi fetchProfile mà không có đối số,
    // đảm bảo tương thích với kiểu EventListener.
    const handleNotificationsUpdate = () => {
      fetchProfile();
    };
    window.addEventListener('notificationsUpdated', handleNotificationsUpdate);
    return () => window.removeEventListener('notificationsUpdated', handleNotificationsUpdate);
  }, [fetchProfile]);

  useEffect(() => {
    const closeMenu = () => setShowUserMenu(false);
    if (showUserMenu) window.addEventListener('click', closeMenu);
    return () => window.removeEventListener('click', closeMenu);
  }, [showUserMenu]);

  // Hàm quay về trang chủ và xóa tìm kiếm
  const goHome = () => {
    setSearchQuery(''); // Xóa nội dung tìm kiếm
    // Chỉ điều hướng nếu không ở trang chủ
    if (location.pathname !== '/app') {
      navigate('/app');
    }
  };

  // Hàm bật/tắt menu người dùng, có ngăn chặn sự kiện lan truyền
  const toggleUserMenu = (e: React.MouseEvent) => {
    e.stopPropagation(); // Ngăn không cho sự kiện click lan ra window và đóng menu ngay lập tức
    setShowUserMenu(prev => !prev);
  };

  return (
    <AudioProvider>
      <BackgroundEffects />
      <style>{`
          @keyframes pulse-blue {
            0% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7); }
            70% { box-shadow: 0 0 0 10px rgba(59, 130, 246, 0); }
            100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
          }
          @keyframes pulse-red {
            0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
            70% { box-shadow: 0 0 0 8px rgba(239, 68, 68, 0); }
            100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
          }
          @keyframes neon-glow-box {
            0%, 100% { box-shadow: 0 0 8px rgba(59, 130, 246, 0.6), inset 0 0 4px rgba(59, 130, 246, 0.4); }
            50% { box-shadow: 0 0 20px rgba(59, 130, 246, 1), inset 0 0 8px rgba(59, 130, 246, 0.6); }
          }
          .neon-logo-box {
            background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
            animation: neon-glow-box 2.5s ease-in-out infinite;
            border: 1px solid rgba(255, 255, 255, 0.2);
          }
          @keyframes neon-profile-rainbow {
            0% { border-color: #ff0000; box-shadow: 0 0 15px rgba(255, 0, 0, 0.6), inset 0 0 8px rgba(255, 0, 0, 0.3); }
            20% { border-color: #ffff00; box-shadow: 0 0 15px rgba(255, 255, 0, 0.6), inset 0 0 8px rgba(255, 255, 0, 0.3); }
            40% { border-color: #00ff00; box-shadow: 0 0 15px rgba(0, 255, 0, 0.6), inset 0 0 8px rgba(0, 255, 0, 0.3); }
            60% { border-color: #00ffff; box-shadow: 0 0 15px rgba(0, 255, 255, 0.6), inset 0 0 8px rgba(0, 255, 255, 0.3); }
            80% { border-color: #0000ff; box-shadow: 0 0 15px rgba(0, 0, 255, 0.6), inset 0 0 8px rgba(0, 0, 255, 0.3); }
            100% { border-color: #ff0000; box-shadow: 0 0 15px rgba(255, 0, 0, 0.6), inset 0 0 8px rgba(255, 0, 0, 0.3); }
          }
          /* Hiệu ứng khi nhấn nút neon */
          .neon-button-active-effect:active {
            transform: scale(0.95);
            filter: brightness(1.2);
            box-shadow: 0 0 20px rgba(59, 130, 246, 0.8), inset 0 0 10px rgba(59, 130, 246, 0.4) !important;
          }
          .neon-card-active-effect:active {
            transform: translateY(0) scale(0.98);
            box-shadow: 0 0 25px rgba(59, 130, 246, 0.8) !important;
          }
          .sidebar-button-active-effect:active {
            transform: scale(0.96);
            background-color: #3b82f6 !important;
          }
        `}</style>

      <Routes>
        {/* Route công khai */}
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={ 
          token ? <Navigate to="/" replace /> : <Login onLoginSuccess={handleLoginSuccess} />
        } />

        {/* 
          Cấu trúc Route mới:
          - Route cha ("/") được bảo vệ bởi ProtectedRoute.
          - Nó render MainLayout, chứa menu bên trái và một <Outlet />.
          - Tất cả các trang con (index, library, profile,...) sẽ được render vào trong <Outlet /> đó.
        */}
        <Route
          path="/"
          element={
            <Navigate to="/app" replace />
          }>
        </Route>

        <Route path="/app/*" element={
          <ProtectedRoute token={token}>
            <ProtectedLayout
              user={user}
              handleLogout={handleLogout}
              goHome={goHome}
              showUserMenu={showUserMenu}
              toggleUserMenu={toggleUserMenu}
              avatarInputRef={avatarInputRef}
              bannerInputRef={bannerInputRef}
              handleMenuUpload={handleMenuUpload}
              navigate={navigate}
              location={location}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              lastRefreshTime={lastRefreshTime}
              fetchProfile={fetchProfile}
              onLogout={handleLogout}
            />
          </ProtectedRoute>
        } />

        <Route path="*" element={<Navigate to="/app" replace />} />
      </Routes>
    </AudioProvider>
  );
}

export default App;
