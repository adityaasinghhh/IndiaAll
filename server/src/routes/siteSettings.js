import { Router } from 'express'
import SiteSettings from '../models/SiteSettings.js'
import { authenticateAdmin } from '../middleware/auth.js'

const router = Router()

router.get('/', async (req, res, next) => {
  try {
    let settings = await SiteSettings.findOne()
    if (!settings) {
      settings = await SiteSettings.create({})
    }
    res.json({ settings })
  } catch (error) {
    next(error)
  }
})

router.put('/', authenticateAdmin, async (req, res, next) => {
  try {
    const { maintenanceMode, contactEmail, companyProfilePdfUrl, offices, dataRetentionDays } = req.body

    let settings = await SiteSettings.findOne()
    if (!settings) {
      settings = await SiteSettings.create({})
    }

    if (maintenanceMode !== undefined) settings.maintenanceMode = maintenanceMode
    if (contactEmail) settings.contactEmail = contactEmail
    if (companyProfilePdfUrl !== undefined) settings.companyProfilePdfUrl = companyProfilePdfUrl
    if (offices) {
      if (offices.india) settings.offices.india.address = offices.india.address
      if (offices.brazil) settings.offices.brazil.address = offices.brazil.address
      if (offices.canada) settings.offices.canada.address = offices.canada.address
    }
    if (dataRetentionDays) settings.dataRetentionDays = parseInt(dataRetentionDays)

    await settings.save()
    res.json({ message: 'Settings updated', settings })
  } catch (error) {
    next(error)
  }
})

export default router
