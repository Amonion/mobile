import React from 'react'
import { View, Modal, TouchableOpacity, Dimensions } from 'react-native'
import Swiper from 'react-native-swiper'
import { X } from 'lucide-react-native'
import EachChatMediaModal from './EachChatMediaModal'
import { PreviewFile } from '@/store/chat/Chat'

type MediaModalProps = {
  openModal: boolean
  setOpenModal: (open: boolean) => void
  media: PreviewFile[]
  activeIndex: number
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window')

const MediaModal: React.FC<MediaModalProps> = ({
  openModal,
  setOpenModal,
  media,
  activeIndex,
}) => {
  return (
    <Modal visible={openModal} transparent animationType="fade">
      <TouchableOpacity
        style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.2)',
          justifyContent: 'center',
          alignItems: 'center',
        }}
        activeOpacity={1}
        onPress={() => setOpenModal(false)}
      >
        <View style={{ width: SCREEN_WIDTH, height: SCREEN_HEIGHT }}>
          <TouchableOpacity
            onPress={() => setOpenModal(false)}
            style={{
              position: 'absolute',
              top: 40,
              right: 20,
              zIndex: 1000,
            }}
          >
            <X size={32} color="white" />
          </TouchableOpacity>

          <Swiper
            index={activeIndex}
            showsPagination
            loop={false}
            style={{}}
            containerStyle={{ width: SCREEN_WIDTH, height: SCREEN_HEIGHT }}
          >
            {media.map((item, index) => (
              <EachChatMediaModal
                key={index}
                media={item}
                setOpenModal={setOpenModal}
              />
            ))}
          </Swiper>
        </View>
      </TouchableOpacity>
    </Modal>
  )
}

export default MediaModal
