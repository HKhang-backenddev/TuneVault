import { useContext } from 'react';
import { PlayerContext, type PlayerContextType } from '../context/PlayerContextDef';

export const usePlayer = (): PlayerContextType => {
  const context = useContext(PlayerContext);
  if (!context) throw new Error("usePlayer phải dùng trong PlayerProvider");
  return context;
};