import { useState, useRef, useEffect } from 'react'
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { SCHOOL_WORKSPACE_NAV } from './schoolWorkspaceData'
import logoImg from '../../assets/logo.jpeg'

const NAVY = '#0f172a'
const GREEN = '#16a34a'

const ICONS = {
  search:'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z',
  bell:'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9',
  chevronDown:'M19 9l-7 7-7-7',menu:'M4 6h16M4 12h16M4 18h16',x:'M6 18L18 6M6 6l12 12',
  logout:'M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1',
  home:'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0h6',
  users:'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
  book:'M12 6.253v13m0-13C10.832 5.483 9.246 5 7.5 5 4.462 5 2 6.79 2 9v11c0-2.21 2.462-4 5.5-4 1.746 0 3.332.483 4.5 1.253',
  user:'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
  clipboard:'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
  heart:'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z',
  calendar:'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
  star:'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915',
  building:'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5',
}

const NAV_ICON_MAP={Home:'home',Students:'users',Programs:'book',Staff:'user',Admissions:'clipboard','Therapy & Support':'heart',Events:'calendar',Achievements:'star','NGO Partners':'building'}

function Ic({name,size=16,color='currentColor'}){const d=ICONS[name];if(!d)return null;return(<svg width={size} height={size} fill="none" stroke={color} strokeWidth="1.8" viewBox="0 0 24 24" style={{display:'block',flexShrink:0}}><path strokeLinecap="round" strokeLinejoin="round" d={d}/></svg>)}

const TOP_LINKS=[{label:'Home',to:'/school-workspace'},{label:'Students',to:'/school-workspace/students'}]
const DROPDOWN_GROUPS=[
  {label:'Academics',items:[{label:'Programs',to:'/school-workspace/programs'},{label:'Admissions',to:'/school-workspace/admissions'},{label:'Therapy & Support',to:'/school-workspace/therapy'}]},
  {label:'Community',items:[{label:'Events',to:'/school-workspace/events'},{label:'Achievements',to:'/school-workspace/achievements'},{label:'NGO Partners',to:'/school-workspace/ngo-partners'}]},
]
const TOP_LINKS_AFTER=[{label:'Staff',to:'/school-workspace/staff'}]

function NavDropdown({group,currentPath}){
  const[open,setOpen]=useState(false);const ref=useRef(null)
  useEffect(()=>{const c=e=>{if(ref.current&&!ref.current.contains(e.target))setOpen(false)};document.addEventListener('mousedown',c);return()=>document.removeEventListener('mousedown',c)},[])
  const hasActive=group.items.some(i=>currentPath.startsWith(i.to))
  return(
    <div ref={ref} style={{position:'relative'}}>
      <button onClick={()=>setOpen(o=>!o)} style={{display:'flex',alignItems:'center',gap:5,padding:'6px 0',background:'none',border:'none',cursor:'pointer',fontSize:14,fontWeight:hasActive?700:500,color:hasActive?NAVY:'#4b5563',transition:'color .15s',whiteSpace:'nowrap'}} onMouseEnter={e=>e.currentTarget.style.color=NAVY} onMouseLeave={e=>{if(!hasActive)e.currentTarget.style.color='#4b5563'}}>
        {group.label}<Ic name="chevronDown" size={12} color={hasActive?NAVY:'#9ca3af'}/>
      </button>
      {open&&(<div style={{position:'absolute',top:'calc(100% + 8px)',left:-8,background:'#fff',borderRadius:14,border:'1px solid #f1f5f9',boxShadow:'0 16px 48px rgba(0,0,0,.10)',minWidth:220,padding:6,zIndex:1000,animation:'swDropIn .15s ease'}}>
        {group.items.map(item=>{const a=currentPath.startsWith(item.to);return(
          <NavLink key={item.to} to={item.to} onClick={()=>setOpen(false)} style={{display:'flex',alignItems:'center',gap:10,width:'100%',padding:'10px 14px',borderRadius:10,textDecoration:'none',background:a?'#f0fdf4':'transparent',color:a?GREEN:'#374151',fontSize:13.5,fontWeight:a?700:500,transition:'background .12s'}} onMouseEnter={e=>{if(!a)e.currentTarget.style.background='#f8fafc'}} onMouseLeave={e=>{if(!a)e.currentTarget.style.background='transparent'}}>
            <Ic name={NAV_ICON_MAP[item.label]||'home'} size={16} color={a?GREEN:'#64748b'}/>{item.label}
          </NavLink>)})}
      </div>)}
    </div>)
}

export default function SchoolWorkspaceLayout(){
  const{user,logout}=useAuth();const navigate=useNavigate();const location=useLocation()
  const[mobileOpen,setMobileOpen]=useState(false);const[search,setSearch]=useState('')
  const currentPath=location.pathname
  const handleLogout=()=>{logout();navigate('/login')}
  const userName=user?.name||user?.email||'School Admin'
  const initials=userName.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase()

  return(
    <div style={{minHeight:'100vh',background:'#fff',fontFamily:"'Inter', sans-serif"}}>
      <style>{`@keyframes swDropIn{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:translateY(0)}}.sw-topnav{display:flex;align-items:center;width:100%;background:#fff;border-bottom:1.5px solid #f1f5f9;padding:0 28px;height:56px;position:sticky;top:0;z-index:100;gap:0}.sw-nav-center{display:flex;align-items:center;gap:28px;margin-left:32px}.sw-nav-search{display:flex;align-items:center;flex:1;justify-content:center;margin:0 24px}.sw-nav-right{display:flex;align-items:center;gap:16px;margin-left:auto;flex-shrink:0}.sw-hamburger{display:none}@media(max-width:900px){.sw-nav-center{display:none!important}.sw-nav-search{display:none!important}.sw-hamburger{display:flex!important}}`}</style>

      <nav className="sw-topnav">
        <div style={{display:'flex',alignItems:'center',gap:8,cursor:'pointer',flexShrink:0}} onClick={()=>navigate('/')}>
          <img src={logoImg} alt="KnotneX" style={{width:30,height:30,borderRadius:7,objectFit:'cover'}}/>
          <span style={{fontSize:18,fontWeight:900,color:NAVY,letterSpacing:'-0.03em'}}>KnotneX</span>
        </div>
        <div className="sw-nav-center">
          {TOP_LINKS.map(link=>{const a=link.to==='/school-workspace'?currentPath==='/school-workspace':currentPath.startsWith(link.to);return(<NavLink key={link.to} to={link.to} end={link.to==='/school-workspace'} style={{textDecoration:'none',fontSize:14,fontWeight:a?700:500,color:a?NAVY:'#4b5563',padding:'6px 0',borderBottom:a?`2px solid ${GREEN}`:'2px solid transparent',transition:'all .15s'}} onMouseEnter={e=>e.currentTarget.style.color=NAVY} onMouseLeave={e=>{if(!a)e.currentTarget.style.color='#4b5563'}}>{link.label}</NavLink>)})}
          {DROPDOWN_GROUPS.map(g=><NavDropdown key={g.label} group={g} currentPath={currentPath}/>)}
          {TOP_LINKS_AFTER.map(link=>{const a=currentPath.startsWith(link.to);return(<NavLink key={link.to} to={link.to} style={{textDecoration:'none',fontSize:14,fontWeight:a?700:500,color:a?NAVY:'#4b5563',padding:'6px 0',borderBottom:a?`2px solid ${GREEN}`:'2px solid transparent',transition:'all .15s'}} onMouseEnter={e=>e.currentTarget.style.color=NAVY} onMouseLeave={e=>{if(!a)e.currentTarget.style.color='#4b5563'}}>{link.label}</NavLink>)})}
        </div>
        <div className="sw-nav-search">
          <div style={{display:'flex',alignItems:'center',gap:8,background:'#f8fafc',border:'1.5px solid #e2e8f0',borderRadius:10,padding:'8px 16px',width:'100%',maxWidth:320}}>
            <Ic name="search" size={16} color="#94a3b8"/>
            <input type="text" placeholder="Search programs..." value={search} onChange={e=>setSearch(e.target.value)} style={{border:'none',background:'transparent',outline:'none',fontSize:13,color:'#374151',width:'100%',fontFamily:"'Inter', sans-serif"}}/>
          </div>
        </div>
        <button className="sw-hamburger" onClick={()=>setMobileOpen(true)} style={{background:'none',border:'none',cursor:'pointer',padding:6,marginLeft:'auto'}}><Ic name="menu" size={22} color="#374151"/></button>
        <div className="sw-nav-right">
          <button style={{background:'none',border:'none',cursor:'pointer',padding:4,position:'relative'}}><Ic name="bell" size={20} color="#6b7280"/><span style={{position:'absolute',top:2,right:2,width:7,height:7,borderRadius:'50%',background:GREEN,border:'1.5px solid #fff'}}/></button>
          <div style={{width:1,height:28,background:'#e5e7eb'}}/>
          <div style={{display:'flex',alignItems:'center',gap:10,cursor:'pointer'}} onClick={()=>navigate('/school/profile')}>
            <div style={{textAlign:'right'}}><span style={{display:'block',fontSize:12,fontWeight:700,color:NAVY,lineHeight:1.2}}>School</span><span style={{display:'block',fontSize:11,color:'#94a3b8',lineHeight:1.2}}>Profile</span></div>
            <div style={{width:34,height:34,borderRadius:'50%',background:`linear-gradient(135deg, ${GREEN}, #22c55e)`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:800,color:'#fff',border:'2px solid #e5e7eb',flexShrink:0}}>{initials}</div>
          </div>
          <div style={{width:1,height:28,background:'#e5e7eb'}}/>
          <button onClick={handleLogout} title="Logout" style={{background:'none',border:'none',cursor:'pointer',padding:4,display:'flex',alignItems:'center',justifyContent:'center',color:'#e11d48',transition:'color .15s'}} onMouseEnter={e=>e.currentTarget.style.color='#be123c'} onMouseLeave={e=>e.currentTarget.style.color='#e11d48'}>
            <Ic name="logout" size={20} color="currentColor"/>
          </button>
        </div>
      </nav>
      <div style={{height:2,background:`linear-gradient(90deg, ${GREEN}, #22c55e, transparent 70%)`}}/>

      {mobileOpen&&<div onClick={()=>setMobileOpen(false)} style={{position:'fixed',inset:0,background:'rgba(0,0,0,.3)',zIndex:9998,backdropFilter:'blur(2px)'}}/>}
      <div style={{position:'fixed',top:0,left:0,bottom:0,width:290,maxWidth:'82vw',background:'#fff',zIndex:9999,transform:mobileOpen?'translateX(0)':'translateX(-100%)',transition:'transform .25s cubic-bezier(.4,0,.2,1)',boxShadow:mobileOpen?'4px 0 30px rgba(0,0,0,.15)':'none',display:'flex',flexDirection:'column',overflowY:'auto'}}>
        <div style={{padding:'16px 20px',borderBottom:'1px solid #f1f5f9',display:'flex',alignItems:'center',justifyContent:'space-between'}}><span style={{fontSize:16,fontWeight:900,color:NAVY}}>KnotneX</span><button onClick={()=>setMobileOpen(false)} style={{background:'none',border:'none',cursor:'pointer',padding:4}}><Ic name="x" size={20} color="#64748b"/></button></div>
        <div style={{padding:'12px 20px',borderBottom:'1px solid #f8fafc'}}><div style={{display:'inline-flex',alignItems:'center',gap:6,padding:'5px 12px',borderRadius:20,background:`${GREEN}10`,border:`1px solid ${GREEN}30`}}><span style={{width:7,height:7,borderRadius:'50%',background:GREEN,display:'inline-block'}}/><span style={{fontSize:11,fontWeight:700,color:GREEN}}>School / Training Center</span></div></div>
        <nav style={{flex:1,padding:'4px 12px'}}>
          {SCHOOL_WORKSPACE_NAV.map(item=>{const a=item.to==='/school-workspace'?currentPath==='/school-workspace':currentPath.startsWith(item.to);return(<NavLink key={item.to} to={item.to} end={item.to==='/school-workspace'} onClick={()=>setMobileOpen(false)} style={{display:'flex',alignItems:'center',gap:10,padding:'10px 12px',borderRadius:10,textDecoration:'none',marginBottom:1,background:a?'#f0fdf4':'transparent',color:a?GREEN:'#374151',fontSize:13.5,fontWeight:a?700:500,borderLeft:a?`3px solid ${GREEN}`:'3px solid transparent'}}><Ic name={NAV_ICON_MAP[item.label]||'home'} size={16} color={a?GREEN:'#64748b'}/>{item.label}</NavLink>)})}
        </nav>
        <div style={{padding:'12px 16px',borderTop:'1px solid #f1f5f9'}}>
          <button type="button" onClick={()=>{navigate('/dashboard');setMobileOpen(false)}} style={{display:'flex',alignItems:'center',gap:10,width:'100%',padding:'10px 12px',borderRadius:10,border:'none',background:'transparent',cursor:'pointer',fontSize:13.5,fontWeight:500,color:'#374151'}}><Ic name="home" size={16} color="#64748b"/>Dashboard</button>
          <button type="button" onClick={()=>{handleLogout();setMobileOpen(false)}} style={{display:'flex',alignItems:'center',gap:10,width:'100%',padding:'10px 12px',borderRadius:10,border:'none',background:'transparent',cursor:'pointer',fontSize:13.5,fontWeight:700,color:'#ef4444'}}><Ic name="logout" size={16} color="#ef4444"/>Sign Out</button>
        </div>
      </div>

      <main style={{maxWidth:1200,margin:'0 auto',padding:'24px 20px'}}><Outlet/></main>
    </div>)
}
