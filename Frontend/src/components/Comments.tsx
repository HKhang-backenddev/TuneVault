import { useState, useEffect } from 'react';
import { MessageCircle, Send, Trash2, Loader2, Heart } from 'lucide-react';
import api from '../axios';
import { User } from '@shared-types/user';

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  userId: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
}

interface CommentsProps {
  mediaId: string;
  user: User | null;
}

const Comments = ({ mediaId, user }: CommentsProps) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [likes, setLikes] = useState(0);

  useEffect(() => {
    fetchComments();
  }, [mediaId]);

  const fetchComments = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/media/${mediaId}/comments`);
      setComments(res.data || []);
      setLikes(Math.floor(Math.random() * 50)); // Demo likes
    } catch (error) {
      console.error("Lỗi khi tải bình luận:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;

    setPosting(true);
    try {
      await api.post(`/media/${mediaId}/comments`, { content: newComment.trim() });
      setNewComment('');
      fetchComments();
    } catch (error) {
      console.error("Lỗi khi đăng bình luận:", error);
    } finally {
      setPosting(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!confirm('Xóa bình luận này?')) return;
    try {
      await api.delete(`/comments/${commentId}`);
      setComments(comments.filter(c => c.id !== commentId));
    } catch (error) {
      console.error("Lỗi khi xóa bình luận:", error);
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (mins < 1) return 'Vừa xong';
    if (mins < 60) return `${mins} phút`;
    if (hours < 24) return `${hours} giờ`;
    if (days < 7) return `${days} ngày`;
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: 'short' });
  };

  return (
    <div className="bg-gradient-to-b from-neutral-900/80 to-neutral-950/80 rounded-3xl p-6 border border-white/5 backdrop-blur-xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center shadow-lg shadow-pink-500/20">
            <MessageCircle size={24} className="text-white" />
          </div>
          <div>
            <h3 className="font-bold text-white text-lg">Bình luận</h3>
            <p className="text-sm text-white/50">{comments.length} bình luận</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-pink-500/10 border border-pink-500/20">
          <Heart size={14} className="text-pink-400" />
          <span className="text-pink-400 text-sm font-semibold">{likes}</span>
        </div>
      </div>

      {/* Input */}
      {user ? (
        <form onSubmit={handlePost} className="flex gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold flex-shrink-0 shadow-lg">
            {user.displayName?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1 flex gap-3">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Chia sẻ cảm nghĩ của bạn..."
              className="flex-1 bg-white/5 rounded-2xl px-5 py-3 text-sm text-white placeholder:text-neutral-500 outline-none focus:ring-2 ring-pink-500/50 border border-transparent focus:border-pink-500/30 transition-all"
            />
            <button
              type="submit"
              disabled={!newComment.trim() || posting}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold text-sm hover:shadow-lg hover:shadow-pink-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {posting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              Gửi
            </button>
          </div>
        </form>
      ) : (
        <div className="bg-white/5 rounded-2xl p-4 mb-6 text-center border border-white/5">
          <p className="text-neutral-400 text-sm">Đăng nhập để tham gia bình luận</p>
        </div>
      )}

      {/* Comments List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 border-3 border-pink-500/30 rounded-full" />
            <div className="absolute inset-0 border-3 border-transparent border-t-pink-500 rounded-full animate-spin" />
          </div>
          <p className="mt-4 text-white/50 text-sm">Đang tải bình luận...</p>
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-12 bg-white/5 rounded-2xl border border-white/5">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-pink-500/10 flex items-center justify-center">
            <MessageCircle size={32} className="text-pink-400/50" />
          </div>
          <p className="text-white/50 font-medium">Chưa có bình luận nào</p>
          <p className="text-white/30 text-sm mt-1">Hãy là người đầu tiên bình luận!</p>
        </div>
      ) : (
        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
          {comments.map((comment, index) => (
            <div 
              key={comment.id} 
              className="group flex gap-4 p-4 rounded-2xl bg-white/[0.02] hover:bg-white/[0.05] transition-all border border-transparent hover:border-pink-500/10"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="relative flex-shrink-0">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold shadow-lg">
                  {comment.displayName?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                {index === 0 && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-pink-500 flex items-center justify-center">
                    <span className="text-[8px]">🔥</span>
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-white text-sm">{comment.displayName}</span>
                  <span className="text-neutral-600 text-xs">@{comment.username}</span>
                  <span className="text-neutral-600 text-xs">•</span>
                  <span className="text-neutral-500 text-xs">{formatTime(comment.createdAt)}</span>
                </div>
                <p className="text-neutral-300 text-sm leading-relaxed">{comment.content}</p>
                <div className="flex items-center gap-4 mt-2">
                  <button className="flex items-center gap-1 text-neutral-500 hover:text-pink-400 text-xs transition-colors">
                    <Heart size={12} />
                    <span>0</span>
                  </button>
                  <button className="text-neutral-500 hover:text-white text-xs transition-colors">
                    Trả lời
                  </button>
                </div>
              </div>
              {user && user.id === comment.userId && (
                <button
                  onClick={() => handleDelete(comment.id)}
                  className="p-2 text-neutral-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all rounded-lg hover:bg-red-500/10"
                  title="Xóa"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Comments;
