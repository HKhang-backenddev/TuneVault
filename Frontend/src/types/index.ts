export interface User {
  id: string;
  username: string;
}

export interface Track {
  id: string;
  title: string;
  artist: string;
  url: string; // Đường dẫn file nhạc
  thumbnail: string;
}

export interface Playlist {
  id: string;
  name: string;
  tracks: Track[];
}