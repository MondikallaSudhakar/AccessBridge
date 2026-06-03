import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import logoImg from '../../assets/logo.jpeg'

const NAVY = '#0f172a'
const GREEN = '#16a34a'

const ICONS = {
  search:'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z',
  bell:'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9',
  chevronDown:'M19 9l-7 7-7-7',menu:'M4 6h16M4 12h16M4 18h16',x:'M6 18L18 6M6 6l12 12',
  logout:'M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1',
  home:'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0h6',
  grid:'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z',
  school:'M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222',
  ngo:'M7 11V7a5 5 0 1110 0v4m-8 0h6m-9 0h12l-1 9H7l-1-9z',
  startup:'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
  shield:'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
  shop:'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z',
  cart:'M3 3h2l.4 2M7 13h10l3-8H6.4M7 13l-1 5h12m-11 0a1 1 0 100 2 1 1 0 000-2zm10 0a1 1 0 100 2 1 1 0 000-2z',
  check:'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
  user:'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
  info:'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
}

function Ic({n,s=16,c='currentColor'}){
  const raw=ICONS[n];if(!raw)return null
  return(<svg width={s} height={s} fill="none" stroke={c} strokeWidth="1.8" viewBox="0 0 24 24" style={{display:'block',flexShrink:0}}><path strokeLinecap="round" strokeLinejoin="round" d={raw}/></svg>)
}

/* ── Dropdown menu for grouped items ── */
function NavDropdown({section,onItemClick,isItemActive}){
  const[open,setOpen]=useState(false);const ref=useRef(null)
  useEffect(()=>{const h=e=>{if(ref.current&&!ref.current.contains(e.target))setOpen(false)};document.addEventListener('mousedown',h);return()=>document.removeEventListener('mousedown',h)},[])
  const hasActiveChild=section.items.some(item=>isItemActive(item))

  if(section.items.length===1){
    const item=section.items[0];const active=isItemActive(item)
    return(<button onClick={()=>onItemClick(item)} style={{display:'flex',alignItems:'center',gap:5,padding:'6px 0',background:'none',border:'none',cursor:'pointer',fontSize:14,fontWeight:active?700:500,color:active?NAVY:'#4b5563',transition:'color .15s',whiteSpace:'nowrap',borderBottom:active?`2px solid ${GREEN}`:'2px solid transparent'}} onMouseEnter={e=>e.currentTarget.style.color=NAVY} onMouseLeave={e=>{if(!active)e.currentTarget.style.color='#4b5563'}}>
      {item.label}
    </button>)
  }

  return(
    <div ref={ref} style={{position:'relative'}}>
      <button onClick={()=>setOpen(o=>!o)} style={{display:'flex',alignItems:'center',gap:5,padding:'6px 0',background:'none',border:'none',cursor:'pointer',fontSize:14,fontWeight:hasActiveChild?700:500,color:hasActiveChild?NAVY:'#4b5563',transition:'color .15s',whiteSpace:'nowrap'}} onMouseEnter={e=>e.currentTarget.style.color=NAVY} onMouseLeave={e=>{if(!hasActiveChild)e.currentTarget.style.color='#4b5563'}}>
        {section.label}<Ic n="chevronDown" s={12} c={hasActiveChild?NAVY:'#9ca3af'}/>
      </button>
      {open&&(<div style={{position:'absolute',top:'calc(100% + 8px)',left:-8,background:'#fff',borderRadius:14,border:'1px solid #f1f5f9',boxShadow:'0 16px 48px rgba(0,0,0,.10)',minWidth:220,padding:6,zIndex:1000,animation:'topnavDropIn .15s ease'}}>
        {section.items.map(item=>{const active=isItemActive(item);return(
          <button key={item.id} onClick={()=>{onItemClick(item);setOpen(false)}} style={{display:'flex',alignItems:'center',gap:10,width:'100%',padding:'10px 14px',borderRadius:10,border:'none',cursor:'pointer',textAlign:'left',background:active?'#f0fdf4':'transparent',color:active?GREEN:'#374151',fontSize:13.5,fontWeight:active?700:500,transition:'background .12s'}} onMouseEnter={e=>{if(!active)e.currentTarget.style.background='#f8fafc'}} onMouseLeave={e=>{if(!active)e.currentTarget.style.background='transparent'}}>
            <Ic n={item.icon} s={16} c={active?GREEN:'#64748b'}/>{item.label}
          </button>)})}
      </div>)}
    </div>)
}

/* ── Mobile drawer ── */
function MobileDrawer({open,onClose,sections,onItemClick,isItemActive,onLogout}){
  const { logout } = useAuth()
  const handleLogout = onLogout || (() => logout('/login'))
  return(<>
    {open&&<div onClick={onClose} style={{position:'fixed',inset:0,background:'rgba(0,0,0,.3)',zIndex:9998,backdropFilter:'blur(2px)'}}/>}
    <div style={{position:'fixed',top:0,left:0,bottom:0,width:290,maxWidth:'82vw',background:'#fff',zIndex:9999,transform:open?'translateX(0)':'translateX(-100%)',transition:'transform .25s cubic-bezier(.4,0,.2,1)',boxShadow:open?'4px 0 30px rgba(0,0,0,.15)':'none',display:'flex',flexDirection:'column',overflowY:'auto'}}>
      <div style={{padding:'16px 20px',borderBottom:'1px solid #f1f5f9',display:'flex',alignItems:'center',justifyContent:'space-between'}}><span style={{fontSize:16,fontWeight:900,color:NAVY}}>KnotneX</span><button onClick={onClose} style={{background:'none',border:'none',cursor:'pointer',padding:4}}><Ic n="x" s={20} c="#64748b"/></button></div>
      <nav style={{flex:1,padding:'4px 12px'}}>
        {sections.map(section=>(
          <div key={section.label||'section'} style={{marginBottom:14}}>
            {section.label&&<p style={{margin:'0 0 4px 8px',fontSize:10,fontWeight:700,color:'#94a3b8',letterSpacing:'0.10em',textTransform:'uppercase'}}>{section.label}</p>}
            {section.items.map(item=>{const active=isItemActive(item);return(
              <button key={item.id} onClick={()=>{onItemClick(item);onClose()}} style={{display:'flex',alignItems:'center',gap:10,width:'100%',padding:'10px 12px',borderRadius:10,border:'none',cursor:'pointer',textAlign:'left',marginBottom:1,background:active?'#f0fdf4':'transparent',color:active?GREEN:'#374151',fontSize:13.5,fontWeight:active?700:500,borderLeft:active?`3px solid ${GREEN}`:'3px solid transparent'}}>
                <Ic n={item.icon} s={16} c={active?GREEN:'#64748b'}/>{item.label}
              </button>)})}
          </div>))}
      </nav>
      <div style={{padding:'12px 16px',borderTop:'1px solid #f1f5f9',marginTop:'auto'}}>
        <button
          onClick={() => {
            handleLogout()
            onClose()
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            width: '100%',
            padding: '10px 12px',
            borderRadius: 10,
            border: 'none',
            cursor: 'pointer',
            textAlign: 'left',
            background: '#fff5f5',
            color: '#e11d48',
            fontSize: '13.5px',
            fontWeight: 700,
            transition: 'background .12s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = '#ffe4e6' }}
          onMouseLeave={(e) => { e.currentTarget.style.background = '#fff5f5' }}
        >
          <Ic n="logout" s={18} c="#e11d48"/>Logout
        </button>
      </div>
    </div>
  </>)
}

export default function UserNavbar({
  badgeText,
  sections=[],
  footerEmail,
  profilePath='/dashboard',
  onBrandClick,
  onItemClick,
  onLogout,
  isItemActive=()=>false,
}){
  const navigate=useNavigate()
  const{user,logout}=useAuth()
  const handleLogout=onLogout||(()=>logout('/login'))
  const handleBrandClick=onBrandClick||(()=>navigate('/dashboard'))
  const[mobileOpen,setMobileOpen]=useState(false)
  const[search,setSearch]=useState('')
  const userName=user?.name||user?.email||'User'
  const initials=userName.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase()

  const defaultItemClick=item=>{if(onItemClick){onItemClick(item);return};if(item.path)navigate(item.path)}

  return(<>
    <style>{`@keyframes topnavDropIn{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:translateY(0)}}.un-topnav{display:flex;align-items:center;width:100%;background:#fff;border-bottom:1.5px solid #f1f5f9;padding:0 28px;height:56px;position:sticky;top:0;z-index:100;gap:0;font-family:'Inter',sans-serif}.un-nav-center{display:flex;align-items:center;gap:28px;margin-left:32px}.un-nav-search{display:flex;align-items:center;flex:1;justify-content:center;margin:0 24px}.un-nav-right{display:flex;align-items:center;gap:16px;margin-left:auto;flex-shrink:0}.un-hamburger{display:none}@media(max-width:900px){.un-nav-center{display:none!important}.un-nav-search{display:none!important}.un-hamburger{display:flex!important}}`}</style>

    <nav className="un-topnav">
      <div style={{display:'flex',alignItems:'center',gap:8,cursor:'pointer',flexShrink:0}} onClick={handleBrandClick}>
        <img src={logoImg} alt="KnotneX" style={{width:30,height:30,borderRadius:7,objectFit:'cover'}}/>
        <span style={{fontSize:18,fontWeight:900,color:NAVY,letterSpacing:'-0.03em'}}>KnotneX</span>
      </div>

      <div className="un-nav-center" style={{ gap: 8 }}>
        {sections.map(section => {
          if (section.label === 'Navigation') {
            return (
              <div key={section.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                {section.items.map(item => {
                  const active = isItemActive(item)
                  return (
                    <button
                      key={item.id}
                      onClick={() => defaultItemClick(item)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        padding: '6px 12px',
                        background: active ? '#f0fdf4' : 'transparent',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '13px',
                        fontWeight: active ? 700 : 500,
                        color: active ? GREEN : '#4b5563',
                        transition: 'all 0.15s ease',
                        whiteSpace: 'nowrap',
                      }}
                      onMouseEnter={e => {
                        if (!active) {
                          e.currentTarget.style.background = '#f8fafc';
                          e.currentTarget.style.color = NAVY;
                        }
                      }}
                      onMouseLeave={e => {
                        if (!active) {
                          e.currentTarget.style.background = 'transparent';
                          e.currentTarget.style.color = '#4b5563';
                        }
                      }}
                    >
                      <Ic n={item.icon} s={16} c={active ? GREEN : '#64748b'} />
                      {item.label}
                    </button>
                  )
                })}
              </div>
            )
          }
          return (
            <NavDropdown key={section.label||'section'} section={section} onItemClick={defaultItemClick} isItemActive={item=>Boolean(isItemActive(item))}/>
          )
        })}
      </div>

      <div className="un-nav-search">
        <div style={{display:'flex',alignItems:'center',gap:8,background:'#f8fafc',border:'1.5px solid #e2e8f0',borderRadius:10,padding:'8px 16px',width:'100%',maxWidth:320}}>
          <Ic n="search" s={16} c="#94a3b8"/>
          <input type="text" placeholder="Search..." value={search} onChange={e=>setSearch(e.target.value)} style={{border:'none',background:'transparent',outline:'none',fontSize:13,color:'#374151',width:'100%',fontFamily:"'Inter', sans-serif"}}/>
        </div>
      </div>

      <button className="un-hamburger" onClick={()=>setMobileOpen(true)} style={{background:'none',border:'none',cursor:'pointer',padding:6,marginLeft:'auto'}}><Ic n="menu" s={22} c="#374151"/></button>

      <div className="un-nav-right">
        <button style={{background:'none',border:'none',cursor:'pointer',padding:4,position:'relative'}}><Ic n="bell" s={20} c="#6b7280"/><span style={{position:'absolute',top:2,right:2,width:7,height:7,borderRadius:'50%',background:GREEN,border:'1.5px solid #fff'}}/></button>
        <div style={{width:1,height:28,background:'#e5e7eb'}}/>
        <div style={{display:'flex',alignItems:'center',gap:10,cursor:'pointer'}} onClick={()=>navigate(profilePath)}>
          <div style={{textAlign:'right'}}><span style={{display:'block',fontSize:12,fontWeight:700,color:NAVY,lineHeight:1.2}}>{badgeText||'User'}</span><span style={{display:'block',fontSize:11,color:'#94a3b8',lineHeight:1.2}}>Profile</span></div>
          <div style={{width:34,height:34,borderRadius:'50%',background:`linear-gradient(135deg, ${GREEN}, #22c55e)`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:800,color:'#fff',border:'2px solid #e5e7eb',flexShrink:0}}>{initials}</div>
        </div>
        <div style={{width:1,height:28,background:'#e5e7eb'}}/>
        <button onClick={handleLogout} title="Logout" style={{background:'none',border:'none',cursor:'pointer',padding:4,display:'flex',alignItems:'center',justifyContent:'center',color:'#e11d48',transition:'color .15s'}} onMouseEnter={e=>e.currentTarget.style.color='#be123c'} onMouseLeave={e=>e.currentTarget.style.color='#e11d48'}>
          <Ic n="logout" s={20} c="currentColor"/>
        </button>
      </div>
    </nav>
    <div style={{height:2,background:`linear-gradient(90deg, ${GREEN}, #22c55e, transparent 70%)`}}/>

    <MobileDrawer open={mobileOpen} onClose={()=>setMobileOpen(false)} sections={sections} onItemClick={defaultItemClick} isItemActive={item=>Boolean(isItemActive(item))} onLogout={handleLogout}/>
  </>)
}
