import { Navigate } from 'react-router-dom'
import { getUser } from '../lib/auth'

/** Route umum lintas-role (Notification Center, Profile, dst) — cukup butuh login. */
export default function AuthGuard({ children }) {
  const user = getUser()

  if (!user) return <Navigate to="/login" replace />

  return children
}
