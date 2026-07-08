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
      {/* Chat Button with Neon Effects */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed',
          bottom: '130px',
          right: '24px',
          width: '70px',
          height: '70px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
          border: '3px solid rgba(255, 255, 255, 0.3)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 30px rgba(102, 126, 234, 0.8), 0 0 60px rgba(118, 75, 162, 0.5), inset 0 0 20px rgba(255, 255, 255, 0.1)',
          zIndex: 9999,
          transition: 'all 0.3s ease',
          animation: isOpen ? 'none' : 'pulse-neon 2s ease-in-out infinite',
        }}
        title="AI Assistant - Powered by Groq Llama"
      >
        {/* Glow ring */}
        <div style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          borderRadius: '50%',
          border: '2px solid rgba(102, 126, 234, 0.5)',
          animation: 'rotate-ring 3s linear infinite',
        }} />
        
        {/* Icon */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '2px',
        }}>
          <MessageCircle size={30} color="white" style={{ filter: 'drop-shadow(0 0 5px white)' }} />
          <span style={{
            fontSize: '8px',
            color: 'white',
            fontWeight: 'bold',
            textShadow: '0 0 5px rgba(255,255,255,0.8)',
          }}>AI</span>
        </div>
      </button>
      
      {/* CSS Animations */}
      <style>{`
        @keyframes pulse-neon {
          0%, 100% { box-shadow: 0 0 30px rgba(102, 126, 234, 0.8), 0 0 60px rgba(118, 75, 162, 0.5); }
          50% { box-shadow: 0 0 50px rgba(102, 126, 234, 1), 0 0 100px rgba(118, 75, 162, 0.8); }
        }
        @keyframes rotate-ring {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>

      {/* Chat Window */}
      {isOpen && (
        <div style={{
          position: 'fixed',
          bottom: '220px',
          right: '24px',
          width: '400px',
          height: '550px',
          background: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 100%)',
          borderRadius: '20px',
          border: '2px solid rgba(102, 126, 234, 0.5)',
          boxShadow: '0 0 40px rgba(102, 126, 234, 0.3), 0 20px 60px rgba(0,0,0,0.6)',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}>
          {/* Header with Neon Effect */}
          <div style={{
            padding: '20px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 4px 20px rgba(102, 126, 234, 0.4)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              {/* Avatar */}
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid rgba(255,255,255,0.3)',
                boxShadow: '0 0 15px rgba(255,255,255,0.3)',
              }}>
                <MessageCircle size={24} color="white" />
              </div>
              <div>
                <h3 style={{ color: 'white', margin: 0, fontSize: '18px', fontWeight: 'bold' }}>TuneVault AI 🤖</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '8px', height: '8px', background: '#22c55e', borderRadius: '50%', display: 'inline-block', boxShadow: '0 0 8px #22c55e' }} />
                  <p style={{ color: 'rgba(255,255,255,0.9)', margin: 0, fontSize: '12px' }}>Powered by Groq Llama</p>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: 'rgba(255,255,255,0.2)',
                border: 'none',
                borderRadius: '50%',
                width: '36px',
                height: '36px',
                cursor: 'pointer',
                color: 'white',
                fontSize: '18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.3)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
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
