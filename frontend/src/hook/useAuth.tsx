import { useQuery } from '@tanstack/react-query'
import axios from 'axios' // axios instead of alalaltu gen axios-hooks ca sa ii dau sho cache

const fetchAuth = async () => {
  const { data } = await axios.get(
    'https://backend-tests.conceptocar.xyz/auth/me',
    {
      withCredentials: true,
    }
  )
  return data
}

export const useAuth = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['authUser'],
    queryFn: fetchAuth,
    staleTime: 5 * 60 * 1000,
    retry: false,
  })

  return { data, isLoading, error }
}
