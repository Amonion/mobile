import { Feather, MaterialIcons } from '@expo/vector-icons'
import { router } from 'expo-router'
import { Text, useColorScheme, TouchableOpacity } from 'react-native'
import BottomSheetProfileOptions from './BottomSheetProfileOptions'

interface ProfileSheetOptionsProps {
  setVisible: (state: boolean) => void
  visible: boolean
}

const ProfileSheetOptions: React.FC<ProfileSheetOptionsProps> = ({
  setVisible,
  visible,
}) => {
  const isDark = useColorScheme() === 'dark'

  return (
    <BottomSheetProfileOptions
      visible={visible}
      onClose={() => setVisible(false)}
    >
      <TouchableOpacity
        onPress={() => {
          setVisible(false)
          router.push(`/home/user/followers`)
        }}
        className="py-4 flex-row px-2 items-center border-b border-b-border dark:border-b-dark-border"
      >
        <Feather
          name="user-plus"
          size={25}
          color={isDark ? '#BABABA' : '#6E6E6E'}
          style={{ marginRight: 15 }}
        />
        <Text className="text-xl text-primary dark:text-dark-primary">
          Account Followers
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => {
          setVisible(false)
          router.push(`/home/user/followings`)
        }}
        className="py-4 flex-row px-2 items-center border-b border-b-border dark:border-b-dark-border"
      >
        <Feather
          name="user-check"
          size={25}
          color={isDark ? '#BABABA' : '#6E6E6E'}
          style={{ marginRight: 15 }}
        />
        <Text className="text-xl text-primary dark:text-dark-primary">
          Account Followings
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => {
          setVisible(false)
          router.push(`/home/user/muted-users`)
        }}
        className="py-4 flex-row px-2 items-center border-b border-b-border dark:border-b-dark-border"
      >
        <Feather
          name="volume-x"
          size={25}
          color={isDark ? '#BABABA' : '#6E6E6E'}
          style={{ marginRight: 15 }}
        />
        <Text className="text-xl text-primary dark:text-dark-primary">
          Muted Accounts
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => {
          setVisible(false)
          router.push(`/home/user/blocked-users`)
        }}
        className="py-4 flex-row px-2 items-center border-b border-b-border dark:border-b-dark-border"
      >
        <MaterialIcons
          name="block"
          size={25}
          color={isDark ? '#BABABA' : '#6E6E6E'}
          style={{ marginRight: 15 }}
        />
        <Text className="text-xl text-primary dark:text-dark-primary">
          Blocked Accounts
        </Text>
      </TouchableOpacity>
    </BottomSheetProfileOptions>
  )
}
export default ProfileSheetOptions
