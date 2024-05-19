import { useEffect, useRef, useState } from "react";
import { getNextSong, getPrevSong, getRandomSong } from "@/util/soundtrack";
import { FaMinus, FaPause, FaPlay, FaStepBackward, FaStepForward, FaVolumeMute, FaVolumeUp } from "react-icons/fa";
import { usePersistentStore } from "@/game/stores/PersistentStore";

interface AudioProps {
  className?: string;
}
export const AudioPlayer = ({ className }: AudioProps) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [song, setSong] = useState(getRandomSong());
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMinimized, setIsMinimized] = useState(true);
  const [progress, setProgress] = useState(0);
  const muted = usePersistentStore((state) => state.musicMuted);
  const toggleMute = usePersistentStore((state) => state.toggleMusicMuted);
  const volume = usePersistentStore((state) => state.volume["music"]);
  const [userInteracted, setUserInteracted] = useState(false);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [audioRef, volume]);

  useEffect(() => {
    const handleUserInteraction = () => {
      setUserInteracted(true);
      document.removeEventListener("click", handleUserInteraction);
      document.removeEventListener("keydown", handleUserInteraction);
    };

    document.addEventListener("click", handleUserInteraction);
    document.addEventListener("keydown", handleUserInteraction);

    return () => {
      document.removeEventListener("click", handleUserInteraction);
      document.removeEventListener("keydown", handleUserInteraction);
    };
  }, []);

  useEffect(() => {
    if (userInteracted && audioRef.current) {
      handlePlay();
    }
  }, [userInteracted]);

  const handlePlay = () => {
    if (audioRef.current) {
      audioRef.current.play();
    }
  };

  const handlePause = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
  };

  const handleNext = () => {
    if (audioRef.current) {
      setSong(getNextSong(song));
    }
  };

  const handlePrev = () => {
    if (audioRef.current) {
      setSong(getPrevSong(song));
    }
  };

  const handleMutetoggle = () => {
    toggleMute();
  };

  const handleUpdate = () => {
    if (audioRef.current) {
      //set progress
      const temp = audioRef.current.currentTime / audioRef.current.duration;
      setProgress(isNaN(temp) ? 0 : temp);

      //go to next song if current song is done
      if (audioRef.current.ended) {
        setSong(getNextSong(song));
      }

      if (audioRef.current.paused && isPlaying) {
        setIsPlaying(false);
      }

      if (!audioRef.current.paused) {
        if (!isPlaying) setIsPlaying(true);
      }
    }
  };

  return (
    <div
      onClick={() => {
        if (isMinimized) setIsMinimized(!isMinimized);
      }}
      className={`${className} p-5 m-5 bg-neutral border border-accent rounded-xl duration-300 transition-all ${
        isMinimized ? "w-20 scale-75 cursor-pointer pointer-events-auto" : " w-[27rem]"
      }`}
    >
      <div className="relative flex justify-center pointer-events-auto">
        <button
          onClick={() => setIsMinimized(!isMinimized)}
          className={`btn btn-circle absolute -left-[2.9rem] -top-10 border border-accent ${
            isMinimized ? "hidden" : ""
          }`}
        >
          <FaMinus />
        </button>

        <div className="my-auto" style={{ imageRendering: "pixelated" }}>
          <img
            src={`${!muted && isPlaying ? "/images/web/miao-music.gif" : "/images/web/miao-music-mute.png"}`}
            alt="miao-music"
            width={40}
            height={40}
          />
        </div>

        <div className={`flex ${isMinimized ? "hidden" : "block"}`}>
          <div className=" w-32 mx-5">
            <p className="font-bold truncate transition-all">{song.title}</p>
            <p className=" opacity-70">{song.artist}</p>
          </div>

          <div className="flex">
            <button className="btn btn-ghost btn-circle" onClick={handlePrev}>
              <FaStepBackward />
            </button>
            {isPlaying ? (
              <button className="btn btn-ghost btn-circle" onClick={handlePause}>
                <FaPause />
              </button>
            ) : (
              <button className="btn btn-ghost btn-circle" onClick={handlePlay}>
                <FaPlay />
              </button>
            )}
            <button className="btn btn-ghost btn-circle" onClick={handleNext}>
              <FaStepForward />
            </button>
            {muted ? (
              <button className="btn btn-ghost btn-circle" onClick={handleMutetoggle}>
                <FaVolumeMute />
              </button>
            ) : (
              <button className="btn btn-ghost btn-circle" onClick={handleMutetoggle}>
                <FaVolumeUp />
              </button>
            )}
          </div>
        </div>
      </div>

      <input
        onChange={(e) => {
          if (audioRef.current) {
            try {
              //set max value to duration minus buffer of 1 to stop rapid song progression
              audioRef.current.currentTime = Math.min(
                audioRef.current.duration - 1,
                Number(e.target.value) * audioRef.current.duration
              );
            } catch (error) {
              //do nothing
            }
          }
        }}
        type="range"
        min="0"
        max="1"
        step={0.01}
        value={progress}
        className={`range range-xs translate-y-2 ${isMinimized ? "hidden" : ""}`}
      />
      <audio ref={audioRef} src={song.url} muted={muted} title={song.title} autoPlay onTimeUpdate={handleUpdate} />
    </div>
  );
};
