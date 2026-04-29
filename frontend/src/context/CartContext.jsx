import { createContext, useContext, useState, useEffect } from 'react'

const CartContext = createContext()

export function CartProvider({ children }) {
  const [cart, setCart] = useState([])

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart')
    if (savedCart) {
      setCart(JSON.parse(savedCart))
    }
  }, [])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart))
  }, [cart])

  const addToCart = (product) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find(
        (item) => item.productId === product.id && item.source === product.source
      )

      if (existingItem) {
        return prevCart.map((item) =>
          item.productId === product.id && item.source === product.source
            ? { ...item, quantity: item.quantity + (product.quantity || 1) }
            : item
        )
      }

      return [
        ...prevCart,
        {
          productId: product.id,
          productName: product.name,
          description: product.description,
          price: product.price,
          quantity: product.quantity || 1,
          source: product.source,
          sourceId: product.sourceId,
          sourceDetails: product.sourceDetails,
          imageUrl: product.imageUrl,
          category: product.category,
          stockQuantity: product.stockQuantity,
        },
      ]
    })
  }

  const removeFromCart = (productId, source) => {
    setCart((prevCart) =>
      prevCart.filter((item) => !(item.productId === productId && item.source === source))
    )
  }

  const updateQuantity = (productId, source, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId, source)
      return
    }

    setCart((prevCart) =>
      prevCart.map((item) =>
        item.productId === productId && item.source === source
          ? { ...item, quantity }
          : item
      )
    )
  }

  const clearCart = () => {
    setCart([])
  }

  const getTotalPrice = () => {
    return cart.reduce((total, item) => {
      return total + item.price * item.quantity
    }, 0)
  }

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0)
  }

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotalPrice,
        getTotalItems,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within CartProvider')
  }
  return context
}
