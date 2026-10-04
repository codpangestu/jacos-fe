import { useEffect } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from 'react-router-dom'
import { router } from './router'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

function App() {
  // Identitas di localStorage harus selalu sinkron dgn sesi server. Kalau user
  // ganti akun / logout di TAB LAIN, tab ini (yang tampilannya masih akun lama
  // — event storage tidak me-rerender React sendiri) bisa mengirim aksi atas
  // nama akun yang salah di mata user, padahal server mencatat sesi yang benar.
  // Reload memaksa tab ini membaca identitas terbaru dari localStorage.
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === 'jacos-user' || e.key === null) {
        window.location.reload()
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  )
}

export default App
