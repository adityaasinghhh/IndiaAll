import { useState, useEffect } from 'react'
import { api } from '../../services/api'

const statusColors = {
  new: 'bg-blue-100 text-blue-800',
  in_review: 'bg-yellow-100 text-yellow-800',
  quoted: 'bg-green-100 text-green-800',
  closed: 'bg-gray-100 text-gray-800',
}

const statusLabels = {
  new: 'New',
  in_review: 'In Review',
  quoted: 'Quoted',
  closed: 'Closed',
}

export default function EnquiriesTab() {
  const [enquiries, setEnquiries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [expanded, setExpanded] = useState(null)

  useEffect(() => {
    fetchEnquiries()
  }, [])

  const fetchEnquiries = async () => {
    try {
      const res = await api.get('/enquiries/my')
      setEnquiries(res.enquiries)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="text-center py-8 text-gray-500">Loading...</div>
  if (error) return <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">{error}</div>
  if (enquiries.length === 0) return <div className="text-center py-8 text-gray-500">No enquiries yet.</div>

  return (
    <div className="space-y-4">
      <h3 className="font-serif text-xl text-navy mb-4">My Enquiries</h3>
      {enquiries.map((enquiry) => (
        <div key={enquiry._id} className="border border-gray-200 rounded-lg overflow-hidden">
          <button
            onClick={() => setExpanded(expanded === enquiry._id ? null : enquiry._id)}
            className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
          >
            <div>
              <p className="font-medium text-ink">{enquiry.commodity}</p>
              <p className="text-sm text-gray-500">{new Date(enquiry.createdAt).toLocaleDateString()}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[enquiry.status]}`}>
              {statusLabels[enquiry.status]}
            </span>
          </button>
          {expanded === enquiry._id && (
            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                <div><span className="font-medium">Quantity:</span> {enquiry.quantity}</div>
                <div><span className="font-medium">Location:</span> {enquiry.deliveryLocation}</div>
                {enquiry.message && <div className="col-span-2"><span className="font-medium">Message:</span> {enquiry.message}</div>}
              </div>
              {enquiry.replies && enquiry.replies.length > 0 && (
                <div className="mt-4 space-y-3">
                  <p className="font-medium text-sm">Replies:</p>
                  {enquiry.replies.map((reply, i) => (
                    <div key={i} className="bg-white p-3 rounded-lg border border-gray-200">
                      <p className="text-sm text-gray-700">{reply.message}</p>
                      <p className="text-xs text-gray-400 mt-1">{new Date(reply.createdAt).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
