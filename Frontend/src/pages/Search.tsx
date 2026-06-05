import { useState } from 'react';
import { MediaCard } from '../components/common/index';

const SearchPage = () => {
  const [q, setQ] = useState('');
  const [results, setResults] = useState<any[]>([]);

  const doSearch = async () => {
    const res = await fetch('/api/media?query=' + encodeURIComponent(q));
    const data = await res.json();
    setResults(data);
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Search</h1>
      <div className="flex mb-6">
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Tìm bài hát, nghệ sĩ, playlist..." className="flex-1 p-3 bg-neutral-800 rounded text-white" />
        <button className="ml-3 px-5 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded" onClick={doSearch}>Tìm</button>
      </div>

      <div className="grid grid-cols-4 gap-6">
        {results.map(r => (
          <MediaCard key={r.id} title={r.title} artist={r.artist ?? ''} imageUrl={'/assets/hero.svg'} playUrl={r.url} />
        ))}
      </div>
    </div>
  );
};

export default SearchPage;
