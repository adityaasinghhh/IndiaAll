import { useState, useEffect, useCallback, useId } from 'react'
import * as libphonenumber from 'libphonenumber-js'

// Library-provided: 245 ISO country codes with correct calling codes
const COUNTRIES = (() => {
  const isoCodes = libphonenumber.getCountries()
  return isoCodes.map((code) => {
    const dialCode = libphonenumber.getCountryCallingCode(code)
    // Map ISO2 code to full country name using standard mapping
    const countryNames = {
      // Americas
      'AC': 'Åland Islands',
      'AD': 'Andorra',
      'AE': 'United Arab Emirates',
      'AF': 'Afghanistan',
      'AG': 'Antigua and Barbuda',
      'AI': 'Anguilla',
      'AL': 'Albania',
      'AM': 'Armenia',
      'AO': 'Angola',
      'AQ': 'Antarctica',
      'AR': 'Argentina',
      'AS': 'American Samoa',
      'AT': 'Austria',
      'AU': 'Australia',
      'AW': 'Aruba',
      'AX': 'Åland Islands',
      'AZ': 'Azerbaijan',
      'BA': 'Bosnia and Herzegovina',
      'BB': 'Barbados',
      'BD': 'Bangladesh',
      'BE': 'Belgium',
      'BF': 'Burkina Faso',
      'BG': 'Bulgaria',
      'BH': 'Bahrain',
      'BI': 'Burundi',
      'BJ': 'Benin',
      'BL': 'Saint Barthélemy',
      'BM': 'Bermuda',
      'BN': 'Brunei Darussalam',
      'BO': 'Bolivia',
      'BQ': 'Caribbean Netherlands',
      'BR': 'Brazil',
      'BS': 'Bahamas',
      'BT': 'Bhutan',
      'BV': 'Bouvet Island',
      'BW': 'Botswana',
      'BY': 'Belarus',
      'BZ': 'Belize',
      'CA': 'Canada',
      'CC': 'Cocos (Keeling) Islands',
      'CD': 'Democratic Republic of the Congo',
      'CF': 'Central African Republic',
      'CG': 'Republic of the Congo',
      'CH': 'Switzerland',
      'CI': 'Côte d\'Ivoire',
      'CK': 'Cook Islands',
      'CL': 'Chile',
      'CM': 'Cameroon',
      'CN': 'China',
      'CO': 'Colombia',
      'CR': 'Costa Rica',
      'CU': 'Cuba',
      'CV': 'Cape Verde',
      'CW': 'Curaçao',
      'CX': 'Christmas Island',
      'CY': 'Cyprus',
      'CZ': 'Czech Republic',
      'DE': 'Germany',
      'DJ': 'Djibouti',
      'DK': 'Denmark',
      'DM': 'Dominica',
      'DO': 'Dominican Republic',
      'DZ': 'Algeria',
      'EA': 'Ceuta & Melilla',
      'EC': 'Ecuador',
      'EE': 'Estonia',
      'EG': 'Egypt',
      'EH': 'Western Sahara',
      'ER': 'Eritrea',
      'ES': 'Spain',
      'ET': 'Ethiopia',
      'EU': 'European Union',
      'FI': 'Finland',
      'FJ': 'Fiji',
      'FK': 'Falkland Islands',
      'FM': 'Micronesia',
      'FO': 'Faroe Islands',
      'FR': 'France',
      'GA': 'Gabon',
      'GB': 'United Kingdom',
      'GD': 'Grenada',
      'GE': 'Georgia',
      'GF': 'French Guiana',
      'GG': 'Guernsey',
      'GH': 'Ghana',
      'GI': 'Gibraltar',
      'GL': 'Greenland',
      'GM': 'Gambia',
      'GN': 'Guinea',
      'GP': 'Guadeloupe',
      'GQ': 'Equatorial Guinea',
      'GR': 'Greece',
      'GS': 'South Georgia and South Sandwich Islands',
      'GT': 'Guatemala',
      'GU': 'Guam',
      'GW': 'Guinea-Bissau',
      'GY': 'Guyana',
      'HK': 'Hong Kong',
      'HM': 'Heard & McDonald Islands',
      'HO': 'Hohhot',
      'HR': 'Croatia',
      'HT': 'Haiti',
      'HU': 'Hungary',
      'ID': 'Indonesia',
      'IE': 'Ireland',
      'IL': 'Israel',
      'IM': 'Isle of Man',
      'IN': 'India',
      'IO': 'British Indian Ocean Territory',
      'IQ': 'Iraq',
      'IR': 'Iran',
      'IS': 'Iceland',
      'IT': 'Italy',
      'JE': 'Jersey',
      'JM': 'Jamaica',
      'JO': 'Jordan',
      'JP': 'Japan',
      'KE': 'Kenya',
      'KG': 'Kyrgyzstan',
      'KH': 'Cambodia',
      'KI': 'Kiribati',
      'KM': 'Comoros',
      'KN': 'Saint Kitts and Nevis',
      'KP': 'North Korea',
      'KR': 'South Korea',
      'KW': 'Kuwait',
      'KY': 'Cayman Islands',
      'KZ': 'Kazakhstan',
      'LA': 'Lao People\'s Democratic Republic',
      'LB': 'Lebanon',
      'LC': 'Saint Lucia',
      'LI': 'Liechtenstein',
      'LK': 'Sri Lanka',
      'LR': 'Liberia',
      'LS': 'Lesotho',
      'LT': 'Lithuania',
      'LU': 'Luxembourg',
      'LV': 'Latvia',
      'LY': 'Libya',
      'MA': 'Morocco',
      'MC': 'Monaco',
      'MD': 'Moldova',
      'ME': 'Montenegro',
      'MF': 'Saint Martin',
      'MG': 'Madagascar',
      'MH': 'Marshall Islands',
      'MK': 'Macedonia',
      'ML': 'Mali',
      'MM': 'Myanmar (Burma)',
      'MN': 'Mongolia',
      'MO': 'Macao',
      'MP': 'Northern Mariana Islands',
      'MQ': 'Martinique',
      'MR': 'Mauritania',
      'MS': 'Montserrat',
      'MT': 'Malta',
      'MU': 'Mauritius',
      'MV': 'Maldives',
      'MW': 'Malawi',
      'MX': 'Mexico',
      'MY': 'Malaysia',
      'MZ': 'Mozambique',
      'NA': 'Namibia',
      'NC': 'New Caledonia',
      'NE': 'Niger',
      'NF': 'Norfolk Island',
      'NG': 'Nigeria',
      'NI': 'Nicaragua',
      'NL': 'Netherlands',
      'NO': 'Norway',
      'NP': 'Nepal',
      'NR': 'Nauru',
      'NU': 'Niue',
      'NZ': 'New Zealand',
      'OM': 'Oman',
      'PA': 'Panama',
      'PE': 'Peru',
      'PF': 'French Polynesia',
      'PG': 'Papua New Guinea',
      'PH': 'Philippines',
      'PK': 'Pakistan',
      'PL': 'Poland',
      'PM': 'Saint Pierre and Miquelon',
      'PN': 'Pitcairn',
      'PR': 'Puerto Rico',
      'PS': 'Palestine',
      'PT': 'Portugal',
      'PW': 'Palau',
      'PY': 'Paraguay',
      'QA': 'Qatar',
      'RE': 'Réunion',
      'RO': 'Romania',
      'RS': 'Serbia',
      'RU': 'Russian Federation',
      'RW': 'Rwanda',
      'SA': 'Saudi Arabia',
      'SB': 'Solomon Islands',
      'SC': 'Seychelles',
      'SD': 'Sudan',
      'SE': 'Sweden',
      'SG': 'Singapore',
      'SH': 'Saint Helena',
      'SI': 'Slovenia',
      'SJ': 'Svalbard and Jan Mayen',
      'SK': 'Slovakia',
      'SL': 'Sierra Leone',
      'SM': 'San Marino',
      'SN': 'Senegal',
      'SO': 'Somalia',
      'SR': 'Suriname',
      'SS': 'South Sudan',
      'ST': 'São Tomé and Príncipe',
      'SU': 'Soviet Union',
      'SV': 'El Salvador',
      'SX': 'Sint Maarten',
      'SY': 'Syria',
      'SZ': 'Swaziland',
      'TA': 'Tristan da Cunha',
      'TC': 'Turks and Caicos Islands',
      'TD': 'Chad',
      'TF': 'French Southern Territories',
      'TG': 'Togo',
      'TH': 'Thailand',
      'TJ': 'Tajikistan',
      'TK': 'Tokelau',
      'TL': 'Timor-Leste',
      'TM': 'Turkmenistan',
      'TN': 'Tunisia',
      'TO': 'Tonga',
      'TR': 'Turkey',
      'TT': 'Trinidad and Tobago',
      'TV': 'Tuvalu',
      'TW': 'Taiwan',
      'TZ': 'Tanzania',
      'UA': 'Ukraine',
      'UG': 'Uganda',
      'UM': 'United States Minor Outlying Islands',
      'UN': 'United Nations',
      'US': 'United States',
      'UY': 'Uruguay',
      'UZ': 'Uzbekistan',
      'VA': 'Vatican City',
      'VC': 'Saint Vincent and the Grenadines',
      'VE': 'Venezuela',
      'VG': 'British Virgin Islands',
      'VI': 'U.S. Virgin Islands',
      'VN': 'Vietnam',
      'VU': 'Vanuatu',
      'WF': 'Wallis and Futuna',
      'WK': 'Wake Island',
      'XA': 'Expo 2020',
      'XB': 'Border, EEC',
      'XC': 'Currency, EU',
      'XK': 'Kosovo',
      'YE': 'Yemen',
      'YT': 'Mayotte',
      'ZA': 'South Africa',
      'ZM': 'Zambia',
      'ZW': 'Zimbabwe',
    }
    const name = countryNames[code] || code
    return {
      code,
      name,
      dialCode: dialCode ? '+' + dialCode : '',
      iso2: code,
    }
  }).sort((a, b) => a.name.localeCompare(b.name))
})()

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
  const [countryCode, setCountryCode] = useState('IN')
  const [phoneValue, setPhoneValue] = useState('')
  const [search, setSearch] = useState('')
  const [touched, setTouched] = useState(false)
  const id = useId()

  const country = COUNTRIES.find((c) => c.code === countryCode) || COUNTRIES.find((c) => c.code === 'IN') || COUNTRIES[0]

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
    const country = COUNTRIES.find((c) => c.code === countryCode)
    if (country) {
      onChange?.(`${country.dialCode}${trimmed}`)
    }
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