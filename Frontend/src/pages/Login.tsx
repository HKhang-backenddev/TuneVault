import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../axios';
import { Play, User, Lock, Loader2, ArrowRight } from 'lucide-react';

interface LoginProps {
  onLoginSuccess: (token: string) => void;
}

const Login = ({ onLoginSuccess }: LoginProps) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate();

  // Định nghĩa các đối tượng style giống hệt ImportMusic.tsx
  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      backgroundColor: 'transparent', // Nền trong suốt
      padding: '24px',
    },
    card: {
      width: '100%',
      maxWidth: '460px',
      backgroundColor: 'rgba(0,0,0,0.7)', // Nền thẻ bán trong suốt
      border: '2px solid #3b82f6',
      borderRadius: '16px',
      overflow: 'hidden',
      boxShadow: '0 0 40px rgba(59, 130, 246, 0.3)',
    },
    accentBar: {
      height: '8px',
      backgroundColor: '#3b82f6',
      width: '100%',
    },
    header: {
      padding: '40px 32px 24px',
      borderBottom: '1px solid #262626',
      backgroundColor: 'rgba(23, 23, 23, 0.5)',
      textAlign: 'center' as const,
    },
    form: {
      padding: '32px',
    },
    inputGroup: {
      marginBottom: '24px',
    },
    label: {
      fontSize: '14px',
      fontWeight: 'bold',
      color: '#ffffff',
      textAlign: 'left' as const,
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      textTransform: 'uppercase' as const,
      letterSpacing: '1px',
    },
    inputIconGroup: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      backgroundColor: 'rgba(17, 17, 17, 0.7)',
      borderRadius: '10px',
      padding: '0 16px',
      border: '2px solid #262626',
      transition: 'all 0.3s ease',
    },
    formInputNoBorder: {
      width: '100%',
      backgroundColor: 'transparent',
      color: '#ffffff',
      border: 'none',
      padding: '12px 16px',
      fontSize: '15px',
      outline: 'none',
    },
    buttonPrimary: {
      width: '100%',
      backgroundColor: '#3b82f6',
      color: '#ffffff',
      fontWeight: '900',
      padding: '16px',
      borderRadius: '10px',
      border: 'none',
      cursor: 'pointer',
      transition: 'background-color 0.2s',
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await api.post('/Auth/login', { 
        usernameOrEmail: username, 
        password: password 
      });
      
      // Kiểm tra kỹ các trường có thể chứa token từ Backend của bạn
      const resData = response.data;
      const token = typeof resData === 'string' 
        ? resData 
        : (resData.token || resData.accessToken || resData.data?.token);
      
      if (!token) {
        throw new Error("Không nhận được mã xác thực từ máy chủ.");
      }

      setIsSuccess(true);
      localStorage.setItem('userId', response.data.userId || '');
      // Lưu thông tin định danh đăng nhập (email hoặc username) để hiển thị ngay trên Profile khi backend chưa trả email
      localStorage.setItem('loginIdentifier', username);
      
      // Gọi onLoginSuccess ngay lập tức. App.tsx sẽ xử lý navigation và loading state.
      onLoginSuccess(token);

    } catch (err: any) {
      console.error("Lỗi đăng nhập:", err);
      
      // Lấy thông báo chi tiết từ server nếu có
      const message = err.response?.data?.message 
                   || err.response?.data 
                   || "Lỗi hệ thống (500). Kiểm tra Terminal của Backend C#.";
                   
      setError(typeof message === 'string' ? message : "Lỗi xác thực người dùng.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.accentBar}></div>
        
        <div style={styles.header}>
          <div className="flex flex-col items-center justify-center gap-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-900 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(59,130,246,0.6)] border border-white/20 animate-pulse">
              <Play className="w-10 h-10 text-white fill-current" />
            </div>
            <h1 className="text-5xl font-black tracking-tighter text-white drop-shadow-[0_0_15px_rgba(59,130,246,0.7)]">TuneVault</h1>
          </div>
          <p style={{ color: '#a3a3a3', fontSize: '14px' }}>Sử dụng tài khoản của bạn để tiếp tục</p>
        </div>
        
        <form onSubmit={handleSubmit} style={styles.form}>
          {error && <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded-lg mb-6 text-sm text-center font-medium">{error}</div>}
          {isSuccess && <div className="bg-green-500/10 border border-green-500/20 text-green-500 p-3 rounded-lg mb-6 text-sm text-center font-medium">Đăng nhập thành công!</div>}

          <div style={styles.inputGroup}>
            <label style={styles.label}><User size={14} /> Tài khoản</label>
            <div style={styles.inputIconGroup} className="focus-within-red">
              <input 
                disabled={isSuccess}
                type="text" 
                style={styles.formInputNoBorder}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                placeholder="Email hoặc tên đăng nhập"
                onFocus={(e) => (e.currentTarget.parentElement!.style.borderColor = '#3b82f6')}
                onBlur={(e) => (e.currentTarget.parentElement!.style.borderColor = '#262626')}
              />
            </div>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}><Lock size={14} /> Mật khẩu</label>
            <div style={styles.inputIconGroup}>
              <input 
                disabled={isSuccess}
                type="password" 
                style={styles.formInputNoBorder}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                onFocus={(e) => (e.currentTarget.parentElement!.style.borderColor = '#3b82f6')}
                onBlur={(e) => (e.currentTarget.parentElement!.style.borderColor = '#262626')}
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading || isSuccess}
            style={{ ...styles.buttonPrimary, backgroundColor: isSuccess ? '#16a34a' : '#3b82f6', opacity: loading ? 0.7 : 1 }}
            className="hover:scale-[1.02] transition-all active:scale-95 tracking-widest text-sm flex items-center justify-center gap-2"
          >
            {isSuccess ? 'ĐANG VÀO...' : (loading ? <Loader2 className="animate-spin" size={20} /> : <>TIẾP THEO <ArrowRight size={18} /></>)}
          </button>

          <div className="mt-8 pt-6 border-t border-neutral-800 text-center">
            <p className="text-neutral-400 text-sm">Bạn chưa có tài khoản? <Link to="/register" className="text-blue-500 hover:text-blue-400 font-bold hover:underline transition-colors">Đăng ký ngay</Link></p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;