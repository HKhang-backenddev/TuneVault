export const Inbox = () => (
  <div className="p-6">
    <h2 className="text-2xl font-bold mb-4">Đã chia sẻ với tôi</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* Hiển thị danh sách media được share */}
      <div className="bg-neutral-800 p-4 rounded">Nội dung được chia sẻ...</div>
    </div>
  </div>
);
export default Inbox;