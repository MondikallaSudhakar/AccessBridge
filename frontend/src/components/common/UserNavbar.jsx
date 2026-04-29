import { useNavigate } from 'react-router-dom'

function Brand({ onClick }) {
  return (
    <div className="flex items-center gap-3 cursor-pointer" onClick={onClick}>
      <div className="w-4 h-7 rounded-sm" style={{ backgroundColor: '#1A8FD1', clipPath: 'polygon(0 0, 60% 0, 100% 50%, 60% 100%, 0 100%, 40% 50%)' }}></div>
      <div className="w-4 h-7 rounded-sm -ml-1.5" style={{ backgroundColor: '#5BBE00', clipPath: 'polygon(40% 0, 100% 0, 100% 100%, 40% 100%, 0 50%)' }}></div>
      <span className="font-black tracking-tight text-gray-900 text-lg">Inclusive Connect</span>
    </div>
  )
}

function NavButton({ active, children, onClick, tone = 'neutral', badge }) {
  const baseStyles = 'relative text-sm font-bold px-4 py-2 rounded-lg transition-colors flex items-center gap-2'
  const toneStyles = {
    neutral: active ? 'bg-gray-900 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-900',
    brand: active ? 'bg-orange-600 text-white' : 'bg-orange-500 hover:bg-orange-600 text-white',
  }

  return (
    <button onClick={onClick} className={`${baseStyles} ${toneStyles[tone]}`}>
      {children}
      {badge != null && badge > 0 && (
        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
          {badge}
        </span>
      )}
    </button>
  )
}

export default function UserNavbar({ currentPage = 'marketplace', cartCount = 0 }) {
  const navigate = useNavigate()

  return (
    <nav className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Brand onClick={() => navigate('/')} />

        <div className="flex items-center gap-3 flex-wrap justify-end">
          <NavButton
            active={currentPage === 'marketplace'}
            onClick={() => navigate('/marketplace')}
            tone={currentPage === 'marketplace' ? 'brand' : 'neutral'}
          >
            Marketplace
          </NavButton>

          <NavButton
            active={currentPage === 'orders'}
            onClick={() => navigate('/orders')}
            tone={currentPage === 'orders' ? 'brand' : 'neutral'}
          >
            Orders
          </NavButton>

          <NavButton
            active={currentPage === 'cart'}
            onClick={() => navigate('/cart')}
            tone={currentPage === 'cart' ? 'brand' : 'neutral'}
            badge={cartCount}
          >
            Cart
          </NavButton>

          <NavButton
            onClick={() => navigate('/dashboard')}
            tone="neutral"
          >
            Dashboard
          </NavButton>
        </div>
      </div>
    </nav>
  )
}