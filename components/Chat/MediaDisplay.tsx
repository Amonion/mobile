import React, { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { PlayCircle, X } from "lucide-react";
import "swiper/css";
import "swiper/css/autoplay";
import Image from "next/image";

interface MediaSource {
  source: string;
  type: string;
}

interface MediaDisplayProps {
  sources: MediaSource[];
}

const MediaDisplay: React.FC<MediaDisplayProps> = ({ sources }) => {
  const [openModal, setOpenModal] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpenModal(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [sources]);

  if (!sources || sources.length === 0) return null;

  const renderMedia = (media: { type: string; source: string }) => {
    if (media.type === "video") {
      return (
        <div className="w-full lg:max-h-[600px] max-h-[350px] xs:max-h-[450px] sm:max-h-[500px] md:max-h-[550px] flex items-center justify-center bg-black relative">
          <PlayCircle className="absolute w-[40px] h-[40px] text-[var(--custom-color)] top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%]" />
          <video
            src={media.source}
            className="w-full h-auto object-cover rounded-lg"
            muted
            loop
            playsInline
          ></video>
        </div>
      );
    } else if (sources.length === 1) {
      return (
        <div className="w-full  lg:max-h-[500px] max-h-[350px] xs:max-h-[450px] sm:max-h-[500px] md:max-h-[550px] flex justify-center bg-[var(--white-gray)]  overflow-hidden rounded-[10px]">
          {media.source && (
            <Image
              src={media.source}
              alt="Media"
              width={0}
              height={0}
              sizes="100vw"
              className="w-full h-auto object-cover  rounded-[10px] overflow-clip"
            />
          )}
        </div>
      );
    } else {
      return (
        <div
          className="w-full h-full bg-cover bg-center"
          style={{ backgroundImage: `url(${media.source})` }}
        ></div>
      );
    }
  };

  return (
    <>
      <div
        onClick={(e) => {
          e.stopPropagation();
        }}
        className="mb-2 overflow-hidden rounded-[10px]"
      >
        <div>
          {sources.length === 1 ? (
            <div
              className="media_layout"
              onClick={() => {
                setActiveIndex(0);
                setOpenModal(true);
              }}
            >
              {renderMedia(sources[0])}
            </div>
          ) : sources.length === 2 ? (
            <div className="flex gap-2">
              {sources.map((media, index) => (
                <div
                  key={index}
                  className="media_layout part"
                  onClick={() => {
                    setActiveIndex(index);
                    setOpenModal(true);
                  }}
                >
                  {renderMedia(media)}
                </div>
              ))}
            </div>
          ) : sources.length === 3 ? (
            <div className="grid grid-cols-2 h-[250px] sm:h-[350px] xs:h-[350px] gap-2 w-full">
              <div
                className="col-span-1 media_layout"
                onClick={() => {
                  setActiveIndex(0);
                  setOpenModal(true);
                }}
              >
                {renderMedia(sources[0])}
              </div>
              <div className="flex flex-col gap-2">
                {sources.slice(1).map((media, index) => (
                  <div
                    key={index + 1}
                    className=" media_layout split"
                    onClick={() => {
                      setActiveIndex(index + 1);
                      setOpenModal(true);
                    }}
                  >
                    {renderMedia(media)}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 grid-rows-2 gap-2">
              {sources.slice(0, 4).map((media, index) => (
                <div
                  key={index}
                  className="h-[120px] xs:h-[140] sm:h-[150px] overflow-hidden bg-[var(--white-gray)] cursor-pointer"
                  onClick={() => {
                    setActiveIndex(index);
                    setOpenModal(true);
                  }}
                >
                  {renderMedia(media)}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {openModal && (
        <div
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <div
            onClick={() => setOpenModal(false)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm"
          >
            <button
              onClick={() => setOpenModal(false)}
              className="absolute top-5 right-5 text-white text-3xl z-[1000]"
            >
              <X />
            </button>

            <Swiper
              initialSlide={activeIndex}
              spaceBetween={10}
              slidesPerView={1}
              navigation
              pagination={{ clickable: true }}
              className="w-full h-full flex items-center justify-center"
            >
              {sources.map((media, index) => (
                <SwiperSlide
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                  key={index}
                >
                  <div
                    onClick={() => setOpenModal(false)}
                    className="flex justify-center relative items-center w-full h-screen"
                  >
                    {media.type === "youtube" ? (
                      <iframe
                        onClick={(e) => e.stopPropagation()}
                        src={`https://www.youtube.com/embed/${getYouTubeID(
                          media.source
                        )}`}
                        className="sm:w-[700px] sm:h-auto w-full h-full max-w-[90vw] max-h-[90vh] rounded-md"
                        allowFullScreen
                      ></iframe>
                    ) : media.type === "video" ? (
                      <video
                        onClick={(e) => e.stopPropagation()}
                        src={media.source}
                        controls
                        autoPlay
                        className="w-auto h-auto max-w-[100vw] max-h-[90vh] object-contain rounded-md"
                      ></video>
                    ) : (
                      <Image
                        onClick={(e) => e.stopPropagation()}
                        src={media.source}
                        alt="Media"
                        width={0}
                        height={0}
                        sizes="100vw"
                        className="rounded-md w-auto h-auto max-w-[100vw] max-h-[90vh]"
                      />
                    )}
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
      )}
    </>
  );
};

export default MediaDisplay;

const getYouTubeID = (url: string): string => {
  const match = url.match(
    /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  return match ? match[1] : "";
};
