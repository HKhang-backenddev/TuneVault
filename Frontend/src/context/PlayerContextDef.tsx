import { createContext } from 'react';

// Định nghĩa kiểu dữ liệu cho bài hát
export interface Track {
  id: string;
  title: string;
  artist: string;
  url: string;
  thumbnail: string;
}

export interface PlayerContextType {
  isPlaying: boolean;
  currentTrack: Track | null;
  playTrack: (track: Track) => void;
  togglePlay: () => void;
}

export const PlayerContext = createContext<PlayerContextType>({
  isPlaying: false,
  currentTrack: null,
  playTrack: () => {},
  togglePlay: () => {},
});
