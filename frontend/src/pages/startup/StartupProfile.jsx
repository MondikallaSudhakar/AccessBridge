import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'
import StartupEventsSection from './StartupEventsSection'

export default function StartupProfile() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const [startup, setStartup] = useState(null)
  const [profileLoading, setProfileLoading] = useState(true)
  
  const [products, setProducts] = useState([])
  const [productsLoading, setProductsLoading] = useState(false)
  const [showProductForm, setShowProductForm] = useState(false)
  const [productForm, setProductForm] = useState({ name: '', description: '', price: '', category: 'Hardware', stockQuantity: '', imageUrl: '', available: true })
  const [submittingProduct, setSubmittingProduct] = useState(false)
  const [productError, setProductError] = useState('')
  const [editingProductId, setEditingProductId] = useState(null)

  const PRODUCT_CATEGORIES = [
    'Hardware', 'Software', 'Educational Tool', 
    'Therapy Equipment', 'Mobility Aid', 'Other'
  ]

  useEffect(() => {
    if (user && user.role !== 'STARTUP_ADMIN') navigate('/dashboard')
  }, [user, navigate])

  useEffect(() => {
    if (!user?.email) return
    fetchStartup()
  }, [user])

  const fetchStartup = async () => {
    setProfileLoading(true)
    try {
      const encoded = encodeURIComponent(user.email)
      const data = await api.get(`/startups/email/${encoded}`)
      setStartup(data)
      if (data && data.id) {
        fetchProducts(data.id)
      }
    } catch (error) {
      console.error("Error fetching startup profile:", error)
      setStartup(null)
    } finally {
      setProfileLoading(false)
    }
  }

  const fetchProducts = async (startupId) => {
    setProductsLoading(true)
    try {
      const data = await api.get(`/products/startup/${startupId}`)
      setProducts(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Error fetching products:", error)
      setProducts([])
    } finally {
      setProductsLoading(false)
    }
  }

  const handleProductFormChange = (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setProductForm({ ...productForm, [e.target.name]: val })
  }

  const handleSaveProduct = async (e) => {
    e.preventDefault()
    if (!startup) return
    setProductError('')
    setSubmittingProduct(true)
    
    try {
      const payload = {
        name: productForm.name,
        description: productForm.description,
        price: parseFloat(productForm.price || 0),
        category: productForm.category,
        stockQuantity: parseInt(productForm.stockQuantity || 0),
        imageUrl: productForm.imageUrl,
        available: productForm.available
      }
      
      if (editingProductId) {
        await api.put(`/products/${editingProductId}`, payload)
      } else {
        await api.post(`/products/startup/${startup.id}`, payload)
      }
      
      setProductForm({ name: '', description: '', price: '', category: 'Hardware', stockQuantity: '', imageUrl: '', available: true })
      setShowProductForm(false)
      setEditingProductId(null)
      fetchProducts(startup.id)
    } catch (err) {
      setProductError(err.message || (editingProductId ? 'Failed to update product' : 'Failed to add product'))
    } finally {
      setSubmittingProduct(false)
    }
  }

  const openNewProductForm = () => {
    setProductForm({ name: '', description: '', price: '', category: 'Hardware', stockQuantity: '', imageUrl: '', available: true })
    setEditingProductId(null)
    setProductError('')
    setShowProductForm(true)
  }

  const openEditProductForm = (p) => {
    setProductForm({ 
      name: p.name || '', 
      description: p.description || '', 
      price: p.price || '', 
      category: p.category || 'Hardware', 
      stockQuantity: p.stockQuantity || '', 
      imageUrl: p.imageUrl || '', 
      available: p.available 
    })
    setEditingProductId(p.id)
    setProductError('')
    setShowProductForm(true)
  }

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await api.delete(`/products/${productId}`)
      fetchProducts(startup.id)
    } catch (err) {
      console.error("Failed to delete product", err)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <a href="/dashboard" className="flex items-center gap-1.5 text-gray-400 hover:text-gray-700 text-sm transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              Dashboard
            </a>
            <span className="text-gray-200 text-xs">|</span>
            <span className="text-sm font-bold text-gray-900">Startup Manage</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/startup/orders')}
              className="text-xs font-semibold text-white px-3 py-1.5 rounded transition-colors"
              style={{ backgroundColor: '#e65100' }}
            >
              Orders Details
            </button>
            <span className="text-xs text-gray-400 hidden md:block">{user?.email}</span>
            <button onClick={() => { logout(); navigate('/') }}
              className="text-xs font-semibold text-red-500 border border-red-100 px-3 py-1.5 rounded transition-colors hover:bg-red-50">
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-10">
        {profileLoading ? (
           <div className="space-y-4">{[1, 2, 3].map(i => <div key={i} className="h-14 bg-gray-200 rounded-lg animate-pulse"></div>)}</div>
        ) : (
          <div>
            <div className="mb-8 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: '#e65100' }}>Startup Admin</p>
                <h1 className="text-3xl font-black text-gray-900">{startup?.name || 'My Startup'}</h1>
                {startup?.city && <p className="text-sm text-gray-400 mt-1">{[startup.city, startup.state].filter(Boolean).join(', ')}</p>}
              </div>
              <button
                onClick={() => navigate('/startup/orders')}
                className="hidden sm:inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90"
                style={{ backgroundColor: '#e65100' }}
              >
                View Orders Details
              </button>
            </div>

            <div className="space-y-6">
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-6 py-5 flex items-center justify-between border-b border-gray-50">
                  <div>
                    <h2 className="font-bold text-gray-900">Manage Products</h2>
                    <p className="text-xs text-gray-400 mt-0.5">Add and edit products to display them on the community marketplace</p>
                  </div>
                  {!showProductForm && (
                     <button onClick={openNewProductForm}
                       className="text-sm font-semibold text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
                       style={{ backgroundColor: '#e65100' }}>
                       + Add Product
                     </button>
                  )}
                </div>

                {showProductForm && (
                   <form onSubmit={handleSaveProduct} className="px-6 py-5 space-y-4 bg-orange-50 border-b border-orange-100">
                     {productError && <div className="bg-red-50 border border-red-100 text-red-600 text-sm p-3 rounded-lg">{productError}</div>}
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <div className="md:col-span-1">
                         <label className="block text-xs font-semibold text-gray-600 mb-1.5">Product Name *</label>
                         <input type="text" name="name" value={productForm.name} onChange={handleProductFormChange}
                           required placeholder="e.g. Assistive Keyboard"
                           className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2"
                         />
                       </div>
                       <div className="md:col-span-1">
                         <label className="block text-xs font-semibold text-gray-600 mb-1.5">Category *</label>
                         <select name="category" value={productForm.category} onChange={handleProductFormChange}
                           required
                           className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2">
                           {PRODUCT_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                         </select>
                       </div>
                       <div className="md:col-span-1">
                         <label className="block text-xs font-semibold text-gray-600 mb-1.5">Price (₹) *</label>
                         <input type="number" step="0.01" name="price" value={productForm.price} onChange={handleProductFormChange}
                           required placeholder="99.99"
                           className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2"
                         />
                       </div>
                       <div className="md:col-span-1">
                         <label className="block text-xs font-semibold text-gray-600 mb-1.5">Stock Quantity *</label>
                         <input type="number" name="stockQuantity" value={productForm.stockQuantity} onChange={handleProductFormChange}
                           required placeholder="10"
                           className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2"
                         />
                       </div>
                       <div className="md:col-span-1">
                         <label className="block text-xs font-semibold text-gray-600 mb-1.5">Image URL</label>
                         <input type="text" name="imageUrl" value={productForm.imageUrl} onChange={handleProductFormChange}
                           placeholder="https://example.com/image.jpg"
                           className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2"
                         />
                       </div>
                       <div className="md:col-span-2">
                         <label className="block text-xs font-semibold text-gray-600 mb-1.5">Description *</label>
                         <textarea name="description" rows={3} value={productForm.description} onChange={handleProductFormChange}
                           required placeholder="Details about the product..."
                           className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 resize-none"
                         />
                       </div>
                     </div>
                     <div className="flex gap-3 pt-2">
                       <button type="submit" disabled={submittingProduct}
                         className="text-sm font-semibold text-white px-6 py-2.5 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-60"
                         style={{ backgroundColor: '#e65100' }}>
                         {submittingProduct ? 'Saving...' : (editingProductId ? 'Update Product' : 'Add Product')}
                       </button>
                       <button type="button" onClick={() => { setShowProductForm(false); setEditingProductId(null); }}
                         className="text-sm font-semibold border rounded-lg px-6 py-2.5 text-gray-600 hover:bg-gray-50 transition-colors bg-white">
                         Cancel
                       </button>
                     </div>
                   </form>
                )}

                <div className="p-6">
                  {productsLoading ? (
                    <div className="animate-pulse flex space-x-4"><div className="flex-1 space-y-4 py-1"><div className="h-4 bg-gray-200 rounded w-3/4"></div></div></div>
                  ) : products.length === 0 ? (
                    <div className="text-center py-6">
                      <p className="text-xs text-gray-400 mb-3">No products added yet.</p>
                      <button onClick={() => setShowProductForm(true)} className="text-sm font-semibold rounded-lg px-4 py-2 text-white" style={{ backgroundColor: '#e65100' }}>
                        Add your first product
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {products.map(p => (
                          <div key={p.id} className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition-shadow flex flex-col">
                            <div className="h-32 bg-gray-50 flex items-center justify-center overflow-hidden border-b border-gray-100 relative">
                              {p.imageUrl ? (
                                <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                              ) : (
                                <span className="text-gray-300 text-4xl">📦</span>
                              )}
                            </div>
                            <div className="p-4 flex flex-col flex-grow">
                              <div className="flex justify-between items-start mb-2">
                                <h3 className="font-semibold text-gray-800 line-clamp-1">{p.name}</h3>
                                <span className="bg-orange-100 text-orange-800 text-xs px-2 py-0.5 rounded ml-2 whitespace-nowrap">{p.category}</span>
                              </div>
                              <p className="text-gray-600 text-xs mb-3 line-clamp-2 flex-grow">{p.description}</p>
                              <div className="flex justify-between items-center mb-4 mt-auto">
                                <span className="text-lg font-bold text-gray-900">₹{parseFloat(p.price).toLocaleString()}</span>
                                <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2.5 py-1 rounded-md">Stock: {p.stockQuantity}</span>
                              </div>
                              <div className="flex gap-2">
                                <button onClick={() => openEditProductForm(p)} className="flex-1 border border-indigo-200 text-indigo-600 hover:bg-indigo-50 py-1.5 rounded text-sm transition-colors font-medium">
                                  Edit
                                </button>
                                <button onClick={() => handleDeleteProduct(p.id)} className="flex-1 border border-red-200 text-red-600 hover:bg-red-50 py-1.5 rounded text-sm transition-colors font-medium">
                                  Delete
                                </button>
                              </div>
                            </div>
                          </div>
                       ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-6 py-5 flex items-center justify-between border-b border-gray-50">
                  <div>
                    <h2 className="font-bold text-gray-900">Manage Events</h2>
                    <p className="text-xs text-gray-400 mt-0.5">Post startup events and review registrations</p>
                  </div>
                </div>
                <div className="p-6">
                  <StartupEventsSection startupId={startup?.id} />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
