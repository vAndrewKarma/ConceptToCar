import { useEffect } from 'react'
import useAxios from 'axios-hooks'

export const useAuth = () => {
  const [{ data, loading, error }] = useAxios({
    url: 'https://backend-tests.conceptocar.xyz/auth/me',
    method: 'GET',
    withCredentials: true,
  })

  useEffect(() => {
    if (!loading && data) {
      console.log('Auth response:', data)
    }
    if (!loading && error) {
      console.error('Auth error:', error)
    }
  }, [loading, data, error])

  return { data, loading, error }
}
