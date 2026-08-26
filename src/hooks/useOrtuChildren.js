import { useQuery } from '@tanstack/react-query'
import { apiGet } from '../lib/api'
import { resolveActiveChild } from '../lib/activeChild'

/** Daftar anak akun ortu login + anak yang sedang aktif (child switcher). */
export default function useOrtuChildren() {
  const query = useQuery({
    queryKey: ['ortu', 'children'],
    queryFn: () => apiGet('/api/ortu/children'),
  })

  const children = query.data?.children ?? []
  const needsConsent = children.some((c) => c.needs_consent)
  const activeChild = resolveActiveChild(children)

  return { ...query, children, needsConsent, activeChild }
}
