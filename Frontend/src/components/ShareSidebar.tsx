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

  useEffect(() => {
    if (songForShare) {
      // Reset state khi có bài hát mới được chọn
      setReceiverUsername('');
      setStatus(null);
      setBusy(false);
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [songForShare]);

  const handleShare = async () => {
    setStatus(null);
    const receiver = receiverUsername.trim();
    if (!songForShare) {
      setStatus({ type: 'error', message: 'Chưa có bài hát để chia sẻ.' });
      return;
    }
    if (!receiver) {
      setStatus({ type: 'error', message: 'Vui lòng nhập username hoặc email người nhận.' });
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
        style={{
          width: '280px', // Giảm nhẹ độ rộng để gọn hơn
          flexShrink: 0,
          backgroundColor: 'rgba(0,0,0,0.6)', // Nền trong suốt hơn
          border: '2px solid transparent',
          borderRadius: '16px', // Bo tròn ít hơn
          backgroundImage: 'linear-gradient(rgba(0,0,0,0.8), rgba(0,0,0,0.8)), linear-gradient(135deg, #c084fc, #3b82f6, #10b981, #c084fc)',
          backgroundOrigin: 'border-box',
          backgroundClip: 'padding-box, border-box',
          backgroundSize: '200% 100%',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5), 0 0 25px rgba(59, 130, 246, 0.15)', // Bóng đổ nhẹ hơn
          animation: 'animated-border-share 8s linear infinite',
          padding: '16px', // Giảm padding
          display: 'flex',
          flexDirection: 'column',
          gap: '12px', // Giảm khoảng cách giữa các phần
          alignSelf: 'flex-start',
          position: 'sticky',
          top: '24px',
        }}>
        {/* --- Header --- */}
        <div className="relative flex items-center justify-center pb-2 border-b border-white/10">
          <h3 className="text-base font-bold tracking-tight text-white drop-shadow-[0_0_8px_rgba(59,130,246,0.6)] flex items-center gap-2">
            <Share2 size={18} className="text-blue-400" />
            Chia sẻ bài hát
          </h3>
          <button
            onClick={() => selectSongForShare(null)}
            className="absolute right-0 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition-colors"
            title="Đóng"
          >
            <X size={16} />
          </button>
        </div>

        {/* --- Form Section --- */}
        <div className="flex flex-col gap-3"> {/* Giảm khoảng cách giữa các section */}
          {/* Song Info */}
          <div className="flex flex-col gap-1">
            <label className="text-neutral-400 text-xs font-bold uppercase tracking-wider flex items-center gap-2">
              <Music size={14} />
              Bài hát
            </label>
            <div className="bg-black/30 p-2 rounded-lg border border-white/10 shadow-inner"> {/* Nền và viền mới */}
              <p className="text-white text-sm font-semibold truncate" title={songForShare.title}>
                {songForShare.title}
              </p>
              <p className="text-neutral-400 text-xs truncate" title={songForShare.artist}>
                {songForShare.artist || 'Nghệ sĩ không xác định'}
              </p>
            </div>
          </div>

          {/* Sender Info */}
          {user && (
            <div className="flex flex-col gap-1"> {/* Căn trái label */}
              <label className="text-neutral-400 text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                <UserIcon size={14} />
                Từ
              </label>
              <div className="bg-black/30 p-2 rounded-lg border border-white/10 shadow-inner"> {/* Nền và viền mới */}
                <p className="text-white font-semibold text-left">@{user.username}</p> {/* Căn trái nội dung */}
              </div>
            </div>
          )}

          {/* Receiver Input */}
          <div className="flex flex-col gap-1">
            <label htmlFor="receiverInput" className="text-neutral-400 text-xs font-bold uppercase tracking-wider flex items-center gap-2">
              <UserIcon size={12} />
              Gửi tới
            </label>
            <div className="flex items-center gap-2 bg-neutral-900/70 border border-neutral-700 rounded-lg px-3 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/50 transition-all"> {/* Nền và viền mới */}
            <input
              ref={inputRef}
              value={receiverUsername}
              id="receiverInput"
              onChange={(e) => setReceiverUsername(e.target.value)}
              placeholder="Username hoặc email"
              className="w-full bg-transparent py-2 text-sm text-white outline-none text-left placeholder:text-left"
              disabled={busy}
            />
          </div>
        </div>
        </div>

        {status && (
          <div className={`text-xs font-semibold p-2.5 rounded-lg border ${status.type === 'success' ? 'text-green-300 bg-green-500/10 border-green-500/30' : 'text-red-300 bg-red-500/10 border-red-500/30'
            }`}>
            {status.message}
          </div>
        )}

        {/* --- Nút bấm chính --- */}
        <button
          onClick={handleShare}
          disabled={busy || !songForShare}
          className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-2 rounded-lg flex items-center justify-center gap-2 transition-all duration-300 hover:shadow-md hover:shadow-blue-500/30 active:scale-95"
        >
          {busy ? <Loader2 size={14} className="animate-spin" /> : <Share2 size={12} />}
          {busy ? 'Đang gửi...' : 'Gửi ngay'}
        </button>
      </div>
    </>
  );
};
