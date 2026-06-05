import { MediaCard } from '../components/common/index';

const Home = () => {
  const sections = [
    { id: 1, title: 'Khám phá', items: Array.from({ length: 6 }).map((_, i) => ({ id: i, title: `Playlist ${i + 1}`, artist: 'Various', imageUrl: 'https://via.placeholder.com/300' })) },
    { id: 2, title: 'Radio phổ biến', items: Array.from({ length: 4 }).map((_, i) => ({ id: i, title: `Radio ${i + 1}`, artist: 'Station', imageUrl: 'https://via.placeholder.com/200' })) },
  ];

  return (
    <div className="p-8">
      {/* Hero */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-extrabold text-white">Khám phá</h1>
          <p className="text-neutral-400 mt-2">Gợi ý cho bạn hôm nay</p>
        </div>
        <div className="flex space-x-3">
          <button className="px-4 py-2 bg-neutral-800 rounded text-white">Tùy chọn</button>
          <button className="px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded">Nghe tất cả</button>
        </div>
      </div>

      {/* Sections */}
      {sections.map((section) => (
        <section key={section.id} className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">{section.title}</h2>
            <a className="text-sm text-neutral-400">Xem tất cả</a>
          </div>
          <div className="grid grid-cols-4 gap-6">
            {section.items.map((it) => (
              <MediaCard key={it.id} title={it.title} artist={it.artist} imageUrl={it.imageUrl} playUrl={`/media/${it.title.replace(/\s/g, '-')}.mp3`} />
            ))}
          </div>
        </section>
      ))}

      {/* Footer spacer for player */}
      <div style={{ height: 88 }} />
    </div>
  );
};

export default Home;
