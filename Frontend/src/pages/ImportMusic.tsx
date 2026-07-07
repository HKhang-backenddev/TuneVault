import React, { useState, useEffect, useRef } from 'react';
import api from '../axios';
import { Youtube, UploadCloud, Music, Loader2, CheckCircle, AlertTriangle, XCircle, Plus, FileAudio, Link } from 'lucide-react';

const ImportMusic = () => {
  const [activeTab, setActiveTab] = useState('youtube');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [genre, setGenre] = useState('Pop');
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const genres = ['Pop', 'Hip-Hop', 'Rock', 'Jazz', 'Electronic', 'Classical', 'R&B', 'Country', 'Latin', 'Metal', 'Indie', 'Other'];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      // Tự động điền Title từ tên file (loại bỏ phần mở rộng)
      setTitle(selectedFile.name.replace(/\.[^/.]+$/, ""));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setStatus({ type: 'info', message: 'Processing, please wait...' });

    if (activeTab === 'youtube') {
      try {
        await api.post('/import/import', { 
          url: youtubeUrl,
          title: title,
          artist: artist,
          genre: genre
        });
        setStatus({ type: 'success', message: 'Import request from YouTube has been sent. The song will appear in your library soon.' });
        setYoutubeUrl('');
        // Reset các trường tùy chọn
        setTitle('');
        setArtist('');
        setGenre('Pop');
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || 'An error occurred while importing from YouTube.';
        setStatus({ type: 'error', message: errorMessage });
      }
    } else if (activeTab === 'upload') {
      if (!file) {
        setStatus({ type: 'error', message: 'Please select a music file.' });
        setIsLoading(false);
        return;
      }

      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', title);
      formData.append('artist', artist);
      formData.append('genre', genre);

      try {
        await api.post('/media/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        setStatus({ type: 'success', message: `Successfully uploaded the song "${title}".` });
        // Reset form
        setFile(null);
        setTitle('');
        setArtist('');
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || 'An error occurred while uploading the file.';
        setStatus({ type: 'error', message: errorMessage });
      }
    }

    setIsLoading(false);
  };

  const renderStatus = () => {
    if (!status) return null;

    const icons = {
      success: <CheckCircle size={20} />,
      error: <XCircle size={20} />,
      info: <Loader2 size={20} className="animate-spin" />,
    };

    const colors = {
      success: 'bg-green-500/10 text-green-400 border-green-500/20',
      error: 'bg-red-500/10 text-red-400 border-red-500/20',
      info: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    };

    return (
      <div style={{
        padding: '1rem',
        borderRadius: '0.5rem',
        border: '1px solid',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        marginTop: '1.5rem'
      }} className={colors[status.type]}>
        {icons[status.type]}
        <span style={{ fontWeight: 500 }}>{status.message}</span>
      </div>
    );
  };

  const inputStyle = {
    width: '100%',
    backgroundColor: 'rgba(10, 10, 10, 0.7)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '0.5rem',
    padding: '0.75rem 1rem',
    color: 'white',
    outline: 'none',
    transition: 'border-color 0.2s ease',
    backdropFilter: 'blur(5px)',
  };

  return (
    <div style={{
      maxWidth: '700px',
      margin: '2rem auto',
      padding: '2.5rem',
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      borderRadius: '24px',
      border: '2px solid transparent',
      backgroundImage: 'linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), linear-gradient(160deg, #c084fc, #3b82f6, #10b981, #c084fc)',
      backgroundOrigin: 'border-box',
      backgroundClip: 'padding-box, border-box',
      backgroundSize: '200% 100%',
      boxShadow: '0 20px 60px rgba(0, 0, 0, 0.7), 0 0 40px rgba(59, 130, 246, 0.2)',
      backdropFilter: 'blur(12px)',
      animation: 'animated-border-import 8s linear infinite',
    }}>
      <style>{`
        @keyframes animated-border-import {
          0% { background-position: 0% center; }
          100% { background-position: 200% center; }
        }
        .input-neon:focus {
          border-color: #3b82f6 !important;
          box-shadow: 0 0 15px rgba(59, 130, 246, 0.5);
        }
      `}</style>
      <h1 style={{ fontSize: '3rem', fontWeight: '900', marginBottom: '2rem', color: 'white', textAlign: 'center', textShadow: '0 0 10px #fff, 0 0 20px #fff, 0 0 30px #3b82f6, 0 0 40px #3b82f6' }}>
        Add New Music
      </h1>

      {/* Tabs */}
      <div style={{ position: 'relative', display: 'flex', padding: '4px', backgroundColor: 'rgba(10, 10, 10, 0.8)', borderRadius: '9999px', marginBottom: '2.5rem', border: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{
          position: 'absolute',
          top: '4px',
          bottom: '4px',
          width: 'calc(50% - 4px)',
          backgroundColor: '#3b82f6',
          borderRadius: '9999px',
          transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          transform: activeTab === 'youtube' ? 'translateX(0%)' : 'translateX(100%)',
          boxShadow: '0 0 15px rgba(59, 130, 246, 0.6)'
        }}></div>
        {['youtube', 'upload'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              flex: 1,
              position: 'relative',
              zIndex: 1,
              padding: '0.75rem 1.5rem',
              borderRadius: '9999px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.75rem',
              cursor: 'pointer',
              fontWeight: 600,
              transition: 'color 0.3s ease',
              border: 'none',
              background: 'transparent',
              color: activeTab === tab ? 'white' : '#a3a3a3',
            }}
          >
            {tab === 'youtube' ? <Youtube size={20} /> : <UploadCloud size={20} />}
            {tab === 'youtube' ? 'YouTube' : 'Upload'}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {activeTab === 'youtube' ? (
          <div>
            <label htmlFor="youtubeUrl" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: '#a3a3a3' }}>
              Paste YouTube link here
            </label>
            <input
              id="youtubeUrl"
              type="text"
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              style={{...inputStyle, fontSize: '1rem'}}
              className="input-neon"
              required
            />
          </div>
        ) : (
          // Tab Upload
          <div>
            <label htmlFor="fileUpload" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: '#a3a3a3' }}>
              Select music file
            </label>
            <div
              style={{
                border: `2px dashed ${isDragOver ? '#3b82f6' : 'rgba(255, 255, 255, 0.2)'}`,
                borderRadius: '0.75rem',
                padding: '2.5rem',
                textAlign: 'center',
                cursor: 'pointer',
                color: isDragOver ? '#3b82f6' : '#a3a3a3',
                transition: 'all 0.3s ease',
                backgroundColor: isDragOver ? 'rgba(59, 130, 246, 0.1)' : 'rgba(10, 10, 10, 0.5)',
                boxShadow: isDragOver ? '0 0 20px rgba(59, 130, 246, 0.4)' : 'none',
              }}
              onClick={() => document.getElementById('fileUpload')?.click()}
              onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragOver(false);
                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                  setFile(e.dataTransfer.files[0]);
                  setTitle(e.dataTransfer.files[0].name.replace(/\.[^/.]+$/, ""));
                }
              }}
            >
              <input
                id="fileUpload"
                type="file"
                accept="audio/*"
                onChange={handleFileChange}
                style={{ display: 'none' }}
                required
              />
              {file ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', color: '#22c55e', fontWeight: 'bold' }}>
                  <Music size={24} />
                  <span>{file.name}</span>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                  <UploadCloud size={32} />
                  <span style={{ fontWeight: 'bold' }}>Drag and drop or click to select file</span>
                  <span style={{ fontSize: '12px' }}>Supported formats: MP3, WAV, FLAC...</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Các trường thông tin chung cho cả 2 tab */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.5rem', marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <p style={{ fontSize: '0.875rem', color: '#737373', textAlign: 'center', fontStyle: 'italic' }}>
              {activeTab === 'youtube' ? 'You can customize the information below, if left blank the system will auto-detect.' : 'Please fill in the information for the song.'}
            </p>
          <div>
            <label htmlFor="title" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: '#a3a3a3' }}>
              Title
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={activeTab === 'youtube' ? 'Leave blank to auto-detect' : 'Song name'}
              style={{...inputStyle, fontSize: '1rem'}} className="input-neon"
              required={activeTab === 'upload'}
            />
          </div>

          <div>
            <label htmlFor="artist" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: '#a3a3a3' }}>
              Artist
            </label>
            <input
              id="artist"
              type="text"
              value={artist}
              onChange={(e) => setArtist(e.target.value)}
              placeholder={activeTab === 'youtube' ? 'Leave blank to auto-detect' : 'Artist name'}
              style={{...inputStyle, fontSize: '1rem'}} className="input-neon"
            />
          </div>

          <div>
            <label htmlFor="genre" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: '#a3a3a3' }}>
              Genre
            </label>
            <select
              id="genre"
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              style={{...inputStyle, fontSize: '1rem'}} className="input-neon"
            >
              <option>Pop</option>
              <option>Rock</option>
              <option>EDM</option>
              <option>Lofi</option>
              <option>Acoustic</option>
              <option>Chill Music</option>
              <option>Rap</option>
              <option>YouTube</option>
              <option>Other</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          style={{
            padding: '1rem',
            marginTop: '1.5rem',
            borderRadius: '0.75rem',
            background: 'linear-gradient(90deg, #3b82f6, #60a5fa)',
            color: 'white',
            fontWeight: 'bold',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            opacity: isLoading ? 0.7 : 1,
            boxShadow: '0 10px 20px rgba(59, 130, 246, 0.3)',
          }}
          className="hover:scale-[1.02] transition-all active:scale-95"
        >
          {isLoading && <Loader2 size={18} className="animate-spin" />}
          {isLoading ? 'Processing...' : (activeTab === 'youtube' ? 'Import from YouTube' : 'Upload')}
        </button>
      </form>

      {renderStatus()}
    </div>
  );
};

export default ImportMusic;