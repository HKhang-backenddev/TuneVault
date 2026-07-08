import { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import api from '../axios';

interface MediaItem {
  id: string;
  title: string;
  artist: string;
  genre?: string;
  url: string;
  thumbnailUrl: string;
  durationInSeconds?: number;
  isLiked?: boolean;
  isOwner?: boolean;
  canDelete?: boolean;
}

interface EditSongModalProps {
  song: MediaItem;
  onClose: () => void;
  onSave: (updatedSong: MediaItem) => void;
}

const EditSongModal = ({ song, onClose, onSave }: EditSongModalProps) => {
  const [title, setTitle] = useState(song.title);
  const [artist, setArtist] = useState(song.artist || '');
  const [genre, setGenre] = useState(song.genre || 'Pop');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const genres = ['Pop', 'Rock', 'Hip-Hop', 'Jazz', 'Classical', 'Electronic', 'R&B', 'Country', 'Latin', 'Metal', 'Folk', 'YouTube'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      const res = await api.put(`/media/${song.id}`, {
        title: title.trim(),
        artistName: artist.trim(),
        genre: genre
      });

      setSuccess(res.data.message || 'Cập nhật thành công!');
      
      // Update the song in the parent
      const updatedSong: MediaItem = {
        ...song,
        title: res.data.title || title,
        artist: res.data.artist || artist,
        genre: res.data.genre || genre
      };

      setTimeout(() => {
        onSave(updatedSong);
        onClose();
      }, 1000);
    } catch (err: any) {
      if (err.response?.status === 403) {
        setError('Bạn không có quyền chỉnh sửa. Chỉ Admin mới được phép.');
      } else {
        setError(err.response?.data?.message || 'Có lỗi xảy ra khi cập nhật.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      backdropFilter: 'blur(5px)'
    }} onClick={onClose}>
      <div style={{
        backgroundColor: '#1a1a2e',
        borderRadius: '12px',
        padding: '32px',
        width: '100%',
        maxWidth: '480px',
        boxShadow: '0 0 30px rgba(0, 255, 136, 0.3)',
        border: '1px solid rgba(0, 255, 136, 0.3)',
        animation: 'fadeIn 0.2s ease-out'
      }} onClick={(e) => e.stopPropagation()}>
        <style>{`
          @keyframes fadeIn {
            from { opacity: 0; transform: scale(0.95); }
            to { opacity: 1; transform: scale(1); }
          }
        `}</style>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ 
            margin: 0, 
            fontSize: '24px', 
            fontWeight: 'bold',
            color: '#00FF88',
            textShadow: '0 0 10px rgba(0, 255, 136, 0.5)'
          }}>
            Edit Song
          </h2>
          <button 
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#888',
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '50%',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#333'; e.currentTarget.style.color = '#fff'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#888'; }}
          >
            <X size={24} />
          </button>
        </div>

        {/* Current Info */}
        <div style={{ 
          backgroundColor: '#12121a', 
          borderRadius: '8px', 
          padding: '12px 16px', 
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <img 
            src={song.thumbnailUrl} 
            style={{ width: '48px', height: '48px', borderRadius: '4px', objectFit: 'cover' }}
            alt=""
          />
          <div style={{ overflow: 'hidden' }}>
            <p style={{ margin: 0, color: '#fff', fontSize: '14px', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {song.title}
            </p>
            <p style={{ margin: 0, color: '#888', fontSize: '12px' }}>
              {song.artist}
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Title */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: '#00FFFF', fontSize: '14px', fontWeight: 500 }}>
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '12px 16px',
                backgroundColor: '#12121a',
                border: '1px solid rgba(0, 255, 255, 0.3)',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => { e.target.style.borderColor = '#00FFFF'; e.target.style.boxShadow = '0 0 10px rgba(0, 255, 255, 0.3)'; }}
              onBlur={(e) => { e.target.style.borderColor = 'rgba(0, 255, 255, 0.3)'; e.target.style.boxShadow = 'none'; }}
            />
          </div>

          {/* Artist */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: '#00FFFF', fontSize: '14px', fontWeight: 500 }}>
              Artist
            </label>
            <input
              type="text"
              value={artist}
              onChange={(e) => setArtist(e.target.value)}
              placeholder="Enter artist name"
              style={{
                width: '100%',
                padding: '12px 16px',
                backgroundColor: '#12121a',
                border: '1px solid rgba(0, 255, 255, 0.3)',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => { e.target.style.borderColor = '#00FFFF'; e.target.style.boxShadow = '0 0 10px rgba(0, 255, 255, 0.3)'; }}
              onBlur={(e) => { e.target.style.borderColor = 'rgba(0, 255, 255, 0.3)'; e.target.style.boxShadow = 'none'; }}
            />
          </div>

          {/* Genre */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: '#00FFFF', fontSize: '14px', fontWeight: 500 }}>
              Genre
            </label>
            <select
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px',
                backgroundColor: '#12121a',
                border: '1px solid rgba(0, 255, 255, 0.3)',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box',
                cursor: 'pointer'
              }}
              onFocus={(e) => { e.target.style.borderColor = '#00FFFF'; e.target.style.boxShadow = '0 0 10px rgba(0, 255, 255, 0.3)'; }}
              onBlur={(e) => { e.target.style.borderColor = 'rgba(0, 255, 255, 0.3)'; e.target.style.boxShadow = 'none'; }}
            >
              {genres.map((g) => (
                <option key={g} value={g} style={{ backgroundColor: '#12121a' }}>{g}</option>
              ))}
            </select>
          </div>

          {/* Error/Success Messages */}
          {error && (
            <div style={{ 
              padding: '12px 16px', 
              backgroundColor: 'rgba(255, 77, 77, 0.2)', 
              border: '1px solid #ff4d4d',
              borderRadius: '8px', 
              color: '#ff4d4d',
              fontSize: '14px',
              marginBottom: '16px'
            }}>
              {error}
            </div>
          )}
          
          {success && (
            <div style={{ 
              padding: '12px 16px', 
              backgroundColor: 'rgba(0, 255, 136, 0.2)', 
              border: '1px solid #00FF88',
              borderRadius: '8px', 
              color: '#00FF88',
              fontSize: '14px',
              marginBottom: '16px'
            }}>
              {success}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '14px 24px',
              background: isLoading ? '#333' : 'linear-gradient(135deg, #00FF88, #00FFFF)',
              border: 'none',
              borderRadius: '8px',
              color: isLoading ? '#888' : '#000',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.2s'
            }}
          >
            {isLoading ? (
              'Đang cập nhật...'
            ) : (
              <>
                <Save size={18} />
                Save Changes
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditSongModal;
