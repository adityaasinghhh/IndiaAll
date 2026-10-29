import mongoose from 'mongoose'
import dotenv from 'dotenv'
import { config } from './env.js'
import { connectDatabase } from './database.js'
import Admin from '../models/Admin.js'
import Product from '../models/Product.js'
import SiteSettings from '../models/SiteSettings.js'
import { products as catalogue } from '../data/products.js'

dotenv.config()

// Seed the canonical product catalogue so the admin manages exactly the
// records the public site displays. The server copy under src/data/ is kept in
// sync with the frontend source of truth via `npm run sync:catalogue`.
const seedProducts = catalogue.map((product) => ({
  name: product.name,
  slug: product.slug,
  category: product.category,
  image: product.image,
  origin: product.origin,
  order: product.order,
  visible: product.visible,
  description: {
    en: product.description,
    es: product.description,
    pt: product.description,
  },
}))

const runSeed = async () => {
  await connectDatabase()

  console.log('Seeding database...')

  // Create admin user
  const existingAdmin = await Admin.findOne({ email: config.admin.email })
  if (!existingAdmin) {
    await Admin.create({
      name: 'Admin',
      email: config.admin.email,
      password: config.admin.password,
      role: 'owner',
    })
    console.log('Admin user created:', config.admin.email)
  } else {
    console.log('Admin user already exists')
  }

  // Create products
  const productCount = await Product.countDocuments()
  if (productCount === 0) {
    await Product.insertMany(seedProducts)
    console.log(`Created ${seedProducts.length} products`)
  } else {
    console.log('Products already exist, skipping')
  }

  // Create site settings
  const settings = await SiteSettings.findOne()
  if (!settings) {
    await SiteSettings.create({})
    console.log('Site settings created')
  }

  console.log('Seed complete!')
  process.exit(0)
}

runSeed().catch((error) => {
  console.error('Seed failed:', error)
  process.exit(1)
})
