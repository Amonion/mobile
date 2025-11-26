import { Feather, MaterialIcons } from '@expo/vector-icons'
import { router } from 'expo-router'
import { Text, useColorScheme, TouchableOpacity } from 'react-native'
import BottomSheetProfileOptions from './BottomSheetProfileOptions'
import { AuthStore } from '@/store/AuthStore'
import { PostStore } from '@/store/post/Post'
import { formatCount } from '@/lib/helpers'

interface ProfileSheetOptionsProps {
  setVisible: (state: boolean) => void
  visible: boolean
}

const ProfileSheetOptions: React.FC<ProfileSheetOptionsProps> = ({
  setVisible,
  visible,
}) => {
  const { user } = AuthStore()
  const { getFollowingPosts } = PostStore()

  const isDark = useColorScheme() === 'dark'

  const moveToFollowings = () => {
    if (user) {
      getFollowingPosts(
        `/posts/following/?followerId=${user._id}&page_size=20&page=1&ordering=-score`
      )
      router.push(`/home/profile/following`)
      setVisible(false)
    }
  }

  return (
    <BottomSheetProfileOptions
      visible={visible}
      onClose={() => setVisible(false)}
    >
      <TouchableOpacity
        onPress={() => {
          setVisible(false)
          router.push(`/home/profile/followers`)
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
        {user && (
          <Text className="ml-auto text-primary dark:text-dark-primary">
            {formatCount(user?.followers)}
          </Text>
        )}
      </TouchableOpacity>
      <TouchableOpacity
        onPress={moveToFollowings}
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
        {user && (
          <Text className="ml-auto text-primary dark:text-dark-primary">
            {formatCount(user?.followings)}
          </Text>
        )}
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
        {user && (
          <Text className="ml-auto text-primary dark:text-dark-primary">
            {formatCount(user?.mutes)}
          </Text>
        )}
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
        {user && (
          <Text className="ml-auto text-primary dark:text-dark-primary">
            {formatCount(user?.blocks)}
          </Text>
        )}
      </TouchableOpacity>
    </BottomSheetProfileOptions>
  )
}
export default ProfileSheetOptions
