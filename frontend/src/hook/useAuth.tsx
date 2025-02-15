import { useQuery, useQueryClient } from '@tanstack/react-query'
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
  const queryClient = useQueryClient()

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

  const logout = async () => {
    try {
      await axios.post(
        'https://backend-tests.conceptocar.xyz/auth/logout',
        {},
        { withCredentials: true }
      )
    } catch (err) {
      console.error('Logout failed', err)
    }

    queryClient.removeQueries({ queryKey: ['authUser'] })
    localStorage.removeItem('authUser')

    window.location.replace('/sign-in')
  }

  return { data, isLoading, error, logout }
}
