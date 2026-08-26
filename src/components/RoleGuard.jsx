import { Navigate } from 'react-router-dom'
import { getUser, ROLE_HOME } from '../lib/auth'

/**
 * Melindungi route /admin/*, /guru/*, /staff/* (dan nantinya /ortu/*):
 * redirect ke /login kalau belum login, atau ke dashboard role sendiri
 * kalau login tapi role-nya tidak cocok dengan prefix route ini.
 */
export default function RoleGuard({ role, children }) {
  const user = getUser()

  if (!user) return <Navigate to="/login" replace />
  if (user.role !== role) return <Navigate to={ROLE_HOME[user.role] ?? '/login'} replace />

  return children
}
