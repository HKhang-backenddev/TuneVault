export const Sidebar = () => (
  <aside className="w-64 bg-gradient-to-b from-neutral-900 via-neutral-950 to-black p-6 flex flex-col gap-6 text-neutral-400">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 bg-gradient-to-tr from-pink-500 to-purple-600 rounded flex items-center justify-center text-white font-bold">TV</div>
      <h1 className="text-white text-xl font-semibold">TuneVault</h1>
    </div>

    <nav className="flex flex-col gap-3">
      <a href="/" className="flex items-center gap-3 hover:text-white transition py-2 px-2 rounded">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-neutral-400"><path d="M3 11.5L12 5l9 6.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1v-8.5z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
        <span>Trang chủ</span>
      </a>
      <a href="/search" className="flex items-center gap-3 hover:text-white transition py-2 px-2 rounded">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><circle cx="11" cy="11" r="6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        <span>Tìm kiếm</span>
      </a>
      <a href="/library" className="flex items-center gap-3 hover:text-white transition py-2 px-2 rounded">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="14" height="16" rx="2" stroke="currentColor" strokeWidth="1.5"/><path d="M7 8h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
        <span>Thư viện</span>
      </a>
      <a href="/playlist" className="flex items-center gap-3 hover:text-white transition py-2 px-2 rounded">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M3 7h14v2H3V7zm0 4h10v2H3v-2zm0 4h6v2H3v-2z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        <span>Playlists</span>
      </a>
    </nav>

    <div className="mt-4 pt-4 border-t border-neutral-800">
      <h2 className="text-sm text-neutral-300 mb-3">Playlist của tôi</h2>
      <ul className="flex flex-col gap-2 text-sm">
        <li className="hover:text-white transition"><a href="#">Yêu thích</a></li>
        <li className="hover:text-white transition"><a href="#">Playlist Hôm nay</a></li>
        <li className="hover:text-white transition"><a href="#">Chill Vibes</a></li>
        <li className="hover:text-white transition"><a href="#">Top Hits</a></li>
      </ul>
    </div>

    <div className="mt-auto pt-4 border-t border-neutral-800 flex items-center gap-3">
      <img src="/assets/avatar-placeholder.svg" alt="user" className="w-10 h-10 rounded-full bg-neutral-700" />
      <div className="text-left">
        <div className="text-white text-sm">Khách</div>
        <div className="text-xs text-neutral-500">Miễn phí</div>
      </div>
    </div>
  </aside>
);