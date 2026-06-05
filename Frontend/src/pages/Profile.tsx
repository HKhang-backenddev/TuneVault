export const Profile = () => (
  <div className="p-6 flex flex-col items-center">
    <div className="w-32 h-32 bg-neutral-700 rounded-full mb-4"></div>
    <h2 className="text-2xl font-bold">Tên người dùng</h2>
    <p className="text-neutral-400">Bio: Người yêu nhạc của TuneVault</p>
    <button className="mt-4 bg-white text-black px-6 py-2 rounded-full font-bold">Chỉnh sửa</button>
  </div>
);
export default Profile;