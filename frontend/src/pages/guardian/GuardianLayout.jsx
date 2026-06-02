import { useState, useRef, useEffect } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { GUARDIAN_NAV } from './guardianData'
import logoImg from '../../assets/logo.jpeg'

const TEAL = '#0d9488'
const NAVY = '#0f172a'

const ICONS = {
  home: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0h6',
  user: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
  briefcase: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
  school: 'M12 14l9-5-9-5-9 5 9 5m0 0v7',
  ngo: 'M7 11V7a5 5 0 1110 0v4m-8 0h6m-9 0h12l-1 9H7l-1-9z',
  learning: 'M12 6.253v13m0-13C10.832 5.483 9.246 5 7.5 5 4.462 5 2 6.79 2 9v11c0-2.21 2.462-4 5.5-4 1.746 0 3.332.483 4.5 1.253',
  calendar: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
  plus: 'M12 4v16m8-8H4',
  star: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915',
  chart: 'M3 3v18h18M18 17V9M13 17V5M8 17v-3',
  logout: 'M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1',
  chevronDown: 'M19 9l-7 7-7-7',
  menu: 'M4 6h16M4 12h16M4 18h16',
  x: 'M6 18L18 6M6 6l12 12',
}

const NAV_ICON = { Home:'home','Dependent Profile':'user',Jobs:'briefcase',Schools:'school','NGO Support':'ngo',Learning:'learning',Events:'calendar',Therapy:'plus','Request Help':'ngo','Request History':'chart',Saved:'star','Track Progress':'chart' }

function Ic({ name, size = 16, color = 'currentColor' }) {
  const d = ICONS[name]; if (!d) return null
  return (<svg width={size} height={size} fill="none" stroke={color} strokeWidth="1.8" viewBox="0 0 24 24" style={{ display:'block',flexShrink:0 }}><path strokeLinecap="round" strokeLinejoin="round" d={d} /></svg>)
}

const NAV_GROUPS = [
  { label:'Home', items:['Home'] },
  { label:'Dependent Profile', items:['Dependent Profile'] },
  { label:'Opportunities', items:['Jobs','Schools','Learning','Events'] },
  { label:'Support', items:['NGO Support','Therapy','Request Help','Request History'] },
  { label:'More', items:['Saved','Track Progress'] },
]

function TopNavDropdown({ group, navItems, currentPath }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const items = navItems.filter(i => group.items.includes(i.label))
  useEffect(() => { const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }; document.addEventListener('mousedown', h); return () => document.removeEventListener('mousedown', h) }, [])
  if (!items.length) return null
  const hasActive = items.some(i => i.to === '/guardian' ? currentPath === '/guardian' : currentPath.startsWith(i.to))

  if (items.length === 1) {
    const i = items[0]; const a = i.to === '/guardian' ? currentPath === '/guardian' : currentPath.startsWith(i.to)
    return (<NavLink to={i.to} end={i.to==='/guardian'} style={{ display:'flex',alignItems:'center',gap:6,padding:'7px 14px',borderRadius:8,textDecoration:'none',background:a?TEAL:'transparent',color:a?'#fff':'#374151',fontSize:13,fontWeight:a?700:500,transition:'all .15s',whiteSpace:'nowrap' }} onMouseEnter={e=>{if(!a)e.currentTarget.style.background='#f1f5f9'}} onMouseLeave={e=>{if(!a)e.currentTarget.style.background=a?TEAL:'transparent'}}><Ic name={NAV_ICON[i.label]||'home'} size={15} color={a?'#fff':'#64748b'} />{i.label}</NavLink>)
  }

  return (
    <div ref={ref} style={{ position:'relative' }}>
      <button onClick={() => setOpen(o=>!o)} style={{ display:'flex',alignItems:'center',gap:6,padding:'7px 14px',borderRadius:8,border:'none',cursor:'pointer',background:hasActive?`${TEAL}15`:'transparent',color:hasActive?TEAL:'#374151',fontSize:13,fontWeight:hasActive?700:500,transition:'all .15s',whiteSpace:'nowrap' }} onMouseEnter={e=>{if(!hasActive)e.currentTarget.style.background='#f1f5f9'}} onMouseLeave={e=>{if(!hasActive)e.currentTarget.style.background=hasActive?`${TEAL}15`:'transparent'}}>
        {group.label}<Ic name="chevronDown" size={12} color={hasActive?TEAL:'#94a3b8'} />
      </button>
      {open && (<div style={{ position:'absolute',top:'calc(100% + 6px)',left:0,background:'#fff',borderRadius:12,border:'1px solid #e9ecef',boxShadow:'0 12px 40px rgba(0,0,0,.12)',minWidth:200,padding:6,zIndex:1000,animation:'gDropIn .15s ease' }}>
        {items.map(i => { const a = i.to==='/guardian'?currentPath==='/guardian':currentPath.startsWith(i.to); return (
          <NavLink key={i.to} to={i.to} end={i.to==='/guardian'} onClick={()=>setOpen(false)} style={{ display:'flex',alignItems:'center',gap:10,width:'100%',padding:'9px 12px',borderRadius:8,textDecoration:'none',background:a?TEAL:'transparent',color:a?'#fff':'#374151',fontSize:13,fontWeight:a?700:500,transition:'background .12s',whiteSpace:'nowrap' }} onMouseEnter={e=>{if(!a)e.currentTarget.style.background='#f1f5f9'}} onMouseLeave={e=>{if(!a)e.currentTarget.style.background=a?TEAL:'transparent'}}>
            <Ic name={NAV_ICON[i.label]||'home'} size={15} color={a?'#fff':'#64748b'} />{i.label}
          </NavLink>)})}</div>)}
    </div>)
}

export default function GuardianLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)
  const currentPath = window.location.pathname
  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <div className="min-h-screen bg-slate-50">
      <style>{`@keyframes gDropIn{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:translateY(0)}}.g-tnav{display:flex;align-items:center;width:100%;background:#fff;border-bottom:1px solid #e9ecef;padding:0 20px;height:58px;position:sticky;top:0;z-index:100;box-shadow:0 1px 4px rgba(0,0,0,.04);gap:16px}.g-tnav-links{display:flex;align-items:center;gap:2px;flex:1;overflow-x:auto}.g-tnav-links::-webkit-scrollbar{display:none}.g-tnav-right{display:flex;align-items:center;gap:12px;flex-shrink:0}.g-ham{display:none}@media(max-width:900px){.g-tnav-links{display:none!important}.g-ham{display:flex!important}}`}</style>

      <nav className="g-tnav">
        <div style={{ display:'flex',alignItems:'center',gap:10,cursor:'pointer',flexShrink:0 }} onClick={()=>navigate('/')}>
          <img src={logoImg} alt="KnotneX" style={{ width:30,height:30,borderRadius:7,objectFit:'cover' }} />
          <span style={{ fontSize:14,fontWeight:900,color:NAVY,letterSpacing:'-0.02em' }}>KnotneX</span>
        </div>
        <div style={{ display:'inline-flex',alignItems:'center',gap:6,padding:'4px 10px',borderRadius:20,flexShrink:0,background:`${TEAL}12`,border:`1px solid ${TEAL}30` }}>
          <span style={{ width:7,height:7,borderRadius:'50%',background:TEAL,display:'inline-block' }} />
          <span style={{ fontSize:11,fontWeight:700,color:TEAL,whiteSpace:'nowrap' }}>Guardian / Caregiver</span>
        </div>
        <div className="g-tnav-links">{NAV_GROUPS.map(g=><TopNavDropdown key={g.label} group={g} navItems={GUARDIAN_NAV} currentPath={currentPath} />)}</div>
        <button className="g-ham" onClick={()=>setMobileOpen(true)} style={{ background:'none',border:'none',cursor:'pointer',padding:6,marginLeft:'auto',display:'flex',alignItems:'center',justifyContent:'center' }}><Ic name="menu" size={22} color="#374151" /></button>
        <div className="g-tnav-right">
          <div style={{ padding:'4px 12px',borderRadius:8,background:'#f8fafc' }}><p style={{ margin:0,fontSize:12,fontWeight:600,color:'#0f172a',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',maxWidth:160 }}>{user?.email||user?.name||'User'}</p></div>
          <button type="button" onClick={()=>navigate('/dashboard')} style={{ display:'flex',alignItems:'center',gap:6,padding:'7px 14px',borderRadius:8,border:'none',background:'#f1f5f9',cursor:'pointer',fontSize:12,fontWeight:600,color:'#374151' }} onMouseEnter={e=>e.currentTarget.style.background='#e2e8f0'} onMouseLeave={e=>e.currentTarget.style.background='#f1f5f9'}><Ic name="home" size={14} color="#64748b" />Dashboard</button>
          <button type="button" onClick={handleLogout} style={{ display:'flex',alignItems:'center',gap:6,padding:'7px 14px',borderRadius:8,border:'none',background:'#fef2f2',cursor:'pointer' }} onMouseEnter={e=>e.currentTarget.style.background='#fee2e2'} onMouseLeave={e=>e.currentTarget.style.background='#fef2f2'}><Ic name="logout" size={14} color="#ef4444" /><span style={{ fontSize:12,fontWeight:700,color:'#ef4444' }}>Sign Out</span></button>
        </div>
      </nav>

      {mobileOpen&&<div onClick={()=>setMobileOpen(false)} style={{ position:'fixed',inset:0,background:'rgba(0,0,0,.3)',zIndex:9998,backdropFilter:'blur(2px)' }} />}
      <div style={{ position:'fixed',top:0,left:0,bottom:0,width:280,maxWidth:'80vw',background:'#fff',zIndex:9999,transform:mobileOpen?'translateX(0)':'translateX(-100%)',transition:'transform .25s cubic-bezier(.4,0,.2,1)',boxShadow:mobileOpen?'4px 0 30px rgba(0,0,0,.15)':'none',display:'flex',flexDirection:'column',overflowY:'auto' }}>
        <div style={{ padding:'16px 18px',borderBottom:'1px solid #f1f5f9',display:'flex',alignItems:'center',justifyContent:'space-between' }}><span style={{ fontSize:14,fontWeight:800,color:NAVY }}>Menu</span><button onClick={()=>setMobileOpen(false)} style={{ background:'none',border:'none',cursor:'pointer',padding:4 }}><Ic name="x" size={18} color="#64748b" /></button></div>
        <nav style={{ flex:1,padding:12 }}>{GUARDIAN_NAV.map(i=>{const a=i.to==='/guardian'?currentPath==='/guardian':currentPath.startsWith(i.to);return(<NavLink key={i.to} to={i.to} end={i.to==='/guardian'} onClick={()=>setMobileOpen(false)} style={{ display:'flex',alignItems:'center',gap:10,padding:'9px 10px',borderRadius:9,textDecoration:'none',marginBottom:1,background:a?TEAL:'transparent',color:a?'#fff':'#374151',fontSize:13.5,fontWeight:a?700:500 }}><Ic name={NAV_ICON[i.label]||'home'} size={16} color={a?'#fff':'#64748b'} />{i.label}</NavLink>)})}</nav>
        <div style={{ padding:12,borderTop:'1px solid #f1f5f9' }}>
          <button type="button" onClick={()=>{navigate('/dashboard');setMobileOpen(false)}} style={{ display:'flex',alignItems:'center',gap:10,width:'100%',padding:'9px 10px',borderRadius:9,border:'none',background:'transparent',cursor:'pointer',fontSize:13.5,fontWeight:500,color:'#374151' }}><Ic name="home" size={16} color="#64748b" />Dashboard</button>
          <button type="button" onClick={()=>{handleLogout();setMobileOpen(false)}} style={{ display:'flex',alignItems:'center',gap:10,width:'100%',padding:'9px 10px',borderRadius:9,border:'none',background:'transparent',cursor:'pointer',fontSize:13.5,fontWeight:700,color:'#ef4444' }}><Ic name="logout" size={16} color="#ef4444" />Sign Out</button>
        </div>
      </div>

      <main className="w-full px-4 py-6 sm:px-6 lg:px-8"><Outlet /></main>
    </div>
  )
}
