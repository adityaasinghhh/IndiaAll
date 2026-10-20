import { useState, useEffect } from 'react'
import { api } from '../../services/api'

// TODO: Replace with actual company profile PDF URL once uploaded to admin panel
const COMPANY_PROFILE_PDF_URL = ''

export default function DownloadsTab() {
  const [settings, setSettings] = useState(null)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const res = await api.get('/settings')
      setSettings(res.settings)
    } catch (err) {
      console.error('Failed to load settings:', err)
    }
  }

  const pdfUrl = COMPANY_PROFILE_PDF_URL || settings?.companyProfilePdfUrl

  return (
    <div>
      <h3 className="font-serif text-xl text-navy mb-4">Downloads</h3>
      <p className="text-sm text-gray-600 mb-6">
        Download our company profile for detailed information about INDIA ALL, our services and our product range.
      </p>

      {pdfUrl ? (
        <a
          href={pdfUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-6 py-3 bg-gold text-navy font-medium rounded-lg hover:bg-gold-dark hover:text-white transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Download Company Profile (PDF)
        </a>
      ) : (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg text-sm">
          Company profile PDF is not yet available. Please check back later or contact us at{' '}
          <a href="mailto:Info@indiaall.org" className="underline font-medium">Info@indiaall.org</a>.
        </div>
      )}
    </div>
  )
}
