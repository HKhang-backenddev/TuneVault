import React, { useEffect, useRef, useState } from 'react';
import api from '../axios';
import { Music, Share2, X } from 'lucide-react';
import { useAudio } from '../Contexts/AudioContext';

interface MediaItem {
  id: string;
  title: string; 
}

type Status = {
  type: 'success' | 'error' | 'info';
  message: string;
}

export const ShareSidebar = ({ user }: { user: any }) => {
  const { songForShare, selectSongForShare } = useAudio();
  const [receiverUsername, setReceiverUsername] = useState('');
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<Status | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Focus vào input khi mở app
  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 150);
  }, []);

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

  return (
    <div 
      className="animate-in fade-in-50 slide-in-from-top-4 duration-300"
      style={{
        backgroundColor: '#121212',
        borderRadius: '12px',
        padding: '16px',
        border: '2px solid #3b82f6', // Làm viền dày hơn và có màu xanh
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        // Thêm hiệu ứng đổ bóng neon
        boxShadow: '0 0 25px rgba(59, 130, 246, 0.4), inset 0 0 10px rgba(59, 130, 246, 0.2)'
      }}>
        <div className="flex items-center gap-2 mb-2">
          <Share2 size={18} className="text-blue-500 flex-shrink-0" />
          <h3 className="text-white font-bold">Chia sẻ bài hát</h3>
          <button onClick={() => selectSongForShare(null)} className="ml-auto text-neutral-500 hover:text-white">
            <X size={16} />
          </button>
        </div>

        {songForShare ? (
          <div className="text-neutral-400 text-xs mb-2">
            Bài đang chọn: <span className="text-neutral-200 font-semibold">{songForShare.title}</span>
          </div>
        ) : (
          <div className="text-yellow-400/80 text-xs mb-2 p-2 bg-yellow-400/10 rounded-md border border-yellow-400/20">
            Vui lòng nhấn vào biểu tượng chia sẻ <Share2 size={12} className="inline-block mx-1" /> trên một bài hát để chọn.
          </div>
        )}

        {user && (
          <div className="text-neutral-500 text-[11px] text-center mb-2">
            Bạn đang chia sẻ với tư cách là <span className="font-bold text-neutral-400">@{user.username}</span>
          </div>
        )}

        <label className="text-neutral-500 text-xs font-bold uppercase tracking-wider">Gửi tới (Username hoặc Email)</label>
        <input
          ref={inputRef}
          value={receiverUsername}
          onChange={(e) => setReceiverUsername(e.target.value)}
          placeholder="Nhập username hoặc email"
          className="w-full mt-2 bg-neutral-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-blue-500"
          disabled={busy}
        />

        {status && (
           <div className={`mt-2 text-xs font-semibold p-2 rounded-md border ${
            status.type === 'success' ? 'text-green-400 bg-green-500/10 border-green-500/20' :
            status.type === 'error' ? 'text-red-400 bg-red-500/10 border-red-500/20' :
            'text-blue-400 bg-blue-500/10 border-blue-500/20'
           }`}>
            {status.message}
           </div>
        )}

        <button
          onClick={handleShare}
          disabled={busy || !songForShare}
          className="mt-3 w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-2 rounded-lg flex items-center justify-center gap-2"
        >
          <Music size={16} />
          {busy ? 'Đang chia sẻ...' : 'Chia sẻ'}
        </button>
    </div>
  );
};
