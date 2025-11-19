import React, { useRef, useState, useEffect } from "react";

type AudioMessageProps = {
  src: string;
  isSender: boolean;
  name?: string;
};

const AudioMessage: React.FC<AudioMessageProps> = ({ src, name, isSender }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);

  const [play, setPlay] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => setDuration(audio.duration);
    const handleTimeUpdate = () => {
      if (!isDragging) setCurrentTime(audio.currentTime);
    };

    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("timeupdate", handleTimeUpdate);

    return () => {
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
    };
  }, [isDragging]);

  const toggleState = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (play) {
      audio.pause();
    } else {
      audio.play();
    }
    setPlay(!play);
  };

  const handleSeek = (e: React.MouseEvent<HTMLElement> | MouseEvent) => {
    if (!trackRef.current || !audioRef.current) return;

    const rect = trackRef.current.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const percent = offsetX / rect.width;
    const newTime = percent * duration;

    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handlePointerDown = (e: React.MouseEvent<HTMLElement> | MouseEvent) => {
    setIsDragging(true);
    handleSeek(e);
    window.addEventListener("mousemove", handlePointerMove);
    window.addEventListener("mouseup", handlePointerUp);
  };

  const handlePointerMove = (e: MouseEvent) => {
    if (!isDragging || !trackRef.current || !audioRef.current) return;

    const rect = trackRef.current.getBoundingClientRect();
    const offsetX = Math.min(Math.max(e.clientX - rect.left, 0), rect.width);
    const percent = offsetX / rect.width;
    const newTime = percent * duration;

    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handlePointerUp = () => {
    setIsDragging(false);
    window.removeEventListener("mousemove", handlePointerMove);
    window.removeEventListener("mouseup", handlePointerUp);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60)
      .toString()
      .padStart(2, "0");
    return `${minutes}:${seconds}`;
  };

  const progressPercent = duration
    ? `${(currentTime / duration) * 100}%`
    : "0%";

  return (
    <>
      <audio ref={audioRef} src={src} preload="metadata" />
      <div className="flex flex-col w-full mb-2">
        <div className="flex items-end">
          <div
            onClick={toggleState}
            className={` ${
              isSender
                ? "border-[var(--text-primary)]"
                : "border-white text-white"
            } flex mr-2 justify-center items-center cursor-pointer w-8 h-8 border  rounded-full`}
          >
            {play ? (
              <i className="bi bi-pause-fill text-xl"></i>
            ) : (
              <i className="bi bi-play-fill text-xl"></i>
            )}
          </div>

          <div className="relative pt-1 flex-1 mr-2">
            <div
              ref={trackRef}
              onClick={handleSeek}
              className="w-full play-track rounded-[5px] mb-1 h-[3px] bg-[var(--border)] relative cursor-pointer"
            >
              <div
                className="flex play-bar rounded-[5px] h-full bg-[var(--text-primary)]"
                style={{ width: progressPercent }}
              >
                <div
                  onMouseDown={handlePointerDown}
                  className="w-3 h-3 rounded-full bg-[var(--text-primary)] ml-auto mt-[-4px] cursor-pointer"
                ></div>
              </div>
            </div>
            <div className="text-[12px] flex justify-between">
              <div className="mr-2">
                {formatTime(currentTime)} / {formatTime(duration)}
              </div>
              <div className="ml-auto flex-1 line-clamp-1 overflow-ellipsis">
                {name}
              </div>
            </div>
          </div>

          <a
            href={src}
            download
            target="_blank"
            rel="noopener noreferrer"
            className={`${
              !isSender
                ? "border-white text-white"
                : "border-[var(--text-primary)]"
            } cursor-pointer ml-auto min-w-8 w-8 h-8 border rounded-full flex items-center justify-center `}
          >
            <i className="bi bi-download"></i>
          </a>
        </div>
      </div>
    </>
  );
};

export default AudioMessage;
