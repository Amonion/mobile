const fileTypeMapping: Record<string, string[]> = {
  image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  audio: ['audio/mpeg', 'audio/mp3'],
  video: ['video/mp4', 'video/webm', 'video/ogg'],
  doc: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ],
}

type ValidationResult = {
  valid: boolean
  messages: Record<string, string>
}

const validateFile = (
  name: string,
  file: File,
  rules: ValidationRules,
  field: string
): string | null => {
  // Validate file type
  if (rules.type && fileTypeMapping[rules.type]) {
    if (!fileTypeMapping[rules.type].includes(file.type)) {
      return `${field} must be a valid ${rules.type} file.`
    }
  }

  // Validate max size
  if (rules.maxSize && file.size > rules.maxSize * 1024 * 1024) {
    return `${field} must not exceed ${rules.maxSize} MB.`
  }

  // Validate video duration (synchronously for simplicity)
  if (rules.maxTime && file.type.startsWith('video/')) {
    const video = document.createElement('video')
    const url = URL.createObjectURL(file)

    video.src = url
    video.onloadedmetadata = () => {
      URL.revokeObjectURL(url)
      if (video.duration / 60 > rules.maxTime!) {
        return `${field} must not exceed ${rules.maxTime} minutes.`
      }
    }
  }

  return null
}

function validateFileLike(
  name: string,
  file: FileLike,
  rules: ValidationRules,
  field: string
): string | null {
  if (!file?.uri) {
    return `${field} is required.`
  }

  if (rules.maxSize) {
    return null
  }

  return null
}

export const validateInputs = (inputs: Input[]): ValidationResult => {
  const messages: Record<string, string> = {}

  for (const input of inputs) {
    const { name, value, rules, field } = input

    if (
      typeof value === 'object' &&
      value !== null &&
      'uri' in value &&
      typeof (value as FileLike).uri === 'string'
    ) {
      const file = value as FileLike

      if (
        rules.blank === false &&
        (!file.uri || file.uri === 'null' || file.uri.trim() === '')
      ) {
        messages[name] = `${field} cannot be blank.`
        continue
      }

      const fileValidationMessage = validateFileLike(name, file, rules, field)
      if (fileValidationMessage) {
        messages[name] = fileValidationMessage
        continue
      }

      continue
    }

    if (
      rules.blank === false &&
      (value === null ||
        value === undefined ||
        (typeof value === 'string' && value.trim() === ''))
    ) {
      messages[name] = `${field} cannot be blank.`
      continue
    }

    if (rules.zero && value === 0) {
      messages[name] = `${field} cannot be zero.`
      continue
    }

    if (
      rules.minLength &&
      typeof value === 'string' &&
      value.length < rules.minLength
    ) {
      messages[
        name
      ] = `${field} must be at least ${rules.minLength} characters long.`
      continue
    }

    if (
      rules.maxLength &&
      typeof value === 'string' &&
      value.length > rules.maxLength
    ) {
      messages[name] = `${field} must not exceed ${rules.maxLength} characters.`
      continue
    }
  }

  return {
    valid: Object.keys(messages).length === 0,
    messages,
  }
}
