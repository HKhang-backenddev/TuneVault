
export const Sidebar = () => {
    return (
        <nav className="w-full h-full bg-black text-gray-400 p-4">
            <div className="mb-8">
                <h2 className="text-white font-bold mb-4">Thư viện</h2>
                <ul>
                    <li className="hover:text-white cursor-pointer mb-2">Bài hát đã thích</li>
                    <li className="hover:text-white cursor-pointer">Danh sách phát</li>
                </ul>
            </div>
        </nav>
    );
};