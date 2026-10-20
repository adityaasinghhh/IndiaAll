import mongoose from 'mongoose'
import dotenv from 'dotenv'
import { config } from './env.js'
import { connectDatabase } from './database.js'
import Admin from '../models/Admin.js'
import Product from '../models/Product.js'
import SiteSettings from '../models/SiteSettings.js'

dotenv.config()

const seedProducts = [
  { name: 'Crude Oil', slug: 'crude-oil', category: 'energy', image: '/images/products/crude-oil-hero.jpg', description: { en: 'Traded in various grades including Brent, WTI and Dubai. Used for refining into fuels and petrochemicals.', es: 'Comercializado en varios grados incluyendo Brent, WTI y Dubai. Utilizado para refinar en combustibles y petroquímicos.', pt: 'Negociado em vários graus, incluindo Brent, WTI e Dubai. Usado para refinar em combustíveis e petroquímicos.' }, origin: 'Common origins: Middle East, USA, Russia', order: 1 },
  { name: 'Gasoline', slug: 'gasoline', category: 'energy', image: '/images/products/gasoline-hero.jpg', description: { en: 'Motor spirit refined from crude oil. Available in various octane ratings for automotive use.', es: 'Gasolina refinada del petróleo crudo. Disponible en varios índices de octanaje para uso automotriz.', pt: 'Gasolina refinada do petróleo bruto. Disponível em vários índices de octanagem para uso automotivo.' }, origin: 'Common origins: USA, India, Middle East', order: 2 },
  { name: 'Bitumen', slug: 'bitumen', category: 'energy', image: '/images/products/bitumen-hero.jpg', description: { en: 'Viscous petroleum product used for road construction, roofing and waterproofing applications.', es: 'Producto petrolero viscoso usado para construcción de carreteras, techados e impermeabilización.', pt: 'Produto petrolífero viscoso usado para construção de estradas, coberturas e impermeabilização.' }, origin: 'Common origins: Middle East, Venezuela, Canada', order: 3 },
  { name: 'Aviation Fuel', slug: 'aviation-fuel', category: 'energy', image: '/images/products/aviation-fuel-hero.jpg', description: { en: 'Jet A and Jet A-1 turbine fuels for commercial and military aviation. Strict quality specifications.', es: 'Combustibles de turbina Jet A y Jet A-1 para aviación comercial y militar. Especificaciones de calidad estrictas.', pt: 'Combustíveis de turbina Jet A e Jet A-1 para aviação comercial e militar. Especificações de qualidade rigorosas.' }, origin: 'Common origins: USA, South Korea, Middle East', order: 4 },
  { name: 'Diesel (EN590)', slug: 'diesel-en590', category: 'energy', image: '/images/products/diesel-en590-hero.jpg', description: { en: 'Ultra-low sulphur diesel meeting European EN590 specification for automotive and industrial use.', es: 'Diésel de ultra bajo azufre que cumple la especificación europea EN590 para uso automotriz e industrial.', pt: 'Diesel de ultra baixo enxofre que atende a especificação europeia EN590 para uso automotivo e industrial.' }, origin: 'Common origins: Russia, India, Middle East', order: 5 },
  { name: 'Di-Ammonium Phosphate (DAP)', slug: 'dap', category: 'energy', image: '/images/products/dap-hero.jpg', description: { en: 'High-analysis nitrogen-phosphorus fertilizer. Contains 18% N and 46% P2O5. Essential for crop nutrition.', es: 'Fertilizante de nitrógeno-fósforo de alto análisis. Contiene 18% N y 46% P2O5. Esencial para la nutrición de cultivos.', pt: 'Fertilizante de nitrogênio-fósforo de alta análise. Contém 18% N e 46% P2O5. Essencial para a nutrição de culturas.' }, origin: 'Common origins: China, Morocco, Saudi Arabia', order: 6 },
  { name: 'D6', slug: 'd6', category: 'energy', image: '', description: { en: 'Residual fuel oil used in power generation and large marine engines. Also known as Bunker C or residual fuel.', es: 'Fuel oil residual usado en generación de energía y grandes motores marinos. También conocido como Bunker C o combustible residual.', pt: 'Óleo combustível residual usado em geração de energia e grandes motores marinhos. Também conhecido como Bunker C ou combustível residual.' }, origin: 'Common origins: Russia, Middle East', order: 7 },
  { name: 'LNG / LPG', slug: 'lng-lpg', category: 'energy', image: '/images/products/lng-lpg-hero.jpg', description: { en: 'Liquefied Natural Gas and Liquefied Petroleum Gas for energy, heating and petrochemical applications.', es: 'Gas Natural Licuado y Gas Petrolero Licuado para aplicaciones energéticas, de calefacción y petroquímicas.', pt: 'Gás Natural Liquefeito e Gás Petrolífero Liquefeito para aplicações energéticas, aquecimento e petroquímicas.' }, origin: 'Common origins: USA, Qatar, Australia', order: 8 },
  { name: 'Petcoke', slug: 'petcoke', category: 'energy', image: '', description: { en: 'Petroleum coke used as a fuel in cement kilns, power plants and various industrial applications.', es: 'Coque de petróleo usado como combustible en hornos de cemento, centrales eléctricas y varias aplicaciones industriales.', pt: 'Coque de petróleo usado como combustível em fornos de cimento, usinas elétricas e várias aplicações industriais.' }, origin: 'Common origins: USA, China, India', order: 9 },
  { name: 'Sulphur', slug: 'sulphur', category: 'energy', image: '/images/products/sulphur-hero.jpg', description: { en: 'Elemental sulphur used in fertilizer production, chemicals, rubber and various industrial processes.', es: 'Azufre elemental usado en producción de fertilizantes, químicos, caucho y varios procesos industriales.', pt: 'Enxofre elementar usado na produção de fertilizantes, químicos, borracha e vários processos industriais.' }, origin: 'Common origins: Saudi Arabia, Kazakhstan, Canada', order: 10 },
  { name: 'Urea', slug: 'urea', category: 'energy', image: '/images/products/urea-hero.jpg', description: { en: 'The most widely used nitrogen fertilizer. Contains 46% nitrogen. Essential for global agriculture.', es: 'El fertilizante nitrogenado más utilizado. Contiene 46% de nitrógeno. Esencial para la agricultura global.', pt: 'O fertilizante nitrogenado mais utilizado. Contém 46% de nitrogênio. Essencial para a agricultura global.' }, origin: 'Common origins: China, India, Middle East', order: 11 },
  { name: 'NPK', slug: 'npk', category: 'energy', image: '', description: { en: 'Compound fertilizer containing nitrogen, phosphorus and potassium in various ratios for balanced crop nutrition.', es: 'Fertilizante compuesto que contiene nitrógeno, fósforo y potasio en varias proporciones para una nutrición equilibrada de cultivos.', pt: 'Fertilizante composto contendo nitrogênio, fósforo e potássio em várias proporções para nutrição equilibrada de culturas.' }, origin: 'Common origins: China, Russia, India', order: 12 },
  { name: 'Sugar (ICUMSA 45 / Brown)', slug: 'sugar', category: 'agriculture', image: '/images/products/sugar-hero.jpg', description: { en: 'Refined white sugar ICUMSA 45 and brown sugar for food industry, retail and industrial applications.', es: 'Azúcar blanco refinado ICUMSA 45 y azúcar moreno para industria alimentaria, retail y aplicaciones industriales.', pt: 'Açúcar branco refinado ICUMSA 45 e açúcar mascavo para indústria alimentícia, varejo e aplicações industriais.' }, origin: 'Common origins: Brazil, India, Thailand', order: 13 },
  { name: 'Soybean & By-products', slug: 'soybean', category: 'agriculture', image: '/images/products/soybean-hero.jpg', description: { en: 'Whole soybeans, soybean meal and soybean oil for animal feed, food processing and biodiesel production.', es: 'Soja entera, harina de soja y aceite de soja para alimentación animal, procesamiento de alimentos y producción de biodiesel.', pt: 'Soja em grãos, farelo de soja e óleo de soja para ração animal, processamento de alimentos e produção de biodiesel.' }, origin: 'Common origins: Brazil, USA, Argentina', order: 14 },
  { name: 'Wheat', slug: 'wheat', category: 'agriculture', image: '/images/products/wheat-hero.jpg', description: { en: 'Various wheat grades including hard red winter, soft white and durum for milling and food production.', es: 'Varios grados de trigo incluyendo rojo duro de invierno, blanco blando y duro para molienda y producción de alimentos.', pt: 'Vários graus de trigo, incluindo vermelho duro de inverno, branco macio e duro para moagem e produção de alimentos.' }, origin: 'Common origins: Russia, USA, Canada, Australia', order: 15 },
  { name: 'Olive Oil', slug: 'olive-oil', category: 'agriculture', image: '/images/products/olive-oil-hero.jpg', description: { en: 'Extra virgin, virgin and refined olive oil for culinary, pharmaceutical and cosmetic applications.', es: 'Aceite de oliva virgen extra, virgen y refinado para aplicaciones culinarias, farmacéuticas y cosméticas.', pt: 'Azeite de oliva extra virgem, virgem e refinado para aplicações culinárias, farmacêuticas e cosméticas.' }, origin: 'Common origins: Spain, Italy, Greece, Tunisia', order: 16 },
  { name: 'Corn', slug: 'corn', category: 'agriculture', image: '/images/products/corn-hero.jpg', description: { en: 'Yellow and white corn for animal feed, food processing, starch production and ethanol manufacturing.', es: 'Maíz amarillo y blanco para alimentación animal, procesamiento de alimentos, produção de almidón y fabricação de etanol.', pt: 'Milho amarelo e branco para ração animal, processamento de alimentos, produção de amido e fabricação de etanol.' }, origin: 'Common origins: USA, Brazil, Argentina, Ukraine', order: 17 },
  { name: 'Sunflower Oil', slug: 'sunflower-oil', category: 'agriculture', image: '/images/products/sunflower-oil-hero.jpg', description: { en: 'High-quality sunflower oil for food industry, cooking and margarine production.', es: 'Aceite de girasol de alta calidad para industria alimentaria, cocina y producción de margarina.', pt: 'Óleo de girassol de alta qualidade para indústria alimentícia, culinária e produção de margarina.' }, origin: 'Common origins: Ukraine, Russia, Argentina', order: 18 },
  { name: 'Indian Rice', slug: 'indian-rice', category: 'agriculture', image: '/images/products/rice-hero.jpg', description: 'Premium Basmati and non-Basmati rice varieties. Long grain, aromatic and high quality for global markets.', origin: 'Common origins: India, Pakistan, Thailand', order: 19 },
  { name: 'Lentils', slug: 'lentils', category: 'agriculture', image: '/images/products/lentils-hero.jpg', description: 'Red, green and yellow lentils for food processing, retail packaging and bulk commodity trade.', origin: 'Common origins: Canada, India, Australia', order: 20 },
  { name: 'Palm Oil', slug: 'palm-oil', category: 'agriculture', image: '/images/products/palm-oil-hero.jpg', description: 'Crude and refined palm oil for food industry, cosmetics, oleochemicals and biodiesel production.', origin: 'Common origins: Indonesia, Malaysia', order: 21 },
  { name: 'Rapeseed Oil', slug: 'rapeseed-oil', category: 'agriculture', image: '', description: { en: 'Canola and rapeseed oil for food processing, cooking and biodiesel production.', es: 'Aceite de canola y colza para procesamiento de alimentos, cocina y producción de biodiesel.', pt: 'Óleo de canola e colza para processamento de alimentos, culinária e produção de biodiesel.' }, origin: 'Common origins: Canada, Germany, France, Australia', order: 22 },
  { name: 'Chicken', slug: 'chicken', category: 'agriculture', image: '/images/products/chicken-hero.jpg', description: { en: 'Frozen whole chicken and chicken parts for retail, food service and processing industries.', es: 'Pollo congelado entero y cortes de pollo para retail, servicio de alimentación e industrias de procesamiento.', pt: 'Frango congelado inteiro e cortes de frango para varejo, food service e indústrias de processamento.' }, origin: 'Common origins: Brazil, USA, Thailand', order: 23 },
  { name: 'Beef', slug: 'beef', category: 'agriculture', image: '/images/products/beef-hero.jpg', description: { en: 'Frozen and chilled beef cuts for retail, food service and meat processing industries.', es: 'Cortes de carne vacuna congelados y refrigerados para retail, servicio de alimentación e industrias cárnicas.', pt: 'Cortes de carne bovina congelados e resfriados para varejo, food service e indústrias de processamento de carne.' }, origin: 'Common origins: Brazil, USA, Australia, India', order: 24 },
  { name: 'Pork', slug: 'pork', category: 'agriculture', image: '/images/products/pork-hero.jpg', description: { en: 'Frozen and chilled pork cuts for retail, food service and meat processing industries.', es: 'Cortes de cerdo congelados y refrigerados para retail, servicio de alimentación e industrias cárnicas.', pt: 'Cortes de suíno congelados e resfriados para varejo, food service e indústrias de processamento de carne.' }, origin: 'Common origins: Brazil, USA, Germany, Spain', order: 25 },
  // Metals and Minerals
  { name: 'Aluminium Ingot A7 & A8', slug: 'aluminium-ingot', category: 'metals', image: '/images/products/aluminium-ingot-hero.jpg', description: { en: 'Primary aluminium ingots with 99.7% and 99.8% purity. Used for extrusion, rolling and alloy production.', es: 'Lingotes de aluminio primario con 99.7% y 99.8% de pureza. Usados para extrusión, laminación y producción de aleaciones.', pt: 'Lingotes de alumínio primário com 99,7% e 99,8% de pureza. Usados para extrusão, laminação e produção de ligas.' }, origin: 'Common origins: India, Russia, Middle East', order: 26 },
  { name: 'Electrolytic Copper Cathodes', slug: 'copper-cathodes', category: 'metals', image: '', description: { en: 'LME-registered Grade A copper cathodes with 99.99% purity. Essential for electrical and industrial applications.', es: 'Cátodos de cobre Grado A registrados en LME con 99.99% de pureza. Esenciales para aplicaciones eléctricas e industriales.', pt: 'Cátodos de cobre Grau A registrados na LME com 99,99% de pureza. Essenciais para aplicações elétricas e industriais.' }, origin: 'Common origins: Chile, Peru, DRC, China', order: 27 },
  { name: 'Gold Bars', slug: 'gold-bars', category: 'metals', image: '/images/products/gold-bars-hero.jpg', description: { en: 'Investment-grade gold bars and bullion. Various weights from 1g to 1kg. LBMA-certified refiners.', es: 'Lingotes de oro de inversión y bullion. Varios pesos de 1g a 1kg. Refinadores certificados por LBMA.', pt: 'Barras de ouro de investimento e bullion. Vários pesos de 1g a 1kg. Refinadores certificados pela LBMA.' }, origin: 'Common origins: Switzerland, UAE, India, USA', order: 28 },
  { name: 'Copper Wire Scrap', slug: 'copper-wire-scrap', category: 'metals', image: '/images/products/copper-wire-scrap-hero.jpg', description: { en: 'Bright copper wire scrap, birch cliff grade. High copper content for recycling and smelting.', es: 'Chatarra de cable de cobre brillante, grado birch cliff. Alto contenido de cobre para reciclaje y fundición.', pt: 'Sucata de fio de cobre brilhante, grau birch cliff. Alto teor de cobre para reciclagem e fundição.' }, origin: 'Common origins: USA, Europe, Middle East', order: 29 },
  { name: 'Coal', slug: 'coal', category: 'metals', image: '/images/products/coal-hero.jpg', description: { en: 'Thermal and coking coal for power generation, steel production and industrial applications.', es: 'Carbón térmico y coquizable para generación de energía, producción de acero y aplicaciones industriales.', pt: 'Carvão térmico e coque para geração de energia, produção de aço e aplicações industriais.' }, origin: 'Common origins: Indonesia, Australia, Russia, South Africa', order: 30 },
  { name: 'Manganese', slug: 'manganese', category: 'metals', image: '', description: { en: 'Manganese ore and ferroalloys for steel production, battery manufacturing and chemical applications.', es: 'Mineral de manganeso y ferroaleaciones para producción de acero, fabricación de baterías y aplicaciones químicas.', pt: 'Minério de manganês e ferro ligas para produção de aço, fabricação de baterias e aplicações químicas.' }, origin: 'Common origins: South Africa, Gabon, Australia, India', order: 31 },
  { name: 'UBC Aluminium Scrap', slug: 'ubc-aluminium-scrap', category: 'metals', image: '/images/products/ubc-aluminium-scrap-hero.jpg', description: { en: 'Used beverage cans and aluminium scrap for recycling and secondary aluminium production.', es: 'Latas de bebidas usadas y chatarra de aluminio para reciclaje y producción de aluminio secundário.', pt: 'Latas de bebidas usadas e sucata de alumínio para reciclagem e produção de alumínio secundário.' }, origin: 'Common origins: USA, Middle East, South America', order: 32 },
]

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
