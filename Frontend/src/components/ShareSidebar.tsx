import React, { useEffect, useRef, useState } from 'react';
import api from '../axios';
import { Music, Share2, X, User as UserIcon, Loader2, Send, CheckCircle, AlertCircle } from 'lucide-react';
import { useAudio, Track } from '../Contexts/AudioContext';
import { User } from '@shared-types/user';

type Status = {
  type: 'success' | 'error' | 'info';
  message: string;
}

interface ShareSidebarAudioContext {
  songForShare: Track | null;
  selectSongForShare: (song: Track | null) => void;
}

export const ShareSidebar = ({ user }: { user: User | null }) => {
  const { songForShare, selectSongForShare } = useAudio() as ShareSidebarAudioContext;
  const [receiverUsername, setReceiverUsername] = useState('');
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<Status | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isReceiverInputFocused, setIsReceiverInputFocused] = useState(false);

  useEffect(() => {
    if (songForShare) {
      setReceiverUsername('');
      setStatus(null);
      setBusy(false);
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [songForShare]);

  const handleShare = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setStatus(null);
    const receiver = receiverUsername.trim();
    if (!songForShare) {
      setStatus({ type: 'error', message: 'Chưa có bài hát để chia sẻ.' });
      return;
    }
    if (!receiver) {
      setStatus({ type: 'error', message: 'Vui lòng nhập username người nhận.' });
      inputRef.current?.focus();
      return;
    }
    if (busy) return;
    setBusy(true);
    try {
      await api.post('/MediaItems/share', {
        receiverUsername: receiver,
        mediaId: songForShare.id
      });
      setReceiverUsername('');
      setStatus({ type: 'success', message: `Đã gửi thành công cho @${receiver}!` });
      setTimeout(() => { selectSongForShare(null); }, 2500);
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || 'Chia sẻ thất bại.';
      setStatus({ type: 'error', message: msg });
    } finally {
      setBusy(false);
    }
  };

  if (!songForShare) return null;

  return (
    <div 
      className="animate-in fade-in-50 slide-in-from-right-4 duration-300"
      style={{
        width: '340px',
        flexShrink: 0,
        background: 'linear-gradient(145deg, rgba(15, 15, 25, 0.95), rgba(25, 25, 40, 0.95))',
        borderRadius: '20px',
        border: '1px solid rgba(139, 92, 246, 0.3)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6), 0 0 40px rgba(139, 92, 246, 0.15)',
        backdropFilter: 'blur(20px)',
        padding: '0',
        display: 'flex',
        flexDirection: 'column',
        alignSelf: 'flex-start',
        position: 'sticky',
        top: '24px',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.3), rgba(59, 130, 246, 0.3))',
        padding: '24px',
        borderBottom: '1px solid rgba(139, 92, 246, 0.2)',
        position: 'relative',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
          <div style={{
            width: '48px', height: '48px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 20px rgba(139, 92, 246, 0.5)',
          }}>
            <Share2 size={24} color="white" />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: 'white', letterSpacing: '-0.02em' }}>
              Chia sẻ giai điệu
            </h3>
            <p style={{ margin: 0, fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.6)', fontWeight: 500 }}>
              Gửi nhạc cho bạn bè
            </p>
          </div>
        </div>
        <button
          onClick={() => selectSongForShare(null)}
          style={{
            position: 'absolute', top: '12px', right: '12px',
            width: '32px', height: '32px', borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.1)', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'rgba(255, 255, 255, 0.7)', transition: 'all 0.2s ease',
          }}
        >
          <X size={16} />
        </button>
      </div>

      {/* Content */}
      <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Song Card */}
        <div style={{
          background: 'rgba(0, 0, 0, 0.4)', borderRadius: '16px', padding: '16px',
          border: '1px solid rgba(255, 255, 255, 0.1)', display: 'flex', gap: '12px', alignItems: 'center',
        }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '12px', overflow: 'hidden', flexShrink: 0 }}>
            <img src={songForShare.thumbnailUrl || 'https://via.placeholder.com/56'} alt={songForShare.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div style={{ overflow: 'hidden' }}>
            <p style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600, color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{songForShare.title}</p>
            <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.5)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{songForShare.artist || 'Nghệ sĩ không xác định'}</p>
          </div>
        </div>

        {/* Sender Info */}
        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, #10b981, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.875rem', fontWeight: 700, color: 'white' }}>
              {user.displayName?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div>
              <p style={{ margin: 0, fontSize: '0.7rem', color: 'rgba(255, 255, 255, 0.5)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Gửi từ</p>
              <p style={{ margin: 0, fontSize: '0.875rem', color: 'white', fontWeight: 600 }}>@{user.username}</p>
            </div>
          </div>
        )}

        {/* Input */}
        <form onSubmit={handleShare} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'rgba(255, 255, 255, 0.6)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Gửi tới</label>
            <div style={{ position: 'relative', background: 'rgba(0, 0, 0, 0.4)', borderRadius: '12px', border: `2px solid ${isReceiverInputFocused ? 'rgba(139, 92, 246, 0.6)' : 'rgba(255, 255, 255, 0.1)'}`, transition: 'all 0.3s ease', overflow: 'hidden' }}>
              <UserIcon size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: isReceiverInputFocused ? '#8b5cf6' : 'rgba(255, 255, 255, 0.4)', transition: 'color 0.3s ease' }} />
              <input ref={inputRef} value={receiverUsername} onChange={(e) => setReceiverUsername(e.target.value)} placeholder="Nhập username người nhận" disabled={busy} required onFocus={() => setIsReceiverInputFocused(true)} onBlur={() => setIsReceiverInputFocused(false)} style={{ width: '100%', background: 'transparent', border: 'none', outline: 'none', color: 'white', padding: '14px 14px 14px 44px', fontSize: '0.95rem' }} />
            </div>
          </div>

          {/* Status */}
          {status && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', borderRadius: '12px', background: status.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)', border: `1px solid ${status.type === 'success' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`, animation: 'fadeIn 0.3s ease' }}>
              {status.type === 'success' ? <CheckCircle size={18} color="#10b981" /> : <AlertCircle size={18} color="#ef4444" />}
              <span style={{ fontSize: '0.875rem', fontWeight: 500, color: status.type === 'success' ? '#10b981' : '#ef4444' }}>{status.message}</span>
            </div>
          )}

          {/* Submit Button */}
          <button type="submit" disabled={busy || !songForShare} style={{ width: '100%', padding: '14px 20px', borderRadius: '12px', background: busy ? 'rgba(139, 92, 246, 0.5)' : 'linear-gradient(135deg, #8b5cf6, #6366f1)', color: 'white', fontSize: '0.95rem', fontWeight: 700, border: 'none', cursor: busy ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'all 0.3s ease', boxShadow: busy ? 'none' : '0 4px 15px rgba(139, 92, 246, 0.4)', marginTop: '8px' }}>
            {busy ? (<><Loader2 size={18} className="animate-spin" />Đang gửi...</>) : (<><Send size={18} />Gửi giai điệu</>)}
          </button>
        </form>
      </div>

      {/* Footer */}
      <div style={{ padding: '12px 24px', background: 'rgba(0, 0, 0, 0.3)', borderTop: '1px solid rgba(255, 255, 255, 0.05)', textAlign: 'center' }}>
        <p style={{ margin: 0, fontSize: '0.7rem', color: 'rgba(255, 255, 255, 0.4)' }}>Người nhận sẽ thấy bài hát này trong "Được chia sẻ với tôi"</p>
      </div>

      <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </div>
  );
};
