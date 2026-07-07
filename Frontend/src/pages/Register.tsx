import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../axios';
import { Play } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    displayName: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      backgroundColor: '#000000',
      padding: '24px',
    },
    card: {
      width: '100%',
      maxWidth: '440px',
      backgroundColor: '#000000',
      border: '1px solid #333',
      borderRadius: '16px',
      overflow: 'hidden',
      boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
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
      marginBottom: '20px',
    },
    label: {
      display: 'block',
      fontSize: '14px',
      fontWeight: 'bold',
      color: '#ffffff',
      marginBottom: '8px',
      textAlign: 'left' as const,
    },
    input: {
      width: '100%',
      backgroundColor: '#000000',
      color: '#ffffff',
      border: '1px solid #3f3f46',
      borderRadius: '8px',
      padding: '12px 16px',
      fontSize: '16px',
      outline: 'none',
      transition: 'border-color 0.2s',
    },
    buttonPrimary: {
      width: '100%',
      backgroundColor: '#3b82f6',
      color: '#ffffff',
      fontWeight: 'bold',
      padding: '14px',
      borderRadius: '8px',
      border: 'none',
      cursor: 'pointer',
      fontSize: '14px',
      letterSpacing: '1px',
      transition: 'background-color 0.2s',
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Chỉ gửi những trường cần thiết, backend sẽ tự tạo username
      await api.post('/Auth/register', formData);
      // Cải thiện trải nghiệm người dùng: không dùng alert()
      // Thay vào đó, có thể hiển thị một thông báo thành công và tự động chuyển hướng
      // Hoặc tự động đăng nhập người dùng sau khi đăng ký.
      // Tạm thời, chúng ta sẽ chuyển hướng ngay lập tức.
      navigate('/login');
    } catch (err: any) {
      console.error("Chi tiết lỗi kết nối:", err); // Dòng này cực kỳ quan trọng để debug
      // Lấy thông báo lỗi chi tiết từ Backend trả về
      const serverMessage = err.response?.data?.message;
      const validationErrors = err.response?.data?.errors ? Object.values(err.response.data.errors).flat().join(', ') : null;
      
      setError(validationErrors || serverMessage || `Connection error: ${err.message}. Make sure Backend is running on port 5132.`);
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
          <p style={{ color: '#a3a3a3', fontSize: '14px' }}>Create a new account to start listening</p>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          {error && <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded-lg mb-6 text-sm text-center font-medium">{error}</div>}

          <div style={styles.inputGroup}>
            <label style={styles.label}>What is your email?</label>
            <input 
              type="email" 
              style={styles.input} 
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value, username: e.target.value})}
              placeholder="name@domain.com" 
              required
              onFocus={(e) => e.currentTarget.style.borderColor = '#3b82f6'}
              onBlur={(e) => e.currentTarget.style.borderColor = '#3f3f46'}
            />
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Your display name</label>
            <input 
              type="text" 
              style={styles.input}
              value={formData.displayName}
              onChange={(e) => setFormData({...formData, displayName: e.target.value})}
              placeholder="Display name on profile"
              required
              onFocus={(e) => e.currentTarget.style.borderColor = '#3b82f6'}
              onBlur={(e) => e.currentTarget.style.borderColor = '#3f3f46'}
            />
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Create password</label>
            <input 
              type="password" 
              style={styles.input} 
              value={formData.password} // Sửa lại để liên kết đúng với formData.password
              onChange={(e) => setFormData({...formData, password: e.target.value})} // Sửa lại để cập nhật đúng
              placeholder="Password"
              required 
              onFocus={(e) => e.currentTarget.style.borderColor = '#3b82f6'}
              onBlur={(e) => e.currentTarget.style.borderColor = '#3f3f46'}
            />
          </div>

          <button 
            type="submit"
            disabled={loading} 
            style={{ ...styles.buttonPrimary, opacity: loading ? 0.7 : 1 }}
            className="hover:scale-[1.01] transition-all active:scale-95 tracking-widest text-xs"
          >
            {loading ? "PROCESSING..." : "SIGN UP"}
          </button>

          <div className="mt-8 pt-6 border-t border-neutral-800 text-center">
            <p className="text-neutral-400 text-sm">Already have an account? <Link to="/login" className="text-blue-500 hover:text-blue-400 font-bold hover:underline transition-colors">Login here</Link></p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;