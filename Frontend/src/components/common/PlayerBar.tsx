import { useContext, useEffect, useRef, useState } from 'react';
import { PlayerContext } from '../../context/PlayerContextDef';

export const PlayerBar = () => {
  const { isPlaying, currentTrack, togglePlay } = useContext(PlayerContext);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!audioRef.current) return;
    if (currentTrack) {
      audioRef.current.src = currentTrack.url;
      if (isPlaying) audioRef.current.play().catch(() => {});
    }
    if (!currentTrack) audioRef.current.pause();
  }, [currentTrack, isPlaying]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onTime = () => {
      if (!audio.duration || isNaN(audio.duration)) return setProgress(0);
      setProgress((audio.currentTime / audio.duration) * 100);
    };
    audio.addEventListener('timeupdate', onTime);
    return () => audio.removeEventListener('timeupdate', onTime);
  }, [audioRef.current]);

  return (
    <footer className="h-24 bg-neutral-900 border-t border-neutral-800 flex items-center px-6 fixed bottom-0 w-full z-40">
      <audio ref={audioRef} />
      <div className="flex items-center gap-4 text-white">
        <div className="w-14 h-14 bg-neutral-700 rounded overflow-hidden flex-shrink-0">
          {currentTrack && <img src={currentTrack.thumbnail} alt="thumb" className="w-full h-full object-cover" />}
        </div>
        <div className="min-w-[240px]">
          <div className="text-sm font-semibold truncate">{currentTrack?.title ?? 'No track'}</div>
          <div className="text-xs text-neutral-400 truncate">{currentTrack?.artist ?? ''}</div>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center px-4">
        <div className="flex items-center gap-6">
          <button onClick={() => {}} aria-label="previous" className="text-neutral-300 hover:text-white">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M19 12L9 5v14l10-7zM5 5v14" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
          <button onClick={togglePlay} aria-label="play-pause" className="w-10 h-10 bg-white text-black rounded-full flex items-center justify-center">
            {isPlaying ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" fill="currentColor"/></svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M5 3v18l15-9L5 3z" fill="currentColor"/></svg>
            )}
          </button>
          <button onClick={() => {}} aria-label="next" className="text-neutral-300 hover:text-white">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M5 12l10 7V5L5 12zM19 5v14" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        </div>

        <div className="w-full max-w-2xl mt-2">
          <div className="h-1 bg-neutral-800 rounded overflow-hidden">
            <div className="h-full bg-gradient-to-r from-pink-500 to-purple-500" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>

      <div className="w-64 flex items-center justify-end text-neutral-300 text-sm gap-4">
        <div className="opacity-80">Volume</div>
      </div>
    </footer>
  );
};