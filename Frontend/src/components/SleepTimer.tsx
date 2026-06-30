import { useState } from 'react';
import { Moon, Timer, X } from 'lucide-react';
import { useAudio } from '../Contexts/AudioContext';

const TIMER_OPTIONS = [
  { label: 'Tắt sau 15 phút', minutes: 15 },
  { label: 'Tắt sau 30 phút', minutes: 30 },
  { label: 'Tắt sau 45 phút', minutes: 45 },
  { label: 'Tắt sau 1 giờ', minutes: 60 },
  { label: 'Tắt sau 2 giờ', minutes: 120 },
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
    setShowMenu(false);
  };

  const handleCancel = () => {
    setSleepTimer(null);
    setShowMenu(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className={`p-2 rounded-full transition-all ${sleepTimer > 0 ? 'bg-blue-500/20 text-blue-400' : 'text-neutral-400 hover:text-white hover:bg-white/10'}`}
        title="Hẹn giờ tắt"
      >
        {sleepTimer > 0 ? (
          <div className="relative">
            <Moon size={20} />
            <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">
              {Math.ceil((sleepTimeRemaining || 0) / 60)}
            </span>
          </div>
        ) : (
          <Timer size={20} />
        )}
      </button>

      {showMenu && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setShowMenu(false)} 
          />
          <div className="absolute bottom-full right-0 mb-2 w-64 bg-neutral-900 rounded-xl border border-white/10 shadow-2xl z-50 overflow-hidden">
            <div className="flex items-center justify-between p-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Moon size={16} className="text-blue-400" />
                <span className="font-semibold text-white text-sm">Hẹn giờ tắt</span>
              </div>
              <button onClick={() => setShowMenu(false)} className="text-neutral-500 hover:text-white">
                <X size={16} />
              </button>
            </div>
            
            {sleepTimer > 0 && (
              <div className="px-3 py-2 bg-blue-500/10 border-b border-white/10">
                <p className="text-blue-400 text-sm font-semibold">
                  Đang đếm ngược: {formatRemaining(sleepTimeRemaining)}
                </p>
              </div>
            )}

            <div className="p-2">
              {TIMER_OPTIONS.map((option) => (
                <button
                  key={option.minutes}
                  onClick={() => handleSelect(option.minutes)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    sleepTimer === option.minutes 
                      ? 'bg-blue-500/20 text-blue-400' 
                      : 'text-neutral-300 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  {option.label}
                </button>
              ))}
              
              {sleepTimer > 0 && (
                <button
                  onClick={handleCancel}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-500/10 transition-colors mt-2 border-t border-white/10 pt-2"
                >
                  Hủy hẹn giờ
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
