import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'
import { useStartupSubscription } from '../../hooks/useStartupSubscription'
import { COLORS } from '../../utils/colors'

export default function StartupProductsPage() {
  const { user } = useAuth()
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
  const { loading: subscriptionLoading, subscription, startSubscription } = useStartupSubscription(startup?.id)

  const PRODUCT_CATEGORIES = ['Hardware', 'Software', 'Educational Tool', 'Therapy Equipment', 'Mobility Aid', 'Other']

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
      if (data?.id) fetchProducts(data.id)
    } catch (error) {
      console.error('Error fetching startup profile:', error)
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
      console.error('Error fetching products:', error)
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
    if (!subscription?.active) {
      setProductError('A paid Startup subscription is required to post products.')
      return
    }
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
        available: productForm.available,
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
    if (!subscription?.active) {
      setProductError('A paid Startup subscription is required to post products.')
      return
    }
    setProductForm({ name: '', description: '', price: '', category: 'Hardware', stockQuantity: '', imageUrl: '', available: true })
    setEditingProductId(null)
    setProductError('')
    setShowProductForm(true)
  }

  const openEditProductForm = (product) => {
    setProductForm({
      name: product.name || '',
      description: product.description || '',
      price: product.price || '',
      category: product.category || 'Hardware',
      stockQuantity: product.stockQuantity || '',
      imageUrl: product.imageUrl || '',
      available: product.available,
    })
    setEditingProductId(product.id)
    setProductError('')
    setShowProductForm(true)
  }

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return
    try {
      await api.delete(`/products/${productId}`)
      if (startup?.id) fetchProducts(startup.id)
    } catch (err) {
      console.error('Failed to delete product', err)
    }
  }

  return (
    <div className="space-y-6" style={{ fontFamily: "'Inter', sans-serif" }}>
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: COLORS.primary }}>Startup Admin</p>
            <h1 className="text-3xl font-black text-slate-900">Posted Products</h1>
            <p className="text-sm text-slate-500 mt-1">Create, update, and manage the products published by your startup.</p>
            <p className="text-xs text-slate-500 mt-1">{subscriptionLoading ? 'Checking subscription status...' : subscription?.active ? 'Subscription active' : 'Subscription required to post products'}</p>
          </div>
          <div className="flex gap-2">
            {!subscription?.active && (
              <button onClick={() => startSubscription({ onActivated: () => fetchStartup() })} className="rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90" style={{ backgroundColor: COLORS.success }}>
                Pay with Razorpay
              </button>
            )}
            <button onClick={() => navigate('/startup/profile')} className="rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90" style={{ backgroundColor: COLORS.success }}>
              Back to Profile
            </button>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
          <div>
            <h2 className="text-base font-extrabold text-slate-900">Manage Products</h2>
            <p className="text-xs text-slate-500">Add and edit products to display them on the community marketplace.</p>
          </div>
          {!showProductForm && (
            <button onClick={openNewProductForm} disabled={!subscription?.active} className="rounded-lg px-4 py-2 text-sm font-semibold text-white transition-opacity disabled:opacity-60 hover:opacity-90" style={{ backgroundColor: COLORS.success }}>
              + Add Product
            </button>
          )}
        </div>

        {showProductForm && (
          <form onSubmit={handleSaveProduct} className="border-b border-emerald-100 bg-emerald-50 px-5 py-5 space-y-4">
            {productError && <div className="rounded-lg border border-red-100 bg-red-50 p-3 text-sm text-red-600">{productError}</div>}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <label className="block">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Product Name *</span>
                <input type="text" name="name" value={productForm.name} onChange={handleProductFormChange} required placeholder="e.g. Assistive Keyboard" className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-400" />
              </label>
              <label className="block">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Category *</span>
                <select name="category" value={productForm.category} onChange={handleProductFormChange} required className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-400">
                  {PRODUCT_CATEGORIES.map((category) => <option key={category} value={category}>{category}</option>)}
                </select>
              </label>
              <label className="block">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Price (₹) *</span>
                <input type="number" step="0.01" name="price" value={productForm.price} onChange={handleProductFormChange} required placeholder="99.99" className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-400" />
              </label>
              <label className="block">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Stock Quantity *</span>
                <input type="number" name="stockQuantity" value={productForm.stockQuantity} onChange={handleProductFormChange} required placeholder="10" className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-400" />
              </label>
              <label className="block md:col-span-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Image URL</span>
                <input type="text" name="imageUrl" value={productForm.imageUrl} onChange={handleProductFormChange} placeholder="https://example.com/image.jpg" className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-400" />
              </label>
              <label className="block md:col-span-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Description *</span>
                <textarea name="description" rows={3} value={productForm.description} onChange={handleProductFormChange} required placeholder="Details about the product..." className="mt-1 w-full resize-none rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-400" />
              </label>
            </div>
            <div className="flex gap-3 pt-2">
                <button type="submit" disabled={submittingProduct || !subscription?.active} className="rounded-lg px-5 py-2.5 text-sm font-semibold text-white transition-opacity disabled:opacity-60 hover:opacity-90" style={{ backgroundColor: COLORS.success }}>
                {submittingProduct ? 'Saving...' : (editingProductId ? 'Update Product' : 'Add Product')}
              </button>
              <button type="button" onClick={() => { setShowProductForm(false); setEditingProductId(null) }} className="rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50">
                Cancel
              </button>
            </div>
          </form>
        )}

        <div className="p-5">
          {productsLoading ? (
            <div className="animate-pulse"><div className="h-5 w-40 rounded bg-slate-200" /></div>
          ) : products.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
              No products added yet.
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {products.map((product) => (
                <div key={product.id} className="flex flex-col sm:flex-row overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md">
                    <div className="flex h-40 w-full sm:h-auto sm:w-48 shrink-0 items-center justify-center overflow-hidden border-b sm:border-b-0 sm:border-r border-slate-100 bg-white">
                    {product.imageUrl ? <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" /> : (
                      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="rounded-full bg-orange-50 px-2 py-0.5 text-[10px] font-bold uppercase text-orange-700">{product.category}</span>
                        <h3 className="mt-1 text-lg font-bold text-slate-900">{product.name}</h3>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-black text-slate-900">₹{parseFloat(product.price).toLocaleString()}</p>
                        <p className="text-[11px] font-medium text-slate-400">In Stock: {product.stockQuantity}</p>
                      </div>
                    </div>
                    <p className="mt-2 flex-1 text-sm text-slate-500 leading-relaxed line-clamp-2 sm:line-clamp-none">{product.description}</p>
                    <div className="mt-4 flex flex-wrap gap-2 pt-4 border-t border-slate-50">
                      <button onClick={() => openEditProductForm(product)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors">Edit Product</button>
                      <button onClick={() => handleDeleteProduct(product.id)} className="rounded-lg border border-red-100 bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-100 transition-colors">Delete</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
