import React from 'react';
import { Sidebar } from '../common/Sidebar';
import { PlayerBar } from '../common/PlayerBar';
import RightPanel from './RightPanel';

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex flex-col h-screen bg-black text-white">
      {/* Phần chính: Sidebar + Nội dung + Panel phải */}
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        
        {/* Vùng nội dung trung tâm */}
        <main className="flex-1 bg-gradient-to-b from-neutral-900 to-neutral-950 rounded-lg m-4 overflow-y-auto p-0">
          <div className="p-0 md:p-6 lg:p-8 h-full">{children}</div>
        </main>

        {/* Panel phải (Chi tiết bài hát/nghệ sĩ) */}
        <aside className="w-80">
          <RightPanel />
        </aside>
      </div>

      {/* Player bar cố định phía dưới */}
      <PlayerBar />
    </div>
  );
};

export default AppLayout;