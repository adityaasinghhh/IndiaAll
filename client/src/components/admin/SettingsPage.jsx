import { useEffect, useState } from 'react'
import { adminApi } from '../../services/adminApi.js'
import { useToast } from './Toast.jsx'
import { ErrorState, Modal, Pagination, Skeleton, StatusBadge } from './ui.jsx'
import OtpForm from '../../components/auth/OtpForm'

function Field({ label, error, children }) {
  return (
    <div>
      <label className="label-base">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  )
}

function TabButton({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-selected={active}
      role="tab"
      className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
        active ? 'bg-white text-navy shadow-sm' : 'text-muted hover:text-ink'
      }`}
    >
      {children}
    </button>
  )
}

export default function SettingsPage({ admin, onProfileUpdate, onLogout }) {
  const [activeTab, setActiveTab] = useState('profile')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [busy, setBusy] = useState(false)
  const toast = useToast()

  // Profile form
  const [profile, setProfile] = useState({ name: admin?.name || '', email: admin?.email || '' })
  useEffect(() => {
    setProfile({ name: admin?.name || '', email: admin?.email || '' })
  }, [admin?.name, admin?.email])

  // Password form
  const [passwordForm, setPasswordForm] = useState({ current: '', next: '', confirm: '', otp: '' })

  // Business settings (persisted via /settings)
  const [settings, setSettings] = useState(null)
  const [settingsLoading, setSettingsLoading] = useState(true)

  // Audit log
  const [logs, setLogs] = useState([])
  const [logsLoading, setLogsLoading] = useState(false)
  const [logsPage, setLogsPage] = useState(1)
  const [logsPagination, setLogsPagination] = useState(null)

  // Admin management (owner only)
  const [showCreateAdmin, setShowCreateAdmin] = useState(false)
  const [newAdmin, setNewAdmin] = useState({ name: '', email: '', password: '', role: 'editor' })

  const loadSettings = async () => {
    setSettingsLoading(true)
    try {
      const result = await adminApi.getSettings()
      setSettings(result.settings)
    } catch (err) {
      if (err.status !== 401) setError(err.message || 'Unable to load settings.')
    } finally {
      setSettingsLoading(false)
    }
  }

  const loadLogs = async (page = 1) => {
    setLogsLoading(true)
    try {
      const result = await adminApi.getAuditLogs({ page: String(page), limit: '10' })
      setLogs(result.logs)
      setLogsPagination(result.pagination)
    } catch (err) {
      if (err.status !== 401) setError(err.message || 'Unable to load activity log.')
    } finally {
      setLogsLoading(false)
    }
  }

  useEffect(() => {
    if (activeTab === 'business') loadSettings()
    if (activeTab === 'activity') loadLogs(logsPage)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, logsPage])

  const flash = (message) => {
    setNotice(message)
    setTimeout(() => setNotice(''), 4000)
  }

  const submitProfile = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    setNotice('')
    try {
      const result = await adminApi.updateProfile(profile)
      onProfileUpdate?.(result.admin)
      flash('Profile updated.')
    } catch (err) {
      if (err.status !== 401) setError(err.message || 'Unable to update profile.')
    } finally {
      setBusy(false)
    }
  }

  const changePassword = async () => {
    if (passwordForm.next !== passwordForm.confirm) {
      setError('New passwords do not match.')
      return
    }
    if (passwordForm.next.length < 8) {
      setError('New password must be at least 8 characters.')
      return
    }
    if (!passwordForm.otp) {
      setError('Enter the verification code sent to your email.')
      return
    }
    setBusy(true)
    setError('')
    setNotice('')
    try {
      await adminApi.changePassword({
        currentPassword: passwordForm.current,
        newPassword: passwordForm.next,
        otp: passwordForm.otp,
      })
      toast.success('Password changed. Please sign in again.')
      setTimeout(() => onLogout(), 1200)
    } catch (err) {
      if (err.status !== 401) setError(err.message || 'Unable to change password.')
    } finally {
      setBusy(false)
    }
  }

  const requestPasswordCode = async () => {
    setBusy(true)
    setError('')
    setNotice('')
    try {
      const result = await adminApi.requestPasswordOtp()
      toast.success(result.message || 'A verification code has been sent.')
    } catch (err) {
      setError(err.message || 'Unable to send a verification code.')
    } finally {
      setBusy(false)
    }
  }

  const submitSettings = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    setNotice('')
    try {
      await adminApi.updateSettings({
        contactEmail: settings.contactEmail,
        whatsappNumber: settings.whatsappNumber,
        companyProfilePdfUrl: settings.companyProfilePdfUrl || '',
        offices: settings.offices,
      })
      flash('Business settings saved.')
    } catch (err) {
      if (err.status !== 401) setError(err.message || 'Unable to save settings.')
    } finally {
      setBusy(false)
    }
  }

  const submitCreateAdmin = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    setNotice('')
    try {
      await adminApi.createAdmin?.(newAdmin)
      flash(`Admin account created for ${newAdmin.email}.`)
      setShowCreateAdmin(false)
      setNewAdmin({ name: '', email: '', password: '', role: 'editor' })
    } catch (err) {
      if (err.status !== 401) setError(err.message || 'Unable to create admin.')
    } finally {
      setBusy(false)
    }
  }

  const tabs = [
    { id: 'profile', label: 'Profile' },
    { id: 'password', label: 'Password' },
    { id: 'business', label: 'Business info' },
    { id: 'activity', label: 'Activity log' },
    { id: 'security', label: 'Security' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <p className="eyebrow">Administration</p>
        <h2 className="mt-1 font-serif text-2xl font-semibold text-navy">Settings</h2>
      </div>

      <div className="flex gap-1 overflow-x-auto rounded-lg bg-surface p-1" role="tablist">
        {tabs.map((tab) => (
          <TabButton key={tab.id} active={activeTab === tab.id} onClick={() => { setActiveTab(tab.id); setError(''); setNotice('') }}>
            {tab.label}
          </TabButton>
        ))}
      </div>

      {error && <ErrorState title="Action failed" message={error} onRetry={() => setError('')} />}
      {notice && (
        <div role="status" className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800">{notice}</div>
      )}

      {/* Profile */}
      {activeTab === 'profile' && (
        <form onSubmit={submitProfile} className="max-w-lg space-y-4 rounded-xl border border-gray-200 bg-white p-6 shadow-card">
          <h3 className="font-serif text-lg font-semibold text-navy">Admin profile</h3>
          <Field label="Name">
            <input
              id="settings-name" type="text" value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              className="input-base"
            />
          </Field>
          <Field label="Email">
            <input
              id="settings-email" type="email" value={profile.email}
              onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              className="input-base"
            />
          </Field>
          <Field label="Role">
            <p className="rounded-lg bg-surface px-4 py-3 text-sm capitalize text-muted">{admin?.role}</p>
          </Field>
          <button type="submit" disabled={busy} className="btn-primary disabled:opacity-50">
            {busy ? 'Saving…' : 'Save profile'}
          </button>
        </form>
      )}

      {/* Password */}
      {activeTab === 'password' && (
        <div className="max-w-lg space-y-4 rounded-xl border border-gray-200 bg-white p-6 shadow-card">
          <h3 className="font-serif text-lg font-semibold text-navy">Change password</h3>
          <p className="text-sm text-muted">Changing your password signs you out of all sessions and requires signing in again.</p>
          <Field label="Current password">
            <input
              id="settings-current" type="password" autoComplete="current-password"
              value={passwordForm.current}
              onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
              className="input-base"
            />
          </Field>
          <Field label="New password">
            <input
              id="settings-next" type="password" autoComplete="new-password"
              value={passwordForm.next}
              onChange={(e) => setPasswordForm({ ...passwordForm, next: e.target.value })}
              className="input-base"
            />
          </Field>
          <Field label="Confirm new password">
            <input
              id="settings-confirm" type="password" autoComplete="new-password"
              value={passwordForm.confirm}
              onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
              className="input-base"
            />
          </Field>
          <p className="text-xs text-gray-500">
            A one-time code was sent to your administrator email. Enter it together with your new password.
          </p>
          <OtpForm
            error={error}
            loading={busy}
            onSubmit={async (otp) => {
              setPasswordForm((prev) => ({ ...prev, otp }))
              await changePassword()
            }}
            onResend={requestPasswordCode}
            submitLabel="Change password"
          />
        </div>
      )}

      {/* Business info (persisted in SiteSettings) */}
      {activeTab === 'business' && (
        settingsLoading ? (
          <div className="max-w-lg rounded-xl border border-gray-200 bg-white p-6 shadow-card">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="mt-4 h-10 w-full" />
            <Skeleton className="mt-3 h-10 w-full" />
            <Skeleton className="mt-3 h-10 w-full" />
          </div>
        ) : settings ? (
          <form onSubmit={submitSettings} className="max-w-lg space-y-4 rounded-xl border border-gray-200 bg-white p-6 shadow-card">
            <h3 className="font-serif text-lg font-semibold text-navy">Business information</h3>
            <p className="text-sm text-muted">Shown across the public website (contact page, WhatsApp button, enquiry recipient).</p>
            <Field label="Contact email">
              <input
                type="email" value={settings.contactEmail || ''}
                onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                className="input-base"
              />
            </Field>
            <Field label="WhatsApp number">
              <input
                type="text" value={settings.whatsappNumber || ''}
                onChange={(e) => setSettings({ ...settings, whatsappNumber: e.target.value })}
                className="input-base"
                placeholder="+1 555 123 4567"
              />
            </Field>
            <Field label="Company profile PDF URL">
              <input
                type="text" value={settings.companyProfilePdfUrl || ''}
                onChange={(e) => setSettings({ ...settings, companyProfilePdfUrl: e.target.value })}
                className="input-base"
                placeholder="/files/company-profile.pdf or https://…"
              />
            </Field>
            <fieldset className="space-y-3">
              <legend className="label-base">Office addresses</legend>
              {['india', 'brazil', 'canada'].map((office) => (
                <Field key={office} label={office.charAt(0).toUpperCase() + office.slice(1)}>
                  <input
                    type="text"
                    value={settings.offices?.[office]?.address || ''}
                    onChange={(e) => setSettings({
                      ...settings,
                      offices: { ...settings.offices, [office]: { address: e.target.value } },
                    })}
                    className="input-base"
                  />
                </Field>
              ))}
            </fieldset>
            <button type="submit" disabled={busy} className="btn-primary disabled:opacity-50">
              {busy ? 'Saving…' : 'Save business info'}
            </button>
          </form>
        ) : null
      )}

      {/* Activity log */}
      {activeTab === 'activity' && (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-card">
          <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
            <div>
              <h3 className="font-serif text-lg font-semibold text-navy">Administrative activity</h3>
              <p className="text-xs text-muted">Who did what, and when. Sensitive values are never logged.</p>
            </div>
            <button type="button" onClick={() => loadLogs(logsPage)} className="btn-outline px-4 py-2 text-sm">
              Refresh
            </button>
          </div>
          {logsLoading ? (
            <div className="space-y-3 p-5">
              <Skeleton className="h-9 w-full" /><Skeleton className="h-9 w-full" /><Skeleton className="h-9 w-full" />
            </div>
          ) : logs.length === 0 ? (
            <p className="p-10 text-center text-sm text-muted">No administrative activity recorded yet.</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {logs.map((log) => (
                <li key={log._id} className="flex items-center justify-between gap-3 px-5 py-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-ink">{log.action.replace(/_/g, ' ')}</p>
                    <p className="text-xs text-muted">
                      {log.admin?.name || 'Admin'} · {log.targetType}
                      {log.targetId ? ` · ${String(log.targetId).slice(-6)}` : ''}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs text-muted">{new Date(log.createdAt).toLocaleString()}</span>
                </li>
              ))}
            </ul>
          )}
          {logsPagination && logsPagination.pages > 1 && (
            <div className="border-t border-gray-200 p-4">
              <Pagination page={logsPagination.page} pages={logsPagination.pages} total={logsPagination.total} onPageChange={setLogsPage} />
            </div>
          )}
        </div>
      )}

      {/* Security */}
      {activeTab === 'security' && (
        <div className="max-w-lg space-y-4 rounded-xl border border-gray-200 bg-white p-6 shadow-card">
          <h3 className="font-serif text-lg font-semibold text-navy">Security</h3>
          <div className="space-y-3 text-sm text-muted">
            <p>Your account is protected by:</p>
            <ul className="list-inside list-disc space-y-1">
              <li>BCrypt password hashing (12 rounds)</li>
              <li>Login attempt limiting (5 attempts, 2-hour lockout)</li>
              <li>HTTP-only, SameSite=Strict cookies</li>
              <li>Server-side session invalidation on logout and password change</li>
              <li>Role-based access control ({admin?.role})</li>
              <li>Audit logging of sensitive administrative actions</li>
            </ul>
          </div>
          <div className="border-t border-gray-200 pt-4">
            <button type="button" onClick={onLogout} className="btn-outline">
              Sign out of all sessions
            </button>
          </div>
        </div>
      )}

      {/* Create admin modal (owner only) */}
      <Modal open={showCreateAdmin} onClose={() => setShowCreateAdmin(false)} title="Create admin account">
        <form onSubmit={submitCreateAdmin} className="space-y-4">
          <Field label="Name">
            <input
              type="text" value={newAdmin.name}
              onChange={(e) => setNewAdmin({ ...newAdmin, name: e.target.value })}
              className="input-base"
            />
          </Field>
          <Field label="Email">
            <input
              type="email" value={newAdmin.email}
              onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
              className="input-base"
            />
          </Field>
          <Field label="Password (min 8 characters)">
            <input
              type="password" autoComplete="new-password" value={newAdmin.password}
              onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
              className="input-base"
            />
          </Field>
          <Field label="Role">
            <select
              value={newAdmin.role}
              onChange={(e) => setNewAdmin({ ...newAdmin, role: e.target.value })}
              className="input-base"
            >
              <option value="editor">Editor — manage orders, enquiries, customers</option>
              <option value="viewer">Viewer — read-only access</option>
              <option value="owner">Owner — full access incl. product deletion</option>
            </select>
          </Field>
          <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
            <button type="button" onClick={() => setShowCreateAdmin(false)} className="btn-outline" disabled={busy}>Cancel</button>
            <button type="submit" disabled={busy} className="btn-primary disabled:opacity-50">
              {busy ? 'Creating…' : 'Create admin'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
