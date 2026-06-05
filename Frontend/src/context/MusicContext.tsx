import React, { createContext, useContext, useState } from 'react';

export interface Song {
  id: string;
  title: string;
  artistName?: string;
  durationInSeconds: number;
  genre: string;
  thumbnailUrl?: string;
  mediaUrl?: string;
  createdAt: string;
}

interface MusicContextType {
  currentSong: Song | null;
  isPlaying: boolean;
  queue: Song[];
  currentIndex: number;
  playSong: (song: Song) => void;
  pauseSong: () => void;
  resumeSong: () => void;
  nextSong: () => void;
  prevSong: () => void;
  setQueue: (songs: Song[]) => void;
  setCurrentIndex: (index: number) => void;
}

const MusicContext = createContext<MusicContextType | undefined>(undefined);

export const MusicProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [queue, setQueue] = useState<Song[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const playSong = (song: Song) => {
    setCurrentSong(song);
    setIsPlaying(true);
    if (!queue.includes(song)) {
      setQueue([song]);
      setCurrentIndex(0);
    }
  };

  const pauseSong = () => {
    setIsPlaying(false);
  };

  const resumeSong = () => {
    setIsPlaying(true);
  };

  const nextSong = () => {
    if (currentIndex < queue.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setCurrentSong(queue[currentIndex + 1]);
    } else if (queue.length > 0) {
      setCurrentIndex(0);
      setCurrentSong(queue[0]);
    }
  };

  const prevSong = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setCurrentSong(queue[currentIndex - 1]);
    } else if (queue.length > 0) {
      setCurrentIndex(queue.length - 1);
      setCurrentSong(queue[queue.length - 1]);
    }
  };

  return (
    <MusicContext.Provider
      value={{
        currentSong,
        isPlaying,
        queue,
        currentIndex,
        playSong,
        pauseSong,
        resumeSong,
        nextSong,
        prevSong,
        setQueue,
        setCurrentIndex,
      }}
    >
      {children}
    </MusicContext.Provider>
  );
};

export const useMusic = () => {
  const context = useContext(MusicContext);
  if (!context) {
    throw new Error('useMusic must be used within MusicProvider');
  }
  return context;
};
