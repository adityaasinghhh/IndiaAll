import mongoose from 'mongoose'

const siteSettingsSchema = new mongoose.Schema(
  {
    maintenanceMode: { type: Boolean, default: true },
    contactEmail: { type: String, default: 'Info@indiaall.org' },
    companyProfilePdfUrl: { type: String, default: '' },
    offices: {
      india: { address: { type: String, default: 'Bakhtawarpur, Delhi 110036' } },
      brazil: { address: { type: String, default: 'Osvaldo Aranha No. 267, Centro, Tapes, Rio Grande do Sul, 96760-000' } },
      // TODO: Add full Edmonton, Canada address
      canada: { address: { type: String, default: 'Edmonton, Alberta' } },
    },
    dataRetentionDays: { type: Number, default: 365 },
  },
  { timestamps: true }
)

export default mongoose.model('SiteSettings', siteSettingsSchema)
