import { Feather, MaterialIcons } from '@expo/vector-icons'
import { router } from 'expo-router'
import { Text, useColorScheme, TouchableOpacity } from 'react-native'
import BottomSheetProfileOptions from './BottomSheetProfileOptions'
import { formatCount } from '@/lib/helpers'
import SocialStore from '@/store/post/Social'
import { User } from '@/store/user/User'

interface ProfileSheetOptionsProps {
  setVisible: (state: boolean) => void
  visible: boolean
  user: User
}

const ProfileSheetOptions: React.FC<ProfileSheetOptionsProps> = ({
  setVisible,
  visible,
  user,
}) => {
  const { getFollowings, getFollowers, getMutedUsers } = SocialStore()
  const isDark = useColorScheme() === 'dark'

  const moveToFollowings = () => {
    if (user) {
      getFollowings(
        `/posts/following/?followerId=${user._id}&page_size=20&page=1&ordering=-score`
      )
      router.push(`/home/profile/following`)
      setVisible(false)
    }
  }

  const moveToFollowers = () => {
    if (user) {
      getFollowers(
        `/posts/followers/?userId=${user._id}&page_size=20&page=1&ordering=-score`
      )
      router.push(`/home/profile/followers`)
      setVisible(false)
    }
  }

  const moveToMutes = () => {
    if (user) {
      getMutedUsers(
        `/posts/mutes/?userId=${user._id}&page_size=20&page=1&ordering=-score`
      )
      router.push(`/home/profile/mutes`)
      setVisible(false)
    }
  }
  const moveToBlocks = () => {
    if (user) {
      getMutedUsers(
        `/posts/blocks/?userId=${user._id}&page_size=20&page=1&ordering=-score`
      )
      router.push(`/home/profile/blocks`)
      setVisible(false)
    }
  }

  return (
    <BottomSheetProfileOptions
      visible={visible}
      onClose={() => setVisible(false)}
    >
      <TouchableOpacity
        onPress={moveToFollowers}
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
        {user.followers > 0 && (
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
        {user.followings > 0 && (
          <Text className="ml-auto text-primary dark:text-dark-primary">
            {formatCount(user?.followings)}
          </Text>
        )}
      </TouchableOpacity>
      <TouchableOpacity
        onPress={moveToMutes}
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
        {user.mutes > 0 && (
          <Text className="ml-auto text-primary dark:text-dark-primary">
            {formatCount(user?.mutes)}
          </Text>
        )}
      </TouchableOpacity>
      <TouchableOpacity
        onPress={moveToBlocks}
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
        {user.blocks > 0 && (
          <Text className="ml-auto text-primary dark:text-dark-primary">
            {formatCount(user?.blocks)}
          </Text>
        )}
      </TouchableOpacity>
    </BottomSheetProfileOptions>
  )
}
export default ProfileSheetOptions
