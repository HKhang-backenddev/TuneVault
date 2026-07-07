import { useState, useEffect } from 'react';
import { Shield, CheckCircle, XCircle } from 'lucide-react';

const AdminPanel = () => {
  const [role, setRole] = useState<string>('User');
  const [username, setUsername] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');

  useEffect(() => {
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setUsername(user.username || user.displayName || 'User');
      } catch (e) {
        setUsername('User');
      }
    }
    checkRole();
  }, []);

  const checkRole = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/user/my-role', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setRole(data.role);
      }
    } catch (e) {
      console.error('Failed to check role');
    }
  };

  const becomeAdmin = async () => {
    if (!token) {
      setMessage({ type: 'error', text: 'Bạn cần đăng nhập trước!' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch('http://localhost:5000/api/user/make-me-admin', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await res.json();

      if (res.ok) {
        setRole('Admin');
        setMessage({ type: 'success', text: data.message });
        
        // Update localStorage
        if (userStr) {
          const user = JSON.parse(userStr);
          user.role = 'Admin';
          localStorage.setItem('user', JSON.stringify(user));
        }
        
        // Reload after 2 seconds
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        setMessage({ type: 'error', text: data.message || 'Có lỗi xảy ra!' });
      }
    } catch (e) {
      setMessage({ type: 'error', text: 'Không thể kết nối server. Hãy chắc chắn Backend đang chạy!' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      padding: '32px', 
      maxWidth: '600px', 
      margin: '0 auto',
      backgroundColor: '#1a1a2e',
      borderRadius: '12px',
      boxShadow: '0 0 30px rgba(0, 255, 136, 0.3)'
    }}>
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <Shield size={64} style={{ color: role === 'Admin' ? '#FFD700' : '#666', filter: role === 'Admin' ? 'drop-shadow(0 0 20px rgba(255, 215, 0, 0.8))' : 'none' }} />
        <h1 style={{ 
          fontSize: '32px', 
          fontWeight: 'bold', 
          color: '#fff', 
          marginTop: '16px',
          textShadow: role === 'Admin' ? '0 0 20px rgba(255, 215, 0, 0.5)' : 'none'
        }}>
          {role === 'Admin' ? 'Bạn là Admin!' : 'Trở thành Admin'}
        </h1>
        <p style={{ color: '#b3b3b3', marginTop: '8px' }}>
          Tài khoản: <strong style={{ color: '#00FFFF' }}>{username}</strong>
        </p>
        <p style={{ 
          color: role === 'Admin' ? '#FFD700' : '#888', 
          marginTop: '8px',
          fontWeight: 'bold'
        }}>
          Role hiện tại: {role}
        </p>
      </div>

      {message && (
        <div style={{
          padding: '16px 24px',
          borderRadius: '8px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          backgroundColor: message.type === 'success' ? 'rgba(0, 255, 136, 0.2)' : 'rgba(255, 77, 77, 0.2)',
          border: `1px solid ${message.type === 'success' ? '#00FF88' : '#ff4d4d'}`
        }}>
          {message.type === 'success' ? (
            <CheckCircle size={24} style={{ color: '#00FF88' }} />
          ) : (
            <XCircle size={24} style={{ color: '#ff4d4d' }} />
          )}
          <span style={{ color: message.type === 'success' ? '#00FF88' : '#ff4d4d' }}>
            {message.text}
          </span>
        </div>
      )}

      {role !== 'Admin' && (
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: '#888', marginBottom: '24px' }}>
            Nhấn nút bên dưới để trở thành Admin và có thể chỉnh sửa bài hát
          </p>
          <button
            onClick={becomeAdmin}
            disabled={loading}
            style={{
              padding: '16px 48px',
              fontSize: '18px',
              fontWeight: 'bold',
              background: loading ? '#333' : 'linear-gradient(135deg, #FFD700, #FFA500)',
              color: '#000',
              border: 'none',
              borderRadius: '12px',
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: '0 0 20px rgba(255, 215, 0, 0.5)',
              transition: 'all 0.3s ease'
            }}
          >
            {loading ? 'Đang xử lý...' : '🚀 Trở thành Admin'}
          </button>
        </div>
      )}

      {role === 'Admin' && (
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: '#00FF88', marginBottom: '24px', fontSize: '18px' }}>
            ✨ Bạn đã là Admin! Giờ bạn có thể chỉnh sửa bài hát ở trang Library.
          </p>
          <a 
            href="/app/library"
            style={{
              display: 'inline-block',
              padding: '14px 32px',
              fontSize: '16px',
              fontWeight: 'bold',
              background: 'linear-gradient(135deg, #00FF88, #00FFFF)',
              color: '#000',
              borderRadius: '8px',
              textDecoration: 'none',
              boxShadow: '0 0 20px rgba(0, 255, 136, 0.5)'
            }}
          >
            Đi đến Library →
          </a>
        </div>
      )}

      {!token && (
        <div style={{ textAlign: 'center', marginTop: '24px', padding: '16px', backgroundColor: 'rgba(255, 77, 77, 0.1)', borderRadius: '8px' }}>
          <p style={{ color: '#ff4d4d' }}>
            ⚠️ Bạn chưa đăng nhập. Hãy đăng nhập trước khi trở thành Admin.
          </p>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
