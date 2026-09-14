import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ShieldCheck, LogOut } from 'lucide-react'
import logo from '../../assets/guide/logo baru.svg'
import useOrtuChildren from '../../hooks/useOrtuChildren'
import { apiPost, logout as apiLogout } from '../../lib/api'
import { clearUser } from '../../lib/auth'

export default function ConsentChild() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { children, isLoading } = useOrtuChildren()
  const [checked, setChecked] = useState({})

  const needing = children.filter((c) => c.needs_consent)

  const submitMutation = useMutation({
    mutationFn: async () => {
      for (const c of needing) {
        if (checked[c.id]) await apiPost('/api/ortu/consents', { student_id: c.id })
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ortu', 'children'] })
      navigate('/ortu/dashboard')
    },
  })

  async function handleLogout() {
    try {
      await apiLogout()
    } finally {
      clearUser()
      navigate('/login')
    }
  }

  const allChecked = needing.length > 0 && needing.every((c) => checked[c.id])

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-primary-300 to-primary-900 px-4 py-10">
      <div className="relative w-full max-w-xl rounded-2xl bg-white p-8 shadow-xl">
        <div className="flex flex-col items-center text-center">
          <img src={logo} alt="Jakarta Cosmopolite Islamic School" className="h-14 w-auto" />
          <ShieldCheck size={28} className="mt-4 text-primary-300" />
          <h1 className="mt-2 font-heading text-xl font-bold text-text-primary">{t('consent.title')}</h1>
        </div>

        <p className="mt-5 text-sm text-text-secondary">{t('consent.intro')}</p>
        <p className="mt-3 text-sm text-text-secondary">{t('consent.dataCollected')}</p>
        <p className="mt-3 text-sm text-text-secondary">{t('consent.purpose')}</p>

        {isLoading ? (
          <p className="mt-6 text-center text-sm text-text-secondary">{t('common.loading')}</p>
        ) : (
          <div className="mt-6 space-y-3">
            {needing.map((c) => (
              <label
                key={c.id}
                className="flex items-start gap-3 rounded-xl border border-border p-4 text-sm hover:bg-bg-page"
              >
                <input
                  type="checkbox"
                  className="mt-0.5"
                  checked={!!checked[c.id]}
                  onChange={(e) => setChecked({ ...checked, [c.id]: e.target.checked })}
                />
                <span className="text-text-primary">{t('consent.checkboxLabel', { name: c.name })}</span>
              </label>
            ))}
          </div>
        )}

        {submitMutation.isError && (
          <p className="mt-4 rounded-lg bg-danger-500/10 px-3 py-2 text-sm text-danger-500">
            {submitMutation.error.message}
          </p>
        )}

        <button
          type="button"
          disabled={!allChecked || submitMutation.isPending}
          onClick={() => submitMutation.mutate()}
          className="mt-6 w-full rounded-xl bg-primary-300 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-400 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitMutation.isPending ? t('common.processing') : t('consent.submit')}
        </button>

        <button
          type="button"
          onClick={handleLogout}
          className="mt-3 flex w-full items-center justify-center gap-1.5 text-sm font-medium text-text-secondary hover:text-text-primary"
        >
          <LogOut size={15} />
          {t('nav.logout')}
        </button>
      </div>
    </div>
  )
}
