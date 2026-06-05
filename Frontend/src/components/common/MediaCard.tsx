interface MediaCardProps {
  title: string;
  artist: string;
  imageUrl: string;
  playUrl?: string;
}

import { useContext } from 'react';
import { PlayerContext } from '../../context/PlayerContextDef';

export const MediaCard = ({ title, artist, imageUrl, playUrl }: MediaCardProps) => {
  const { playTrack } = useContext(PlayerContext);
  return (
    <div className="bg-neutral-800 p-3 rounded-lg hover:scale-105 transform transition-shadow shadow-sm hover:shadow-lg cursor-pointer">
      <div className="relative">
        <img src={imageUrl} alt={title} className="w-full h-44 object-cover rounded-md" />
          {playUrl && (
            <>
              <button onClick={() => playTrack({ id: title, title, artist, url: playUrl, thumbnail: imageUrl })} className="absolute inset-0 m-auto w-12 h-12 rounded-full bg-black/50 text-white flex items-center justify-center opacity-0 hover:opacity-100 transition">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M5 3v18l15-9L5 3z" fill="currentColor"/></svg>
              </button>
              <button title="Add to playlist" onClick={(e) => { e.stopPropagation(); const name = window.prompt('Nhập tên playlist để thêm (tạo mới nếu chưa có)'); if (!name) return; // simple flow: create if missing, then add
                  import('../../utils/playlists').then((m: any) => {
                    const pls = m.getPlaylists() as any[];
                    let p = pls.find((x: any) => x.name === name);
                    if (!p) p = m.createPlaylist(name);
                    m.addTrackToPlaylist(p.id, { id: title, title, artist, url: playUrl, thumbnail: imageUrl });
                    alert('Đã thêm vào playlist "' + p.name + '"');
                  });
                }} className="absolute right-2 bottom-2 w-8 h-8 rounded-full bg-white/10 text-white flex items-center justify-center opacity-90 hover:bg-white/20 transition">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
            </>
          )}
      </div>
      <h3 className="text-white font-semibold mt-3 truncate">{title}</h3>
      <p className="text-sm text-neutral-400 truncate">{artist}</p>
    </div>
  );
};