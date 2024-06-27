import { useEffect, useRef, useState } from "react";
import { getNextSong, getPrevSong, getRandomSong } from "@/util/soundtrack";
import { FaMusic, FaPause, FaPlay, FaStepBackward, FaStepForward } from "react-icons/fa";
import { usePersistentStore } from "@primodiumxyz/game/src/stores/PersistentStore";
import { SecondaryCard } from "@/components/core/Card";
import { cn } from "@/util/client";
import { Button } from "@/components/core/Button";

export const AudioPlayer = () => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [song, setSong] = useState(getRandomSong());
  const [isPlaying, setIsPlaying] = useState(false);
  const muted = usePersistentStore((state) => state.musicMuted);
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

  const handleUpdate = () => {
    if (audioRef.current) {
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
    <SecondaryCard className={cn("w-48 h-10 text-sm m-2 group bg-secondary/15")}>
      <div className={cn("flex gap-2 items-center group-hover:opacity-15 transition-all", !isPlaying && "opacity-15")}>
        <FaMusic className={cn("min-w-6", isPlaying && "animate-pulse")} />
        <div className="relative marquee grow flex">
          <div className="marquee-text flex">
            <div className="flex px-1">
              <p className="font-bold ">{song.title}-</p>
              <p className=" opacity-70">{song.artist}</p>
            </div>
          </div>
          <div className="absolute top-0 marquee-text2 flex gap-2">
            <div className="flex px-1">
              <p className="font-bold ">{song.title}-</p>
              <p className=" opacity-70">{song.artist}</p>
            </div>
          </div>
        </div>
      </div>

      <div
        className={cn(
          "absolute inset-0 w-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all",
          !isPlaying && "opacity-100"
        )}
      >
        <div className="flex">
          <Button variant="ghost" shape="square" size="xs" onClick={handlePrev}>
            <FaStepBackward />
          </Button>
          {isPlaying ? (
            <Button variant="ghost" shape="square" size="xs" onClick={handlePause}>
              <FaPause />
            </Button>
          ) : (
            <Button variant="ghost" shape="square" size="xs" onClick={handlePlay}>
              <FaPlay />
            </Button>
          )}
          <Button variant="ghost" shape="square" size="xs" onClick={handleNext}>
            <FaStepForward />
          </Button>
        </div>
      </div>

      <audio ref={audioRef} src={song.url} muted={muted} title={song.title} autoPlay onTimeUpdate={handleUpdate} />
    </SecondaryCard>
  );
};
