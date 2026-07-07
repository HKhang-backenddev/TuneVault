import { useState, useEffect } from 'react';
import { Search as SearchIcon } from 'lucide-react';
import api from '../axios';
import { useAudio } from '../Contexts/AudioContext';

const Search = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const { playTrack } = useAudio();

  useEffect(() => {
    if (!query) {
      setResults([]);
      return;
    }
    const delayDebounce = setTimeout(() => {
      api.get(`/media?query=${query}`).then(res => setResults(res.data.items));
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [query]);

  return (
    <div className="pb-24 bg-transparent">
      <div className="relative mb-8 max-w-md">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 w-5 h-5" />
        <input
          type="text"
          placeholder="What do you want to listen to?"
          className="w-full bg-neutral-800 rounded-full py-3 pl-12 pr-4 text-sm text-white placeholder:text-neutral-500 focus:ring-2 ring-white outline-none"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {results.length > 0 ? (
        <div className="max-w-5xl mx-auto bg-black/30 backdrop-blur-sm p-3 rounded-3xl border border-white/5 shadow-inner">
          <div className="custom-scrollbar" style={{ display: 'flex', flexWrap: 'nowrap', overflowX: 'auto', gap: '8px', paddingBottom: '8px', width: '100%', scrollSnapType: 'x mandatory' }}>
          {results.map((item: any) => (
            <div 
              key={item.id} 
              onClick={() => playTrack(item)}
              className="bg-neutral-900 p-3 rounded-3xl hover:bg-neutral-800 cursor-pointer group shadow-xl"
              style={{ flexShrink: 0, width: '180px', minWidth: '180px', maxWidth: '180px', scrollSnapAlign: 'start', overflow: 'hidden' }}
            >
              <img src={item.thumbnailUrl} className="object-cover rounded-2xl mb-3 shadow-lg" style={{ width: '100%', height: '160px', objectFit: 'cover' }} />
              <div className="text-sm text-neutral-400">{item.artist || ''}</div>
            </div>
          ))}
          </div>
        </div>
      ) : (
        <>
          <div className="max-w-5xl mx-auto mb-4 px-2">
            <h2 className="text-2xl font-bold tracking-tight text-white">Browse All</h2>
          </div>
          
          <div className="max-w-5xl mx-auto bg-black/30 backdrop-blur-sm p-3 rounded-3xl border border-white/5 shadow-inner">
            <div className="custom-scrollbar" style={{ display: 'flex', flexWrap: 'nowrap', overflowX: 'auto', gap: '8px', paddingBottom: '8px', width: '100%', scrollSnapType: 'x mandatory' }}>
              {['Pop', 'Hip-Hop', 'Indie', 'Podcast', 'New Releases', 'For You'].map((genre, i) => (
                <div 
                  key={genre} 
                  style={{ 
                    backgroundColor: `hsl(${i * 45}, 70%, 40%)`,
                    flexShrink: 0,
                    width: '280px',
                    aspectRatio: '16/9',
                    scrollSnapAlign: 'start'
                  }}
                  className="rounded-lg p-4 font-bold text-lg cursor-pointer hover:brightness-110 flex items-end shadow-lg"
                >
                  {genre}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Search;