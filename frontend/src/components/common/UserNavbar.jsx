import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

function Brand({ onClick }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={onClick}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <div style={{ width: 16, height: 28, backgroundColor: '#1A8FD1', clipPath: 'polygon(0 0,60% 0,100% 50%,60% 100%,0 100%,40% 50%)' }} />
        <div style={{ width: 16, height: 28, marginLeft: -6, backgroundColor: '#5BBE00', clipPath: 'polygon(40% 0,100% 0,100% 100%,40% 100%,0 50%)' }} />
      </div>
      <span style={{ fontSize: 15, fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em' }}>Inclusive Connect</span>
    </div>
  )
}

function NavButton({ active, children, onClick, tone = 'neutral', badge }) {
  const baseStyles = 'relative flex items-center gap-2.5 w-full rounded-lg px-3 py-2 text-left text-sm transition-colors'
  const toneStyles = {
    neutral: active ? '' : '',
    brand: active ? '' : '',
  }

  return (
    <button
      onClick={onClick}
      className={baseStyles}
      style={{
        backgroundColor: active ? '#0d9488' : 'transparent',
        color: active ? '#fff' : '#374151',
        fontWeight: active ? 700 : 500,
      }}
    >
      <span style={{ fontSize: 0 }}>{tone}</span>
      {children}
      {badge != null && badge > 0 && (
        <span style={{ position: 'absolute', top: -8, right: -8, backgroundColor: '#ef4444', color: '#fff', fontSize: 12, fontWeight: 700, borderRadius: '9999px', width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {badge}
        </span>
      )}
    </button>
  )
}

export default function UserNavbar({ currentPage = 'marketplace', cartCount = 0 }) {
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  return (
    <aside
      className="hidden lg:flex"
      style={{
        width: 250,
        minWidth: 250,
        background: '#fff',
        borderRight: '1px solid #e9ecef',
        flexDirection: 'column',
        position: 'sticky',
        top: 0,
        height: '100vh',
        overflowY: 'auto',
        zIndex: 50,
      }}
    >
      <div style={{ padding: '22px 20px 18px', borderBottom: '1px solid #f1f5f9' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, cursor: 'pointer' }} onClick={() => navigate('/dashboard')}>
          <Brand />
        </div>

        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '5px 12px', borderRadius: 20, background: '#5BCB2B12', border: '1px solid #5BCB2B30' }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#5BCB2B', display: 'inline-block' }} />
          <span style={{ fontSize: 12, fontWeight: 700, color: '#5BCB2B' }}>Community Marketplace</span>
        </div>
      </div>

      <nav style={{ flex: 1, padding: '14px 12px 8px' }}>
        <p style={{ margin: '0 0 4px 8px', fontSize: 10, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.10em', textTransform: 'uppercase' }}>
          Navigation
        </p>

        <div>
          <NavButton
            active={currentPage === 'dashboard'}
            onClick={() => navigate('/dashboard')}
          >
            Dashboard
          </NavButton>

          <NavButton
            active={currentPage === 'profile'}
            onClick={() => navigate('/profile')}
          >
            Profile
          </NavButton>

          <NavButton
            active={currentPage === 'marketplace'}
            onClick={() => navigate('/marketplace')}
          >
            Marketplace
          </NavButton>

          <NavButton
            active={currentPage === 'orders'}
            onClick={() => navigate('/orders')}
          >
            Orders
          </NavButton>

          <NavButton
            active={currentPage === 'cart'}
            onClick={() => navigate('/cart')}
            badge={cartCount}
          >
            Cart
          </NavButton>
        </div>
      </nav>

      <div style={{ padding: '8px 12px 20px', borderTop: '1px solid #f1f5f9' }}>
        <div style={{ padding: '10px 10px', borderRadius: 10, background: '#f8fafc', marginBottom: 8 }}>
          <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {user?.email}
          </p>
          <p style={{ margin: '2px 0 0', fontSize: 11, color: '#94a3b8' }}>{user?.role === 'USER' ? 'General User' : user?.role}</p>
        </div>

        <button
          type="button"
          onClick={() => logout('/login')}
          style={{ display: 'flex', alignItems: 'center', gap: 9, width: '100%', padding: '9px 10px', borderRadius: 9, border: 'none', background: 'transparent', cursor: 'pointer', textAlign: 'left', transition: 'background .15s' }}
          onMouseEnter={e => e.currentTarget.style.background = '#fef2f2'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          <span style={{ color: '#ef4444', fontSize: 16 }}>↪</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#ef4444' }}>Sign Out</span>
        </button>
      </div>
    </aside>
  )
}