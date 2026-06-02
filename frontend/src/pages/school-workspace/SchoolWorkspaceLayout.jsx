import { useState, useRef, useEffect } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { SCHOOL_WORKSPACE_NAV } from './schoolWorkspaceData'
import logoImg from '../../assets/logo.jpeg'

const AMBER = '#d97706'
const NAVY = '#0f172a'

const ICONS = {
  home: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0h6',
  users: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
  book: 'M12 6.253v13m0-13C10.832 5.483 9.246 5 7.5 5 4.462 5 2 6.79 2 9v11c0-2.21 2.462-4 5.5-4 1.746 0 3.332.483 4.5 1.253',
  user: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
  clipboard: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
  heart: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z',
  calendar: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
  star: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915',
  building: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5',
  school: 'M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422',
  logout: 'M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1',
  chevronDown: 'M19 9l-7 7-7-7',
  menu: 'M4 6h16M4 12h16M4 18h16',
  x: 'M6 18L18 6M6 6l12 12',
}

const NAV_ICON = { Home:'home',Students:'users',Programs:'book',Staff:'user',Admissions:'clipboard','Therapy & Support':'heart',Events:'calendar',Achievements:'star','NGO Partners':'building' }

function Ic({ name, size=16, color='currentColor' }) {
  const d=ICONS[name]; if(!d) return null
  return (<svg width={size} height={size} fill="none" stroke={color} strokeWidth="1.8" viewBox="0 0 24 24" style={{display:'block',flexShrink:0}}><path strokeLinecap="round" strokeLinejoin="round" d={d}/></svg>)
}

const NAV_GROUPS = [
  { label:'Home', items:['Home'] },
  { label:'People', items:['Students','Staff'] },
  { label:'Academics', items:['Programs','Admissions','Therapy & Support'] },
  { label:'Community', items:['Events','Achievements','NGO Partners'] },
]

function TopNavDropdown({ group, navItems, currentPath }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const items = navItems.filter(i => group.items.includes(i.label))
  useEffect(() => { const h=e=>{if(ref.current&&!ref.current.contains(e.target))setOpen(false)};document.addEventListener('mousedown',h);return()=>document.removeEventListener('mousedown',h) }, [])
  if (!items.length) return null
  const hasActive = items.some(i => i.to==='/school-workspace'?currentPath==='/school-workspace':currentPath.startsWith(i.to))

  if (items.length===1) {
    const i=items[0]; const a=i.to==='/school-workspace'?currentPath==='/school-workspace':currentPath.startsWith(i.to)
    return (<NavLink to={i.to} end={i.to==='/school-workspace'} style={{display:'flex',alignItems:'center',gap:6,padding:'7px 14px',borderRadius:8,textDecoration:'none',background:a?AMBER:'transparent',color:a?'#fff':'#374151',fontSize:13,fontWeight:a?700:500,transition:'all .15s',whiteSpace:'nowrap'}} onMouseEnter={e=>{if(!a)e.currentTarget.style.background='#fef3c7'}} onMouseLeave={e=>{if(!a)e.currentTarget.style.background=a?AMBER:'transparent'}}><Ic name={NAV_ICON[i.label]||'home'} size={15} color={a?'#fff':'#64748b'}/>{i.label}</NavLink>)
  }

  return (
    <div ref={ref} style={{position:'relative'}}>
      <button onClick={()=>setOpen(o=>!o)} style={{display:'flex',alignItems:'center',gap:6,padding:'7px 14px',borderRadius:8,border:'none',cursor:'pointer',background:hasActive?`${AMBER}15`:'transparent',color:hasActive?AMBER:'#374151',fontSize:13,fontWeight:hasActive?700:500,transition:'all .15s',whiteSpace:'nowrap'}} onMouseEnter={e=>{if(!hasActive)e.currentTarget.style.background='#fef3c7'}} onMouseLeave={e=>{if(!hasActive)e.currentTarget.style.background=hasActive?`${AMBER}15`:'transparent'}}>
        {group.label}<Ic name="chevronDown" size={12} color={hasActive?AMBER:'#94a3b8'}/>
      </button>
      {open&&(<div style={{position:'absolute',top:'calc(100% + 6px)',left:0,background:'#fff',borderRadius:12,border:'1px solid #e9ecef',boxShadow:'0 12px 40px rgba(0,0,0,.12)',minWidth:200,padding:6,zIndex:1000,animation:'sDropIn .15s ease'}}>
        {items.map(i=>{const a=i.to==='/school-workspace'?currentPath==='/school-workspace':currentPath.startsWith(i.to);return(
          <NavLink key={i.to} to={i.to} end={i.to==='/school-workspace'} onClick={()=>setOpen(false)} style={{display:'flex',alignItems:'center',gap:10,width:'100%',padding:'9px 12px',borderRadius:8,textDecoration:'none',background:a?AMBER:'transparent',color:a?'#fff':'#374151',fontSize:13,fontWeight:a?700:500,transition:'background .12s',whiteSpace:'nowrap'}} onMouseEnter={e=>{if(!a)e.currentTarget.style.background='#fef3c7'}} onMouseLeave={e=>{if(!a)e.currentTarget.style.background=a?AMBER:'transparent'}}>
            <Ic name={NAV_ICON[i.label]||'home'} size={15} color={a?'#fff':'#64748b'}/>{i.label}
          </NavLink>)})}</div>)}
    </div>)
}

export default function SchoolWorkspaceLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)
  const currentPath = window.location.pathname
  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <div className="min-h-screen bg-slate-50">
      <style>{`@keyframes sDropIn{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:translateY(0)}}.s-tnav{display:flex;align-items:center;width:100%;background:#fff;border-bottom:1px solid #e9ecef;padding:0 20px;height:58px;position:sticky;top:0;z-index:100;box-shadow:0 1px 4px rgba(0,0,0,.04);gap:16px}.s-tnav-links{display:flex;align-items:center;gap:2px;flex:1;overflow-x:auto}.s-tnav-links::-webkit-scrollbar{display:none}.s-tnav-right{display:flex;align-items:center;gap:12px;flex-shrink:0}.s-ham{display:none}@media(max-width:900px){.s-tnav-links{display:none!important}.s-ham{display:flex!important}}`}</style>

      <nav className="s-tnav">
        <div style={{display:'flex',alignItems:'center',gap:10,cursor:'pointer',flexShrink:0}} onClick={()=>navigate('/')}>
          <img src={logoImg} alt="KnotneX" style={{width:30,height:30,borderRadius:7,objectFit:'cover'}}/>
          <span style={{fontSize:14,fontWeight:900,color:NAVY,letterSpacing:'-0.02em'}}>KnotneX</span>
        </div>
        <div style={{display:'inline-flex',alignItems:'center',gap:6,padding:'4px 10px',borderRadius:20,flexShrink:0,background:`${AMBER}18`,border:`1px solid ${AMBER}50`}}>
          <span style={{width:7,height:7,borderRadius:'50%',background:AMBER,display:'inline-block'}}/>
          <span style={{fontSize:11,fontWeight:700,color:AMBER,whiteSpace:'nowrap'}}>School / Training Center</span>
        </div>
        <div className="s-tnav-links">{NAV_GROUPS.map(g=><TopNavDropdown key={g.label} group={g} navItems={SCHOOL_WORKSPACE_NAV} currentPath={currentPath}/>)}</div>
        <button className="s-ham" onClick={()=>setMobileOpen(true)} style={{background:'none',border:'none',cursor:'pointer',padding:6,marginLeft:'auto',display:'flex',alignItems:'center',justifyContent:'center'}}><Ic name="menu" size={22} color="#374151"/></button>
        <div className="s-tnav-right">
          <div style={{padding:'4px 12px',borderRadius:8,background:'#f8fafc'}}><p style={{margin:0,fontSize:12,fontWeight:600,color:'#0f172a',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',maxWidth:160}}>{user?.email||user?.name||'School Admin'}</p></div>
          <button type="button" onClick={()=>navigate('/school/profile')} style={{display:'flex',alignItems:'center',gap:6,padding:'7px 14px',borderRadius:8,border:'none',background:'#f1f5f9',cursor:'pointer',fontSize:12,fontWeight:600,color:'#374151'}} onMouseEnter={e=>e.currentTarget.style.background='#e2e8f0'} onMouseLeave={e=>e.currentTarget.style.background='#f1f5f9'}><Ic name="school" size={14} color="#64748b"/>Profile</button>
          <button type="button" onClick={()=>navigate('/dashboard')} style={{display:'flex',alignItems:'center',gap:6,padding:'7px 14px',borderRadius:8,border:'none',background:'#f1f5f9',cursor:'pointer',fontSize:12,fontWeight:600,color:'#374151'}} onMouseEnter={e=>e.currentTarget.style.background='#e2e8f0'} onMouseLeave={e=>e.currentTarget.style.background='#f1f5f9'}><Ic name="home" size={14} color="#64748b"/>Dashboard</button>
          <button type="button" onClick={handleLogout} style={{display:'flex',alignItems:'center',gap:6,padding:'7px 14px',borderRadius:8,border:'none',background:'#fef2f2',cursor:'pointer'}} onMouseEnter={e=>e.currentTarget.style.background='#fee2e2'} onMouseLeave={e=>e.currentTarget.style.background='#fef2f2'}><Ic name="logout" size={14} color="#ef4444"/><span style={{fontSize:12,fontWeight:700,color:'#ef4444'}}>Sign Out</span></button>
        </div>
      </nav>

      {mobileOpen&&<div onClick={()=>setMobileOpen(false)} style={{position:'fixed',inset:0,background:'rgba(0,0,0,.3)',zIndex:9998,backdropFilter:'blur(2px)'}}/>}
      <div style={{position:'fixed',top:0,left:0,bottom:0,width:280,maxWidth:'80vw',background:'#fff',zIndex:9999,transform:mobileOpen?'translateX(0)':'translateX(-100%)',transition:'transform .25s cubic-bezier(.4,0,.2,1)',boxShadow:mobileOpen?'4px 0 30px rgba(0,0,0,.15)':'none',display:'flex',flexDirection:'column',overflowY:'auto'}}>
        <div style={{padding:'16px 18px',borderBottom:'1px solid #f1f5f9',display:'flex',alignItems:'center',justifyContent:'space-between'}}><span style={{fontSize:14,fontWeight:800,color:NAVY}}>Menu</span><button onClick={()=>setMobileOpen(false)} style={{background:'none',border:'none',cursor:'pointer',padding:4}}><Ic name="x" size={18} color="#64748b"/></button></div>
        <nav style={{flex:1,padding:12}}>{SCHOOL_WORKSPACE_NAV.map(i=>{const a=i.to==='/school-workspace'?currentPath==='/school-workspace':currentPath.startsWith(i.to);return(<NavLink key={i.to} to={i.to} end={i.to==='/school-workspace'} onClick={()=>setMobileOpen(false)} style={{display:'flex',alignItems:'center',gap:10,padding:'9px 10px',borderRadius:9,textDecoration:'none',marginBottom:1,background:a?AMBER:'transparent',color:a?'#fff':'#374151',fontSize:13.5,fontWeight:a?700:500}}><Ic name={NAV_ICON[i.label]||'home'} size={16} color={a?'#fff':'#64748b'}/>{i.label}</NavLink>)})}</nav>
        <div style={{padding:12,borderTop:'1px solid #f1f5f9'}}>
          <button type="button" onClick={()=>{navigate('/dashboard');setMobileOpen(false)}} style={{display:'flex',alignItems:'center',gap:10,width:'100%',padding:'9px 10px',borderRadius:9,border:'none',background:'transparent',cursor:'pointer',fontSize:13.5,fontWeight:500,color:'#374151'}}><Ic name="home" size={16} color="#64748b"/>Dashboard</button>
          <button type="button" onClick={()=>{handleLogout();setMobileOpen(false)}} style={{display:'flex',alignItems:'center',gap:10,width:'100%',padding:'9px 10px',borderRadius:9,border:'none',background:'transparent',cursor:'pointer',fontSize:13.5,fontWeight:700,color:'#ef4444'}}><Ic name="logout" size={16} color="#ef4444"/>Sign Out</button>
        </div>
      </div>

      <main className="w-full px-4 py-6 sm:px-6 lg:px-8"><Outlet /></main>
    </div>
  )
}
