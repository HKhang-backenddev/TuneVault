import { useState } from 'react';
import { Moon, Timer, X, Check } from 'lucide-react';
import { useAudio } from '../Contexts/AudioContext';

const TIMER_OPTIONS = [
  { label: '15 phút', minutes: 15, icon: '☕' },
  { label: '30 phút', minutes: 30, icon: '🎵' },
  { label: '45 phút', minutes: 45, icon: '📖' },
  { label: '1 giờ', minutes: 60, icon: '🎬' },
  { label: '2 giờ', minutes: 120, icon: '🌙' },
];

export const SleepTimer = () => {
  const { sleepTimer, sleepTimeRemaining, setSleepTimer } = useAudio();
  const [showMenu, setShowMenu] = useState(false);

  const formatRemaining = (seconds: number | null) => {
    if (!seconds) return '';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSelect = (minutes: number) => {
    setSleepTimer(minutes);
  };

  const handleCancel = () => {
    setSleepTimer(null);
    setShowMenu(false);
  };

  const progress = sleepTimer > 0 && sleepTimeRemaining !== null
    ? ((sleepTimer * 60 - sleepTimeRemaining) / (sleepTimer * 60)) * 100
    : 0;

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className={`group p-2.5 rounded-xl transition-all duration-300 ${
          sleepTimer > 0 
            ? 'bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-indigo-400 shadow-lg shadow-indigo-500/20' 
            : 'text-neutral-400 hover:text-white hover:bg-white/10'
        }`}
        title="Hẹn giờ tắt nhạc"
      >
        {sleepTimer > 0 ? (
          <div className="relative">
            <div className="w-5 h-5 rounded-full border-2 border-indigo-500 flex items-center justify-center">
              <Moon size={12} className="text-indigo-400" />
            </div>
            <span className="absolute -top-1 -right-1 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center shadow-lg">
              {Math.ceil((sleepTimeRemaining || 0) / 60)}
            </span>
          </div>
        ) : (
          <Timer size={20} className="group-hover:scale-110 transition-transform" />
        )}
      </button>

      {showMenu && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setShowMenu(false)} 
          />
          <div className="absolute bottom-full right-0 mb-3 w-72 bg-gradient-to-b from-neutral-900 to-neutral-950 rounded-2xl border border-white/10 shadow-2xl z-50 overflow-hidden backdrop-blur-xl">
            {/* Header */}
            <div className="relative p-4 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 border-b border-white/5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg">
                    <Moon size={20} className="text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white">Hẹn giờ tắt</h3>
                    <p className="text-xs text-white/50">Nhạc sẽ tự động dừng</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowMenu(false)} 
                  className="p-2 rounded-lg hover:bg-white/10 text-neutral-400 hover:text-white transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
              
              {/* Active Timer */}
              {sleepTimer > 0 && sleepTimeRemaining !== null && (
                <div className="mt-4 p-3 rounded-xl bg-black/30 border border-indigo-500/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-indigo-400 text-sm font-semibold">Đang đếm ngược</span>
                    <span className="text-white font-mono font-bold">{formatRemaining(sleepTimeRemaining)}</span>
                  </div>
                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-1000"
                      style={{ width: `${100 - progress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
            
            {/* Options */}
            <div className="p-3 grid grid-cols-1 gap-2">
              {TIMER_OPTIONS.map((option) => {
                const isActive = sleepTimer === option.minutes && sleepTimeRemaining !== null;
                return (
                  <button
                    key={option.minutes}
                    onClick={() => { handleSelect(option.minutes); setShowMenu(false); }}
                    className={`group flex items-center justify-between p-3 rounded-xl transition-all duration-200 ${
                      isActive 
                        ? 'bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-500/30' 
                        : 'hover:bg-white/5 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{option.icon}</span>
                      <div className="text-left">
                        <p className={`font-semibold ${isActive ? 'text-indigo-400' : 'text-white'}`}>
                          {option.label}
                        </p>
                        <p className="text-xs text-white/40">Tắt nhạc sau {option.label.toLowerCase()}</p>
                      </div>
                    </div>
                    {isActive && (
                      <div className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center">
                        <Check size={14} className="text-white" />
                      </div>
                    )}
                  </button>
                );
              })}
              
              {sleepTimer > 0 && (
                <button
                  onClick={handleCancel}
                  className="w-full flex items-center justify-center gap-2 p-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors mt-2 border border-red-500/20 hover:border-red-500/40"
                >
                  <X size={16} />
                  <span className="font-semibold">Hủy hẹn giờ</span>
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default SleepTimer;
