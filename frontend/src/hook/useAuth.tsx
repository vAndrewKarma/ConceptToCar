import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { useEffect } from 'react'

const fetchAuth = async () => {
  const { data } = await axios.get(
    'https://backend-tests.conceptocar.xyz/auth/me',
    { withCredentials: true }
  )
  return data
}

export const useAuth = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['authUser'],
    queryFn: fetchAuth,
    staleTime: 5 * 60 * 1000,
    retry: false,
    initialData: () => {
      const cached = localStorage.getItem('authUser')
      return cached ? JSON.parse(cached) : undefined
    },
  })

  useEffect(() => {
    if (data) {
      localStorage.setItem('authUser', JSON.stringify(data))
    }
  }, [data])

  return { data, isLoading, error }
}
