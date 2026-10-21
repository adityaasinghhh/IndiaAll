import { useLanguage } from '../../context/LanguageContext'

export default function LanguageSwitcher({ dark }) {
  const { lang, setLang } = useLanguage()

  const languages = [
    { code: 'en', label: 'EN' },
    { code: 'es', label: 'ES' },
    { code: 'pt', label: 'PT' },
  ]

  const inactiveClass = dark
    ? 'text-off-white hover:text-gold hover:bg-white/10'
    : 'text-charcoal hover:text-gold hover:bg-white/10'

  return (
    <div className="flex items-center gap-1" role="group" aria-label="Language selector">
      {languages.map((l) => (
        <button
          key={l.code}
          type="button"
          onClick={() => setLang(l.code)}
          className={`rounded-md px-2.5 py-1.5 text-xs font-bold transition-all ${
            lang === l.code
              ? 'bg-gold text-charcoal'
              : inactiveClass}
          }`}
          aria-pressed={lang === l.code}
        >
          {l.label}
        </button>
      ))}
    </div>
  )
}