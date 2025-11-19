'use client'
import { handlePendingFileUpload } from '@/lib/helpers'
import { AuthStore } from '@/src/zustand/user/AuthStore'
import { ChatContent, ChatStore } from '@/src/zustand/chat/Chat'
import { useEffect, useState } from 'react'
import { MessageStore } from '@/src/zustand/notification/Message'
import { Swiper, SwiperSlide } from 'swiper/react'
import { PlayCircle, X } from 'lucide-react'
import 'swiper/css'
import 'swiper/css/autoplay'
import Image from 'next/image'

type ChatContentProps = {
  e: ChatContent
}

const ChatMediaDisplay = ({ e }: ChatContentProps) => {
  const { user } = AuthStore()
  const { baseURL } = MessageStore()
  const { updateChatWithFile } = ChatStore()
  const [progress, setProgress] = useState(0)
  const [openModal, setOpenModal] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const isSender = e.senderUsername === user?.username

  useEffect(() => {
    const uploadPendingMedia = async () => {
      if (!e.media || e.media.length === 0) return

      const pendingItems = e.media.filter(
        (m) => m.status === 'pending' && m.blob
      )
      if (pendingItems.length === 0) return

      const updatedMedia = await Promise.all(
        e.media.map(async (item) => {
          if (item.status === 'pending' && item.blob) {
            try {
              const uploaded = await handlePendingFileUpload(
                item.blob,
                baseURL,
                (percent: number) => setProgress(percent),
                item.pages || 0,
                item.duration || 0
              )

              return {
                ...item,
                status: 'uploaded',
                url: uploaded.source, // replace blob URL with real bucket URL
                source: uploaded.source,
                previewUrl: uploaded.source,
              }
            } catch (err) {
              console.error(`❌ Error uploading ${item.name}:`, err)
              return item
            }
          }
          return item
        })
      )

      const updatedChat = { ...e, media: updatedMedia }
      updateChatWithFile('/chats', updatedChat)
    }

    uploadPendingMedia()
  }, [e])

  return (
    <>
      <div
        className={`grid items-start ${
          e.media.length === 1
            ? 'grid-cols-1'
            : e.media.length === 2
            ? 'grid-cols-2'
            : 'grid-cols-2 sm:h-[300px] h-[200px]'
        } z-40 rounded-[10px] overflow-hidden gap-2 mb-3`}
      >
        {e.media.map((item, index) => (
          <div
            key={index}
            onClick={() => {
              setActiveIndex(index)
              setOpenModal(true)
            }}
            className="relative cursor-pointer group rounded-lg overflow-hidden flex items-center justify-center"
          >
            {item.status === 'pending' && isSender && progress === 0 && (
              <div className="w-full absoluteCenter z-50 h-32 flex flex-col items-center justify-center text-gray-500">
                <div className="animate-spin w-10 h-10 border-4 border-gray-300 border-t-transparent rounded-full mb-2"></div>
              </div>
            )}

            {isSender && progress > 0 && item.status !== 'uploaded' && (
              <div className="absoluteCenter rounded-full bg-black/50 z-20 w-12 h-12 mb-2">
                <svg className="w-12 h-12 rotate-[-90deg]">
                  <circle
                    cx="24"
                    cy="24"
                    r="20"
                    stroke="#e5e7eb"
                    strokeWidth="4"
                    fill="transparent"
                  />
                  {/* Progress circle */}
                  <circle
                    cx="24"
                    cy="24"
                    r="20"
                    stroke="var(--custom)"
                    strokeWidth="4"
                    fill="transparent"
                    strokeDasharray={2 * Math.PI * 20}
                    strokeDashoffset={
                      2 * Math.PI * 20 * (1 - (progress ?? 0) / 100)
                    }
                    strokeLinecap="round"
                    className="transition-all duration-300"
                  />
                </svg>

                {/* Percent text */}
                <div className="absolute inset-0 flex items-center justify-center text-[12px] font-medium  text-white">
                  {progress ? `${progress}%` : '...'}
                </div>
              </div>
            )}
            {item.status === 'pending' && !isSender ? (
              <div className="w-full h-32 flex flex-col items-center justify-center text-gray-500">
                <div className="animate-spin w-10 h-10 border-4 border-gray-300 border-t-transparent rounded-full mb-2"></div>
                <p className="text-xs">Uploading...</p>
              </div>
            ) : item.type.includes('image') ? (
              <img
                src={item.previewUrl || item.url}
                alt={item.name}
                className={`w-full ${
                  e.media.length === 1
                    ? 'h-auto object-contain'
                    : e.media.length === 2
                    ? 'h-[200px] object-cover'
                    : e.media.length === 3 && index !== 1
                    ? 'sm:h-[150px] h-[100px] object-cover'
                    : e.media.length === 3 && index == 1
                    ? 'sm:h-[300px] h-[200px] object-cover'
                    : ''
                } `}
              />
            ) : (
              item.type.includes('video') && (
                <video
                  src={item.previewUrl || item.url}
                  className={`w-full ${
                    e.media.length === 1
                      ? 'h-auto object-contain'
                      : e.media.length === 2
                      ? 'h-[200px] object-cover'
                      : e.media.length === 3 && index !== 1
                      ? 'sm:h-[150px] h-[100px] object-cover'
                      : e.media.length === 3 && index == 1
                      ? 'sm:h-[300px] h-[200px] object-cover'
                      : ''
                  } `}
                  muted
                  controls
                  onLoadedMetadata={(e) =>
                    (item.duration = e.currentTarget.duration)
                  }
                />
              )
            )}

            <div className="absolute top-1 left-1 bg-black/60 text-white rounded-full h-6 w-6 flex items-center justify-center text-[10px]">
              {item.type.includes('image') ? (
                <i className="bi bi-image"></i>
              ) : (
                item.type.includes('video') && (
                  <i className="bi bi-camera-video"></i>
                )
              )}
            </div>
          </div>
        ))}
      </div>

      {openModal && (
        <div
          onClick={(e) => {
            e.stopPropagation()
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
              className="w-full h-full relative flex items-center justify-center"
            >
              {e.media.map((media, index) => (
                <SwiperSlide
                  onClick={(e) => {
                    e.stopPropagation()
                  }}
                  key={index}
                >
                  {media.type.includes('video') && (
                    <PlayCircle className="absoluteCenter w-[40px] h-[40px] text-[var(--custom-color)]" />
                  )}

                  <div
                    onClick={() => setOpenModal(false)}
                    className="flex justify-center relative items-center w-full h-screen"
                  >
                    {media.type.includes('video') ? (
                      <video
                        onClick={(e) => e.stopPropagation()}
                        src={media.url}
                        controls
                        autoPlay
                        className="w-auto h-auto max-w-[100vw] max-h-[90vh] object-contain rounded-md"
                      ></video>
                    ) : (
                      <Image
                        onClick={(e) => e.stopPropagation()}
                        src={String(media.url)}
                        alt={`${media.url}`}
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
  )
}

export default ChatMediaDisplay
