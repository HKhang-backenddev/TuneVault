import React, { useEffect, useRef, useState } from 'react';
import api from '../axios';
import { Music, Share2, X, User as UserIcon, Loader2, Send, CheckCircle, AlertCircle } from 'lucide-react';
import { useAudio, Track } from '../Contexts/AudioContext';
import { User } from '@shared-types/user';

interface ShareSidebarAudioContext {
  songForShare: Track | null;
  selectSongForShare: (song: Track | null) => void;
}

export const ShareSidebar = ({ user }: { user: User | null }) => {
  const { songForShare, selectSongForShare } = useAudio() as ShareSidebarAudioContext;
  const [receiverUsername, setReceiverUsername] = useState('');
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (songForShare) {
      setReceiverUsername('');
      setStatus(null);
      setBusy(false);
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [songForShare]);

  const handleShare = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    setStatus(null);
    const receiver = receiverUsername.trim();
    
    if (!songForShare) {
      setStatus({ type: 'error', message: 'No song selected to share.' });
      return;
    }
    if (!receiver) {
      setStatus({ type: 'error', message: 'Please enter recipient username or email.' });
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

      setStatus({ type: 'success', message: `Shared successfully with @${receiver}!` });
      setReceiverUsername('');
      
      setTimeout(() => {
        selectSongForShare(null);
      }, 2500);

    } catch (e: any) {
      const msg = e?.response?.data?.message || 'Share failed. Please try again.';
      setStatus({ type: 'error', message: msg });
    } finally {
      setBusy(false);
    }
  };

  if (!songForShare) {
    return null;
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: '100px',
      right: '24px',
      width: '380px',
      backgroundColor: 'rgba(26, 26, 46, 0.95)',
      borderRadius: '20px',
      border: '1px solid rgba(131, 58, 180, 0.4)',
      boxShadow: '0 25px 80px rgba(131, 58, 180, 0.3), 0 0 60px rgba(253, 29, 29, 0.15)',
      backdropFilter: 'blur(20px)',
      overflow: 'hidden',
      animation: 'slideUp 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      zIndex: 1000,
    }}>
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 20px rgba(30, 215, 96, 0.4); }
          50% { box-shadow: 0 0 40px rgba(30, 215, 96, 0.8); }
        }
        @keyframes spin {
          100% { transform: rotate(360deg); }
        }
      `}</style>

      {/* Header with Gradient */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(131, 58, 180, 0.6) 0%, rgba(253, 29, 29, 0.4) 100%)',
        padding: '24px',
        position: 'relative'
      }}>
        <button
          onClick={() => selectSongForShare(null)}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            border: 'none',
            color: '#fff',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'; e.currentTarget.style.transform = 'scale(1.1)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'; e.currentTarget.style.transform = 'scale(1)'; }}
        >
          <X size={18} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #1ed760, #00d4aa)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 24px rgba(30, 215, 96, 0.4)'
          }}>
            <Share2 size={28} style={{ color: '#000' }} />
          </div>
          <div>
            <h2 style={{ 
              margin: 0, 
              fontSize: '22px', 
              fontWeight: 'bold', 
              color: '#fff',
              textShadow: '0 0 20px rgba(131, 58, 180, 0.6)'
            }}>
              Share Song
            </h2>
            <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'rgba(255,255,255,0.7)' }}>
              Send this track to a friend
            </p>
          </div>
        </div>
      </div>

      {/* Song Card */}
      <div style={{
        padding: '20px 24px',
        backgroundColor: 'rgba(0, 0, 0, 0.3)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          padding: '14px',
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '12px',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          {songForShare.thumbnailUrl ? (
            <img 
              src={songForShare.thumbnailUrl} 
              alt={songForShare.title}
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '8px',
                objectFit: 'cover',
                boxShadow: '0 4px 12px rgba(0,0,0,0.4)'
              }}
            />
          ) : (
            <div style={{
              width: '52px',
              height: '52px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Music size={24} style={{ color: '#fff' }} />
            </div>
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ 
              margin: 0, 
              fontWeight: 'bold', 
              fontSize: '15px', 
              color: '#fff',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              {songForShare.title}
            </p>
            <p style={{ 
              margin: '4px 0 0', 
              fontSize: '13px', 
              color: 'rgba(255,255,255,0.6)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              {songForShare.artist || 'Unknown Artist'}
            </p>
          </div>
          <div style={{
            padding: '6px 12px',
            borderRadius: '20px',
            backgroundColor: 'rgba(131, 58, 180, 0.3)',
            border: '1px solid rgba(131, 58, 180, 0.5)'
          }}>
            <Music size={14} style={{ color: '#c084fc' }} />
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleShare} style={{ padding: '0 24px 24px' }}>
        {/* Sender Info */}
        {user && (
          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              fontSize: '11px',
              fontWeight: 'bold',
              color: 'rgba(255,255,255,0.5)',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              marginBottom: '8px'
            }}>
              From
            </label>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '12px 14px',
              backgroundColor: 'rgba(30, 215, 96, 0.1)',
              borderRadius: '10px',
              border: '1px solid rgba(30, 215, 96, 0.3)'
            }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: user.avatarUrl ? `url(${user.avatarUrl}) center/cover` : 'linear-gradient(135deg, #833ab4, #fd1d1d)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {!user.avatarUrl && <UserIcon size={16} style={{ color: '#fff' }} />}
              </div>
              <span style={{ color: '#1ed760', fontWeight: 'bold', fontSize: '14px' }}>
                @{user.username}
              </span>
            </div>
          </div>
        )}

        {/* Receiver Input */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{
            display: 'block',
            fontSize: '11px',
            fontWeight: 'bold',
            color: 'rgba(255,255,255,0.5)',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            marginBottom: '8px'
          }}>
            Send To
          </label>
          <div style={{
            position: 'relative',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '12px',
            border: '2px solid rgba(131, 58, 180, 0.4)',
            transition: 'all 0.3s',
            overflow: 'hidden'
          }}>
            <UserIcon 
              size={18} 
              style={{
                position: 'absolute',
                left: '14px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'rgba(255,255,255,0.4)'
              }} 
            />
            <input
              ref={inputRef}
              value={receiverUsername}
              onChange={(e) => setReceiverUsername(e.target.value)}
              placeholder="Username or email"
              disabled={busy}
              required
              style={{
                width: '100%',
                padding: '14px 14px 14px 46px',
                backgroundColor: 'transparent',
                border: 'none',
                outline: 'none',
                color: '#fff',
                fontSize: '15px',
              }}
            />
          </div>
        </div>

        {/* Status Message */}
        {status && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '12px 16px',
            borderRadius: '10px',
            marginBottom: '16px',
            backgroundColor: status.type === 'success' 
              ? 'rgba(30, 215, 96, 0.15)' 
              : 'rgba(255, 77, 77, 0.15)',
            border: `1px solid ${status.type === 'success' ? 'rgba(30, 215, 96, 0.4)' : 'rgba(255, 77, 77, 0.4)'}`,
            animation: status.type === 'success' ? 'glow 2s infinite' : 'none'
          }}>
            {status.type === 'success' ? (
              <CheckCircle size={20} style={{ color: '#1ed760', flexShrink: 0 }} />
            ) : (
              <AlertCircle size={20} style={{ color: '#ff4d4d', flexShrink: 0 }} />
            )}
            <span style={{
              fontSize: '13px',
              color: status.type === 'success' ? '#1ed760' : '#ff4d4d',
              fontWeight: '500'
            }}>
              {status.message}
            </span>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={busy || !songForShare}
          style={{
            width: '100%',
            padding: '14px',
            borderRadius: '12px',
            background: busy 
              ? 'rgba(131, 58, 180, 0.5)' 
              : 'linear-gradient(135deg, #833ab4 0%, #fd1d1d 50%, #fcb045 100%)',
            border: 'none',
            color: '#fff',
            fontWeight: 'bold',
            fontSize: '15px',
            cursor: busy ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            transition: 'all 0.3s',
            boxShadow: busy ? 'none' : '0 8px 30px rgba(131, 58, 180, 0.4)',
            opacity: busy ? 0.7 : 1
          }}
          onMouseEnter={(e) => { if (!busy) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(131, 58, 180, 0.6)'; }}}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = busy ? 'none' : '0 8px 30px rgba(131, 58, 180, 0.4)'; }}
        >
          {busy ? (
            <>
              <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
              Sending...
            </>
          ) : (
            <>
              <Send size={18} />
              Send Song
            </>
          )}
        </button>
      </form>
    </div>
  );
};
