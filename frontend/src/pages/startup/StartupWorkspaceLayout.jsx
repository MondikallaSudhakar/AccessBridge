import { useState, useRef, useEffect } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { COLORS } from '../../utils/colors'
import logoImg from '../../assets/logo.jpeg'

const TEAL = COLORS.primary
const NAVY = COLORS.text

const ICONS = {
  home: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0h6',
  box: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
  orders: 'M3 7h18M3 12h18M3 17h18',
  calendar: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
  logout: 'M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1',
  dashboard: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0h6',
  menu: 'M4 6h16M4 12h16M4 18h16',
  x: 'M6 18L18 6M6 6l12 12',
}

function Icon({ name, color='currentColor', size=16 }) {
  const d=ICONS[name]; if(!d) return null
  return (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" style={{display:'block',flexShrink:0}}><path strokeLinecap="round" strokeLinejoin="round" d={d}/></svg>)
}

const NAV_ITEMS = [
  { to:'/startup/profile', label:'Profile', icon:'home' },
  { to:'/startup/products', label:'Products', icon:'box' },
  { to:'/startup/jobs', label:'Jobs', icon:'orders' },
  { to:'/startup/events', label:'Events', icon:'calendar' },
  { to:'/startup/orders', label:'Orders', icon:'orders' },
  { to:'/startup/payouts', label:'Payouts', icon:'orders' },
]

export default function StartupWorkspaceLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)
  const currentPath = window.location.pathname
  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <div className="min-h-screen bg-white">
      <style>{`.st-tnav{display:flex;align-items:center;width:100%;background:#fff;border-bottom:1px solid #e9ecef;padding:0 20px;height:58px;position:sticky;top:0;z-index:100;box-shadow:0 1px 4px rgba(0,0,0,.04);gap:16px}.st-tnav-links{display:flex;align-items:center;gap:2px;flex:1;overflow-x:auto}.st-tnav-links::-webkit-scrollbar{display:none}.st-tnav-right{display:flex;align-items:center;gap:12px;flex-shrink:0}.st-ham{display:none}@media(max-width:900px){.st-tnav-links{display:none!important}.st-ham{display:flex!important}}`}</style>

      <nav className="st-tnav">
        <div style={{display:'flex',alignItems:'center',gap:10,cursor:'pointer',flexShrink:0}} onClick={()=>navigate('/')}>
          <img src={logoImg} alt="KnotneX" style={{width:30,height:30,borderRadius:7,objectFit:'cover'}}/>
          <span style={{fontSize:14,fontWeight:900,color:NAVY,letterSpacing:'-0.02em'}}>KnotneX</span>
        </div>
        <div style={{display:'inline-flex',alignItems:'center',gap:6,padding:'4px 10px',borderRadius:20,flexShrink:0,background:`${TEAL}12`,border:`1px solid ${TEAL}50`}}>
          <span style={{width:7,height:7,borderRadius:'50%',background:TEAL,display:'inline-block'}}/>
          <span style={{fontSize:11,fontWeight:700,color:TEAL,whiteSpace:'nowrap'}}>Startup Workspace</span>
        </div>
        <div className="st-tnav-links">
          {NAV_ITEMS.map(item => {
            const isActive = currentPath.startsWith(item.to)
            return (
              <NavLink key={item.to} to={item.to} end={item.to==='/startup/profile'}
                style={{display:'flex',alignItems:'center',gap:6,padding:'7px 14px',borderRadius:8,textDecoration:'none',background:isActive?TEAL:'transparent',color:isActive?'#fff':'#374151',fontSize:13,fontWeight:isActive?700:500,transition:'all .15s',whiteSpace:'nowrap'}}
                onMouseEnter={e=>{if(!isActive)e.currentTarget.style.background='#f1f5f9'}}
                onMouseLeave={e=>{if(!isActive)e.currentTarget.style.background=isActive?TEAL:'transparent'}}
              >
                <Icon name={item.icon} size={15} color={isActive?'#fff':'#64748b'}/>{item.label}
              </NavLink>
            )
          })}
        </div>
        <button className="st-ham" onClick={()=>setMobileOpen(true)} style={{background:'none',border:'none',cursor:'pointer',padding:6,marginLeft:'auto',display:'flex',alignItems:'center',justifyContent:'center'}}><Icon name="menu" size={22} color="#374151"/></button>
        <div className="st-tnav-right">
          <div style={{padding:'4px 12px',borderRadius:8,background:'#f8fafc'}}><p style={{margin:0,fontSize:12,fontWeight:600,color:'#0f172a',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',maxWidth:160}}>{user?.email||user?.name||'Startup Admin'}</p></div>
          <button type="button" onClick={()=>navigate('/dashboard')} style={{display:'flex',alignItems:'center',gap:6,padding:'7px 14px',borderRadius:8,border:'none',background:'#f1f5f9',cursor:'pointer',fontSize:12,fontWeight:600,color:'#374151'}} onMouseEnter={e=>e.currentTarget.style.background='#e2e8f0'} onMouseLeave={e=>e.currentTarget.style.background='#f1f5f9'}><Icon name="dashboard" size={14} color="#64748b"/>Dashboard</button>
          <button type="button" onClick={handleLogout} style={{display:'flex',alignItems:'center',gap:6,padding:'7px 14px',borderRadius:8,border:'none',background:'#fef2f2',cursor:'pointer'}} onMouseEnter={e=>e.currentTarget.style.background='#fee2e2'} onMouseLeave={e=>e.currentTarget.style.background='#fef2f2'}><Icon name="logout" size={14} color="#ef4444"/><span style={{fontSize:12,fontWeight:700,color:'#ef4444'}}>Sign Out</span></button>
        </div>
      </nav>

      {mobileOpen&&<div onClick={()=>setMobileOpen(false)} style={{position:'fixed',inset:0,background:'rgba(0,0,0,.3)',zIndex:9998,backdropFilter:'blur(2px)'}}/>}
      <div style={{position:'fixed',top:0,left:0,bottom:0,width:280,maxWidth:'80vw',background:'#fff',zIndex:9999,transform:mobileOpen?'translateX(0)':'translateX(-100%)',transition:'transform .25s cubic-bezier(.4,0,.2,1)',boxShadow:mobileOpen?'4px 0 30px rgba(0,0,0,.15)':'none',display:'flex',flexDirection:'column',overflowY:'auto'}}>
        <div style={{padding:'16px 18px',borderBottom:'1px solid #f1f5f9',display:'flex',alignItems:'center',justifyContent:'space-between'}}><span style={{fontSize:14,fontWeight:800,color:NAVY}}>Menu</span><button onClick={()=>setMobileOpen(false)} style={{background:'none',border:'none',cursor:'pointer',padding:4}}><Icon name="x" size={18} color="#64748b"/></button></div>
        <nav style={{flex:1,padding:12}}>{NAV_ITEMS.map(i=>{const a=currentPath.startsWith(i.to);return(<NavLink key={i.to} to={i.to} end={i.to==='/startup/profile'} onClick={()=>setMobileOpen(false)} style={{display:'flex',alignItems:'center',gap:10,padding:'9px 10px',borderRadius:9,textDecoration:'none',marginBottom:1,background:a?TEAL:'transparent',color:a?'#fff':'#374151',fontSize:13.5,fontWeight:a?700:500}}><Icon name={i.icon} size={16} color={a?'#fff':'#64748b'}/>{i.label}</NavLink>)})}</nav>
        <div style={{padding:12,borderTop:'1px solid #f1f5f9'}}>
          <button type="button" onClick={()=>{navigate('/dashboard');setMobileOpen(false)}} style={{display:'flex',alignItems:'center',gap:10,width:'100%',padding:'9px 10px',borderRadius:9,border:'none',background:'transparent',cursor:'pointer',fontSize:13.5,fontWeight:500,color:'#374151'}}><Icon name="dashboard" size={16} color="#64748b"/>Dashboard</button>
          <button type="button" onClick={()=>{handleLogout();setMobileOpen(false)}} style={{display:'flex',alignItems:'center',gap:10,width:'100%',padding:'9px 10px',borderRadius:9,border:'none',background:'transparent',cursor:'pointer',fontSize:13.5,fontWeight:700,color:'#ef4444'}}><Icon name="logout" size={16} color="#ef4444"/>Sign Out</button>
        </div>
      </div>

      <main className="w-full px-4 py-6 sm:px-6 lg:px-8"><Outlet /></main>
    </div>
  )
}