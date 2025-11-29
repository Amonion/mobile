import UserPostStore from '@/store/post/UserPost'
import { UserStore } from '@/store/user/User'
import axios from 'axios'
import { ImagePickerAsset } from 'expo-image-picker'
import { Dimensions } from 'react-native'

export interface RNUploadFile {
  uri: string // required
  name: string // ⬅ you need this
  type: string // MIME type
  size?: number // optional
  pages?: number
  duration?: number
}

export type MediaType = 'image' | 'video' | 'livePhoto' | 'pairedVideo'

interface FileLike {
  uri: string
  name: string
  type: string
}

/**
 * Converts a MIME type or generic type string to React Native ImagePicker type
 * @param type string like "image/png", "video/mp4", or custom "image" / "video"
 */
export const mapMimeToPickerType = (type?: string): 'image' | 'video' => {
  if (!type) return 'image'

  const lower = type.toLowerCase()

  if (lower.startsWith('image/')) return 'image'
  if (lower.startsWith('video/')) return 'video'

  // fallback for custom type strings
  if (lower === 'image' || lower === 'video') return lower as 'image' | 'video'

  // default
  return 'image'
}

export const getDeviceWidth = () => {
  return Dimensions.get('window').width
}

export async function getPdfPageCount(file: File): Promise<number> {
  const buffer = await file.arrayBuffer()
  const text = new TextDecoder().decode(buffer)

  // Regex to find the page count from /Count entries in the PDF
  const matches = text.match(/\/Count\s+(\d+)/g)
  if (!matches) return 0

  // Get the largest count value — usually the total pages
  const counts = matches.map((m) => parseInt(m.replace('/Count', '').trim()))
  return Math.max(...counts)
}

export const getUserIP = async (): Promise<string> => {
  try {
    const response = await fetch(
      `${process.env.EXPO_PUBLIC_API_BASE_URL}/user-ip`
    )
    const data = await response.json()
    return data.ip || ''
  } catch (error) {
    console.warn('Failed to fetch IP address from server', error)
    return ''
  }
}

export const addQuery = (
  input: string,
  startWith: string,
  replacement: string
) => {
  if (!input) {
    return replacement
  }
  if (!input.includes(startWith)) {
    return `${input}${replacement}`
  }
  const regex = new RegExp(`${startWith}[^&]*&`, 'g')
  return input.replace(regex, replacement)
}

interface UserProfile {
  followed: boolean
  username: string
  picture: string
  media: string
  displayName: string
  _id: string
}

export const moveToProfile = (user: UserProfile, username: string) => {
  UserStore.getState().getUser(`/users/${user.username}/?userId=${user?._id}`)
  UserPostStore.setState({ postResults: [] })
  UserPostStore.getState().getPosts(
    `/posts/user/?username=${user?.username}&page_size=40&myId=${user?._id}${
      username === user.username ? '&myPost=true' : ''
    }`
  )

  UserStore.setState((prev) => {
    return {
      userForm: {
        ...prev.userForm,
        username: user.username,
        picture: user.picture,
        media: user.media,
        displayName: user.displayName,
        followed: user.followed,
      },
    }
  })
}

export const handlePendingFileUpload = async (
  file: RNUploadFile,
  baseURL: string,
  onProgress?: (percent: number) => void,
  filePages: number = 0,
  duration: number = 0
): Promise<{
  type: MediaType // ← Use MediaType instead of string
  name: string
  duration: number
  pages: number
  size?: number
  source: string
}> => {
  try {
    const fileName = file.name || `file-${Date.now()}`
    const fileType = file.type || 'application/octet-stream'
    const fileSize = file.size || 0

    const type = getFileType({
      uri: file.uri,
      fileName: file.name,
      type: undefined,
    } as Partial<ImagePickerAsset> as ImagePickerAsset)

    // Request presigned URL
    const { data } = await axios.post(`${baseURL}/s3-presigned-url`, {
      fileName,
      fileType,
    })

    const { uploadUrl } = data

    // Fetch URI → blob
    const blob = await (await fetch(file.uri)).blob()

    // Upload to S3
    await fetch(uploadUrl, {
      method: 'PUT',
      headers: { 'Content-Type': fileType },
      body: blob,
    })

    const cleanUrl = uploadUrl.split('?')[0]

    return {
      type, // now typed correctly
      name: fileName,
      duration,
      pages: filePages,
      size: fileSize,
      source: cleanUrl,
    }
  } catch (err) {
    console.error('❌ Upload failed:', err)
    throw err
  }
}

export const appendForm = (inputs: Input[]): FormData => {
  const data = new FormData()

  inputs.forEach((el) => {
    const { name, value } = el

    if (value !== null && value !== undefined) {
      if (
        typeof value === 'object' &&
        'uri' in value &&
        typeof value.uri === 'string' &&
        value.uri !== 'null'
      ) {
        const fileLike = value as FileLike
        data.append(name, {
          uri: fileLike.uri,
          name: fileLike.name,
          type: fileLike.type,
        } as any)
      } else {
        data.append(name, String(value))
      }
    }
  })

  return data
}

export const calculateRemainingTime = (endTime: Date): CountdownState => {
  const formatTime = (time: number): string => time.toString().padStart(2, '0')
  const now = new Date()
  const timeDifference = endTime.getTime() - now.getTime()

  if (timeDifference <= 0) {
    return { countdown: 'Expired', isExpired: true }
  }

  const days = Math.floor(timeDifference / (1000 * 60 * 60 * 24))
  const hours = Math.floor((timeDifference / (1000 * 60 * 60)) % 24)
  const minutes = Math.floor((timeDifference / (1000 * 60)) % 60)
  const seconds = Math.floor((timeDifference / 1000) % 60)

  // Include all units, with leading zeros
  const countdown = `${formatTime(days * 24 + hours)}:${formatTime(
    minutes
  )}:${formatTime(seconds)}`

  return {
    countdown,
    isExpired: false,
  }
}

export const cleanQuery = (queryString: string): string => {
  return queryString.endsWith('&') ? queryString.slice(0, -1) : queryString
}

export const formatCount = (num: number): string => {
  if (!num) {
    return '0'
  }
  if (num >= 1_000_000_000) return (num / 1_000_000_000).toFixed(1) + 'B'
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + 'M'
  if (num >= 1_000) return (num / 1_000).toFixed(1) + 'K'
  return num.toString()
}

export const formatDate = (dateInput: Date | string): string => {
  const date = new Date(dateInput)

  // Months array
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ]

  // Get the day, month, and year
  const day = date.getDate()
  const month = months[date.getMonth()]
  const year = date.getFullYear()

  // Determine the day suffix
  const getDaySuffix = (day: number): string => {
    if (day % 10 === 1 && day !== 11) return 'st'
    if (day % 10 === 2 && day !== 12) return 'nd'
    if (day % 10 === 3 && day !== 13) return 'rd'
    return 'th'
  }

  // Format the date
  return `${month} ${day}${getDaySuffix(day)}, ${year}`
}

export const formatDateToDDMMYY = (
  dateInput: Date | null | number | string
): string => {
  if (dateInput) {
    const date = new Date(dateInput)
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = String(date.getFullYear()).slice(-2)
    return `${day}/${month}/${year}`
  } else {
    return `Incorrect Date`
  }
}

export const formatDateToDayMonthYY = (
  dateInput: Date | null | number | string
): string => {
  if (!dateInput) return 'Incorrect Date'

  const date = new Date(dateInput)
  const day = date.getDate()
  const year = String(date.getFullYear()).slice(-2)

  // Get short month name
  const month = date.toLocaleString('default', { month: 'short' })

  // Helper to get ordinal suffix
  const getOrdinal = (n: number) => {
    if (n > 3 && n < 21) return `${n}th`
    switch (n % 10) {
      case 1:
        return `${n}st`
      case 2:
        return `${n}nd`
      case 3:
        return `${n}rd`
      default:
        return `${n}th`
    }
  }

  return `${getOrdinal(day)} ${month}, ${year}`
}

export const formatRelativeDate = (dateInput: Date | string): string => {
  const now = new Date()
  const date = new Date(dateInput)

  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 0) {
    return 'now'
  }

  const minute = 60
  const hour = 3600
  const day = 86400
  const week = 604800

  if (diffInSeconds < minute) {
    return 'now'
  } else if (diffInSeconds < hour) {
    const minutes = Math.floor(diffInSeconds / minute)
    return minutes === 1 ? `${minutes} min` : `${minutes} mins`
  } else if (diffInSeconds < day) {
    const hours = Math.floor(diffInSeconds / hour)
    return hours === 1 ? `${hours} hr` : `${hours} hrs`
  } else if (diffInSeconds < week) {
    const days = Math.floor(diffInSeconds / day)
    return days === 1 ? `${days} day` : `${days} days`
  } else {
    // 7 days or more — return as dd/mm/yy
    const dd = String(date.getDate()).padStart(2, '0')
    const mm = String(date.getMonth() + 1).padStart(2, '0') // Month is 0-based
    const yy = String(date.getFullYear()).slice(-2)
    return `${dd}/${mm}/${yy}`
  }
}

export const formatTimeTo12Hour = (
  dateInput: Date | null | number | string
): string => {
  if (dateInput) {
    const date = new Date(dateInput)
    let hours = date.getHours()
    const minutes = String(date.getMinutes()).padStart(2, '0')
    const ampm = hours >= 12 ? 'PM' : 'AM'
    hours = hours % 12 || 12
    return `${hours}:${minutes} ${ampm}`
  } else {
    return `Incorrect Date`
  }
}

export const getExtension = (type: string): string => {
  const extension = type.substring(type.lastIndexOf('.')).toLowerCase()

  if (extension.includes('doc')) {
    return '/files/doc.png'
  } else if (extension.includes('csv')) {
    return '/files/csv.png'
  } else if (extension.includes('ppt')) {
    return '/files/ppt.png'
  } else if (extension.includes('xls')) {
    return '/files/xls.png'
  } else if (extension.includes('pdf')) {
    return '/files/pdf.png'
  } else {
    return '/files/file.png'
  }
}

export const getExtensionKey = (type: string): string => {
  const ext = type.substring(type.lastIndexOf('.')).toLowerCase()

  if (ext.includes('doc')) return 'doc'
  if (ext.includes('csv')) return 'csv'
  if (ext.includes('ppt')) return 'ppt'
  if (ext.includes('xls')) return 'xls'
  if (ext.includes('pdf')) return 'pdf'
  return 'file'
}

export const getFileType = (file: ImagePickerAsset): MediaType => {
  // Extract file extension
  const fileName = file.fileName || file.uri?.split('/').pop() || ''
  const ext = fileName.includes('.')
    ? fileName.substring(fileName.lastIndexOf('.') + 1).toLowerCase()
    : ''

  // Map common extensions to "image" | "video"
  const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'avif', 'bmp', 'svg']
  const videoExts = ['mp4', 'mov', 'avi', 'mkv', 'webm', 'mpeg']

  if (imageExts.includes(ext)) return 'image'
  if (videoExts.includes(ext)) return 'video'

  // fallback to asset.type if valid
  if (
    file.type === 'image' ||
    file.type === 'video' ||
    file.type === 'livePhoto' ||
    file.type === 'pairedVideo'
  ) {
    return file.type
  }

  // Default fallback
  return 'image'
}

export const handleRemoveFile = async (
  index: number,
  source: string,
  baseURL: string,
  setFiles: React.Dispatch<
    React.SetStateAction<
      {
        type: string
        name: string
        duration: number
        pages: number
        size: number
        source: string
      }[]
    >
  >
) => {
  try {
    const fileKey = source.split('.com/')[1]
    await axios.post(`${baseURL}s3-delete-file`, { fileKey })
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index))
  } catch (error) {
    console.error('Failed to delete file from S3:', error)
  }
}

export const truncateString = (
  input: string,
  maxLength: number = 50
): string => {
  if (input.length > maxLength) {
    return input.slice(0, maxLength) + '...'
  }
  return input
}

export const truncateStringNormal = (
  input: string,
  maxLength: number
): string => {
  if (input.length > maxLength) {
    return input.substring(0, maxLength)
  }
  return input
}

interface Input {
  name: string
  value: string | number | boolean | FileLike | null
}

type CountdownState = {
  countdown: string
  isExpired: boolean
}

export const validateUsername = (username: string) => {
  const regex = /^[\w!@#$%^&*()_+={}\[\]:;"'<>,.?/|\\~`]{2,}$/
  if (regex.test(username)) {
    return { valid: true, message: 'Valid username' }
  } else {
    return {
      valid: false,
      message:
        'Invalid username. It should contain at least 2 alphanumeric characters, underscore or special symbols without spaces or hyphens.',
    }
  }
}
