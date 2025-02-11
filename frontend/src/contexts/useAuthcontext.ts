import { useContext } from 'react'
import { AuthContext } from './authContext'

export const useAuthContext = () => useContext(AuthContext)
