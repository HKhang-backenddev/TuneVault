import React, { useState } from 'react';
import { MessageCircle } from 'lucide-react';

const AIChatbotSimple = () => {
  const [isOpen, setIsOpen] = useState(false);

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
            <div style={{
              background: '#2d2d44',
              padding: '12px 16px',
              borderRadius: '12px',
              borderBottomLeftRadius: '4px',
              maxWidth: '85%',
              alignSelf: 'flex-start',
            }}>
              <p style={{ color: 'white', margin: 0, fontSize: '14px' }}>
                👋 Xin chào! Tôi là **TuneVault AI Assistant**.
                
                Tôi có thể giúp bạn:
                🎵 Tìm bài hát
                📚 Tạo playlist
                ❤️ Quản lý yêu thích
                📤 Chia sẻ nhạc
                
                Bạn cần gì?
              </p>
            </div>
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
              <button style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                cursor: 'pointer',
                color: 'white',
                fontSize: '18px',
              }}>
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
