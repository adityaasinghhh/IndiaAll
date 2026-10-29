import { useLanguage } from '../../context/LanguageContext'

export default function LanguageSwitcher({ onDark = false, compact = false }) {
  const { lang, setLang } = useLanguage()

  const languages = [
    { code: 'en', label: 'EN' },
    { code: 'es', label: 'ES' },
    { code: 'pt', label: 'PT' },
  ]

  const inactiveClass = onDark
    ? 'text-titanium/70 hover:text-off-white'
    : 'text-steel hover:text-charcoal'

  return (
    <div className="flex items-center gap-0.5" role="group" aria-label="Language selector">
      {languages.map((language) => (
        <button
          key={language.code}
          type="button"
          onClick={() => setLang(language.code)}
          className={`px-1.5 ${compact ? 'py-0.5' : 'py-1.5'} text-[10px] font-semibold tracking-[0.12em] transition-colors focus-visible:outline-none focus-visible:ring-2 ${
            onDark
              ? 'focus-visible:ring-titanium focus-visible:ring-offset-2 focus-visible:ring-offset-charcoal'
              : 'focus-visible:ring-industrial-blue focus-visible:ring-offset-2'
          } ${
            lang === language.code
              ? onDark
                ? 'text-off-white underline decoration-titanium/60 underline-offset-4'
                : 'text-charcoal underline decoration-industrial-blue/60 underline-offset-4'
              : inactiveClass
          }`}
          aria-pressed={lang === language.code}
        >
          {language.label}
        </button>
      ))}
    </div>
  )
}
