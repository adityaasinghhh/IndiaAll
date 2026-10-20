import { useState } from 'react'
import { useLanguage } from '../context/LanguageContext'
import { products } from '../data/products'
import { api } from '../services/api.js'
import FormField from './ui/FormField'
import CountryPhoneInput from './auth/CountryPhoneInput'

const UNITS = ['mt', 'kg', 'litres', 'units', 'cbm', 'bags', 'containers', 'other']
const PACKAGING = ['bulk-loose', 'bags-25kg', 'bags-50kg', 'drums', 'ibc', 'containers', 'other']
const TIMEFRAMES = ['immediate', '2-4-weeks', '1-3-months', '3-6-months', 'flexible']

/**
 * Custom bulk order enquiry form.
 * Client-side validation mirrors the server rules in
 * server/src/middleware/validate.js (validateBulkOrder).
 */
export default function BulkOrderForm() {
  const { t, lang } = useLanguage()

  const [form, setForm] = useState({
    fullName: '',
    company: '',
    email: '',
    phone: '',
    country: '',
    commodity: '',
    otherCommodity: '',
    quantity: '',
    unit: '',
    destination: '',
    packaging: '',
    grade: '',
    deliveryTimeframe: '',
    incoterms: '',
    targetPrice: '',
    reference: '',
    message: '',
    consent: false,
  })
  const [errors, setErrors] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }))
  }

  const validate = () => {
    const errs = {}
    if (form.fullName.trim().length < 2) errs.fullName = t.bulkOrder.errors.required
    if (form.company.trim().length < 2) errs.company = t.bulkOrder.errors.required
    if (!form.email.trim()) errs.email = t.bulkOrder.errors.required
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = t.bulkOrder.errors.email
    if (form.country.trim().length < 2) errs.country = t.bulkOrder.errors.required
    if (!form.commodity) errs.commodity = t.bulkOrder.errors.required
    if (form.commodity === 'other' && !form.otherCommodity.trim()) {
      errs.otherCommodity = t.bulkOrder.errors.required
    }
    if (!form.quantity.trim()) errs.quantity = t.bulkOrder.errors.required
    if (!form.unit) errs.unit = t.bulkOrder.errors.required
    if (form.destination.trim().length < 2) errs.destination = t.bulkOrder.errors.required
    if (!form.consent) errs.consent = t.bulkOrder.errors.consent
    return errs
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }
    setSubmitting(true)
    setSubmitError('')
    try {
      await api.post('/bulk-orders', {
        fullName: form.fullName.trim(),
        company: form.company.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        country: form.country.trim(),
        commodity: form.commodity === 'other' ? 'other' : form.commodity,
        otherCommodity: form.otherCommodity.trim(),
        quantity: form.quantity.trim(),
        unit: form.unit,
        destination: form.destination.trim(),
        message: form.message.trim(),
        packaging: form.packaging,
        grade: form.grade.trim(),
        deliveryTimeframe: form.deliveryTimeframe,
        incoterms: form.incoterms,
        targetPrice: form.targetPrice.trim(),
        reference: form.reference.trim(),
        consent: form.consent,
        language: lang,
      })
      setSubmitted(true)
    } catch (error) {
      setSubmitError(error.message || t.bulkOrder.errors.submitFailed)
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="rounded-2xl border border-gold/40 bg-white p-10 text-center shadow-card" role="status">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-gold/15">
          <svg className="h-7 w-7 text-gold-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="font-serif text-2xl font-semibold text-navy">{t.bulkOrder.success.title}</h3>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted">{t.bulkOrder.success.text}</p>
        <button type="button" onClick={() => setSubmitted(false)} className="btn-outline mt-8">
          {t.bulkOrder.success.submitAnother}
        </button>
      </div>
    )
  }

  const inputClass = (field) => `input-base ${errors[field] ? 'input-error' : ''}`

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      {submitError && (
        <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {submitError}
        </div>
      )}

      {/* Contact information */}
      <fieldset>
        <legend className="mb-4 font-serif text-lg font-semibold text-navy">
          {t.bulkOrder.form.contactTitle}
        </legend>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <FormField label={t.bulkOrder.form.fullName} htmlFor="bo-fullName" required error={errors.fullName}>
            <input id="bo-fullName" type="text" name="fullName" autoComplete="name" value={form.fullName} onChange={handleChange} className={inputClass('fullName')} />
          </FormField>
          <FormField label={t.bulkOrder.form.company} htmlFor="bo-company" required error={errors.company}>
            <input id="bo-company" type="text" name="company" autoComplete="organization" value={form.company} onChange={handleChange} className={inputClass('company')} />
          </FormField>
          <FormField label={t.bulkOrder.form.email} htmlFor="bo-email" required error={errors.email}>
            <input id="bo-email" type="email" name="email" autoComplete="email" value={form.email} onChange={handleChange} className={inputClass('email')} />
          </FormField>
          <CountryPhoneInput
            value={form.phone}
            onChange={(val) => setForm((prev) => ({ ...prev, phone: val }))}
            label={t.bulkOrder.form.phone}
          />
          <FormField label={t.bulkOrder.form.country} htmlFor="bo-country" required error={errors.country}>
            <input id="bo-country" type="text" name="country" autoComplete="country-name" value={form.country} onChange={handleChange} className={inputClass('country')} />
          </FormField>
        </div>
      </fieldset>

      {/* Order requirements */}
      <fieldset>
        <legend className="mb-4 font-serif text-lg font-semibold text-navy">
          {t.bulkOrder.form.requirementsTitle}
        </legend>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <FormField label={t.bulkOrder.form.commodity} htmlFor="bo-commodity" required error={errors.commodity}>
            <select id="bo-commodity" name="commodity" value={form.commodity} onChange={handleChange} className={inputClass('commodity')}>
              <option value="">--</option>
              {products.map((p) => (
                <option key={p.id} value={p.slug}>{p.name}</option>
              ))}
              <option value="other">{t.bulkOrder.form.otherCommodityOption}</option>
            </select>
          </FormField>

          {form.commodity === 'other' && (
            <FormField label={t.bulkOrder.form.otherCommodityLabel} htmlFor="bo-otherCommodity" required error={errors.otherCommodity}>
              <input id="bo-otherCommodity" type="text" name="otherCommodity" value={form.otherCommodity} onChange={handleChange} placeholder={t.bulkOrder.form.otherCommodityPlaceholder} className={inputClass('otherCommodity')} />
            </FormField>
          )}

          <FormField label={t.bulkOrder.form.quantity} htmlFor="bo-quantity" required error={errors.quantity}>
            <input id="bo-quantity" type="text" name="quantity" inputMode="decimal" placeholder={t.bulkOrder.form.quantityPlaceholder} value={form.quantity} onChange={handleChange} className={inputClass('quantity')} />
          </FormField>
          <FormField label={t.bulkOrder.form.unit} htmlFor="bo-unit" required error={errors.unit}>
            <select id="bo-unit" name="unit" value={form.unit} onChange={handleChange} className={inputClass('unit')}>
              <option value="">--</option>
              {UNITS.map((u) => (
                <option key={u} value={u}>{t.bulkOrder.form.units[u]}</option>
              ))}
            </select>
          </FormField>
          <FormField label={t.bulkOrder.form.destination} htmlFor="bo-destination" required error={errors.destination}>
            <input id="bo-destination" type="text" name="destination" value={form.destination} onChange={handleChange} placeholder={t.bulkOrder.form.destinationPlaceholder} className={inputClass('destination')} />
          </FormField>
        </div>
      </fieldset>

      {/* Commercial preferences */}
      <fieldset>
        <legend className="mb-4 font-serif text-lg font-semibold text-navy">
          {t.bulkOrder.form.preferencesTitle}
        </legend>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <FormField label={t.bulkOrder.form.packaging} htmlFor="bo-packaging" optional>
            <select id="bo-packaging" name="packaging" value={form.packaging} onChange={handleChange} className={inputClass('packaging')}>
              <option value="">--</option>
              {PACKAGING.map((p) => (
                <option key={p} value={p}>{t.bulkOrder.form.packagingOptions[p]}</option>
              ))}
            </select>
          </FormField>
          <FormField label={t.bulkOrder.form.grade} htmlFor="bo-grade" optional>
            <input id="bo-grade" type="text" name="grade" value={form.grade} onChange={handleChange} className={inputClass('grade')} />
          </FormField>
          <FormField label={t.bulkOrder.form.deliveryTimeframe} htmlFor="bo-deliveryTimeframe" optional>
            <select id="bo-deliveryTimeframe" name="deliveryTimeframe" value={form.deliveryTimeframe} onChange={handleChange} className={inputClass('deliveryTimeframe')}>
              <option value="">--</option>
              {TIMEFRAMES.map((tf) => (
                <option key={tf} value={tf}>{t.bulkOrder.form.timeframes[tf]}</option>
              ))}
            </select>
          </FormField>
          <FormField label={t.bulkOrder.form.incoterms} htmlFor="bo-incoterms" optional>
            <select id="bo-incoterms" name="incoterms" value={form.incoterms} onChange={handleChange} className={inputClass('incoterms')}>
              <option value="">--</option>
              {['EXW', 'FOB', 'CFR', 'CIF', 'DAP', 'DDP', 'other'].map((term) => (
                <option key={term} value={term}>{term === 'other' ? t.bulkOrder.form.otherOption : term}</option>
              ))}
            </select>
          </FormField>
          <FormField label={t.bulkOrder.form.targetPrice} htmlFor="bo-targetPrice" optional>
            <input id="bo-targetPrice" type="text" name="targetPrice" value={form.targetPrice} onChange={handleChange} className={inputClass('targetPrice')} />
          </FormField>
          <FormField label={t.bulkOrder.form.reference} htmlFor="bo-reference" optional>
            <input id="bo-reference" type="text" name="reference" value={form.reference} onChange={handleChange} className={inputClass('reference')} />
          </FormField>
        </div>
      </fieldset>

      {/* Additional requirements */}
      <FormField label={t.bulkOrder.form.message} htmlFor="bo-message" hint={t.bulkOrder.form.messageHint}>
        <textarea id="bo-message" name="message" rows={5} value={form.message} onChange={handleChange} className={inputClass('message')} />
      </FormField>

      {/* Consent */}
      <div>
        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            name="consent"
            checked={form.consent}
            onChange={handleChange}
            aria-invalid={errors.consent ? 'true' : undefined}
            aria-describedby={errors.consent ? 'bo-consent-error' : undefined}
            className="mt-1 h-4 w-4 rounded border-gray-300 accent-[#C9A24B]"
          />
          <span className="text-sm leading-6 text-steel">{t.bulkOrder.form.consent}</span>
        </label>
        {errors.consent && (
          <p id="bo-consent-error" role="alert" className="mt-1.5 text-xs font-medium text-red-600">
            {errors.consent}
          </p>
        )}
      </div>

      <button type="submit" disabled={submitting} className="btn-primary w-full px-8 py-4 text-base disabled:cursor-not-allowed disabled:opacity-60">
        {submitting ? t.common.loading : t.bulkOrder.form.submit}
      </button>
    </form>
  )
}
