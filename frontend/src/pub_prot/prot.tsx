// src/components/PublicRoute.jsx

import { Navigate } from 'react-router-dom'
import { useAuthContext } from '../contexts/useAuthcontext'

import { ReactNode } from 'react'

const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const auth: any = useAuthContext()

  if (!auth || auth.loading) {
    return <div>Loading...</div>
  }

  if (!auth.data || !auth.data.auth) {
    return <Navigate to="/sign-in" replace />
  }

  return children
}

export default ProtectedRoute
