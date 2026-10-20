import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function ProfileTab() {
  const { customer, updateProfile, changePassword, deleteAccount } = useAuth()
  const navigate = useNavigate()

  const [profile, setProfile] = useState({
    name: customer?.name || '',
    company: customer?.company || '',
    country: customer?.country || '',
    phone: customer?.phone || '',
  })
  const [profileMsg, setProfileMsg] = useState('')

  const [pwd, setPwd] = useState({ currentPassword: '', newPassword: '' })
  const [pwdMsg, setPwdMsg] = useState('')

  const [showDelete, setShowDelete] = useState(false)
  const [deletePwd, setDeletePwd] = useState('')
  const [deleteMsg, setDeleteMsg] = useState('')

  const inputClass =
    'w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold'

  const handleProfile = async (e) => {
    e.preventDefault()
    setProfileMsg('')
    try {
      await updateProfile(profile)
      setProfileMsg('Profile updated successfully')
    } catch (err) {
      setProfileMsg(err.message)
    }
  }

  const handlePassword = async (e) => {
    e.preventDefault()
    setPwdMsg('')
    try {
      await changePassword(pwd)
      setPwd({ currentPassword: '', newPassword: '' })
      setPwdMsg('Password changed. Please log in again.')
    } catch (err) {
      setPwdMsg(err.message)
    }
  }

  const handleDelete = async (e) => {
    e.preventDefault()
    setDeleteMsg('')
    try {
      await deleteAccount(deletePwd)
    } catch (err) {
      setDeleteMsg(err.message)
    }
  }

  return (
    <div className="space-y-8">
      {/* Profile */}
      <div>
        <h3 className="font-serif text-xl text-navy mb-4">Profile Information</h3>
        {profileMsg && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm mb-4">
            {profileMsg}
          </div>
        )}
        <form onSubmit={handleProfile} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-ink mb-1">Full Name</label>
            <input type="text" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-1">Company</label>
            <input type="text" value={profile.company} onChange={(e) => setProfile({ ...profile, company: e.target.value })} className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-1">Country</label>
            <input type="text" value={profile.country} onChange={(e) => setProfile({ ...profile, country: e.target.value })} className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-1">Phone</label>
            <input type="tel" value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} className={inputClass} />
          </div>
          <button type="submit" className="btn-primary">Save Changes</button>
        </form>
      </div>

      {/* Change Password */}
      <div className="pt-6 border-t border-gray-200">
        <h3 className="font-serif text-xl text-navy mb-4">Change Password</h3>
        {pwdMsg && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm mb-4">
            {pwdMsg}
          </div>
        )}
        <form onSubmit={handlePassword} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-ink mb-1">Current Password</label>
            <input type="password" value={pwd.currentPassword} onChange={(e) => setPwd({ ...pwd, currentPassword: e.target.value })} className={inputClass} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-1">New Password</label>
            <input type="password" value={pwd.newPassword} onChange={(e) => setPwd({ ...pwd, newPassword: e.target.value })} className={inputClass} required minLength={8} />
          </div>
          <button type="submit" className="btn-primary">Change Password</button>
        </form>
      </div>

      {/* Delete Account */}
      <div className="pt-6 border-t border-gray-200">
        <h3 className="font-serif text-xl text-red-600 mb-4">Delete Account</h3>
        <p className="text-sm text-gray-600 mb-4">
          This action cannot be undone. All your data will be permanently removed.
        </p>
        {!showDelete ? (
          <button onClick={() => setShowDelete(true)} className="px-4 py-2 bg-red-50 text-red-600 font-medium rounded-lg hover:bg-red-100 transition-colors">
            Delete My Account
          </button>
        ) : (
          <form onSubmit={handleDelete} className="space-y-4">
            {deleteMsg && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {deleteMsg}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-ink mb-1">Enter password to confirm</label>
              <input type="password" value={deletePwd} onChange={(e) => setDeletePwd(e.target.value)} className={inputClass} required />
            </div>
            <div className="flex gap-3">
              <button type="submit" className="px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors">
                Confirm Delete
              </button>
              <button type="button" onClick={() => { setShowDelete(false); setDeletePwd('') }} className="px-4 py-2 bg-gray-100 text-ink font-medium rounded-lg hover:bg-gray-200 transition-colors">
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Multi-factor authentication */}
      <div className="pt-6 border-t border-gray-200">
        <h3 className="font-serif text-xl text-navy mb-4">Multi-factor authentication</h3>
        <p className="text-sm text-gray-600 mb-4">
          Add an authenticator app (TOTP) as a second factor for sign in.
        </p>
        <button
          onClick={() => navigate('/auth/mfa/enroll')}
          className="btn-primary"
        >
          Set up authenticator app
        </button>
      </div>
    </div>
  )
}
