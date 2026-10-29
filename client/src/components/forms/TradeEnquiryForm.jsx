import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useLanguage } from '../../context/LanguageContext'
import { getSiteContent } from '../../data/siteContent'
import { products } from '../../data/products'
import { api } from '../../services/api'
import { ArrowRight, Check } from '../ui/Icons'

const ENQUIRY_KEYS = [
  'product-sourcing',
  'bulk-supply',
  'supplier-partnership',
  'distribution',
  'general',
]

const ENQUIRY_PARAM_MAP = {
  'consumer-goods': 'product-sourcing',
  'product-sourcing': 'product-sourcing',
  'sourcing-partnership': 'supplier-partnership',
  'buyer-supplier': 'product-sourcing',
  distribution: 'distribution',
  bulk: 'bulk-supply',
  general: 'general',
}

const EMPTY_FORM = {
  name: '',
  company: '',
  email: '',
  country: '',
  phone: '',
  enquiryType: 'product-sourcing',
  product: '',
  customProduct: null,
  message: '',
  consent: false,
}

const CATEGORY_OPTIONS = [
  { value: 'agricultural', label: 'Agricultural Commodities' },
  { value: 'industrial', label: 'Industrial Raw Materials' },
  { value: 'energy', label: 'Energy Commodities' },
  { value: 'food', label: 'Food & Specialty Products' },
  { value: 'consumer', label: 'Consumer Goods' },
  { value: 'other', label: 'Other' },
]

const MODAL_HEADING = 'Tell Us About Your Product'
const MODAL_SUBTEXT = 'We source products across a range of industries. Share a few details about the item you are looking for so our team can better understand your requirements.'

export default function TradeEnquiryForm({ defaultEnquiryType = '', defaultProduct = '' }) {
  const { lang } = useLanguage()
  const copy = getSiteContent(lang)
  const labels = copy.contact.form
  const [searchParams] = useSearchParams()

  const initialType = ENQUIRY_KEYS.includes(defaultEnquiryType)
    ? defaultEnquiryType
    : 'product-sourcing'

  const resolveProduct = (param) => {
    if (!param) return ''
    if (param === 'consumer-goods') return 'consumer-goods'
    const match = products.find(
      (product) => product.slug === param || product.name.toLowerCase() === param.toLowerCase()
    )
    return match ? match.slug : 'other'
  }

  const [form, setForm] = useState({
    ...EMPTY_FORM,
    enquiryType: initialType,
    product: resolveProduct(defaultProduct),
  })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [modalForm, setModalForm] = useState({
    productName: '',
    productCategory: '',
    specifications: '',
    estimatedQuantity: '',
    countryOfOrigin: '',
    additionalDetails: '',
  })
  const [modalErrors, setModalErrors] = useState({})
  const formRef = useRef(null)

  const productParam = searchParams.get('product')
  const enquiryParam = searchParams.get('enquiry')

  useEffect(() => {
    if (!productParam && !enquiryParam) return
    setForm((previous) => ({
      ...previous,
      ...(productParam ? { product: resolveProduct(productParam) } : {}),
      ...(enquiryParam && ENQUIRY_PARAM_MAP[enquiryParam]
        ? { enquiryType: ENQUIRY_PARAM_MAP[enquiryParam] }
        : {}),
    }))
    setSubmitted(false)
  }, [productParam, enquiryParam])

  const update = (event) => {
    const { name, value, type, checked } = event.target
    setForm((previous) => ({ ...previous, [name]: type === 'checkbox' ? checked : value }))
    if (errors[name]) setErrors((previous) => ({ ...previous, [name]: undefined }))
    if (submitError) setSubmitError('')
  }

  const validateModal = () => {
    const nextErrors = {}
    if (!modalForm.productName.trim()) nextErrors.productName = copy.contact.errors.required
    return nextErrors
  }

  const handleModalSubmit = () => {
    const nextErrors = validateModal()
    if (Object.keys(nextErrors).length > 0) {
      setModalErrors(nextErrors)
      return
    }
    setModalOpen(false)
    setModalForm({
      productName: modalForm.productName.trim(),
      productCategory: modalForm.productCategory,
      specifications: modalForm.specifications.trim(),
      estimatedQuantity: modalForm.estimatedQuantity.trim(),
      countryOfOrigin: modalForm.countryOfOrigin.trim(),
      additionalDetails: modalForm.additionalDetails.trim(),
    })
    // Update the product field to "other" so it displays correctly
    setForm((prev) => ({ ...prev, product: 'other', customProduct: modalForm }))
  }

  const handleModalCancel = () => {
    setModalOpen(false)
    // Do not reset custom product details; keep them in state
    setModalForm({
      productName: '',
      productCategory: '',
      specifications: '',
      estimatedQuantity: '',
      countryOfOrigin: '',
      additionalDetails: '',
    })
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const nextErrors = validate()
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      const firstKey = Object.keys(nextErrors)[0]
      const field = formRef.current?.querySelector(`[name="${firstKey}"]`)
      if (field) field.focus()
      return
    }

    setSubmitting(true)
    setSubmitError('')

    const productRecord = products.find((product) => product.slug === form.product)
    const commodity =
      form.product === 'consumer-goods'
        ? copy.commodities.categories.find((category) => category.id === 'consumer')?.name
        : form.product === 'other'
          ? labels.otherProduct
          : productRecord?.name || form.product

    // Build custom product data if "other" is selected
    let customProductPayload = {}
    if (form.product === 'other' && form.customProduct) {
      customProductPayload = {
        name: form.customProduct.productName,
        category: form.customProduct.productCategory,
        specifications: form.customProduct.specifications,
        estimatedQuantity: form.customProduct.estimatedQuantity,
        countryOfOrigin: form.customProduct.countryOfOrigin,
        additionalDetails: form.customProduct.additionalDetails,
      }
    }

    try {
      await api.post('/enquiries', {
        name: form.name.trim(),
        company: form.company.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        country: form.country.trim(),
        deliveryLocation: form.country.trim(),
        commodity,
        quantity: form.quantity.trim(),
        enquiryType: labels.enquiryTypes[ENQUIRY_KEYS.indexOf(form.enquiryType)] || '',
        message: form.message.trim(),
        consent: form.consent,
        language: lang,
        ...customProductPayload,
      })
      setSubmitted(true)
      setForm({ ...EMPTY_FORM, enquiryType: initialType })
      setModalOpen(false)
      setModalForm({
        productName: '',
        productCategory: '',
        specifications: '',
        estimatedQuantity: '',
        countryOfOrigin: '',
        additionalDetails: '',
      })
    } catch (error) {
      const details = Array.isArray(error.errors) ? ` ${error.errors.join(' ')}` : ''
      setSubmitError(`${error.message || copy.contact.errors.submit}${details}`)
    } finally {
      setSubmitting(false)
    }
  }

  const resetForm = () => {
    setSubmitted(false)
    setErrors({})
    setSubmitError('')
    setForm({ ...EMPTY_FORM, enquiryType: initialType })
    setModalOpen(false)
    setModalForm({
      productName: '',
      productCategory: '',
      specifications: '',
      estimatedQuantity: '',
      countryOfOrigin: '',
      additionalDetails: '',
    })
  }

  const describedBy = (field) => (errors[field] ? `enquiry-${field}-error` : undefined)
  const inputClass = (field) =>
    `field-input ${errors[field] ? '!border-red-700/70' : ''}`

  if (submitted) {
    return (
      <div
        className="flex min-h-[420px] flex-col justify-between border border-charcoal/15 bg-white p-8 sm:p-10"
        role="status"
        aria-live="polite"
      >
        <div>
          <span className="flex h-12 w-12 items-center justify-center border border-industrial-blue text-industrial-blue">
            <Check className="h-5 w-5" />
          </span>
          <h3 className="mt-7 font-serif text-[clamp(1.8rem,3vw,2.4rem)] leading-tight text-charcoal">
            {copy.contact.success.title}
          </h3>
          <p className="mt-4 max-w-md text-sm leading-7 text-body-text/70">
            {copy.contact.success.text}
          </p>
        </div>
        <button type="button" onClick={resetForm} className="btn-corporate-outline mt-10 self-start">
          {copy.contact.success.again}
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
    )
  }

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      noValidate
      className="border border-charcoal/15 bg-white p-6 sm:p-8 lg:p-9"
    >
      {submitError && (
        <div
          role="alert"
          className="mb-6 border border-red-700/30 bg-red-50 px-4 py-3 text-[13px] leading-6 text-red-800"
        >
          {submitError}
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label={labels.name} htmlFor="enq-name" error={errors.name} errorId="enquiry-name-error">
          <input
            id="enq-name"
            name="name"
            type="text"
            autoComplete="name"
            value={form.name}
            onChange={update}
            className={inputClass('name')}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={describedBy('name')}
            required
          />
        </Field>

        <Field label={labels.company} htmlFor="enq-company" error={errors.company} errorId="enquiry-company-error">
          <input
            id="enq-company"
            name="company"
            type="text"
            autoComplete="organization"
            value={form.company}
            onChange={update}
            className={inputClass('company')}
            aria-invalid={Boolean(errors.company)}
            aria-describedby={describedBy('company')}
            required
          />
        </Field>

        <Field label={labels.email} htmlFor="enq-email" error={errors.email} errorId="enquiry-email-error">
          <input
            id="enq-email"
            name="email"
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={update}
            className={inputClass('email')}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={describedBy('email')}
            required
          />
        </Field>

        <Field label={labels.country} htmlFor="enq-country" error={errors.country} errorId="enquiry-country-error">
          <input
            id="enq-country"
            name="country"
            type="text"
            autoComplete="country-name"
            value={form.country}
            onChange={update}
            className={inputClass('country')}
            aria-invalid={Boolean(errors.country)}
            aria-describedby={describedBy('country')}
            required
          />
        </Field>

        <Field label={labels.phone} htmlFor="enq-phone" hint={labels.optional} error={errors.phone} errorId="enquiry-phone-error">
          <input
            id="enq-phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            value={form.phone}
            onChange={update}
            className={inputClass('phone')}
            aria-invalid={Boolean(errors.phone)}
            aria-describedby={describedBy('phone')}
          />
        </Field>

        <Field label={labels.enquiryType} htmlFor="enq-type" error={errors.enquiryType} errorId="enquiry-enquiryType-error">
          <select
            id="enq-type"
            name="enquiryType"
            value={form.enquiryType}
            onChange={update}
            className={`${inputClass('enquiryType')} cursor-pointer appearance-none bg-[length:12px] bg-[right_1rem_center] bg-no-repeat pr-10`}
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23353B43'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")",
            }}
          >
            {labels.enquiryTypes.map((label, index) => (
              <option key={label} value={ENQUIRY_KEYS[index]}>
                {label}
              </option>
            ))}
          </select>
        </Field>

        <div className="sm:col-span-2">
          <Field label={labels.product} htmlFor="enq-product" error={errors.product} errorId="enquiry-product-error">
            <select
              id="enq-product"
              name="product"
              value={form.product}
              onChange={(e) => {
                const selectedValue = e.target.value
                update(e)
                if (selectedValue === 'other') {
                  setModalOpen(true)
                }
              }}
              className={`${inputClass('product')} cursor-pointer appearance-none bg-[length:12px] bg-[right_1rm_center] bg-no-repeat pr-10`}
              style={{
                backgroundImage:
                  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23353B43'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")",
              }}
              aria-invalid={Boolean(errors.product)}
              aria-describedby={describedBy('product')}
              required
            >
              <option value="">{labels.selectPlaceholder}</option>
              {products
                .filter((product) => product.visible)
                .map((product) => (
                  <option key={product.slug} value={product.slug}>
                    {product.name}
                  </option>
                ))}
              <option value="consumer-goods">
                {copy.commodities.categories.find((category) => category.id === 'consumer')?.name}
              </option>
              <option value="other">{labels.otherProduct}</option>
            </select>
          </Field>
        </div>

        {/* Display custom product name when "other" is selected */}
        {form.product === 'other' && form.customProduct && (
          <div className="sm:col-span-2 mt-2 p-3 border-t border-charcoal/10 pt-3 text-[11px] leading-5 text-titanium/60">
            <div className="flex items-center gap-2">
              <svg className="h-4 w-4 text-titanium/40" fill="none" stroke="titanium" strokeWidth="1.5" viewBox="0 0 24 24">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
              <span className="font-medium text-charcoal">Specified product: {form.customProduct.productName}</span>
            </div>
          </div>
        )}

        <div className="sm:col-span-2">
          <Field label={labels.message} htmlFor="enq-message" error={errors.message} errorId="enquiry-message-error">
            <textarea
              id="enq-message"
              name="message"
              rows={6}
              value={form.message}
              onChange={update}
              placeholder={labels.messagePlaceholder}
              className={`${inputClass('message')} resize-y`}
              aria-invalid={Boolean(errors.message)}
              aria-describedby={describedBy('message')}
              required
            />
          </Field>
        </div>
      </div>

      {/* Modal for "Other / not listed" product selection */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
        >
          <div
            className="bg-white rounded-2xl max-w-md w-full max-h-[90%] overflow-y-auto shadow-lg transform scale-100 opacity-100 transition-all duration-300 ease-out"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-heading"
            style={{ margin: 'auto' }}
          >
            <button
              onClick={handleModalCancel}
              className="absolute top-2 right-2 p-2 text-charcoal/60 hover:text-charcoal transition-colors rounded-lg focus:outline-none focus:ring-2 focus:ring-gold focus-ring-offset-2"
              aria-label="Close modal"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="p-6">
              <h3 id="modal-heading" className="text-2xl font-bold text-charcoal mb-2">
                {MODAL_HEADING}
              </h3>
              <p className="text-charcoal/60 text-sm mb-4 leading-relaxed">
                {MODAL_SUBTEXT}
              </p>

              {/* Modal form fields */}
              {modalErrors.productName && (
                <p id="modal-product-name-error" role="alert" className="text-sm text-red-600 mb-3">
                  {modalErrors.productName}
                </p>
              )}

              <Field
                label="Product or Commodity Name"
                htmlFor="modal-product-name"
                error={modalErrors.productName}
                errorId="modal-product-name-error"
              >
                <input
                  id="modal-product-name"
                  type="text"
                  name="productName"
                  value={modalForm.productName}
                  onChange={(e) =>
                    setModalForm((prev) => ({ ...prev, productName: e.target.value }))
                  }
                  className="w-full rounded-lg border border-soft-border bg-input-bg p-3 transition-colors focus:outline-none focus:ring-2 focus-burgundy focus-border-burgundy/24 py-3"
                  aria-invalid={Boolean(modalErrors.productName)}
                  aria-describedby={describedBy('modal-product-name')}
                  required
                />
              </Field>

              <Field
                label="Product Category"
                htmlFor="modal-product-category"
              >
                <select
                  id="modal-product-category"
                  value={modalForm.productCategory}
                  onChange={(e) =>
                    setModalForm((prev) => ({ ...prev, productCategory: e.target.value }))
                  }
                  className="w-full rounded-lg border border-soft-border bg-input-bg p-3 transition-colors focus:outline-none focus:ring-2 focus-burgundy focus-border-burgundy/24 py-3 appearance-none bg-no-repeat cursor-pointer"
                  style={{
                    backgroundImage:
                      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23353B43'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")",
                    color: "#292D32",
                    paddingLeft: '12px',
                    backgroundPosition: 'right 0.5rem center',
                    backgroundSize: '1.25rem',
                  }}
                >
                  <option value="agricultural">Agricultural Commodities</option>
                  <option value="industrial">Industrial Raw Materials</option>
                  <option value="energy">Energy Commodities</option>
                  <option value="food">Food & Specialty Products</option>
                  <option value="consumer">Consumer Goods</option>
                  <option value="other">Other</option>
                </select>
              </Field>

              <Field
                label="Product Specifications"
                htmlFor="modal-specifications"
              >
                <textarea
                  id="modal-specifications"
                  name="specifications"
                  rows={3}
                  value={modalForm.specifications}
                  onChange={(e) =>
                    setModalForm((prev) => ({ ...prev, specifications: e.target.value }))
                  }
                  placeholder="e.g. Non-GMO, feed grade"
                  className="w-full rounded-lg border border-soft-border bg-input-bg p-3 transition-colors focus:outline-none focus:ring-2 focus-burgundy focus-border-burgundy/24 py-3 resize-y"
                  aria-invalid={false}
                />
              </Field>

              <Field
                label="Estimated Quantity"
                htmlFor="modal-quantity"
              >
                <input
                  id="modal-quantity"
                  type="text"
                  name="estimatedQuantity"
                  value={modalForm.estimatedQuantity}
                  onChange={(e) =>
                    setModalForm((prev) => ({ ...prev, estimatedQuantity: e.target.value }))
                  }
                  placeholder="e.g. 100 tonnes, 500 kg, 1000 units"
                  className="w-full rounded-lg border border-soft-border bg-input-bg p-3 transition-colors focus:outline-none focus:ring-2 focus-burgundy focus-border-burgundy/24 py-3"
                />
              </Field>

              <Field
                label="Country of Origin Preference"
                htmlFor="modal-country"
              >
                <input
                  id="modal-country"
                  type="text"
                  name="countryOfOrigin"
                  value={modalForm.countryOfOrigin}
                  onChange={(e) =>
                    setModalForm((prev) => ({ ...prev, countryOfOrigin: e.target.value }))
                  }
                  placeholder="e.g. Brazil, USA, India"
                  className="w-full rounded-lg border border-soft-border bg-input-bg p-3 transition-colors focus:outline-none focus:ring-2 focus-burgundy focus-border-burgundy/24 py-3"
                />
              </Field>

              <Field
                label="Additional Details"
                htmlFor="modal-additional"
              >
                <textarea
                  id="modal-additional"
                  name="additionalDetails"
                  rows={3}
                  value={modalForm.additionalDetails}
                  onChange={(e) =>
                    setModalForm((prev) => ({ ...prev, additionalDetails: e.target.value }))
                  }
                  placeholder="Share any other relevant information"
                  className="w-full rounded-lg border border-soft-border bg-input-bg p-3 transition-colors focus:outline-none focus:ring-2 focus-burgundy focus-border-burgundy/24 py-3 resize-y"
                  aria-invalid={false}
                />
              </Field>

              <div className="mt-6 space-x-3">
                <button
                  onClick={handleModalCancel}
                  className="flex-1 btn-corporate-outline text-charcoal rounded-lg py-2.5 px-4 text-sm font-medium transition-all duration-200 hover:bg-charcoal hover:text-off-white active:bg-charcoal active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-gold focus-ring-offset-2"
                >
                  Cancel
                </button>
                <button
                  onClick={handleModalSubmit}
                  className="flex-1 btn-corporate rounded-lg py-2.5 px-4 text-sm font-medium transition-all duration-200 hover:bg-graphite hover:shadow-card active:bg-graphite active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-gold focus-ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-graphite disabled:hover:shadow-card"
                  disabled={Object.keys(modalErrors).length > 0}
                >
                  Save Product Details
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </form>
  )
}

function Field({ label, htmlFor, hint, error, errorId, children }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="field-label">
        {label}
        {hint && (
          <span className="ml-2 font-normal normal-case tracking-normal text-steel/80">({hint})</span>
        )}
      </label>
      {children}
      {error && (
        <p id={errorId} role="alert" className="field-error">
          {error}
        </p>
      )}
    </div>
  )
}