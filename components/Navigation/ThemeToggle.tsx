import { TouchableOpacity, useColorScheme } from 'react-native'
import { Feather } from '@expo/vector-icons'
import { useThemeStore } from '@/store/ThemeStore'

const ThemeToggle = () => {
  const { theme, toggleTheme } = useThemeStore()
  const system = useColorScheme()
  const isDark = theme === 'dark' || (theme === 'system' && system === 'dark')

  return (
    <TouchableOpacity
      onPress={toggleTheme}
      className="flex bg-primary ml-auto dark:bg-dark-primary rounded-full w-[45px] h-[45px] items-center justify-center"
    >
      <Feather
        name={isDark ? 'sun' : 'moon'}
        size={25}
        color={isDark ? '#BABABA' : '#6E6E6E'}
      />
    </TouchableOpacity>
  )
}

export default ThemeToggle
