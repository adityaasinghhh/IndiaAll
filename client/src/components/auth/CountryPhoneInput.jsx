import { useState, useEffect, useCallback, useId } from 'react'

const DEFAULT_COUNTRY = 'IN'

// Simple country list with calling codes (subset used by INDIA ALL)
const COUNTRIES = [
  { code: 'IN', name: 'India', dialCode: '+91', flag: '🇮🇳' },
  { code: 'US', name: 'United States', dialCode: '+1', flag: '🇺🇸' },
  { code: 'GB', name: 'United Kingdom', dialCode: '+44', flag: '🇬🇧' },
  { code: 'AE', name: 'United Arab Emirates', dialCode: '+971', flag: '🇦🇪' },
  { code: 'CA', name: 'Canada', dialCode: '+1', flag: '🇨🇦' },
  { code: 'AU', name: 'Australia', dialCode: '+61', flag: '🇦🇺' },
  { code: 'BR', name: 'Brazil', dialCode: '+55', flag: '🇧🇷' },
  { code: 'FR', name: 'France', dialCode: '+33', flag: '🇫🇷' },
  { code: 'DE', name: 'Germany', dialCode: '+49', flag: '🇩🇪' },
  { code: 'ZA', name: 'South Africa', dialCode: '+27', flag: '🇿🇦' },
]

export default function CountryPhoneInput({
  value = '',
  onChange,
  label = 'Phone number',
  labelCountry = 'Country',
  disabled = false,
  required = false,
  error,
  className = '',
}) {
  const [countryCode, setCountryCode] = useState(DEFAULT_COUNTRY)
  const [phoneValue, setPhoneValue] = useState('')
  const [search, setSearch] = useState('')
  const [touched, setTouched] = useState(false)
  const id = useId()

  const country = COUNTRIES.find((c) => c.code === countryCode) || COUNTRIES[0]

  // Sync the externally controlled E.164 value into the national-number display
  useEffect(() => {
    if (!value) {
      setPhoneValue('')
      return
    }
    // Strip leading + for display
    setPhoneValue(value.replace(/^\+/, ''))
  }, [value])

  const isNumberValid = useCallback(() => {
    const v = phoneValue.trim()
    if (!v) return false
    // Basic validation: digits only, reasonable length
    return /^\+?\d{7,15}$/.test(v)
  }, [phoneValue])

  const fieldError =
    error ||
    (touched && phoneValue.trim() && !isNumberValid()
      ? 'Please enter a valid phone number.'
      : undefined)

  const handleCountryChange = (e) => {
    const nextCode = e.target.value
    setCountryCode(nextCode)
    setTouched(true)

    const current = phoneValue.trim()
    if (!current) {
      onChange?.('')
      return
    }
    const newCountry = COUNTRIES.find((c) => c.code === nextCode)
    if (newCountry) {
      onChange?.(`${newCountry.dialCode}${current}`)
    }
  }

  const handlePhoneChange = (e) => {
    const raw = e.target.value
    setPhoneValue(raw)
    const trimmed = raw.trim()
    if (!trimmed) {
      setTouched(false)
      onChange?.('')
      return
    }
    onChange?.(`${country.dialCode}${trimmed}`)
  }

  const handleBlur = () => {
    setTouched(true)
  }

  const filteredCountries = COUNTRIES.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.code.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div
      className={['country-phone-input', className].filter(Boolean).join(' ')}
      role="group"
      aria-label={label}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="country-selector flex flex-col gap-2">
          <input
            id={`country-search-${id}`}
            type="search"
            placeholder="Search country…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            disabled={disabled}
            autoComplete="off"
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-ink placeholder:text-gray-400 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30 disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <select
            id={`country-select-${id}`}
            name="country-code"
            value={countryCode}
            onChange={handleCountryChange}
            disabled={disabled}
            aria-label={labelCountry}
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-ink focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30 disabled:opacity-50 disabled:cursor-not-allowed appearance-none"
          >
            {filteredCountries.map((c) => (
              <option key={c.code} value={c.code}>
                {c.flag} {c.name} {c.dialCode}
              </option>
            ))}
          </select>
        </div>
        <div className="phone-input-wrapper flex flex-col gap-2">
          <input
            id={`phone-input-${id}`}
            type="tel"
            name="phone"
            autoComplete="tel"
            value={phoneValue}
            onChange={handlePhoneChange}
            onBlur={handleBlur}
            placeholder="National number"
            required={required}
            disabled={disabled}
            aria-invalid={fieldError ? 'true' : undefined}
            aria-describedby={fieldError ? `phone-error-${id}` : undefined}
            className={[
              'w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-ink placeholder:text-gray-400',
              'focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30',
              disabled ? 'opacity-50 cursor-not-allowed' : '',
              fieldError ? 'border-red-400 focus:border-red-400 focus:ring-red-200' : '',
            ]
              .filter(Boolean)
              .join(' ')}
          />
          {fieldError && (
            <p id={`phone-error-${id}`} role="alert" className="mt-1 text-xs font-medium text-red-600">
              {fieldError}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}