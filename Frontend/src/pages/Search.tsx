import { useState, useEffect } from 'react';
import { Search as SearchIcon, User, Music } from 'lucide-react';
import api from '../axios';
import { useAudio } from '../Contexts/AudioContext';
import { Link } from 'react-router-dom';

const Search = () => {
  const [query, setQuery] = useState('');
  const [songs, setSongs] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { playTrack } = useAudio();

  useEffect(() => {
    if (!query || query.length < 2) {
      setSongs([]);
      setUsers([]);
      return;
    }
    
    setLoading(true);
    const delayDebounce = setTimeout(async () => {
      try {
        const [songsRes, usersRes] = await Promise.all([
          api.get(`/media?query=${query}`),
          api.get(`/User/search?query=${query}`)
        ]);
        setSongs(songsRes.data?.items || []);
        setUsers(usersRes.data || []);
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [query]);

  const hasResults = songs.length > 0 || users.length > 0;

  return (
    <div className="pb-24 bg-transparent">
      <div className="relative mb-8 max-w-md">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Tìm kiếm bài hát, nghệ sĩ, người dùng..."
          className="w-full bg-neutral-800 rounded-full py-3 pl-12 pr-4 text-sm text-white placeholder:text-neutral-500 focus:ring-2 ring-blue-500 outline-none"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-8 text-neutral-400">
          <div className="animate-pulse">Đang tìm kiếm...</div>
        </div>
      )}

      {/* Results */}
      {!loading && hasResults && (
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Users Section */}
          {users.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <User size={20} className="text-blue-400" />
                Người dùng
              </h2>
              <div className="flex flex-wrap gap-4">
                {users.map((user: any) => (
                  <Link
                    key={user.id}
                    to={`/profile/${user.username}`}
                    className="bg-neutral-800/50 hover:bg-neutral-700/50 p-4 rounded-2xl flex items-center gap-4 transition-all border border-transparent hover:border-blue-500/30"
                    style={{ minWidth: '250px' }}
                  >
                    {user.avatarUrl ? (
                      <img 
                        src={user.avatarUrl} 
                        className="w-14 h-14 rounded-full object-cover border-2 border-blue-500/30"
                        alt={user.displayName}
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl">
                        {user.displayName?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                    )}
                    <div>
                      <div className="font-semibold text-white">{user.displayName}</div>
                      <div className="text-sm text-neutral-400">@{user.username}</div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Songs Section */}
          {songs.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Music size={20} className="text-green-400" />
                Bài hát
              </h2>
              <div className="bg-black/30 backdrop-blur-sm p-4 rounded-3xl border border-white/5">
                <div className="custom-scrollbar" style={{ display: 'flex', flexWrap: 'nowrap', overflowX: 'auto', gap: '12px', paddingBottom: '8px' }}>
                  {songs.map((item: any) => (
                    <div 
                      key={item.id} 
                      onClick={() => playTrack(item, songs)}
                      className="bg-neutral-900 p-3 rounded-2xl hover:bg-neutral-800 cursor-pointer group transition-all shadow-xl hover:shadow-2xl"
                      style={{ flexShrink: 0, width: '180px', minWidth: '180px' }}
                    >
                      <div className="relative overflow-hidden rounded-xl mb-3">
                        <img 
                          src={item.thumbnailUrl} 
                          className="w-full aspect-square object-cover"
                          style={{ height: '160px' }}
                          alt={item.title}
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center shadow-lg transform scale-0 group-hover:scale-100 transition-transform">
                            <Music size={20} className="text-white" />
                          </div>
                        </div>
                      </div>
                      <div className="font-medium text-white truncate">{item.title}</div>
                      <div className="text-sm text-neutral-400 truncate">{item.artist || 'Nghệ sĩ không xác định'}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* No Results */}
      {!loading && query.length >= 2 && !hasResults && (
        <div className="text-center py-16">
          <SearchIcon size={64} className="mx-auto mb-4 text-neutral-600" />
          <h3 className="text-xl font-semibold text-white mb-2">Không tìm thấy kết quả</h3>
          <p className="text-neutral-400">Thử tìm kiếm với từ khóa khác</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && query.length < 2 && (
        <>
          <div className="max-w-5xl mx-auto mb-4 px-2">
            <h2 className="text-2xl font-bold tracking-tight text-white">Duyệt tìm tất cả</h2>
          </div>
          
          <div className="max-w-5xl mx-auto bg-black/30 backdrop-blur-sm p-3 rounded-3xl border border-white/5 shadow-inner">
            <div className="custom-scrollbar" style={{ display: 'flex', flexWrap: 'nowrap', overflowX: 'auto', gap: '8px', paddingBottom: '8px', width: '100%', scrollSnapType: 'x mandatory' }}>
              {['Pop', 'Hip-Hop', 'Indie', 'Podcast', 'Mới phát hành', 'Dành cho bạn'].map((genre, i) => (
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