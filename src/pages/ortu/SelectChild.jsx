import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import logo from '../../assets/guide/logo.png'
import useOrtuChildren from '../../hooks/useOrtuChildren'
import { setActiveChildId } from '../../lib/activeChild'

export default function SelectChild() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { children, isLoading } = useOrtuChildren()

  function choose(id) {
    setActiveChildId(id)
    navigate('/ortu/dashboard')
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-primary-300 to-primary-900 px-4 py-10">
      <div className="relative w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
        <div className="flex flex-col items-center text-center">
          <img src={logo} alt="Jakarta Cosmopolite Islamic School" className="h-14 w-auto" />
          <h1 className="mt-5 font-heading text-xl font-bold text-text-primary">{t('ortu.selectChildTitle')}</h1>
          <p className="mt-1 text-sm text-text-secondary">{t('ortu.selectChildDescription')}</p>
        </div>

        {isLoading ? (
          <p className="mt-6 text-center text-sm text-text-secondary">{t('common.loading')}</p>
        ) : (
          <div className="mt-6 space-y-2">
            {children.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => choose(c.id)}
                className="flex w-full items-center gap-3 rounded-xl border border-border p-4 text-left transition-colors hover:border-primary-300 hover:bg-primary-300/5"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary-300/12 text-sm font-semibold text-primary-300">
                  {c.name
                    .split(' ')
                    .map((w) => w[0])
                    .slice(0, 2)
                    .join('')}
                </span>
                <span>
                  <span className="block text-sm font-semibold text-text-primary">{c.name}</span>
                  <span className="block text-xs text-text-secondary">{c.classroom?.name}</span>
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
