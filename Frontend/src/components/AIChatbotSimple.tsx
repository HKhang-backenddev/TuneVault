import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle } from 'lucide-react';
import api from '../axios';

interface Message {
  id: number;
  role: 'user' | 'ai';
  text: string;
}

const AIChatbotSimple = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      role: 'ai',
      text: '👋 Xin chào! Tôi là TuneVault AI Assistant (Powered by Groq Llama).\n\nTôi có thể giúp bạn:\n🎵 Tìm bài hát\n📚 Tạo playlist\n❤️ Quản lý yêu thích\n📤 Chia sẻ nhạc\n\nBạn cần gì?'
    }
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;
    
    const userMessage = input.trim();
    
    const newUserMsg: Message = {
      id: Date.now(),
      role: 'user',
      text: userMessage
    };
    
    setMessages(prev => [...prev, newUserMsg]);
    setInput('');
    setIsTyping(true);
    
    try {
      const response = await api.post('/AI/chat', { message: userMessage });
      const aiText = response.data.response || 'Xin lỗi, tôi không thể trả lời lúc này.';
      
      const aiResponse: Message = {
        id: Date.now() + 1,
        role: 'ai',
        text: aiText
      };
      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      const errorMsg: Message = {
        id: Date.now() + 1,
        role: 'ai',
        text: 'Xin lỗi, tôi đang gặp sự cố kết nối. Vui lòng thử lại sau.'
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
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
            
            {/* Typing indicator */}
            {isTyping && (
              <div style={{
                background: '#2d2d44',
                padding: '12px 16px',
                borderRadius: '12px',
                borderBottomLeftRadius: '4px',
                maxWidth: '85%',
                alignSelf: 'flex-start',
                color: '#888',
                fontSize: '14px',
              }}>
                💭 AI đang nhập...
              </div>
            )}
            
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
