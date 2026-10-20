import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'
import { products } from '../data/products'
import { api } from '../services/api.js'
import FormField from './ui/FormField'
import Button from './ui/Button'
import CountryPhoneInput from './auth/CountryPhoneInput'
import { useNavigate } from 'react-router-dom'

export default function EnquiryForm() {
  const { t, lang } = useLanguage()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const preselectedProduct = searchParams.get('product')

  const [form, setForm] = useState({
    name: '',
    company: '',
    email: '',
    phone: '', // E.164 format, e.g. +919876543210
    commodity: preselectedProduct || '',
    quantity: '',
    location: '',
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
    if (!form.name.trim()) errs.name = t.enquiry.errors.required
    if (!form.company.trim()) errs.company = t.enquiry.errors.required
    if (!form.email.trim()) errs.email = t.enquiry.errors.required
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = t.enquiry.errors.email
    if (!form.phone.trim()) errs.phone = t.enquiry.errors.required
    if (!form.commodity) errs.commodity = t.enquiry.errors.required
    if (!form.message.trim()) errs.message = t.enquiry.errors.required
    return errs
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      // Focus first invalid field
      const firstKey = Object.keys(errs)[0]
      const firstInput = document.getElementById(firstKey === 'name' ? 'enq-name' : firstKey === 'company' ? 'enq-company' : firstKey === 'email' ? 'enq-email' : firstKey === 'phone' ? 'enq-phone' : firstKey === 'commodity' ? 'enq-commodity' : 'enq-message')
      if (firstInput) firstInput.focus()
      return
    }
    setSubmitting(true)
    setSubmitError('')
    try {
      await api.post('/enquiries', {
        name: form.name.trim(),
        company: form.company.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        commodity: products.find((product) => product.slug === form.commodity)?.name || form.commodity,
        quantity: form.quantity.trim(),
        deliveryLocation: form.location.trim(),
        message: form.message.trim(),
        consent: form.consent,
        language: lang,
      })
      setSubmitted(true)
    } catch (error) {
      setSubmitError(error.message || 'We could not submit your enquiry. Please try again or contact us by email.')
    } finally {
      setSubmitting(false)
    }
  }

  const inputClass = (field) => {
    const base = 'input-base block w-full rounded-lg border border-soft-border bg-input-bg p-3 transition-colors focus:outline-none focus:ring-2 focus-burgundy focus-border-burgundy/24'
    return form[field] && Object.keys(errors).includes(field)
      ? `${base} border-red-500`
      : base
  }

  return (
    <div>
      {/* Form card - glassmorphism style */}
      <section className="py-12">
        <div className="container-site max-w-8xl mx-auto">
          <div className="rounded-2xl border border-soft-border bg-pearl-white/80 backdrop-filter blur(20px) shadow-lg p-8 md:p-10">
            <form
              id="enquiry-form"
              onSubmit={handleSubmit}
              className="space-y-6"
              noValidate
            >

              {submitError && (
                <div
                  role="alert"
                  className="rounded-lg border border-red-500 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-300 transition-colors"
                >
                  {submitError}
                </div>
              )}

              <FormField
                label={t.enquiry.form.name}
                htmlFor="enq-name"
                required
                error={errors.name}
              >
                <input
                  id="enq-name"
                  type="text"
                  name="name"
                  autoComplete="name"
                  value={form.name}
                  onChange={handleChange}
                  className="input-base w-full rounded-lg border border-soft-border bg-input-bg p-3 transition-colors focus:outline-none focus:ring-2 focus-burgundy focus-border-burgundy/24 py-3"
                  placeholder={t.enquiry.form.namePlaceholder}
                />
              </FormField>

              <FormField
                label={t.enquiry.form.company}
                htmlFor="enq-company"
                required
                error={errors.company}
              >
                <input
                  id="enq-company"
                  type="text"
                  name="company"
                  autoComplete="organization"
                  value={form.company}
                  onChange={handleChange}
                  className="input-base w-full rounded-lg border border-soft-border bg-input-bg p-3 transition-colors focus:outline-none focus:ring-2 focus-burgundy focus-border-burgundy/24 py-3"
                  placeholder={t.enquiry.form.companyPlaceholder}
                />
              </FormField>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  label={t.enquiry.form.email}
                  htmlFor="enq-email"
                  required
                  error={errors.email}
                >
                  <input
                    id="enq-email"
                    type="email"
                    name="email"
                    autoComplete="email"
                    value={form.email}
                    onChange={handleChange}
                    className="input-base w-full rounded-lg border border-soft-border bg-input-bg p-3 transition-colors focus:outline-none focus:ring-2 focus-burgundy focus-border-burgundy/24 py-3"
                    placeholder={t.enquiry.form.emailPlaceholder}
                  />
                </FormField>

                <CountryPhoneInput
                  value={form.phone}
                  onChange={(val) => setForm((prev) => ({ ...prev, phone: val }))}
                  required
                  error={errors.phone}
                  label={t.enquiry.form.phone}
                  placeholder="+{t.enquiry.form.phonePlaceholder}"
                />
              </div>

              <FormField
                label={t.enquiry.form.commodity}
                htmlFor="enq-commodity"
                required
                error={errors.commodity}
              >
                <select
                  id="enq-commodity"
                  name="commodity"
                  value={form.commodity}
                  onChange={handleChange}
                  className="input-base w-full rounded-lg border border-soft-border bg-input-bg p-3 transition-colors focus:outline-none focus:ring-2 focus-burgundy focus-border-burgundy/24 py-3 appearance-none bg-no-repeat cursor-pointer"
                >
                  <option value="">-- Select Category --</option>
                  <option value="energy">Energy & Fuels</option>
                  <option value="fertilizers">Fertilizers</option>
                  <option value="agriculture">Agriculture & Food</option>
                  <option value="meat">Meat & Livestock</option>
                  <option value="metals">Metals & Minerals</option>
                  <option value="other">Other</option>
                </select>
              </FormField>

              <FormField
                label={t.enquiry.form.quantity}
                htmlFor="enq-quantity"
                error={errors.quantity}
              >
                <input
                  id="enq-quantity"
                  type="text"
                  name="quantity"
                  value={form.quantity}
                  onChange={handleChange}
                  className="input-base w-full rounded-lg border border-soft-border bg-input-bg p-3 transition-colors focus:outline-none focus:ring-2 focus-burgundy focus-border-burgundy/24 py-3"
                  placeholder={t.enquiry.form.quantityPlaceholder}
                />
              </FormField>

              <FormField
                label={t.enquiry.form.location}
                htmlFor="enq-location"
                error={errors.location}
              >
                <input
                  id="enq-location"
                  type="text"
                  name="location"
                  autoComplete="country-name"
                  value={form.location}
                  onChange={handleChange}
                  className="input-base w-full rounded-lg border border-soft-border bg-input-bg p-3 transition-colors focus:outline-none focus:ring-2 focus-burgundy focus-border-burgundy/24 py-3"
                  placeholder={t.enquiry.form.locationPlaceholder}
                />
              </FormField>

              <FormField
                label={t.enquiry.form.message}
                htmlFor="enq-message"
                required
                error={errors.message}
              >
                <textarea
                  id="enq-message"
                  name="message"
                  rows={6}
                  value={form.message}
                  onChange={handleChange}
                  className="input-base w-full rounded-lg border border-soft-border bg-input-bg p-3 transition-colors focus:outline-none focus:ring-2 focus-burgundy focus-border-burgundy/24 py-3 resize-none"
                  placeholder={t.enquiry.form.messagePlaceholder}
                />
              </FormField>

              <div className="flex items-center gap-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="consent"
                    checked={form.consent}
                    onChange={handleChange}
                    aria-invalid={errors.consent ? 'true' : undefined}
                    aria-describedby={errors.consent ? 'enq-consent-error' : undefined}
                    className="rounded border-burgundy h-4 w-4"
                  />
                  <span className="text-sm font-medium text-primary-text">{t.enquiry.form.consent}</span>
                </label>
                {errors.consent && (
                  <p id="enq-consent-error" role="alert" className="text-xs text-red-400">
                    {errors.consent}
                  </p>
                )}
              </div>

              <div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full sm:w-auto rounded-lg bg-charcoal px-6 py-3.5 text-off-white font-semibold text-base transition-all duration-200 hover:bg-graphite hover:shadow-card active:bg-graphite active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-graphite disabled:hover:shadow-card"
                >
                  {submitting ? (
                    <>
                      <svg className="h-4 w-4 animate-spin mr-2" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.25v-1.5c-0.463 0-0.85-0.347-0.85-0.85a0.85 0.85 0 011.7-1.7l-1.5 1.5V4.5a0.85 0.85 0 011.7-1.7L7.5 2.5a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.573c0.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 01-1.065-2.572c-0.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 01-2.573-1.066c-1.543 0.94-3.31-0.826-2.37-2.37a1.724 1.724 0 01-1.065-2.572c-0.94-1.543 0.826-3.31 2.37-2.37 0.996 0.608 2.296 0.07 2.572-1.065z" />
                      </svg>
                      {t.common.loading}
                    </>
                  ) : (
                    t.enquiry.form.submit
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </div>
  )
}