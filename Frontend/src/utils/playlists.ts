export interface Track {
  id: string;
  title: string;
  artist?: string;
  url: string;
  thumbnail?: string;
}

export interface Playlist {
  id: string;
  name: string;
  tracks: Track[];
}

const KEY = 'tv_playlists_v1';

export function getPlaylists(): Playlist[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Playlist[];
  } catch {
    return [];
  }
}

export function savePlaylists(pls: Playlist[]) {
  localStorage.setItem(KEY, JSON.stringify(pls));
}

export function createPlaylist(name: string): Playlist {
  const pls = getPlaylists();
  const p: Playlist = { id: Date.now().toString(), name, tracks: [] };
  pls.push(p);
  savePlaylists(pls);
  return p;
}

export function addTrackToPlaylist(playlistId: string, track: Track) {
  const pls = getPlaylists();
  const p = pls.find(x => x.id === playlistId);
  if (!p) return false;
  // avoid duplicates by id
  if (!p.tracks.find(t => t.id === track.id)) p.tracks.push(track);
  savePlaylists(pls);
  return true;
}

export function removeTrackFromPlaylist(playlistId: string, trackId: string) {
  const pls = getPlaylists();
  const p = pls.find(x => x.id === playlistId);
  if (!p) return false;
  p.tracks = p.tracks.filter(t => t.id !== trackId);
  savePlaylists(pls);
  return true;
}

export function renamePlaylist(playlistId: string, name: string) {
  const pls = getPlaylists();
  const p = pls.find(x => x.id === playlistId);
  if (!p) return false;
  p.name = name;
  savePlaylists(pls);
  return true;
}

export function deletePlaylist(playlistId: string) {
  let pls = getPlaylists();
  pls = pls.filter(p => p.id !== playlistId);
  savePlaylists(pls);
}
