import { createContext, useContext } from 'react'
import type { Permission, Session } from './types'

type AuthContext = {
  session: Session
  can: (permission: Permission) => boolean
  logout: () => Promise<void>
}
export const Auth = createContext<AuthContext | null>(null)
export function useAuth() {
  const value = useContext(Auth)
  if (!value) throw new Error('Sessão não disponível.')
  return value
}
