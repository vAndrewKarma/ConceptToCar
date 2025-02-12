import React, { createContext } from 'react'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const AuthContext = createContext<any>(null)

interface AuthProviderProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  auth: any
  children: React.ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({
  auth,
  children,
}) => {
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>
}
