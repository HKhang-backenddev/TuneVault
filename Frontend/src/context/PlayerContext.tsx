import { useState, type ReactNode } from 'react';
import { PlayerContext, type Track } from './PlayerContextDef';

export const PlayerProvider = ({ children }: { children: ReactNode }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);

  const playTrack = (track: Track) => {
    setCurrentTrack(track);
    setIsPlaying(true);
  };

  const togglePlay = () => setIsPlaying(!isPlaying);

  return (
    <PlayerContext.Provider value={{ isPlaying, currentTrack, playTrack, togglePlay }}>
      {children}
    </PlayerContext.Provider>
  );
};
