import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'

// Marketplace - Product Listing
export default function Marketplace() {
  const navigate = useNavigate()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const data = await api.get('/products/available')
      setProducts(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Failed to fetch products', error)
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Navbar Minimal */}
      <nav className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-4 h-7 rounded-sm" style={{ backgroundColor: '#1A8FD1', clipPath: 'polygon(0 0, 60% 0, 100% 50%, 60% 100%, 0 100%, 40% 50%)' }}></div>
            <div className="w-4 h-7 rounded-sm -ml-1.5" style={{ backgroundColor: '#5BBE00', clipPath: 'polygon(40% 0, 100% 0, 100% 100%, 40% 100%, 0 50%)' }}></div>
            <span className="font-black tracking-tight text-gray-900 text-lg">Inclusive Connect</span>
          </div>
          <button onClick={() => navigate('/dashboard')} className="text-sm font-bold bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg transition-colors">
            Back to Dashboard
          </button>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-12 max-w-7xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-black text-gray-900 mb-4">Assistive Product Marketplace</h1>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto">Discover and procure specialized tools, educational devices, and adaptive equipment designed for inclusive learning and daily life.</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-white rounded-xl shadow-sm p-4 animate-pulse flex flex-col h-72">
                <div className="h-32 bg-gray-200 rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="mt-auto h-10 bg-gray-200 rounded-lg"></div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-16 text-center shadow-sm">
             <div className="w-16 h-16 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
               <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
             </div>
             <h3 className="text-xl font-bold text-gray-900 mb-2">No Products Available</h3>
             <p className="text-gray-500">Check back later for new assistive products from our startup network.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <div key={product.id} className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 flex flex-col group">
                <div className="h-48 relative overflow-hidden bg-gray-50 flex items-center justify-center border-b border-gray-100">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  {product.imageUrl ? (
                    <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-gray-300 text-6xl group-hover:scale-110 transition-transform duration-300">📦</span>
                  )}
                  {product.category && (
                    <span className="absolute top-3 right-3 z-20 bg-white/90 backdrop-blur text-gray-800 text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">
                      {product.category}
                    </span>
                  )}
                </div>
                <div className="p-5 flex flex-col flex-grow">
                  <h3 className="font-bold text-gray-900 mb-1.5 line-clamp-1 group-hover:text-orange-500 transition-colors">
                    {product.name}
                  </h3>
                  <p className="text-gray-500 text-xs mb-4 line-clamp-2 leading-relaxed flex-grow">
                    {product.description}
                  </p>
                  <div className="flex justify-between items-end mb-4">
                    <div>
                      <p className="text-xs text-gray-400 font-semibold mb-0.5">Price</p>
                      <span className="text-xl font-black text-gray-900">₹{parseFloat(product.price).toLocaleString()}</span>
                    </div>
                    {product.stockQuantity > 0 ? (
                      <span className="text-xs font-bold text-green-600 bg-green-50 px-2.5 py-1 rounded-md">
                        In Stock ({product.stockQuantity})
                      </span>
                    ) : (
                      <span className="text-xs font-bold text-red-600 bg-red-50 px-2.5 py-1 rounded-md">
                        Out of Stock
                      </span>
                    )}
                  </div>
                  <button 
                    disabled={product.stockQuantity <= 0}
                    className={`w-full py-2.5 rounded-lg text-sm font-bold transition-colors ${
                      product.stockQuantity > 0 
                        ? 'bg-orange-500 hover:bg-orange-600 text-white shadow-sm' 
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}>
                    {product.stockQuantity > 0 ? 'Add to Cart' : 'Unavailable'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
