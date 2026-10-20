import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { adminApi, downloadCsv } from '../../services/adminApi.js'
import { useToast } from './Toast.jsx'
import {
  ConfirmDialog,
  DataTable,
  ErrorState,
  Modal,
  Pagination,
} from './ui.jsx'

const CATEGORIES = ['energy', 'agriculture', 'metals']
const PAGE_SIZE = 20

const emptyForm = {
  name: '', slug: '', category: 'energy',
  description: { en: '', es: '', pt: '' },
  image: '', origin: '', order: 0, visible: true,
}

function validateForm(form) {
  const errors = {}
  if (!form.name.trim() || form.name.trim().length < 2) errors.name = 'Name is required (min 2 characters).'
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(form.slug)) errors.slug = 'Slug must be lowercase letters, numbers and hyphens.'
  if (!form.description.en.trim() || form.description.en.trim().length < 10) errors.descriptionEn = 'English description is required (min 10 characters).'
  if (!form.description.es.trim()) errors.descriptionEs = 'Spanish description is required.'
  if (!form.description.pt.trim()) errors.descriptionPt = 'Portuguese description is required.'
  if (form.image && !/^(https?:\/\/|\/)/.test(form.image)) errors.image = 'Image must be an absolute URL (https://…) or a site-relative path (/…).'
  return errors
}

export default function ProductsPage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [visibilityFilter, setVisibilityFilter] = useState('')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [formErrors, setFormErrors] = useState({})
  const [busy, setBusy] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const toast = useToast()
  const requestId = useRef(0)

  useEffect(() => {
    const handle = setTimeout(() => { setSearch(searchInput); setPage(1) }, 350)
    return () => clearTimeout(handle)
  }, [searchInput])

  const load = useCallback(async () => {
    const id = ++requestId.current
    setLoading(true)
    setError('')
    try {
      const params = { page: String(page), limit: String(PAGE_SIZE) }
      if (search) params.search = search
      if (categoryFilter) params.category = categoryFilter
      if (visibilityFilter) params.visibility = visibilityFilter
      const result = await adminApi.getProducts(params)
      if (id !== requestId.current) return
      setProducts(result.products)
      setPagination(result.pagination)
    } catch (err) {
      if (err.status === 401) return
      if (id !== requestId.current) return
      setError(err.message || 'Unable to load products.')
    } finally {
      if (id === requestId.current) setLoading(false)
    }
  }, [page, search, categoryFilter, visibilityFilter])

  useEffect(() => { load() }, [load])

  const openCreate = () => {
    setForm(emptyForm)
    setFormErrors({})
    setEditingId(null)
    setShowForm(true)
  }

  const openEdit = (product) => {
    setForm({
      name: product.name || '',
      slug: product.slug || '',
      category: product.category || 'energy',
      description: {
        en: product.description?.en || '',
        es: product.description?.es || '',
        pt: product.description?.pt || '',
      },
      image: product.image || '',
      origin: product.origin || '',
      order: product.order || 0,
      visible: product.visible !== false,
    })
    setFormErrors({})
    setEditingId(product._id)
    setShowForm(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errors = validateForm(form)
    setFormErrors(errors)
    if (Object.keys(errors).length > 0) return

    setBusy(true)
    setError('')
    try {
      const payload = {
        ...form,
        name: form.name.trim(),
        slug: form.slug.trim().toLowerCase(),
        order: Number(form.order) || 0,
      }
      if (editingId) {
        await adminApi.updateProduct(editingId, payload)
        toast.success('Product updated.')
      } else {
        await adminApi.createProduct(payload)
        toast.success('Product created.')
      }
      setShowForm(false)
      load()
    } catch (err) {
      if (err.status === 401) return
      if (err.status === 409) {
        setFormErrors({ slug: 'A product with this slug already exists.' })
      } else {
        setError(err.message || 'Unable to save product.')
      }
    } finally {
      setBusy(false)
    }
  }

  const toggleVisibility = async (product) => {
    setError('')
    try {
      await adminApi.updateProduct(product._id, { visible: !product.visible })
      toast.success(`${product.name} is now ${!product.visible ? 'visible' : 'hidden'}.`)
      load()
    } catch (err) {
      if (err.status !== 401) toast.error(err.message || 'Unable to update visibility.')
    }
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    setBusy(true)
    try {
      await adminApi.deleteProduct(deleteTarget._id)
      toast.success(`“${deleteTarget.name}” deleted.`)
      setDeleteTarget(null)
      load()
    } catch (err) {
      if (err.status !== 401) toast.error(err.message || 'Unable to delete product.')
    } finally {
      setBusy(false)
    }
  }

  const exportCsv = async () => {
    try {
      await downloadCsv('/admin/products/export/csv', 'products.csv')
      toast.success('Products CSV downloaded.')
    } catch (err) {
      toast.error(err.message || 'Unable to export CSV.')
    }
  }

  const columns = useMemo(() => [
    {
      key: 'name', label: 'Product',
      render: (p) => (
        <div className="flex items-center gap-3">
          <img src={p.image} alt="" className="h-10 w-10 rounded-lg border border-gray-100 object-cover" loading="lazy" />
          <div>
            <p className="font-medium text-ink">{p.name}</p>
            <p className="text-xs text-muted">{p.slug}</p>
          </div>
        </div>
      ),
    },
    { key: 'category', label: 'Category', render: (p) => <span className="rounded-full bg-surface px-2.5 py-1 text-xs font-semibold capitalize text-steel">{p.category}</span> },
    { key: 'origin', label: 'Origin', render: (p) => <span className="text-muted">{p.origin || '—'}</span> },
    { key: 'order', label: 'Order', render: (p) => <span className="text-muted">{p.order}</span> },
    {
      key: 'visible', label: 'Status',
      render: (p) => (
        <button
          type="button"
          onClick={() => toggleVisibility(p)}
          className={`rounded-full px-2.5 py-1 text-xs font-semibold transition-colors ${
            p.visible ? 'bg-green-100 text-green-800 hover:bg-green-200' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
          aria-pressed={p.visible}
        >
          {p.visible ? 'Visible' : 'Hidden'}
        </button>
      ),
    },
    {
      key: 'actions', label: '',
      render: (p) => (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => openEdit(p)}
            className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-ink transition-colors hover:border-gold hover:text-gold-dark"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => setDeleteTarget(p)}
            className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50"
          >
            Delete
          </button>
        </div>
      ),
    },
  ], [])

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="eyebrow">Catalogue</p>
          <h2 className="mt-1 font-serif text-2xl font-semibold text-navy">Products</h2>
          <p className="mt-1 text-sm text-muted">Changes apply to the public catalogue immediately.</p>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={exportCsv} className="btn-outline px-4 py-2 text-sm">Export CSV</button>
          <button type="button" onClick={openCreate} className="btn-primary">Add product</button>
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-card lg:flex-row lg:items-end">
        <div className="flex-1">
          <label htmlFor="product-search" className="label-base">Search</label>
          <input
            id="product-search"
            type="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by name or slug…"
            className="input-base"
          />
        </div>
        <div>
          <label htmlFor="product-category" className="label-base">Category</label>
          <select
            id="product-category"
            value={categoryFilter}
            onChange={(e) => { setCategoryFilter(e.target.value); setPage(1) }}
            className="input-base w-full lg:w-44"
          >
            <option value="">All categories</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="product-visibility" className="label-base">Visibility</label>
          <select
            id="product-visibility"
            value={visibilityFilter}
            onChange={(e) => { setVisibilityFilter(e.target.value); setPage(1) }}
            className="input-base w-full lg:w-40"
          >
            <option value="">All</option>
            <option value="visible">Visible</option>
            <option value="hidden">Hidden</option>
          </select>
        </div>
      </div>

      {error && <ErrorState title="Unable to load products" message={error} onRetry={load} />}

      <DataTable
        columns={columns}
        rows={products}
        rowKey={(p) => p._id}
        loading={loading}
        emptyMessage={search || categoryFilter || visibilityFilter ? 'No products match the current filters.' : 'No products yet. Add your first commodity to start building the catalogue.'}
      />

      {pagination && (
        <Pagination page={pagination.page} pages={pagination.pages} total={pagination.total} onPageChange={setPage} />
      )}

      {/* Create / edit modal */}
      <Modal open={showForm} onClose={() => setShowForm(false)} title={editingId ? 'Edit product' : 'Add product'} wide>
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="pf-name" className="label-base">Name *</label>
              <input
                id="pf-name" type="text" value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className={`input-base ${formErrors.name ? 'input-error' : ''}`}
              />
              {formErrors.name && <p className="mt-1 text-xs text-red-600">{formErrors.name}</p>}
            </div>
            <div>
              <label htmlFor="pf-slug" className="label-base">Slug *</label>
              <input
                id="pf-slug" type="text" value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                className={`input-base ${formErrors.slug ? 'input-error' : ''}`}
                placeholder="e.g. crude-oil"
              />
              {formErrors.slug && <p className="mt-1 text-xs text-red-600">{formErrors.slug}</p>}
            </div>
            <div>
              <label htmlFor="pf-category" className="label-base">Category *</label>
              <select
                id="pf-category" value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="input-base"
              >
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="pf-order" className="label-base">Sort order</label>
              <input
                id="pf-order" type="number" min="0" value={form.order}
                onChange={(e) => setForm({ ...form, order: parseInt(e.target.value, 10) || 0 })}
                className="input-base"
              />
            </div>
          </div>

          <div>
            <label htmlFor="pf-image" className="label-base">Image URL *</label>
            <input
              id="pf-image" type="text" value={form.image}
              onChange={(e) => setForm({ ...form, image: e.target.value })}
              className={`input-base ${formErrors.image ? 'input-error' : ''}`}
              placeholder="/images/products/example.svg or https://…"
            />
            {formErrors.image && <p className="mt-1 text-xs text-red-600">{formErrors.image}</p>}
            <p className="mt-1 text-xs text-muted">Use a site-relative path or an absolute HTTPS URL. No server file paths.</p>
          </div>

          <div>
            <label htmlFor="pf-origin" className="label-base">Origin</label>
            <input
              id="pf-origin" type="text" value={form.origin}
              onChange={(e) => setForm({ ...form, origin: e.target.value })}
              className="input-base"
              placeholder="Common origins: Middle East, USA, Brazil…"
            />
          </div>

          <div>
            <label htmlFor="pf-desc-en" className="label-base">Description (English) *</label>
            <textarea
              id="pf-desc-en" rows={3} value={form.description.en}
              onChange={(e) => setForm({ ...form, description: { ...form.description, en: e.target.value } })}
              className={`input-base ${formErrors.descriptionEn ? 'input-error' : ''}`}
            />
            {formErrors.descriptionEn && <p className="mt-1 text-xs text-red-600">{formErrors.descriptionEn}</p>}
          </div>
          <div>
            <label htmlFor="pf-desc-es" className="label-base">Description (Spanish) *</label>
            <textarea
              id="pf-desc-es" rows={2} value={form.description.es}
              onChange={(e) => setForm({ ...form, description: { ...form.description, es: e.target.value } })}
              className={`input-base ${formErrors.descriptionEs ? 'input-error' : ''}`}
            />
            {formErrors.descriptionEs && <p className="mt-1 text-xs text-red-600">{formErrors.descriptionEs}</p>}
          </div>
          <div>
            <label htmlFor="pf-desc-pt" className="label-base">Description (Portuguese) *</label>
            <textarea
              id="pf-desc-pt" rows={2} value={form.description.pt}
              onChange={(e) => setForm({ ...form, description: { ...form.description, pt: e.target.value } })}
              className={`input-base ${formErrors.descriptionPt ? 'input-error' : ''}`}
            />
            {formErrors.descriptionPt && <p className="mt-1 text-xs text-red-600">{formErrors.descriptionPt}</p>}
          </div>

          <label className="flex items-center gap-3">
            <input
              id="pf-visible" type="checkbox" checked={form.visible}
              onChange={(e) => setForm({ ...form, visible: e.target.checked })}
              className="h-4 w-4 rounded accent-[#C9A24B]"
            />
            <span className="text-sm text-ink">Visible in the public catalogue</span>
          </label>

          <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
            <button type="button" onClick={() => setShowForm(false)} className="btn-outline" disabled={busy}>Cancel</button>
            <button type="submit" disabled={busy} className="btn-primary disabled:opacity-50">
              {busy ? 'Saving…' : editingId ? 'Update product' : 'Create product'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        busy={busy}
        title="Delete product"
        message={`Permanently delete “${deleteTarget?.name}”? This cannot be undone. Consider hiding it instead if you want to keep the record.`}
        confirmLabel="Delete product"
        danger
      />
    </div>
  )
}
