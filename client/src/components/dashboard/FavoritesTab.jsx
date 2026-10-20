import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../services/api'
import { useAuth } from '../../context/AuthContext'

export default function FavoritesTab() {
  const { customer } = useAuth()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFavorites()
  }, [])

  const fetchFavorites = async () => {
    try {
      const res = await api.get('/products')
      const favIds = customer?.favoriteProducts || []
      const favs = res.products.filter((p) => favIds.includes(p._id))
      setProducts(favs)
    } catch (err) {
      console.error('Failed to load favorites:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="text-center py-8 text-gray-500">Loading...</div>
  if (products.length === 0) return <div className="text-center py-8 text-gray-500">No favorite products yet.</div>

  return (
    <div>
      <h3 className="font-serif text-xl text-navy mb-4">Saved Products</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {products.map((product) => (
          <div key={product._id} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
            <img src={product.image} alt={product.name} className="w-16 h-16 object-cover rounded-lg" />
            <div className="flex-1">
              <p className="font-medium text-ink">{product.name}</p>
              <p className="text-sm text-gray-500 capitalize">{product.category}</p>
            </div>
            <Link
              to={`/enquiry?product=${product.slug}`}
              className="px-3 py-2 bg-gold text-navy text-sm font-medium rounded-lg hover:bg-gold-dark hover:text-white transition-colors"
            >
              Enquire
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}
