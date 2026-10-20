import { useLanguage } from '../context/LanguageContext'

export default function MaintenanceBanner() {
  const { t } = useLanguage()

  return (
    <div className="bg-gold/10 border-b border-gold/20 px-4 py-3 text-center">
      <p className="text-sm font-semibold text-gold-dark">
        Scheduled maintenance in progress. Some features may be temporarily unavailable.
      </p>
    </div>
  )
}