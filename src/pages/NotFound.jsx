import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div>
      <h1>404 - Halaman Tidak Ditemukan</h1>
      <Link to="/login">Kembali ke Login</Link>
    </div>
  )
}
