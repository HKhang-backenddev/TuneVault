import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle } from 'lucide-react';

interface Message {
  id: number;
  role: 'user' | 'ai';
  text: string;
}

const AIChatbotSimple = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      role: 'ai',
      text: '👋 Xin chào! Tôi là TuneVault AI Assistant.\n\nTôi có thể giúp bạn:\n🎵 Tìm bài hát\n📚 Tạo playlist\n❤️ Quản lý yêu thích\n📤 Chia sẻ nhạc\n\nBạn cần gì?'
    }
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getAIResponse = (userText: string): string => {
    const text = userText.toLowerCase();
    
    if (text.includes('xin chào') || text.includes('hello') || text.includes('hi')) {
      return 'Chào bạn! 👋 Rất vui được gặp bạn!';
    }
    if (text.includes('tìm') || text.includes('search')) {
      return 'Để tìm bài hát, click vào Search Songs ở menu bên trái và gõ tên bài hát hoặc nghệ sĩ.';
    }
    if (text.includes('playlist')) {
      return 'Để tạo playlist mới, vào Your Library và click nút + ở góc trên bên phải.';
    }
    if (text.includes('yêu thích') || text.includes('like')) {
      return 'Click vào icon trái tim ❤️ trên bài hát để thêm vào yêu thích.';
    }
    if (text.includes('chia sẻ') || text.includes('share')) {
      return 'Click vào icon Share trên Player Bar để chia sẻ bài hát cho bạn bè.';
    }
    return 'Tôi có thể giúp bạn về:\n🎵 Tìm bài hát\n📚 Tạo playlist\n❤️ Yêu thích\n📤 Chia sẻ nhạc\n\nBạn cần gì?';
  };

  const handleSend = () => {
    if (!input.trim()) return;
    
    const newUserMsg: Message = {
      id: Date.now(),
      role: 'user',
      text: input.trim()
    };
    
    setMessages(prev => [...prev, newUserMsg]);
    setInput('');
    
    setTimeout(() => {
      const aiResponse: Message = {
        id: Date.now() + 1,
        role: 'ai',
        text: getAIResponse(input)
      };
      setMessages(prev => [...prev, aiResponse]);
    }, 500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <div>
      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed',
          bottom: '120px',
          right: '24px',
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 20px rgba(102, 126, 234, 0.6)',
          zIndex: 9999,
        }}
        title="AI Assistant"
      >
        <MessageCircle size={28} color="white" />
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div style={{
          position: 'fixed',
          bottom: '200px',
          right: '24px',
          width: '380px',
          height: '500px',
          background: '#1a1a2e',
          borderRadius: '16px',
          border: '2px solid #667eea',
          boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}>
          {/* Header */}
          <div style={{
            padding: '16px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <MessageCircle size={22} color="white" />
              </div>
              <div>
                <h3 style={{ color: 'white', margin: 0, fontSize: '16px' }}>TuneVault AI</h3>
                <p style={{ color: '#90EE90', margin: 0, fontSize: '12px' }}>● Online</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: 'rgba(255,255,255,0.2)',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                cursor: 'pointer',
                color: 'white',
                fontSize: '18px',
              }}
            >
              ✕
            </button>
          </div>

          {/* Messages */}
          <div style={{
            flex: 1,
            padding: '16px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}>
            {messages.map((msg) => (
              <div
                key={msg.id}
                style={{
                  background: msg.role === 'user' ? '#667eea' : '#2d2d44',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  borderBottomRightRadius: msg.role === 'user' ? '4px' : '12px',
                  borderBottomLeftRadius: msg.role === 'ai' ? '4px' : '12px',
                  maxWidth: '85%',
                  alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  color: 'white',
                  fontSize: '14px',
                  whiteSpace: 'pre-wrap',
                }}
              >
                {msg.text}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div style={{
            padding: '12px',
            borderTop: '1px solid #333',
          }}>
            <div style={{
              display: 'flex',
              gap: '8px',
            }}>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Nhắn tin..."
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  borderRadius: '24px',
                  border: '1px solid #444',
                  background: '#2d2d44',
                  color: 'white',
                  fontSize: '14px',
                  outline: 'none',
                }}
              />
              <button
                onClick={handleSend}
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'white',
                  fontSize: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                ➤
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIChatbotSimple;
