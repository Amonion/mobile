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
          backgroundColor: '#121314',
          justifyContent: 'center',
          alignItems: 'center',
        }}
        activeOpacity={1}
        // onPress={() => setOpenModal(false)}
      >
        <View style={{ width: SCREEN_WIDTH, height: SCREEN_HEIGHT }}>
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
