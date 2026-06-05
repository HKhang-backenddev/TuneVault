const RightPanel = () => {
  return (
    <div className="w-80 bg-gradient-to-t from-neutral-950 to-neutral-900 p-6 border-l border-neutral-800 h-full flex flex-col">
      <div className="mb-6">
        <h4 className="text-sm text-neutral-400 uppercase">Now Playing</h4>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <img src="/assets/hero.svg" alt="current" className="w-52 h-52 object-cover rounded-lg mb-4 shadow-lg" />
        <h3 className="text-lg font-semibold">No track</h3>
        <p className="text-sm text-neutral-400">—</p>
        <div className="mt-4 w-full px-4">
          <div className="w-full h-2 bg-neutral-800 rounded-full">
            <div className="h-2 bg-green-500 rounded-full" style={{ width: '40%' }} />
          </div>
          <div className="flex justify-between text-xs text-neutral-500 mt-2">
            <span>1:12</span>
            <span>3:45</span>
          </div>
        </div>
      </div>

      <div className="mt-6 text-neutral-400 text-sm">
        <div className="mb-2">Playlist</div>
        <ul className="space-y-2">
          <li className="flex items-center">
            <div className="w-10 h-10 bg-neutral-800 rounded mr-3" />
            <div>
              <div className="text-sm">Tuan Ngoc</div>
              <div className="text-xs text-neutral-500">Various Artists</div>
            </div>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default RightPanel;
