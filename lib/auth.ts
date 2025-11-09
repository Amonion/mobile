import api from './api'

export const signUp = async (form: FormData) => {
  const response = await api.post('/users', form)

  return response.data
}

export const signIn = async (form: FormData) => {
  const response = await api.post('/users/login', form)

  return response.data
}

export const createAccount = async (form: FormData) => {
  const response = await api.post('/users/create-account', form)
  return response.data
}
