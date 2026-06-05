import React, { useRef, useEffect, useState } from 'react';
import { useMusic } from '../context/MusicContext';
import './PlayerBar.css';

export const PlayerBar: React.FC = () => {
  const { currentSong, isPlaying, pauseSong, resumeSong, nextSong, prevSong } = useMusic();
  const audioRef = useRef<HTMLAudioElement>(null);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying && currentSong) {
      audio.src = currentSong.mediaUrl || '';
      audio.play().catch((error) => {
        console.error('Failed to play audio:', error);
      });
    } else {
      audio.pause();
    }
  }, [currentSong, isPlaying]);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setProgress(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleProgress = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = value;
      setProgress(value);
    }
  };

  const handleEnded = () => {
    nextSong();
  };

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  if (!currentSong) {
    return (
      <div className="player-bar empty">
        <div className="player-info">
          <p>No song playing</p>
        </div>
        <audio ref={audioRef} onTimeUpdate={handleTimeUpdate} onLoadedMetadata={handleLoadedMetadata} />
      </div>
    );
  }

  return (
    <div className="player-bar">
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
      />

      <div className="player-info">
        <div className="song-thumbnail">
          {currentSong.thumbnailUrl ? (
            <img src={currentSong.thumbnailUrl} alt={currentSong.title} />
          ) : (
            <div className="no-thumbnail">🎵</div>
          )}
        </div>
        <div className="song-details">
          <p className="song-title">{currentSong.title}</p>
          <p className="song-artist">{currentSong.artistName || 'Unknown Artist'}</p>
        </div>
      </div>

      <div className="player-controls">
        <button className="control-btn" onClick={prevSong} title="Previous">
          ⏮️
        </button>
        <button className="control-btn play-btn" onClick={isPlaying ? pauseSong : resumeSong} title={isPlaying ? 'Pause' : 'Play'}>
          {isPlaying ? '⏸️' : '▶️'}
        </button>
        <button className="control-btn" onClick={nextSong} title="Next">
          ⏭️
        </button>
      </div>

      <div className="player-progress">
        <span className="time">{formatTime(progress)}</span>
        <input
          type="range"
          min="0"
          max={duration || 0}
          value={progress}
          onChange={handleProgress}
          className="progress-bar"
        />
        <span className="time">{formatTime(duration)}</span>
      </div>

      <div className="player-info-right">
        <p className="queue-info">{currentSong.genre}</p>
      </div>
    </div>
  );
};
