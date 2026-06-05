import { useEffect, useState } from 'react';
import type { Playlist as P } from '../utils/playlists';
import { getPlaylists, createPlaylist, renamePlaylist, deletePlaylist, removeTrackFromPlaylist, savePlaylists } from '../utils/playlists';

const PlaylistPage = () => {
  const [playlists, setPlaylists] = useState<P[]>([]);
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => setPlaylists(getPlaylists()), []);

  const refresh = () => setPlaylists(getPlaylists());

  const onCreate = () => {
    const name = window.prompt('Tên playlist mới');
    if (!name) return;
    createPlaylist(name);
    refresh();
  };

  const onRename = (id: string) => {
    const name = window.prompt('Tên mới');
    if (!name) return;
    renamePlaylist(id, name);
    refresh();
  };

  const onDelete = (id: string) => {
    if (!confirm('Xóa playlist này?')) return;
    deletePlaylist(id);
    if (selected === id) setSelected(null);
    refresh();
  };

  const onRemoveTrack = (playlistId: string, trackId: string) => {
    removeTrackFromPlaylist(playlistId, trackId);
    refresh();
  };

  const onReorder = (playlistId: string, idx: number, dir: number) => {
    const pls = getPlaylists();
    const p = pls.find(x => x.id === playlistId);
    if (!p) return;
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= p.tracks.length) return;
    const t = p.tracks.splice(idx, 1)[0];
    p.tracks.splice(newIdx, 0, t);
    savePlaylists(pls);
    refresh();
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Playlist</h1>
        <div>
          <button className="px-4 py-2 bg-neutral-800 rounded mr-2" onClick={onCreate}>Tạo playlist</button>
        </div>
      </div>

      <div className="flex gap-6">
        <div className="w-64 bg-neutral-800 rounded p-3">
          <h3 className="text-sm text-neutral-300 mb-3">Danh sách</h3>
          <ul className="space-y-2">
            {playlists.map(p => (
              <li key={p.id} className={`p-2 rounded hover:bg-neutral-700 ${selected === p.id ? 'bg-neutral-700' : ''}`}>
                <div className="flex items-center justify-between">
                  <button className="text-left flex-1" onClick={() => setSelected(p.id)}>{p.name}</button>
                  <div className="flex gap-2">
                    <button onClick={() => onRename(p.id)} className="text-xs">Rename</button>
                    <button onClick={() => onDelete(p.id)} className="text-xs text-red-400">Del</button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex-1 bg-neutral-900 rounded p-4">
          {!selected && <div className="text-neutral-400">Chọn một playlist để xem nội dung</div>}
          {selected && (() => {
            const p = playlists.find(x => x.id === selected);
            if (!p) return <div className="text-neutral-400">Playlist không tồn tại</div>;
            return (
              <div>
                <h2 className="text-lg font-semibold mb-4">{p.name}</h2>
                <ul className="space-y-3">
                  {p.tracks.map((t, i) => (
                    <li key={t.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img src={t.thumbnail ?? '/assets/hero.svg'} alt="t" className="w-12 h-12 object-cover rounded" />
                        <div>
                          <div className="font-semibold">{t.title}</div>
                          <div className="text-xs text-neutral-400">{t.artist}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => onReorder(p.id, i, -1)} className="text-sm">▲</button>
                        <button onClick={() => onReorder(p.id, i, 1)} className="text-sm">▼</button>
                        <button onClick={() => onRemoveTrack(p.id, t.id)} className="text-sm text-red-400">Remove</button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
};

export default PlaylistPage;
