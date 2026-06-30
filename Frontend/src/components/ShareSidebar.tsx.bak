import React, { useEffect, useRef, useState } from 'react';
import api from '../axios';
import { Music, Share2, X, User as UserIcon, Loader2 } from 'lucide-react';
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
  // State để quản lý hiệu ứng hover và active cho các nút bằng inline style
  const [isReceiverInputFocused, setIsReceiverInputFocused] = useState(false);
  const [isCloseButtonHovered, setIsCloseButtonHovered] = useState(false);
  const [isSubmitButtonHovered, setIsSubmitButtonHovered] = useState(false);
  const [isSubmitButtonActive, setIsSubmitButtonActive] = useState(false);

  useEffect(() => {
    if (songForShare) {
      // Reset state khi có bài hát mới được chọn
      setReceiverUsername('');
      setStatus(null);
      setBusy(false);
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [songForShare]);

  const handleShare = async (e?: React.FormEvent) => {
    // Ngăn form submit và tải lại trang
    if (e) {
      e.preventDefault();
    }

    setStatus(null);
    const receiver = receiverUsername.trim();
    if (!songForShare) {
      setStatus({ type: 'error', message: 'Chưa có bài hát để chia sẻ.' });
      return;
    }
    if (!receiver) {
      setStatus({ type: 'error', message: 'Vui lòng nhập username hoặc email người nhận.' });
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

      // Reset form và hiển thị thông báo thành công
      setReceiverUsername('');
      setStatus({ type: 'success', message: `Đã gửi thành công cho '${receiver}'!` });
      inputRef.current?.focus();
      // Tự động đóng sidebar sau 2 giây
      const timer = setTimeout(() => {
        selectSongForShare(null);
      }, 2000);

    } catch (e: any) {
      // Hiển thị lỗi từ backend trả về
      const msg = e?.response?.data?.message || e?.message || 'Chia sẻ thất bại. Vui lòng thử lại.';
      const statusCode = e?.response?.status;
      setStatus({
        type: 'error',
        message: statusCode ? `Chia sẻ thất bại (${statusCode}): ${msg}` : `Chia sẻ thất bại: ${msg}`
      });
    } finally {
      setBusy(false);
    }
  };

  // Nếu không có bài hát nào được chọn để chia sẻ, không hiển thị gì cả
  if (!songForShare) {
    return null;
  }

  // --- INLINE STYLES ĐỂ ĐẢM BẢO HIỆU ỨNG HIỂN THỊ ---

  const mainContainerStyle: React.CSSProperties = {
    width: '300px',
    flexShrink: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: '24px',
    border: '2px solid transparent',
    backgroundImage: 'linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), linear-gradient(160deg, #c084fc, #3b82f6, #10b981, #c084fc)',
    backgroundOrigin: 'border-box',
    backgroundClip: 'padding-box, border-box',
    backgroundSize: '200% 100%',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.7), 0 0 40px rgba(59, 130, 246, 0.2)',
    backdropFilter: 'blur(12px)',
    animation: 'animated-border-share 8s linear infinite',
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    alignSelf: 'flex-start',
    position: 'sticky',
    top: '24px',
  };

  const closeButtonStyle: React.CSSProperties = {
    position: 'absolute',
    top: '16px',
    right: '16px',
    padding: '8px',
    borderRadius: '9999px',
    color: isCloseButtonHovered ? 'white' : '#a3a3a3',
    backgroundColor: isCloseButtonHovered ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
    transition: 'all 0.2s ease',
    border: 'none',
    cursor: 'pointer',
    zIndex: 10,
  };

  const submitButtonStyle: React.CSSProperties = {
    width: '100%',
    backgroundImage: 'linear-gradient(to right, #a855f7, #3b82f6, #22d3ee)', // from-purple-500 via-blue-500 to-cyan-400
    backgroundSize: '200% auto',
    backgroundPosition: isSubmitButtonHovered ? 'right center' : 'left center', // hover:bg-right
    color: 'white',
    fontWeight: 'bold',
    padding: '12px 0', // py-3
    borderRadius: '0.75rem', // rounded-xl
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem', // gap-2
    transition: 'all 0.5s ease',
    border: 'none',
    transform: isSubmitButtonHovered && !isSubmitButtonActive ? 'scale(1.05)' : 'scale(1)', // hover:scale-105 active:scale-100
    boxShadow: isSubmitButtonHovered ? '0 0 25px rgba(96, 165, 250, 0.8)' : 'none', // hover:shadow-[...]
    opacity: (busy || !songForShare) ? 0.5 : 1,
    cursor: (busy || !songForShare) ? 'not-allowed' : 'pointer',
  };

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: '16px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
  };

  const labelStyle: React.CSSProperties = {
    color: '#a3a3a3',
    fontSize: '0.75rem',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    cursor: 'default',
    marginBottom: '4px',
  };

  const infoBoxStyle: React.CSSProperties = {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '8px',
    padding: '12px',
  };

  const songTitleStyle: React.CSSProperties = {
    color: 'white',
    fontWeight: 600,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  };

  const songArtistStyle: React.CSSProperties = {
    color: '#a3a3a3',
    fontSize: '0.875rem',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    marginTop: '4px',
  };

  const receiverInputStyle: React.CSSProperties = {
    width: '100%',
    backgroundColor: 'transparent',
    border: 'none',
    outline: 'none',
    color: 'white',
    padding: '12px 0',
    fontSize: '0.875rem',
  };

  // Giao diện được thiết kế lại để giống với các khung thông tin khác
  return (
    <>
      <style>{`
        @keyframes animated-border-share {
          0% { background-position: 0% center; }
          100% { background-position: 200% center; }
        }
      `}</style>
      <div
        className="animate-in fade-in-50 slide-in-from-right-4 duration-300"
        style={mainContainerStyle}>
        <button
          onClick={() => selectSongForShare(null)}
          title="Đóng"
          style={closeButtonStyle}
          onMouseEnter={() => setIsCloseButtonHovered(true)}
          onMouseLeave={() => setIsCloseButtonHovered(false)}
        >
          <X size={18} />
        </button>
        {/* --- Header --- */}
        <div style={headerStyle}>
          <h3 style={{ fontSize: '2rem', fontWeight: 900, color: 'white', textShadow: '0 0 10px #fff, 0 0 20px #fff, 0 0 30px #3b82f6, 0 0 40px #3b82f6' }} className="flex items-center gap-3 text-center">
            Gửi tặng giai điệu
          </h3>
        </div>

        {/* --- Form Section --- 
            Sử dụng thẻ <form> để đúng ngữ nghĩa và cấu trúc.
            Thêm flex-1 và flex-col để form chiếm hết không gian còn lại và đẩy nút bấm xuống dưới.
        */}
        <form onSubmit={handleShare} className="flex flex-col flex-1 gap-5">
          <fieldset className="flex flex-col gap-2 border-0 p-0 m-0">
            <label style={labelStyle}>
              <Music size={14} className="text-purple-400"/>
              Đang chia sẻ
            </label>
            <div style={infoBoxStyle}>
              <p style={songTitleStyle} title={songForShare.title}>
                {songForShare.title}
              </p>
              <p style={songArtistStyle} title={songForShare.artist}>
                {songForShare.artist || 'Nghệ sĩ không xác định'}
              </p>
            </div>
          </fieldset>

          {user && (
            <fieldset className="flex flex-col gap-2 border-0 p-0 m-0">
              <label style={labelStyle}>
                <UserIcon size={14} className="text-green-400"/>
                Người gửi
              </label>
              <div style={infoBoxStyle}>
                <p style={songTitleStyle}>@{user.username}</p>
              </div>
            </fieldset>
          )}

          <fieldset className="flex flex-col gap-2 border-0 p-0 m-0">
            <label htmlFor="receiverInput" style={labelStyle}>
              <UserIcon size={14} className="text-blue-400"/>
              Gửi tới
            </label>
            <div style={{
              position: 'relative',
            }}>
              <UserIcon size={16} style={{
                position: 'absolute',
                left: '16px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: isReceiverInputFocused ? '#60a5fa' : '#71717a',
                pointerEvents: 'none',
                transition: 'color 0.3s ease',
              }} />
              <input
                ref={inputRef}
                value={receiverUsername}
                id="receiverInput"
                onChange={(e) => setReceiverUsername(e.target.value)}
                placeholder="Tên người nhận (username/email)"
                style={receiverInputStyle}
                disabled={busy}
                required
                onFocus={() => setIsReceiverInputFocused(true)}
                onBlur={() => setIsReceiverInputFocused(false)}
              />
            </div>
          </fieldset>

          {/* --- Vùng hiển thị trạng thái và nút bấm --- 
              Sử dụng mt-auto để đẩy vùng này xuống cuối cùng của form.
          */}
          <div className="mt-auto pt-2 pb-2">
            {status && (
              <div className={`text-sm font-semibold p-3 rounded-xl border mb-4 ${status.type === 'success' ? 'text-green-300 bg-green-500/10 border-green-500/30' : 'text-red-300 bg-red-500/10 border-red-500/30'}`}>
                {status.message}
              </div>
            )}
            <button
              type="submit"
              disabled={busy || !songForShare}
              style={submitButtonStyle}
              onMouseEnter={() => setIsSubmitButtonHovered(true)}
              onMouseLeave={() => {
                setIsSubmitButtonHovered(false);
                setIsSubmitButtonActive(false); // Reset active state on leave
              }}
              onMouseDown={() => setIsSubmitButtonActive(true)}
              onMouseUp={() => setIsSubmitButtonActive(false)}
            >
              {busy ? <Loader2 size={14} className="animate-spin" /> : <Share2 size={12} />}
              {busy ? 'Đang gửi...' : 'Gửi Giai Điệu'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};
