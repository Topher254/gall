import { useState, useRef } from "react";
import { Volume2, VolumeX } from "lucide-react";

const MusicToggle = () => {
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const toggle = () => {
    if (!audioRef.current) {
      // Romantic piano instrumental
      audioRef.current = new Audio(
        "https://cdn.pixabay.com/audio/2024/11/04/audio_4956b4ece1.mp3"
      );
      audioRef.current.loop = true;
      audioRef.current.volume = 0.25;
    }
    if (playing) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(() => {});
    }
    setPlaying(!playing);
  };

  return (
    <button
      onClick={toggle}
      className="fixed top-6 right-6 z-50 p-3 rounded-full glass-card transition-all duration-300 hover:scale-110 group"
      aria-label="Toggle music"
    >
      {playing ? (
        <Volume2 size={18} className="text-primary" />
      ) : (
        <VolumeX size={18} className="text-muted-foreground group-hover:text-primary transition-colors" />
      )}
    </button>
  );
};

export default MusicToggle;
