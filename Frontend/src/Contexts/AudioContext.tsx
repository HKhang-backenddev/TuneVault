import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import api from '../axios';

export interface Track {
  id: string;
  title: string;
  artist: string;
  url: string;
  thumbnailUrl: string;
  durationSeconds?: number;
  isLiked?: boolean;
}

export type AudioContextType = {
  currentTrack: Track | null;
  songForShare: Track | null;
  selectSongForShare: (track: Track | null) => void;
  isPlaying: boolean;
  playTrack: (track: Track, queue?: Track[]) => void;
  togglePlay: () => void;
  stopTrack: () => void;
  currentTime: number;
  duration: number;
  seek: (time: number) => void;
  volume: number;
  setVolume: (v: number) => void;
  loading: boolean;
  updateLikedStatus: (liked: boolean) => void;
  playNext: () => void;
  playPrev: () => void;
  analyser: AnalyserNode | null;
  queue: Track[];
  addToQueue: (track: Track) => void;
  removeFromQueue: (index: number) => void;
  clearQueue: () => void;
  sleepTimer: number;
  setSleepTimer: (minutes: number | null) => void;
  sleepTimeRemaining: number | null;
};
export const AudioContext = createContext<AudioContextType | null>(null);

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [songForShare, setSongForShare] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [queue, setQueue] = useState<Track[]>([]);
  const [sleepTimer, setSleepTimer] = useState(0);
  const [sleepTimeRemaining, setSleepTimeRemaining] = useState<number | null>(null);
  const sleepTimerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null!);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  const audioApiContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    const audio = audioRef.current;

    const handleError = () => {
      const err = audio.error;
      // Bỏ qua lỗi nếu src đang trống (do ta vừa reset src hoặc chưa nạp gì)
      if (!audio.src || audio.src === window.location.href) return;

      console.error("!!! LỖI AUDIO THỰC TẾ:", {
        code: err?.code,
        message: err?.message,
        src: audio.src
      });
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleDurationChange = () => {
      if (!isNaN(audio.duration) && audio.duration > 0) {
        setDuration(audio.duration);
      }
    };

    const handleLoadedMetadata = () => {
      console.log(">>> Đã nạp xong metadata. Thời lượng:", audio.duration);
      if (!isNaN(audio.duration)) {
        setDuration(audio.duration);
      }
    };

    const handleEnded = () => {
      console.log("Bài hát kết thúc, đang thử phát bài tiếp theo...");
      playNext(); // Tự động phát bài tiếp theo khi hết bài
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    audio.addEventListener('error', handleError);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('durationchange', handleDurationChange);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);

    return () => {
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('durationchange', handleDurationChange);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
    };
  }, []);

  const updateLikedStatus = (liked: boolean) => {
    if (currentTrack) {
      setCurrentTrack({ ...currentTrack, isLiked: liked });
    }
  };

  // Hàm mới để chọn bài hát để chia sẻ
  const selectSongForShare = (track: Track | null) => {
    // Nếu chọn bài mới, sidebar sẽ hiện ra. Nếu chọn null, nó sẽ ẩn đi.
    if (track) {
      console.log("AudioContext: Chọn bài hát để chia sẻ:", track.title);
    }
    setSongForShare(track);
  };

  // Hàm khởi tạo Web Audio API Context
  const initAudioApi = () => {
    if (audioApiContextRef.current || !audioRef.current) return;

    console.log(">>> AudioContext: Khởi tạo Web Audio API cho Visualizer...");
    const context = new (window.AudioContext || (window as any).webkitAudioContext)();
    const source = context.createMediaElementSource(audioRef.current);
    const analyserNode = context.createAnalyser();

    analyserNode.fftSize = 256; // Số lượng mẫu để phân tích
    source.connect(analyserNode);
    analyserNode.connect(context.destination);

    audioApiContextRef.current = context;
    setAnalyser(analyserNode);
  };

  const playTrack = async (track: Track, newQueue?: Track[]) => {
    console.log(">>> AudioContext: Nhận lệnh phát bài:", track.title);

    // Nếu có hàng đợi mới được cung cấp, cập nhật nó
    if (newQueue && newQueue.length > 0) {
      console.log(`>>> AudioContext: Đã đặt hàng đợi mới với ${newQueue.length} bài hát.`);
      setQueue(newQueue);
    }

    // Ghi lịch sử nghe vào backend
    try {
      const token = localStorage.getItem('token');
      console.log(">>> AudioContext: Token:", token ? "Có" : "Không có");
      console.log(">>> AudioContext: track.id:", track.id);
      console.log(">>> AudioContext: Gọi POST /api/media/history/" + track.id);
      const res = await api.post(`/media/history/${track.id}`);
      console.log(">>> AudioContext: Ghi lịch sử OK:", res.data);
    } catch (err: any) {
      console.error(">>> AudioContext: Lỗi ghi lịch sử:", err?.response?.status);
      console.error(">>> AudioContext: Response data:", JSON.stringify(err?.response?.data));
    }

    // Kiểm tra xem bài hát hiện tại có nguồn hợp lệ (Blob URL) chưa
    const hasValidSource = audioRef.current.src && audioRef.current.src.includes(track.id); // Kiểm tra nguồn đã được thiết lập chưa

    // Nếu nhấn lại bài đang phát và nguồn đã sẵn sàng, chỉ cần Toggle Play/Pause
    if (currentTrack?.id === track.id && !audioRef.current.error && hasValidSource) {
      // Khởi tạo Audio API nếu chưa có (cần tương tác người dùng)
      if (!audioApiContextRef.current) {
        initAudioApi();
      }
      console.log(">>> AudioContext: Bài hát đã nạp xong, thực hiện chuyển đổi trạng thái.");
      togglePlay();
      return;
    }

    console.log(">>> AudioContext: Chuẩn bị nạp dữ liệu bài hát mới...");
    setLoading(true);

    // 1. Reset trạng thái UI và dừng nhạc cũ
    setCurrentTrack(track);
    setCurrentTime(0);
    setDuration(track.durationSeconds || 0);
    setIsPlaying(false);

    // Dừng nhạc cũ hoàn toàn
    if (audioRef.current) {
      audioRef.current.pause();
    }

    try {
      // 2. Chuẩn hóa đường dẫn stream (đảm bảo có /api/ ở đầu)
      // Giả sử track.url từ Backend đã là /api/media/{id}
      const streamUrl = track.url.startsWith('/api/') ? track.url : `/api/${track.url}`;

      console.log(">>> AudioContext: Đang thiết lập nguồn nhạc trực tiếp:", streamUrl);

      if (audioRef.current) {
        // Tạo một Promise để đợi nhạc sẵn sàng để phát (canplay)
        const readyToPlay = new Promise<void>((resolve, reject) => {
          const canPlayHandler = () => {
            audioRef.current.removeEventListener('canplay', canPlayHandler);
            resolve();
          };
          const errorHandler = (e: Event) => {
            audioRef.current.removeEventListener('error', errorHandler);
            console.error("Lỗi nạp nguồn audio:", audioRef.current.error);
            reject(new Error(`Lỗi nạp nhạc: ${audioRef.current.error?.message || 'Không xác định'}`));
          };

          audioRef.current.addEventListener('canplay', canPlayHandler);
          audioRef.current.addEventListener('error', errorHandler);
        });

        audioRef.current.src = streamUrl;
        audioRef.current.load();

        // Đợi tối đa 10s để nạp nhạc, nếu không sẽ báo lỗi
        const timeout = new Promise<void>((_, reject) =>
          setTimeout(() => reject(new Error("Quá thời gian nạp nhạc (10s)")), 10000)
        );

        await Promise.race([readyToPlay, timeout]);

        if (!audioApiContextRef.current) {
          initAudioApi();
        }

        console.log(">>> AudioContext: Nhạc đã sẵn sàng, bắt đầu phát.");
        try {
          await audioRef.current.play();
          setIsPlaying(true);
        } catch (playErr: any) {
          if (playErr.name === 'NotAllowedError') {
            console.warn(">>> Trình duyệt chặn autoplay. Cần tương tác người dùng.");
            // Fallback: Hiện nút play để user ấn thủ công
          }
          throw playErr;
        }
      }
    } catch (err: any) {
      if (err.name === 'AbortError') return;
      setIsPlaying(false); // Dừng phát nhạc nếu có lỗi
      console.error("!!! LỖI KHI CỐ GẮNG PHÁT NHẠC:", err);
      // Thông báo lỗi chung, lỗi chi tiết hơn sẽ được log bởi event listener của audio element
      alert(err.message || "Hệ thống gặp sự cố khi nạp nhạc. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const togglePlay = async () => {
    // Kiểm tra xem đã có bài hát nào được nạp chưa
    if (!audioRef.current || !audioRef.current.src || audioRef.current.src === window.location.href) {
      console.warn(">>> AudioContext: Không thể phát vì nguồn nhạc chưa sẵn sàng.");
      return;
    }

    // Nếu element đang ở trạng thái lỗi (ví dụ 401 hoặc 404 trước đó), nạp lại nguồn
    if (audioRef.current.error) {
      audioRef.current.load();
    }

    try {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          await playPromise;
        }
      }
    } catch (error: any) {
      // Không log lỗi nếu là AbortError để tránh làm bẩn console
      if (error.name === 'AbortError') return;

      console.error("Lỗi khi chuyển đổi trạng thái phát:", error.name, error.message);
      setIsPlaying(false);
    }
  };

  const stopTrack = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
    }
    setCurrentTrack(null);
    setCurrentTime(0);
    setDuration(0);
    setIsPlaying(false);
  };

  const seek = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time); // Cập nhật trạng thái ngay lập tức để UI mượt mà hơn
    }
  };

  useEffect(() => {
    audioRef.current.volume = volume;
  }, [volume]);

  const playNext = () => {
    if (queue.length === 0) return;
    const currentIndex = queue.findIndex(t => t.id === currentTrack?.id);
    if (currentIndex === -1) {
      // Nếu không tìm thấy bài hiện tại, phát bài đầu tiên
      playTrack(queue[0], queue);
      return;
    }
    // Phát bài tiếp theo, nếu là bài cuối thì quay về đầu
    const nextIndex = (currentIndex + 1) % queue.length;
    playTrack(queue[nextIndex], queue);
  };

  const playPrev = () => {
    if (queue.length === 0) return;
    const currentIndex = queue.findIndex(t => t.id === currentTrack?.id);
    if (currentIndex === -1) {
      playTrack(queue[0], queue);
      return;
    }
    const prevIndex = (currentIndex - 1 + queue.length) % queue.length;
    playTrack(queue[prevIndex], queue);
  };

  const addToQueue = (track: Track) => {
    setQueue(prev => [...prev, track]);
  };

  const removeFromQueue = (index: number) => {
    setQueue(prev => prev.filter((_, i) => i !== index));
  };

  const clearQueue = () => {
    setQueue([]);
  };

  const handleSetSleepTimer = (minutes: number | null) => {
    if (sleepTimerRef.current) {
      clearInterval(sleepTimerRef.current);
      sleepTimerRef.current = null;
    }
    if (minutes === null || minutes <= 0) {
      setSleepTimer(0);
      setSleepTimeRemaining(null);
      return;
    }
    setSleepTimer(minutes);
    setSleepTimeRemaining(minutes * 60);
    sleepTimerRef.current = setInterval(() => {
      setSleepTimeRemaining(prev => {
        if (prev === null || prev <= 1) {
          if (sleepTimerRef.current) clearInterval(sleepTimerRef.current);
          setSleepTimer(0);
          if (audioRef.current) audioRef.current.pause();
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  return (
    <AudioContext.Provider value={{
      currentTrack, songForShare, selectSongForShare,
      isPlaying, loading,
      playTrack, togglePlay, stopTrack,
      playNext, playPrev,
      currentTime, duration, seek, analyser,
      volume, setVolume, updateLikedStatus,
      queue, addToQueue, removeFromQueue, clearQueue,
      sleepTimer, setSleepTimer: handleSetSleepTimer, sleepTimeRemaining
    }}>
      {children}
      <audio
        ref={audioRef}
        preload="auto"
        style={{ display: 'none' }}
      />
    </AudioContext.Provider>
  );
};

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (!context) throw new Error("useAudio must be used within AudioProvider");
  return context;
};
