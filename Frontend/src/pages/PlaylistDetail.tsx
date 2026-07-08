import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Clock, Play } from 'lucide-react';
import api from '../axios';
import { useAudio } from '../Contexts/AudioContext';

const PlaylistDetail = () => {
  const { id } = useParams();
  const [playlist, setPlaylist] = useState<any>(null);
  const { playTrack } = useAudio();

  useEffect(() => {
    api.get(`/playlists/${id}`).then(res => setPlaylist(res.data));
  }, [id]);

  if (!playlist) return <div className="p-8 text-neutral-400">Loading...</div>;

  return (
    <div className="pb-24 bg-transparent">
      <div className="flex items-end gap-6 mb-8 bg-gradient-to-b from-neutral-700/50 to-transparent p-6 -mx-6 -mt-6">
        <div className="w-52 h-52 bg-neutral-800 shadow-2xl flex-shrink-0">
          {/* Playlist Cover */}
        </div>
        <div>
          <span className="text-xs font-bold uppercase">Playlist</span>
          <h1 className="text-7xl font-black my-2">{playlist.title}</h1>
          <p className="text-neutral-400 text-sm">{playlist.description}</p>
        </div>
      </div>

      <div className="px-2">
        <div className="grid grid-cols-[16px_1fr_1fr_40px] gap-4 px-4 py-2 border-b border-neutral-800 text-neutral-400 text-sm mb-4">
          <div>#</div>
          <div>Title</div>
          <div>Album</div>
          <div className="flex justify-center"><Clock className="w-4 h-4" /></div>
        </div>

        {playlist.tracks.map((track: any, index: number) => (
          <div 
            key={track.id}
            onClick={() => playTrack(track)}
            className="grid grid-cols-[16px_1fr_1fr_40px] gap-4 px-4 py-2 rounded-md hover:bg-neutral-800 group cursor-pointer items-center"
          >
            <div className="text-neutral-400 group-hover:text-white">
              <span className="group-hover:hidden">{index + 1}</span>
              <Play className="w-3 h-3 hidden group-hover:block fill-current" />
            </div>
            <div>
              <div className="font-medium truncate">{track.title}</div>
              <div className="text-xs text-neutral-400 truncate">{track.artistName}</div>
            </div>
            <div className="text-sm text-neutral-400 truncate">{playlist.title}</div>
            <div className="text-sm text-neutral-400 text-center">3:45</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlaylistDetail;