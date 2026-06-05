
// src/components/PlayerBar.tsx
import AudioPlayer from 'react-h5-audio-player';
import 'react-h5-audio-player/lib/styles.css';
import { MediaItem } from '../types/media';

interface PlayerBarProps {
    currentTrack: MediaItem | null;
}

export const PlayerBar = ({ currentTrack }: PlayerBarProps) => {
    if (!currentTrack) return <div className="p-4 bg-black text-white">Chưa chọn bài hát</div>;

    return (
        <div className="fixed bottom-0 w-full bg-neutral-900 p-2">
            <div className="text-white text-sm mb-1">
                Đang phát: {currentTrack.title} - {currentTrack.artist}
            </div>
            <AudioPlayer
                src={currentTrack.filePath}
                controls
            />
        </div>
    );
};