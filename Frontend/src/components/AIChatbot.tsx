import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, Sparkles } from 'lucide-react';

interface Message {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const AIChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      role: 'assistant',
      content: `Xin chào! 👋 Tôi là **TuneVault AI Assistant** - trợ lý ảo của bạn.

Tôi có thể giúp bạn:
🎵 Tìm bài hát theo tên, nghệ sĩ
📚 Tạo playlist mới
❤️ Quản lý bài hát yêu thích
🔍 Khám phá nhạc mới
📤 Chia sẻ nhạc với bạn bè

Bạn cần tôi hỗ trợ gì?`,
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Simple AI responses for common queries
  const getAIResponse = (userMessage: string): string => {
    const msg = userMessage.toLowerCase();

    // Greeting
    if (msg.includes('xin chào') || msg.includes('hello') || msg.includes('hi') || msg.includes('hey')) {
      return `Chào bạn! 👋 Rất vui được gặp bạn! Tôi có thể giúp gì cho bạn hôm nay?`;
    }

    // Help
    if (msg.includes('giúp') || msg.includes('help') || msg.includes('hỗ trợ')) {
      return `Tôi có thể hỗ trợ bạn về:

🎵 **Tìm nhạc**: Tìm bài hát, album, nghệ sĩ
📋 **Playlist**: Tạo, chỉnh sửa playlist
❤️ **Yêu thích**: Quản lý bài hát yêu thích
📤 **Chia sẻ**: Chia sẻ nhạc cho bạn bè
🔍 **Khám phá**: Tìm nhạc mới hay

Bạn muốn làm gì?`;
    }

    // Search for songs
    if (msg.includes('tìm') || msg.includes('search') || msg.includes('tìm kiếm')) {
      return `Để tìm bài hát, bạn có thể:
1. Click vào **Search Songs** ở menu bên trái
2. Gõ tên bài hát, nghệ sĩ hoặc album
3. Kết quả sẽ hiện ra ngay!

Bạn muốn tìm bài hát nào?`;
    }

    // Create playlist
    if (msg.includes('tạo playlist') || msg.includes('playlist') || msg.includes('danh sách')) {
      return `Để tạo playlist mới:
1. Vào **Your Library** ở menu trái
2. Click nút **+** ở góc trên bên phải
3. Đặt tên cho playlist của bạn
4. Bắt đầu thêm bài hát!

Bạn muốn tạo playlist với chủ đề gì?`;
    }

    // Liked songs
    if (msg.includes('yêu thích') || msg.includes('like') || msg.includes('thích') || msg.includes('favorites')) {
      return `Để xem bài hát đã thích:
1. Click vào **Liked Songs** ở menu bên trái
2. Tất cả bài hát bạn đã thích sẽ hiển thị ở đây

Để thích một bài hát, click vào **icon trái tim ❤️** trên bài hát đó!`;
    }

    // Share music
    if (msg.includes('chia sẻ') || msg.includes('share') || msg.includes('gửi')) {
      return `Để chia sẻ bài hát:
1. Click vào bài hát bạn muốn chia sẻ
2. Click **icon Share 📤** trên Player Bar
3. Chọn bạn bè để gửi!

Bài hát sẽ xuất hiện trong mục **Shared With Me** của người nhận.`;
    }

    // Import music
    if (msg.includes('upload') || msg.includes('tải lên') || msg.includes('thêm nhạc') || msg.includes('import')) {
      return `Để thêm nhạc của bạn:
1. Click vào **Import Music** ở menu
2. Chọn file nhạc (MP3, WAV, FLAC...)
3. Điền thông tin bài hát
4. Upload lên thư viện của bạn!

Lưu ý: Chỉ bạn mới thấy được bài hát đã upload.`;
    }

    // Profile
    if (msg.includes('profile') || msg.includes('trang cá nhân') || msg.includes('tài khoản')) {
      return `Để xem/chỉnh sửa profile:
1. Click vào **My Profile** ở menu bên trái
2. Bạn có thể:
   - 📷 Đổi ảnh đại diện
   - 🖼️ Đổi ảnh bìa
   - ✏️ Sửa thông tin cá nhân
   - 👥 Xem người theo dõi`;

    }

    // Download
    if (msg.includes('tải') || msg.includes('download') || msg.includes('lịch sử')) {
      return `Để xem lịch sử tải nhạc:
1. Click vào **Download History** ở menu trái
2. Bạn sẽ thấy danh sách các bài đã tải

Để tải bài hát, click vào **menu (...)** trên bài hát và chọn Download!`;
    }

    // Recommendation
    if (msg.includes('gợi ý') || msg.includes('recommend') || msg.includes('hay') || msg.includes('hot')) {
      return `🌟 **Gợi ý cho bạn:**

Thử khám phá các thể loại khác nhau:
- 🎸 Rock/Pop
- 🎹 Electronic
- 🎤 Rap/Hip-hop
- 🎻 Classical
- 🌴 Lo-fi/Chill

Hoặc vào **Home** để xem các bài hát đang được nghe nhiều nhất!`;

    }

    // Thanks
    if (msg.includes('cảm ơn') || msg.includes('thank') || msg.includes('thanks')) {
      return `Không có gì! 😊 Rất vui được giúp bạn!

Nếu bạn cần thêm hỗ trợ, đừng ngần ngại hỏi tôi nhé!`;
    }

    // Unknown query
    return `Tôi chưa hiểu ý bạn lắm 😅

Thử hỏi tôi về:
- 🎵 Tìm bài hát
- 📋 Tạo playlist
- ❤️ Bài hát yêu thích
- 📤 Chia sẻ nhạc
- 🔍 Khám phá nhạc mới

Hoặc bạn có thể mô tả chi tiết hơn để tôi hiểu nhé!`;
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simulate AI thinking
    setTimeout(() => {
      const aiResponse: Message = {
        id: Date.now() + 1,
        role: 'assistant',
        content: getAIResponse(userMessage.content),
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 800 + Math.random() * 500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      <style>{`
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(139, 92, 246, 0.6), 0 0 40px rgba(59, 130, 246, 0.4); }
          50% { box-shadow: 0 0 40px rgba(139, 92, 246, 0.9), 0 0 80px rgba(59, 130, 246, 0.6); }
        }
      `}</style>
      
      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-28 right-6 z-[9999] w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg hover:scale-110 transition-all duration-300"
        style={{
          boxShadow: isOpen 
            ? '0 0 20px rgba(139, 92, 246, 0.8)' 
            : '0 0 30px rgba(139, 92, 246, 0.6), 0 0 60px rgba(59, 130, 246, 0.4)',
          animation: 'pulse-glow 2s ease-in-out infinite',
        }}
        title="TuneVault AI Assistant 🤖"
      >
        {isOpen ? (
          <X size={24} className="text-white" />
        ) : (
          <Sparkles size={24} className="text-white" />
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div 
          className="fixed bottom-36 right-6 z-50 w-96 max-w-[calc(100vw-48px)] h-[500px] max-h-[70vh] rounded-2xl overflow-hidden flex flex-col"
          style={{
            background: 'linear-gradient(180deg, rgba(15, 15, 25, 0.98) 0%, rgba(20, 20, 35, 0.98) 100%)',
            border: '1px solid rgba(139, 92, 246, 0.4)',
            boxShadow: '0 0 40px rgba(139, 92, 246, 0.3), 0 25px 50px rgba(0, 0, 0, 0.5)',
          }}
        >
          {/* Header */}
          <div 
            className="flex items-center justify-between px-4 py-3"
            style={{
              background: 'linear-gradient(90deg, rgba(59, 130, 246, 0.2), rgba(139, 92, 246, 0.2), rgba(236, 72, 153, 0.2))',
              borderBottom: '1px solid rgba(139, 92, 246, 0.3)',
            }}
          >
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                  boxShadow: '0 0 15px rgba(59, 130, 246, 0.5)',
                }}
              >
                <Bot size={20} className="text-white" />
              </div>
              <div>
                <h3 className="text-white font-bold text-sm">TuneVault AI</h3>
                <p className="text-xs" style={{ color: '#22c55e' }}>● Online</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 rounded-full hover:bg-white/10 transition-colors"
            >
              <X size={18} className="text-gray-400" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center mr-2 flex-shrink-0"
                    style={{
                      background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                    }}
                  >
                    <Bot size={16} className="text-white" />
                  </div>
                )}
                <div
                  className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'text-white rounded-br-md'
                      : 'text-gray-200 rounded-bl-md'
                  }`}
                  style={{
                    background: msg.role === 'user'
                      ? 'linear-gradient(135deg, #3b82f6, #8b5cf6)'
                      : 'rgba(55, 55, 75, 0.8)',
                    border: msg.role === 'assistant' ? '1px solid rgba(139, 92, 246, 0.2)' : 'none',
                  }}
                >
                  <p style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</p>
                </div>
                {msg.role === 'user' && (
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center ml-2 flex-shrink-0"
                    style={{
                      background: 'rgba(139, 92, 246, 0.3)',
                    }}
                  >
                    <User size={16} className="text-white" />
                  </div>
                )}
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center mr-2"
                  style={{
                    background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                  }}
                >
                  <Bot size={16} className="text-white" />
                </div>
                <div 
                  className="px-4 py-3 rounded-2xl rounded-bl-md"
                  style={{
                    background: 'rgba(55, 55, 75, 0.8)',
                    border: '1px solid rgba(139, 92, 246, 0.2)',
                  }}
                >
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div 
            className="p-3"
            style={{
              borderTop: '1px solid rgba(139, 92, 246, 0.3)',
              background: 'rgba(20, 20, 35, 0.5)',
            }}
          >
            <div 
              className="flex items-center gap-2 px-4 py-2 rounded-full"
              style={{
                background: 'rgba(30, 30, 50, 0.8)',
                border: '1px solid rgba(139, 92, 246, 0.3)',
              }}
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Hỏi tôi về TuneVault..."
                className="flex-1 bg-transparent text-white text-sm outline-none placeholder-gray-500"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim()}
                className="p-2 rounded-full transition-all disabled:opacity-50"
                style={{
                  background: input.trim() 
                    ? 'linear-gradient(135deg, #3b82f6, #8b5cf6)' 
                    : 'transparent',
                }}
              >
                <Send size={18} className={input.trim() ? 'text-white' : 'text-gray-500'} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AIChatbot;
