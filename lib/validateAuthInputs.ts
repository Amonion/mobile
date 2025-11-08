export interface ValidationResult {
  emailMessage?: string
  usernameMessage?: string
  phoneMessage?: string
  passwordMessage?: string
  confirmPasswordMessage?: string
  general?: string
  valid: boolean
}

export const validateInputs = (
  password: string,
  email: string,
  confirmPassword?: string
  // phone?: string
): ValidationResult => {
  const result: ValidationResult = { valid: true }

  // Validate email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    result.valid = false
    result.emailMessage = 'Invalid email address'
  }

  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
  if (!passwordRegex.test(password)) {
    result.valid = false
    result.passwordMessage =
      'Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character'
  }

  // Validate confirm password
  if (password !== confirmPassword) {
    result.valid = false
    result.confirmPasswordMessage = 'Passwords do not match'
  }

  return result
}

export const validateSignUp = (
  password: string,
  email: string
): ValidationResult => {
  const result: ValidationResult = { valid: true }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    result.valid = false
    result.emailMessage = 'Invalid email address'
  }

  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
  if (!passwordRegex.test(password)) {
    result.valid = false
    result.passwordMessage =
      'Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character'
  }

  return result
}
