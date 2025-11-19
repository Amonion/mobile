import React from "react";
import "swiper/css";
import "swiper/css/autoplay";
import Image from "next/image";

interface MediaSource {
  source: string;
  type: string;
}

interface ReplyMediaProps {
  sources: MediaSource[];
}

const ReplyMedia: React.FC<ReplyMediaProps> = ({ sources }) => {
  if (!sources || sources.length === 0) return null;

  const renderMedia = (media: { type: string; source: string }) => {
    if (media.type === "video") {
      return (
        <div className="w-full h-[70px] flex items-center justify-center bg-black relative">
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
        <div className="max-w-[100px]  max-h-[70px] flex justify-center bg-[var(--white-gray)]  overflow-hidden rounded-[10px]">
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
        className="mb-2 overflow-hidden rounded-[10px] ml-auto"
      >
        <div>
          {sources.length === 1 ? (
            <div className="media_layout">{renderMedia(sources[0])}</div>
          ) : sources.length === 2 ? (
            <div className="flex gap-2">
              {sources.map((media, index) => (
                <div key={index} className="media_layout part">
                  {renderMedia(media)}
                </div>
              ))}
            </div>
          ) : sources.length === 3 ? (
            <div className="grid grid-cols-2 h-[250px] sm:h-[350px] xs:h-[350px] gap-2 w-full">
              <div className="col-span-1 media_layout">
                {renderMedia(sources[0])}
              </div>
              <div className="flex flex-col gap-2">
                {sources.slice(1).map((media, index) => (
                  <div key={index + 1} className=" media_layout split">
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
                >
                  {renderMedia(media)}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ReplyMedia;
