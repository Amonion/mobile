import 'dotenv/config'

export default ({ config }) => {
  return {
    ...config,
    plugins: [...(config.plugins || []), 'expo-asset', 'expo-web-browser'],
    extra: {
      ...config.extra,
      API_BASE_URL: process.env.API_BASE_URL,
      eas: {
        projectId: 'e3553066-167e-4d82-85cb-257822e3b233',
      },
    },
  }
}
