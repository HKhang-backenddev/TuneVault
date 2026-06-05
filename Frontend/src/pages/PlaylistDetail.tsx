export const PlaylistDetail = () => (
  <div className="p-6">
    <h2 className="text-3xl font-bold mb-4">Tên Playlist</h2>
    <div className="flex flex-col gap-2">
      {/* Giả lập danh sách bài hát */}
      <div className="p-3 hover:bg-neutral-800 rounded">Bài hát 1 - Nghệ sĩ</div>
      <div className="p-3 hover:bg-neutral-800 rounded">Bài hát 2 - Nghệ sĩ</div>
    </div>
  </div>
);
export default PlaylistDetail;