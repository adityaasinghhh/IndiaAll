import { useLanguage } from '../context/LanguageContext'

export default function Maintenance() {
  const { t } = useLanguage()

  return (
    <main className="min-h-screen flex items-center justify-center bg-charcoal px-4">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gold/10">
          <svg className="h-8 w-8 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-1.065-2.572c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01" />
          </svg>
        </div>
        <h1 className="font-serif text-3xl font-bold text-off-white mb-2">Under Maintenance</h1>
        <p className="text-titanium/80 font-medium">We're performing scheduled maintenance. Please check back soon.</p>
      </div>
    </main>
  )
}