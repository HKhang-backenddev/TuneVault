import { useState, useEffect } from 'react';
import { MessageCircle, Send, Trash2, Loader2 } from 'lucide-react';
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

  useEffect(() => {
    fetchComments();
  }, [mediaId]);

  const fetchComments = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/media/${mediaId}/comments`);
      setComments(res.data || []);
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
    if (mins < 60) return `${mins} phút trước`;
    if (hours < 24) return `${hours} giờ trước`;
    if (days < 7) return `${days} ngày trước`;
    return date.toLocaleDateString('vi-VN');
  };

  return (
    <div className="bg-neutral-900/50 rounded-2xl p-4 border border-white/5">
      <div className="flex items-center gap-2 mb-4">
        <MessageCircle size={20} className="text-blue-400" />
        <h3 className="font-bold text-white">{comments.length} Bình luận</h3>
      </div>

      {/* Input */}
      {user ? (
        <form onSubmit={handlePost} className="flex gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold flex-shrink-0">
            {user.displayName?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1 flex gap-2">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Viết bình luận..."
              className="flex-1 bg-neutral-800 rounded-full px-4 py-2 text-sm text-white placeholder:text-neutral-500 outline-none focus:ring-2 ring-blue-500"
            />
            <button
              type="submit"
              disabled={!newComment.trim() || posting}
              className="px-4 py-2 rounded-full bg-blue-500 text-white font-semibold text-sm hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {posting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              Gửi
            </button>
          </div>
        </form>
      ) : (
        <p className="text-neutral-500 text-sm mb-6 text-center">Đăng nhập để bình luận</p>
      )}

      {/* Comments List */}
      {loading ? (
        <div className="text-center py-8">
          <Loader2 size={24} className="animate-spin text-neutral-500 mx-auto" />
        </div>
      ) : comments.length === 0 ? (
        <p className="text-neutral-500 text-sm text-center py-8">Chưa có bình luận nào</p>
      ) : (
        <div className="space-y-4 max-h-96 overflow-y-auto custom-scrollbar">
          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-3 group">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                {comment.displayName?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-white text-sm">{comment.displayName}</span>
                  <span className="text-neutral-500 text-xs">@{comment.username}</span>
                  <span className="text-neutral-600 text-xs">• {formatTime(comment.createdAt)}</span>
                </div>
                <p className="text-neutral-300 text-sm mt-1">{comment.content}</p>
              </div>
              {user && user.id === comment.userId && (
                <button
                  onClick={() => handleDelete(comment.id)}
                  className="p-2 text-neutral-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
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
