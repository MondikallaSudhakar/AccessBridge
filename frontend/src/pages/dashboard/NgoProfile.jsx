import { useEffect, useMemo, useRef, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useNavigate, useSearchParams } from 'react-router-dom'
import api from '../../services/api'

/* ─────────────────────────── constants ──────────────────────────────── */
const BASE  = 'http://localhost:8081/api'
const G     = '#5BCB2B'          // brand green (buttons, badges)
const B     = '#1A8FD1'          // brand blue
const NAVY  = '#0f172a'          // dark text
const TEAL  = '#0d9488'          // sidebar active color (NYSPACE style)
const SIDEBAR_W = 260

/* ─────────────────────────── blank forms ────────────────────────────── */
const blankNeed        = { title:'', description:'', category:'SUPPORT', targetAmount:'', urgent:false }
const blankJob         = { title:'', description:'', employmentType:'FULL_TIME', location:'', salaryRange:'', applicationUrl:'', lastDateToApply:'' }
const blankProduct     = { name:'', description:'', category:'', price:'', stockQuantity:'', available:true }
const blankService     = { title:'', description:'', category:'', contactInfo:'', availability:'', status:'ACTIVE' }
const blankAchievement = { title:'', description:'', category:'', achievementDate:'', imageUrl:'' }
const blankVolunteer   = { fullName:'', email:'', phone:'', skills:'', availability:'', preferredCity:'', status:'PENDING', note:'' }
const blankCampaign    = { title:'', objective:'', startDate:'', endDate:'', targetBeneficiaries:'', volunteerTarget:'', spentAmount:'', status:'PLANNED', impactSummary:'' }

/* ─────────────────────────── helpers ────────────────────────────────── */
const fmt = v => { if(!v) return ''; const d=new Date(v); return isNaN(d)?'':d.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}) }
const tKey  = (m,me) => !m||!me?null : m.senderEmail===me ? m.recipientEmail||null : m.senderEmail||null
const tName = (m,me) => !m||!me?'Unknown' : m.senderEmail===me ? m.recipientEmail||'Unknown' : m.senderName||m.senderEmail||'Unknown'
const mergeMsg = (list, inc) => {
  const idx = list.findIndex(m => m.id === inc.id)
  if (idx === -1) return [...list, inc]
  const next = [...list]
  next[idx] = { ...next[idx], ...inc }
  return next
}

/* ─────────────────────────── SVG icons ──────────────────────────────── */
const ICONS = {
  home:       'd="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"',
  clipboard:  'd="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"',
  briefcase:  'd="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"',
  box:        'd="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"',
  users:      'd="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"',
  star:       'd="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"',
  inbox:      'd="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"',
  eye:        ['d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"', 'd="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"'],
  logout:     'd="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"',
  back:       'd="M15 19l-7-7 7-7"',
  ngo:        'd="M7 11V7a5 5 0 1110 0v4m-8 0h6m-9 0h12l-1 9H7l-1-9z"',
  save:       'd="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"',
  plus:       'd="M12 4v16m8-8H4"',
  trash:      'd="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"',
  x:          'd="M6 18L18 6M6 6l12 12"',
  check:      'd="M5 13l4 4L19 7"',
  clock:      'd="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"',
  location:   'd="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"',
  currency:   'd="M9 8h6m-5 0a3 3 0 110 6H9l3 3m-3-6h6m6 1a9 9 0 11-18 0 9 9 0 0118 0z"',
  calendar:   'd="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"',
  chat:       'd="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"',
  send:       'd="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"',
  warning:    'd="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"',
  building:   'd="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"',
  chevronR:   'd="M9 5l7 7-7 7"',
  mail:       'd="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"',
}

const Icon = ({ name, size = 16, color = 'currentColor', strokeWidth = 1.8, style = {} }) => {
  const d = ICONS[name]
  const paths = Array.isArray(d) ? d : [d]
  return (
    <svg width={size} height={size} fill="none" stroke={color} strokeWidth={strokeWidth}
      viewBox="0 0 24 24" style={{ display:'block', flexShrink:0, ...style }}>
      {paths.map((p,i) => <path key={i} strokeLinecap="round" strokeLinejoin="round" {...Object.fromEntries([p.split('=').reduce((a,v,i,arr)=>i%2===0?a:[...a,[arr[i-1].trim().replace(/^d/,'d'),v.replace(/^"|"$/g,'')]],[])[0]])} />)}
    </svg>
  )
}

// Simpler Icon implementation
const Ic = ({ n, s=16, c='currentColor', sw=1.8, st={} }) => {
  const raw = ICONS[n]
  const dArr = Array.isArray(raw) ? raw : (raw ? [raw] : [])
  return (
    <svg width={s} height={s} fill="none" stroke={c} strokeWidth={sw} viewBox="0 0 24 24" style={{display:'block',flexShrink:0,...st}}>
      {dArr.map((attr,i)=>{
        const dMatch = attr.match(/d="([^"]+)"/)
        return dMatch ? <path key={i} strokeLinecap="round" strokeLinejoin="round" d={dMatch[1]} /> : null
      })}
    </svg>
  )
}

/* ─────────────────────────── TABS definition ────────────────────────── */
const TABS = [
  { id:'overview',      label:'Overview',     icon:'home'      },
  { id:'requirements',  label:'Requirements', icon:'clipboard' },
  { id:'supportRequests', label:'Support Requests', icon:'chat' },
  { id:'volunteers',    label:'Volunteers',   icon:'users'     },
  { id:'campaigns',     label:'Campaigns',    icon:'calendar'  },
  { id:'jobs',          label:'Jobs',         icon:'briefcase' },
  { id:'products',      label:'Products',     icon:'box'       },
  { id:'services',      label:'Services',     icon:'users'     },
  { id:'achievements',  label:'Achievements', icon:'star'      },
  { id:'messages',      label:'Messages',     icon:'inbox'     },
]

/* ─────────────────────────── design tokens ──────────────────────────── */
const radius = { sm:6, md:10, lg:14, xl:18 }
const shadow = {
  xs:  '0 1px 2px rgba(0,0,0,.06)',
  sm:  '0 1px 4px rgba(0,0,0,.08)',
  md:  '0 2px 8px rgba(0,0,0,.10)',
  lg:  '0 4px 16px rgba(0,0,0,.12)',
}

/* ─────────────────────────── micro components ───────────────────────── */
const FieldLabel = ({ children, required }) => (
  <label style={{display:'block',fontSize:11.5,fontWeight:600,color:'#64748b',marginBottom:5,letterSpacing:'0.04em',textTransform:'uppercase'}}>
    {children}{required && <span style={{color:'#ef4444',marginLeft:2}}>*</span>}
  </label>
)

const TextInput = ({ style={}, ...p }) => (
  <input
    style={{width:'100%',boxSizing:'border-box',border:'1.5px solid #e2e8f0',borderRadius:radius.md,padding:'9px 13px',fontSize:14,color:NAVY,background:'#fff',outline:'none',fontFamily:"'Inter',sans-serif",transition:'border-color .18s,box-shadow .18s',...style}}
    onFocus={e=>{e.target.style.borderColor=G;e.target.style.boxShadow=`0 0 0 3px ${G}20`}}
    onBlur={e=>{e.target.style.borderColor='#e2e8f0';e.target.style.boxShadow='none'}}
    {...p}
  />
)

const TextArea = ({ style={}, ...p }) => (
  <textarea
    style={{width:'100%',boxSizing:'border-box',border:'1.5px solid #e2e8f0',borderRadius:radius.md,padding:'9px 13px',fontSize:14,color:NAVY,background:'#fff',outline:'none',resize:'vertical',fontFamily:"'Inter',sans-serif",transition:'border-color .18s,box-shadow .18s',lineHeight:1.6,...style}}
    onFocus={e=>{e.target.style.borderColor=G;e.target.style.boxShadow=`0 0 0 3px ${G}20`}}
    onBlur={e=>{e.target.style.borderColor='#e2e8f0';e.target.style.boxShadow='none'}}
    {...p}
  />
)

const PrimaryBtn = ({ iconName, loading, children, style={}, ...p }) => (
  <button
    style={{display:'inline-flex',alignItems:'center',gap:7,padding:'9px 20px',borderRadius:radius.md,border:'none',background:loading?'#94a3b8':G,color:'#fff',fontWeight:700,fontSize:13,cursor:loading?'not-allowed':'pointer',fontFamily:"'Inter',sans-serif",boxShadow:`0 2px 8px ${G}50`,transition:'transform .15s,box-shadow .15s,background .15s',...style}}
    onMouseEnter={e=>{if(!loading){e.currentTarget.style.transform='translateY(-1px)';e.currentTarget.style.boxShadow=`0 4px 14px ${G}60`}}}
    onMouseLeave={e=>{e.currentTarget.style.transform='translateY(0)';e.currentTarget.style.boxShadow=`0 2px 8px ${G}50`}}
    disabled={loading}
    {...p}
  >
    {loading
      ? <span style={{width:14,height:14,borderRadius:'50%',border:'2px solid rgba(255,255,255,.4)',borderTopColor:'#fff',animation:'spin .7s linear infinite',display:'inline-block'}}/>
      : iconName && <Ic n={iconName} s={15} c="#fff"/>}
    {children}
  </button>
)

const GhostBtn = ({ iconName, children, color='#ef4444', style={}, ...p }) => (
  <button
    style={{display:'inline-flex',alignItems:'center',gap:5,padding:'5px 11px',borderRadius:radius.sm,border:`1.5px solid ${color}30`,background:`${color}0a`,color,fontSize:12,fontWeight:600,cursor:'pointer',fontFamily:"'Inter',sans-serif",transition:'all .15s',whiteSpace:'nowrap',...style}}
    onMouseEnter={e=>{e.currentTarget.style.background=`${color}18`;e.currentTarget.style.borderColor=`${color}80`}}
    onMouseLeave={e=>{e.currentTarget.style.background=`${color}0a`;e.currentTarget.style.borderColor=`${color}30`}}
    {...p}
  >
    {iconName && <Ic n={iconName} s={13} c={color}/>}
    {children}
  </button>
)

const Panel = ({ children, style={} }) => (
  <div style={{background:'#fff',borderRadius:radius.xl,border:'1px solid #e9ecef',boxShadow:shadow.sm,padding:'28px 28px',...style}}>
    {children}
  </div>
)

const PanelHeader = ({ title, subtitle, action }) => (
  <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:24,paddingBottom:18,borderBottom:'1px solid #f1f5f9'}}>
    <div>
      <h2 style={{margin:0,fontSize:17,fontWeight:800,color:NAVY,letterSpacing:'-0.02em'}}>{title}</h2>
      {subtitle && <p style={{margin:'4px 0 0',fontSize:13,color:'#64748b',lineHeight:1.5}}>{subtitle}</p>}
    </div>
    {action}
  </div>
)

const Chip = ({ children, color=G, iconName }) => (
  <span style={{display:'inline-flex',alignItems:'center',gap:4,padding:'3px 9px',borderRadius:20,fontSize:11,fontWeight:700,color,background:`${color}12`,border:`1px solid ${color}30`,whiteSpace:'nowrap'}}>
    {iconName && <Ic n={iconName} s={10} c={color}/>}
    {children}
  </span>
)

const MetaItem = ({ iconName, children }) => (
  <span style={{display:'inline-flex',alignItems:'center',gap:4,fontSize:12,color:'#64748b'}}>
    <Ic n={iconName} s={13} c="#94a3b8"/>{children}
  </span>
)

const Divider = () => <div style={{height:1,background:'#f1f5f9',margin:'16px 0'}}/>

const EmptyPane = ({ iconName, title, body }) => (
  <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'52px 24px',color:'#94a3b8',textAlign:'center'}}>
    <div style={{width:56,height:56,borderRadius:'50%',background:'#f8fafc',border:'1px solid #e2e8f0',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:14}}>
      <Ic n={iconName} s={26} c="#cbd5e1"/>
    </div>
    <p style={{margin:'0 0 4px',fontWeight:700,fontSize:14,color:'#94a3b8'}}>{title}</p>
    {body && <p style={{margin:0,fontSize:13}}>{body}</p>}
  </div>
)

const ListItem = ({ children, hover=true }) => {
  const [hov,setHov] = useState(false)
  return (
    <div
      style={{borderRadius:radius.lg,border:'1.5px solid',borderColor:hov?`${G}60`:'#e9ecef',background:hov?`${G}04`:'#fafbfc',padding:'14px 18px',transition:'all .18s',cursor:'default'}}
      onMouseEnter={()=>hover&&setHov(true)}
      onMouseLeave={()=>setHov(false)}
    >{children}</div>
  )
}

/* ── SidebarBtn: NYSPACE-inspired nav item ─────────────────────────────── */
function SidebarBtn({ t, active, count, onClick }) {
  const [hov, setHov] = useState(false)
  return (
    <button
      onClick={onClick}
      style={{
        display:'flex', alignItems:'center', justifyContent:'space-between',
        width:'100%', padding:'9px 10px', borderRadius:9, border:'none',
        cursor:'pointer', textAlign:'left', marginBottom:1,
        background: active ? TEAL : hov ? '#f8fafc' : 'transparent',
        transition:'background .15s',
      }}
      onMouseEnter={()=>setHov(true)}
      onMouseLeave={()=>setHov(false)}
    >
      <div style={{display:'flex', alignItems:'center', gap:11}}>
        <Ic n={t.icon} s={17} c={active ? '#fff' : '#64748b'} sw={active ? 2 : 1.7}/>
        <span style={{fontSize:13.5, fontWeight: active ? 700 : 500, color: active ? '#fff' : '#374151', transition:'color .15s'}}>
          {t.label}
        </span>
      </div>
      {count > 0 && (
        <span style={{
          fontSize:11, fontWeight:700,
          color: active ? TEAL : '#3d9f4a',
          background: active ? 'rgba(255,255,255,.22)' : '#dcfce7',
          padding:'1px 7px', borderRadius:12,
          minWidth:22, textAlign:'center',
        }}>
          {count}
        </span>
      )}
    </button>
  )
}

function SidebarFooterBtn({ icon, label, color, onClick }) {
  const [hov, setHov] = useState(false)
  return (
    <button
      onClick={onClick}
      style={{display:'flex', alignItems:'center', gap:9, width:'100%', padding:'8px 10px', borderRadius:9, border:'none', background: hov ? `${color}10` : 'transparent', cursor:'pointer', transition:'background .15s', textAlign:'left'}}
      onMouseEnter={()=>setHov(true)}
      onMouseLeave={()=>setHov(false)}
    >
      <Ic n={icon} s={16} c={color}/>
      <span style={{fontSize:13, fontWeight:500, color}}>{label}</span>
    </button>
  )
}

/* ─────────────────────────── MAIN COMPONENT ─────────────────────────── */
export default function NgoProfile() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const chatEndRef = useRef(null)

  const [tab, setTab]             = useState(searchParams.get('tab') || 'overview')
  const [loading, setLoading]     = useState(true)
  const [saving, setSaving]       = useState(false)
  const [ngo, setNgo]             = useState(null)
  const [form, setForm]           = useState({})
  const [error, setError]         = useState('')
  const [success, setSuccess]     = useState('')

  const [needs, setNeeds]         = useState([])
  const [jobs, setJobs]           = useState([])
  const [products, setProducts]   = useState([])
  const [services, setServices]   = useState([])
  const [achievements, setAchievements] = useState([])
  const [supportRequests, setSupportRequests] = useState([])
  const [volunteers, setVolunteers] = useState([])
  const [campaigns, setCampaigns] = useState([])
  const [messages, setMessages]   = useState([])
  const [selThread, setSelThread] = useState('')
  const [mobileView, setMobileView] = useState('threads') // 'threads' | 'chat' (mobile WhatsApp nav)
  const [msgText, setMsgText]     = useState('')
  const [sending, setSending]     = useState(false)

  const [needForm, setNeedForm]               = useState(blankNeed)
  const [jobForm, setJobForm]                 = useState(blankJob)
  const [productForm, setProductForm]         = useState(blankProduct)
  const [serviceForm, setServiceForm]         = useState(blankService)
  const [achievementForm, setAchievementForm] = useState(blankAchievement)
  const [volunteerForm, setVolunteerForm] = useState(blankVolunteer)
  const [campaignForm, setCampaignForm] = useState(blankCampaign)
  const [supportRequestFilter, setSupportRequestFilter] = useState('PENDING')

  /* effects */
  useEffect(() => {
    if (user && user.role !== 'NGO_ADMIN') { navigate('/dashboard'); return }
    if (user?.email) loadNgo()
  }, [user])

  useEffect(() => setTab(searchParams.get('tab') || 'overview'), [searchParams])

  useEffect(() => {
    if (!ngo?.id || !user) return
    let alive = true
    const token = localStorage.getItem('token')
    if (!token) return
    const sse = new EventSource(`${BASE}/messages/stream?token=${encodeURIComponent(token)}`)
    api.get(`/messages/ngo/${ngo.id}`)
      .then(d  => { if(alive) setMessages(Array.isArray(d)?d:[]) })
      .catch(() => { if(alive) setMessages([]) })
    sse.addEventListener('message', e => {
      if (!alive) return
      try {
        const inc = JSON.parse(e.data)
        if (Number(inc.ngoId) !== Number(ngo.id)) return
        setMessages(p => mergeMsg(p, inc))
      } catch {}
    })
    return () => { alive=false; sse.close() }
  }, [ngo?.id, user])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior:'smooth' })
  }, [messages, selThread])

  /* derived */
  const threads = useMemo(() => {
    if (!user?.email) return []
    const map = new Map()
    for (const m of messages) {
      const email = tKey(m, user.email)
      if (!email || email === user.email) continue
      const ex = map.get(email)
      const isUnreadForNgo = m.senderEmail !== user.email && m.recipientEmail === user.email && !m.seen
      if (!ex) {
        map.set(email, {
          email,
          name: tName(m, user.email),
          last: m,
          unreadCount: isUnreadForNgo ? 1 : 0,
        })
        continue
      }
      if (new Date(m?.createdAt||0) >= new Date(ex.last?.createdAt||0)) ex.last = m
      if (!ex.name || ex.name===email) ex.name = tName(m,user.email)
      if (isUnreadForNgo) ex.unreadCount += 1
    }
    return [...map.values()].sort((a,b)=>new Date(b.last?.createdAt||0)-new Date(a.last?.createdAt||0))
  }, [messages, user?.email])

  const threadMsgs = useMemo(() => {
    if (!selThread || !user?.email) return []
    return messages.filter(m=>tKey(m,user.email)===selThread).sort((a,b)=>new Date(a.createdAt||0)-new Date(b.createdAt||0))
  }, [messages, selThread, user?.email])

  useEffect(() => {
    if (!threads.length) { setSelThread(''); return }
    if (!threads.some(t=>t.email===selThread)) setSelThread(threads[0].email)
  }, [threads, selThread])

  useEffect(() => {
    if (tab !== 'messages' || !ngo?.id || !selThread || !user?.email) return

    const hasUnread = threadMsgs.some(m => m.senderEmail !== user.email && m.recipientEmail === user.email && !m.seen)
    if (!hasUnread) return

    let alive = true

    api.put(`/messages/ngo/${ngo.id}/seen?senderEmail=${encodeURIComponent(selThread)}`, {})
      .then(updated => {
        if (!alive || !Array.isArray(updated) || updated.length === 0) return
        setMessages(prev => updated.reduce((acc, msg) => mergeMsg(acc, msg), prev))
      })
      .catch(() => {
        // Best effort. SSE still updates seen state if request succeeds from another tab.
      })

    return () => { alive = false }
  }, [ngo?.id, selThread, tab, threadMsgs, user?.email])

  /* data loaders */
  const loadNgo = async () => {
    setLoading(true); setError('')
    try {
      const d = await api.get(`/ngos/email/${encodeURIComponent(user.email)}`)
      setNgo(d); setForm(d); await loadData(d.id)
    } catch {
      setNgo(null); setForm({ email:user.email, verified:false, country:'India' })
    } finally { setLoading(false) }
  }

  const loadData = async id => {
    const [n,j,p,s,a,sr,v,c] = await Promise.all([
      api.get(`/ngos/${id}/needs`).catch(()=>[]),
      api.get(`/ngos/${id}/jobs`).catch(()=>[]),
      api.get(`/ngos/${id}/products`).catch(()=>[]),
      api.get(`/ngos/${id}/services`).catch(()=>[]),
      api.get(`/ngos/${id}/achievements`).catch(()=>[]),
      api.get(`/ngos/${id}/support-requests`).catch(()=>[]),
      api.get(`/ngos/${id}/volunteers`).catch(()=>[]),
      api.get(`/ngos/${id}/campaigns`).catch(()=>[]),
    ])
    setNeeds(Array.isArray(n)?n:[]); setJobs(Array.isArray(j)?j:[])
    setProducts(Array.isArray(p)?p:[]); setServices(Array.isArray(s)?s:[])
    setAchievements(Array.isArray(a)?a:[])
    setSupportRequests(Array.isArray(sr)?sr:[])
    setVolunteers(Array.isArray(v)?v:[])
    setCampaigns(Array.isArray(c)?c:[])
  }

  const flash = (msg) => { setSuccess(msg); setTimeout(()=>setSuccess(''), 3000) }

  const handleLogout = () => { logout(); navigate('/login') }
  const pi = e => { const v=e.target.type==='checkbox'?e.target.checked:e.target.value; setForm(p=>({...p,[e.target.name]:v})) }

  const saveProfile = async e => {
    e.preventDefault(); setSaving(true); setError('')
    try {
      if (ngo?.id) { const u=await api.put(`/ngos/${ngo.id}`,{...form,verified:ngo.verified}); setNgo(u); setForm(u) }
      else { const c=await api.post('/ngos',{...form,email:user.email,verified:false}); setNgo(c); setForm(c); await loadData(c.id) }
      flash('Profile saved successfully!')
    } catch(err) { setError(err.message||'Failed to save profile') }
    finally { setSaving(false) }
  }

  const createNeed = async e => {
    e.preventDefault(); if(!ngo?.id) return
    try {
      await fetch(`${BASE}/ngos/${ngo.id}/needs`,{method:'POST',headers:{'Content-Type':'application/json','Authorization':`Bearer ${localStorage.getItem('token')}`},body:JSON.stringify({...needForm,targetAmount:needForm.targetAmount?parseFloat(needForm.targetAmount):0})})
      setNeedForm(blankNeed); loadData(ngo.id); flash('Requirement posted!')
    } catch { setError('Failed to post requirement') }
  }
  const createJob = async e => { e.preventDefault(); if(!ngo?.id)return; try{await api.post(`/ngos/${ngo.id}/jobs`,jobForm);setJobForm(blankJob);loadData(ngo.id);flash('Job posted!')}catch(err){setError(err.message||'Error')} }
  const createProduct = async e => { e.preventDefault(); if(!ngo?.id)return; try{await api.post(`/ngos/${ngo.id}/products`,{...productForm,price:productForm.price?parseFloat(productForm.price):0,stockQuantity:productForm.stockQuantity?parseInt(productForm.stockQuantity,10):0});setProductForm(blankProduct);loadData(ngo.id);flash('Product posted!')}catch(err){setError(err.message||'Error')} }
  const createService = async e => { e.preventDefault(); if(!ngo?.id)return; try{await api.post(`/ngos/${ngo.id}/services`,serviceForm);setServiceForm(blankService);loadData(ngo.id);flash('Service posted!')}catch(err){setError(err.message||'Error')} }
  const createAchievement = async e => { e.preventDefault(); if(!ngo?.id)return; try{await api.post(`/ngos/${ngo.id}/achievements`,achievementForm);setAchievementForm(blankAchievement);loadData(ngo.id);flash('Achievement posted!')}catch(err){setError(err.message||'Error')} }
  const createVolunteer = async e => { e.preventDefault(); if(!ngo?.id)return; try{await api.post(`/ngos/${ngo.id}/volunteers`, volunteerForm); setVolunteerForm(blankVolunteer); loadData(ngo.id); flash('Volunteer profile added!')}catch(err){setError(err.message||'Error')} }
  const createCampaign = async e => { e.preventDefault(); if(!ngo?.id)return; try{await api.post(`/ngos/${ngo.id}/campaigns`, {...campaignForm, targetBeneficiaries: campaignForm.targetBeneficiaries ? Number(campaignForm.targetBeneficiaries) : null, volunteerTarget: campaignForm.volunteerTarget ? Number(campaignForm.volunteerTarget) : null, spentAmount: campaignForm.spentAmount ? Number(campaignForm.spentAmount) : null}); setCampaignForm(blankCampaign); loadData(ngo.id); flash('Campaign added!')}catch(err){setError(err.message||'Error')} }
  const updateSupportRequestStatus = async (requestId, status) => {
    if (!ngo?.id) return
    try {
      await api.patch(`/ngos/support-requests/${requestId}/status?status=${encodeURIComponent(status)}`, {})
      await loadData(ngo.id)
      flash(`Support request marked as ${status}.`)
    } catch (err) {
      setError(err.message || 'Failed to update support request status')
    }
  }
  const closeNeed = async id => { if(!ngo?.id)return; await fetch(`${BASE}/ngos/needs/${id}/close`,{method:'PATCH',headers:{'Authorization':`Bearer ${localStorage.getItem('token')}`}}); loadData(ngo.id) }
  const del = async ep => { if(!ngo?.id)return; await api.delete(ep); loadData(ngo.id) }

  const filteredSupportRequests = useMemo(() => {
    if (supportRequestFilter === 'ALL') return supportRequests
    return supportRequests.filter((request) => request.status === supportRequestFilter)
  }, [supportRequests, supportRequestFilter])

  const sendMsg = async e => {
    e.preventDefault(); if(!ngo?.id)return
    if(!localStorage.getItem('token')){setError('Session expired');navigate('/login');return}
    const content=msgText.trim(); if(!content||!selThread)return
    setSending(true)
    try{await api.post(`/messages/ngo/${ngo.id}`,{content,recipientEmail:selThread});setMsgText('')}
    catch(err){setError(err.message||'Failed to send')}
    finally{setSending(false)}
  }

  /* counts for sidebar badges */
  const totalUnread = threads.reduce((sum, t) => sum + (t.unreadCount || 0), 0)
  const counts = {
    requirements:needs.length,
    supportRequests:supportRequests.filter(r => r.status === 'PENDING').length,
    volunteers:volunteers.length,
    campaigns:campaigns.length,
    jobs:jobs.length,
    products:products.length,
    services:services.length,
    achievements:achievements.length,
    messages:totalUnread,
  }

  /* ── loading ── */
  if (loading) return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#f4f6f8',fontFamily:"'Inter',sans-serif"}}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{textAlign:'center'}}>
        <div style={{width:44,height:44,borderRadius:'50%',border:`3px solid ${G}30`,borderTopColor:G,animation:'spin .8s linear infinite',margin:'0 auto 14px'}}/>
        <p style={{color:'#64748b',fontSize:14,fontWeight:500,margin:0}}>Loading NGO Dashboard…</p>
      </div>
    </div>
  )

  /* ── RENDER ── */
  return (
    <div style={{display:'flex',minHeight:'100vh',background:'#f4f6f8',fontFamily:"'Inter',sans-serif"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
        @keyframes slideInRight{from{opacity:0;transform:translateX(30px)}to{opacity:1;transform:translateX(0)}}
        @keyframes slideInLeft{from{opacity:0;transform:translateX(-30px)}to{opacity:1;transform:translateX(0)}}
        .fade-in{animation:fadeIn .25s ease forwards}
        .slide-right{animation:slideInRight .22s ease forwards}
        .slide-left{animation:slideInLeft .22s ease forwards}
        *{box-sizing:border-box}
        ::-webkit-scrollbar{width:5px;height:5px}
        ::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:#cbd5e1;border-radius:10px}

        /* desktop defaults */
        .ngo-sidebar    { display:flex !important; }
        .ngo-bottom-nav { display:none !important; }
        .ngo-main       { padding-bottom:0 !important; }
        .ngo-topbar-pill{ display:flex !important; }
        .ngo-topbar-sub { display:block !important; }
        .ngo-mob-back   { display:none !important; }
        .ngo-msg-grid   { grid-template-columns:260px 1fr; }
        .ngo-msg-threads{ display:flex !important; }
        .ngo-msg-chat   { display:flex !important; }

        /* mobile ≤767px */
        @media(max-width:767px){
          .ngo-sidebar    { display:none !important; }
          .ngo-bottom-nav { display:flex !important; }
          .ngo-main       { padding-bottom:68px !important; }
          .ngo-content    { padding:12px 12px 28px !important; }
          .ngo-stats-grid { grid-template-columns:repeat(3,1fr) !important; gap:10px !important; }
          .ngo-two-col    { grid-template-columns:1fr !important; }
          .ngo-form-2col  { grid-template-columns:1fr !important; }
          .ngo-topbar-pill{ display:none !important; }
          .ngo-topbar-sub { display:none !important; }
          .ngo-topbar     { padding:0 14px !important; }

          /* WhatsApp-style message panels */
          .ngo-msg-container { height:calc(100vh - 132px) !important; border-radius:0 !important; }
          .ngo-msg-grid   { grid-template-columns:1fr !important; }
          .ngo-msg-threads{ flex-direction:column; overflow-y:auto; }
          .ngo-msg-threads.hidden-panel { display:none !important; }
          .ngo-msg-chat   { flex-direction:column; }
          .ngo-msg-chat.hidden-panel { display:none !important; }
          .ngo-mob-back   { display:flex !important; }
          .ngo-inbox-header { display:none !important; }
        }

        /* tablet 768–1023px */
        @media(min-width:768px) and (max-width:1023px){
          .ngo-stats-grid { grid-template-columns:repeat(3,1fr) !important; }
          .ngo-content    { padding:18px 20px 48px !important; }
          .ngo-msg-grid   { grid-template-columns:220px 1fr !important; }
        }
      `}</style>

      {/* ══════════════════ SIDEBAR ══════════════════ */}
      <aside className="ngo-sidebar" style={{
        width: SIDEBAR_W,
        minWidth: SIDEBAR_W,
        background: '#ffffff',
        borderRight: '1px solid #e9ecef',
        flexDirection:'column',
        position:'sticky',
        top:0,
        height:'100vh',
        overflowY:'auto',
        zIndex:50,
      }}>

        {/* Brand */}
        <div style={{padding:'22px 20px 18px',borderBottom:'1px solid #f1f5f9'}}>
          <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:16}}>
            <div style={{width:38,height:38,borderRadius:10,background:`linear-gradient(135deg,${TEAL},#0f766e)`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,boxShadow:`0 2px 8px ${TEAL}50`}}>
              <Ic n="ngo" s={18} c="#fff"/>
            </div>
            <div>
              <p style={{margin:0,fontSize:15,fontWeight:800,color:NAVY,lineHeight:1.1,letterSpacing:'-0.02em'}}>NGO Portal</p>
              <p style={{margin:0,fontSize:11,color:'#94a3b8',lineHeight:1.5}}>Inclusive Connect</p>
            </div>
          </div>

          {/* Role badge – NYSPACE style */}
          <div style={{display:'inline-flex',alignItems:'center',gap:7,padding:'5px 12px',borderRadius:20,background:'#f0fdf4',border:'1px solid #bbf7d0'}}>
            <span style={{width:8,height:8,borderRadius:'50%',background:G,display:'inline-block',flexShrink:0}}></span>
            <span style={{fontSize:12,fontWeight:700,color:'#166534'}}>{ngo?.name ? 'NGO Admin' : 'Sign Up First'}</span>
          </div>
        </div>

        {/* Nav links */}
        <nav style={{flex:1,padding:'16px 12px 8px'}}>

          {/* MAIN section */}
          <p style={{margin:'0 0 4px 8px',fontSize:10,fontWeight:700,color:'#94a3b8',letterSpacing:'0.10em',textTransform:'uppercase'}}>Main</p>
          {TABS.slice(0,1).map(t=>{
            const active = tab===t.id
            const count  = counts[t.id]
            return (
              <SidebarBtn key={t.id} t={t} active={active} count={count} onClick={()=>setTab(t.id)}/>
            )
          })}

          {/* MANAGEMENT section */}
          <p style={{margin:'16px 0 4px 8px',fontSize:10,fontWeight:700,color:'#94a3b8',letterSpacing:'0.10em',textTransform:'uppercase'}}>Management</p>
          {TABS.slice(1).map(t=>{
            const active = tab===t.id
            const count  = counts[t.id]
            return (
              <SidebarBtn key={t.id} t={t} active={active} count={count} onClick={()=>setTab(t.id)}/>
            )
          })}
        </nav>

        {/* Sidebar footer */}
        <div style={{padding:'8px 12px 20px',borderTop:'1px solid #f1f5f9',display:'flex',flexDirection:'column',gap:2}}>
          <SidebarFooterBtn icon="eye"  label="View Public Profile" color={B} onClick={()=>navigate(ngo?.id?`/ngos/${ngo.id}`:'/') }/>
          <SidebarFooterBtn icon="back" label="Back to Home"        color="#64748b" onClick={()=>navigate('/dashboard')}/>
          <div style={{height:1,background:'#f1f5f9',margin:'4px 0'}}/>
          <button
            onClick={handleLogout}
            style={{display:'flex',alignItems:'center',gap:9,width:'100%',padding:'9px 10px',borderRadius:9,border:'none',background:'transparent',cursor:'pointer',transition:'background .15s',textAlign:'left'}}
            onMouseEnter={e=>e.currentTarget.style.background='#fef2f2'}
            onMouseLeave={e=>e.currentTarget.style.background='transparent'}
          >
            <Ic n="logout" s={16} c="#ef4444"/>
            <span style={{fontSize:13,fontWeight:700,color:'#ef4444'}}>Sign Out</span>
          </button>
          <p style={{margin:'6px 0 0 10px',fontSize:10.5,color:'#94a3b8',fontWeight:500,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{user?.email}</p>
        </div>
      </aside>

      {/* ══════════════════ MAIN AREA ══════════════════ */}
      <main className="ngo-main" style={{flex:1,minWidth:0,display:'flex',flexDirection:'column'}}>

        {/* Topbar */}
        <header className="ngo-topbar" style={{background:'#fff',borderBottom:'1px solid #e9ecef',padding:'0 32px',height:58,display:'flex',alignItems:'center',justifyContent:'space-between',position:'sticky',top:0,zIndex:40,boxShadow:shadow.xs}}>
          <div>
            <h1 style={{margin:0,fontSize:16,fontWeight:800,color:NAVY,letterSpacing:'-0.02em'}}>{TABS.find(t=>t.id===tab)?.label}</h1>
            <p className="ngo-topbar-sub" style={{margin:0,fontSize:11.5,color:'#94a3b8'}}>{
              tab==='overview'       ? 'Manage your NGO information' :
              tab==='requirements'   ? 'Post and manage requirements' :
              tab==='supportRequests'? 'Review and respond to user help requests' :
              tab==='volunteers'     ? 'Track volunteer profiles and readiness' :
              tab==='campaigns'      ? 'Plan and track campaign outcomes' :
              tab==='jobs'           ? 'Manage job listings' :
              tab==='products'       ? 'List products for the community' :
              tab==='services'       ? 'Services visible on public profile' :
              tab==='achievements'   ? 'Showcase your milestones' :
              tab==='messages'       ? 'Real-time conversations' : ''
            }</p>
          </div>
          {/* Breadcrumb pill */}
          <div className="ngo-topbar-pill" style={{alignItems:'center',gap:6,padding:'5px 12px',background:'#f8fafc',borderRadius:20,border:'1px solid #e9ecef'}}>
            <Ic n={TABS.find(t=>t.id===tab)?.icon||'home'} s={13} c={G}/>
            <span style={{fontSize:12,fontWeight:600,color:'#475569'}}>{TABS.find(t=>t.id===tab)?.label}</span>
          </div>
        </header>

        {/* Toasts */}
        <div style={{position:'fixed',top:70,right:24,zIndex:999,display:'flex',flexDirection:'column',gap:8}}>
          {error && (
            <div className="fade-in" style={{display:'flex',alignItems:'center',gap:10,background:'#fff',border:'1px solid #fecaca',borderLeft:`4px solid #ef4444`,borderRadius:10,padding:'12px 16px',boxShadow:shadow.md,maxWidth:340}}>
              <Ic n="warning" s={16} c="#ef4444"/>
              <span style={{fontSize:13,color:'#dc2626',fontWeight:500,flex:1}}>{error}</span>
              <button onClick={()=>setError('')} style={{background:'none',border:'none',cursor:'pointer',padding:0,display:'flex'}}><Ic n="x" s={14} c="#94a3b8"/></button>
            </div>
          )}
          {success && (
            <div className="fade-in" style={{display:'flex',alignItems:'center',gap:10,background:'#fff',border:'1px solid #bbf7d0',borderLeft:`4px solid ${G}`,borderRadius:10,padding:'12px 16px',boxShadow:shadow.md,maxWidth:340}}>
              <Ic n="check" s={16} c={G}/>
              <span style={{fontSize:13,color:'#166534',fontWeight:500}}>{success}</span>
            </div>
          )}
        </div>

        {/* Scrollable content */}
        <div className="ngo-content" style={{flex:1,overflowY:'auto',padding:'28px 32px 60px'}}>

          {/* ── OVERVIEW ────────────────────────────────────────────── */}
          {tab === 'overview' && (
            <div className="fade-in" style={{display:'flex',flexDirection:'column',gap:24}}>
              {/* Stats row */}
              {ngo && (
                <div className="ngo-stats-grid" style={{display:'grid',gap:14}}>
                  {[
                    {label:'Requirements', value:needs.length,       icon:'clipboard', color:'#6366f1'},
                    {label:'Jobs',         value:jobs.length,        icon:'briefcase', color:B},
                    {label:'Products',     value:products.length,    icon:'box',       color:'#f59e0b'},
                    {label:'Services',     value:services.length,    icon:'users',     color:G},
                    {label:'Achievements', value:achievements.length,icon:'star',      color:'#ec4899'},
                  ].map(s=>(
                    <div key={s.label} style={{background:'#fff',borderRadius:radius.lg,border:'1px solid #e9ecef',padding:'16px 18px',boxShadow:shadow.xs,display:'flex',alignItems:'center',gap:12}}>
                      <div style={{width:38,height:38,borderRadius:9,background:`${s.color}12`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                        <Ic n={s.icon} s={18} c={s.color}/>
                      </div>
                      <div>
                        <p style={{margin:0,fontSize:22,fontWeight:800,color:NAVY,lineHeight:1}}>{s.value}</p>
                        <p style={{margin:0,fontSize:11,color:'#64748b'}}>{s.label}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <Panel>
                <PanelHeader title="NGO Profile" subtitle="This information appears on your public profile and the community directory." />
                <form onSubmit={saveProfile}>
                  <div className="ngo-form-2col" style={{display:'grid',gap:18}}>
                    {[
                      {name:'name',               label:'NGO Name',            req:true},
                      {name:'email',              label:'Email Address',        req:true},
                      {name:'phone',              label:'Phone Number'},
                      {name:'registrationNumber', label:'Registration Number'},
                      {name:'city',               label:'City'},
                      {name:'state',              label:'State'},
                      {name:'country',            label:'Country'},
                      {name:'websiteUrl',         label:'Website URL'},
                    ].map(f=>(
                      <div key={f.name}>
                        <FieldLabel required={f.req}>{f.label}</FieldLabel>
                        <TextInput name={f.name} value={form[f.name]||''} onChange={pi} placeholder={f.label} required={!!f.req}/>
                      </div>
                    ))}
                    <div style={{gridColumn:'1/-1'}}><FieldLabel>Logo URL</FieldLabel><TextInput name="logoUrl" value={form.logoUrl||''} onChange={pi} placeholder="https://…/logo.png"/></div>
                    <div style={{gridColumn:'1/-1'}}><FieldLabel required>Address</FieldLabel><TextArea name="address" value={form.address||''} onChange={pi} placeholder="Full postal address" rows={2} required/></div>
                    <div style={{gridColumn:'1/-1'}}><FieldLabel>Mission Statement</FieldLabel><TextArea name="mission" value={form.mission||''} onChange={pi} placeholder="What drives your organisation?" rows={2}/></div>
                    <div style={{gridColumn:'1/-1'}}><FieldLabel>Description</FieldLabel><TextArea name="description" value={form.description||''} onChange={pi} placeholder="Tell the community about your work and impact…" rows={3}/></div>
                    <div style={{gridColumn:'1/-1'}}><FieldLabel>Past Campaign Highlights</FieldLabel><TextArea name="campaignHistory" value={form.campaignHistory||''} onChange={pi} placeholder="Share previously run campaigns and outcomes." rows={3}/></div>
                    <div style={{gridColumn:'1/-1'}}><FieldLabel>What You Provided</FieldLabel><TextArea name="supportProvidedSummary" value={form.supportProvidedSummary||''} onChange={pi} placeholder="Mention devices/services/support provided to beneficiaries." rows={3}/></div>
                    <div><FieldLabel>Total Spend (INR)</FieldLabel><TextInput name="totalSpend" type="number" value={form.totalSpend||''} onChange={pi} placeholder="e.g. 2500000"/></div>
                  </div>
                  <div style={{marginTop:22,paddingTop:18,borderTop:'1px solid #f1f5f9'}}>
                    <PrimaryBtn type="submit" iconName="save" loading={saving}>{saving?'Saving…':'Save Profile'}</PrimaryBtn>
                  </div>
                </form>
              </Panel>
            </div>
          )}

          {/* ── SUPPORT REQUESTS ───────────────────────────────────── */}
          {tab === 'supportRequests' && (
            <div className="fade-in" style={{display:'flex',flexDirection:'column',gap:24}}>
              <Panel>
                <PanelHeader
                  title="User Support Requests"
                  subtitle="Accept or decline beneficiary requests and coordinate your response plan."
                />
                <div style={{display:'flex',gap:8,marginBottom:16,flexWrap:'wrap'}}>
                  {['PENDING','ACCEPTED','DECLINED','ALL'].map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setSupportRequestFilter(status)}
                      style={{
                        border:'1px solid #e2e8f0',
                        borderRadius:999,
                        padding:'6px 12px',
                        background: supportRequestFilter === status ? '#dcfce7' : '#fff',
                        color: supportRequestFilter === status ? '#166534' : '#475569',
                        fontSize:12,
                        fontWeight:700,
                        cursor:'pointer',
                      }}
                    >
                      {status}
                    </button>
                  ))}
                </div>
                {filteredSupportRequests.length===0 ? (
                  <EmptyPane iconName="chat" title="No support requests yet" body="When users ask for help from your NGO, requests will appear here."/>
                ) : (
                  <div style={{display:'flex',flexDirection:'column',gap:10}}>
                    {filteredSupportRequests.map((req)=>(
                      <ListItem key={req.id}>
                        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:12}}>
                          <div style={{flex:1,minWidth:0}}>
                            <div style={{display:'flex',alignItems:'center',gap:8,flexWrap:'wrap',marginBottom:6}}>
                              <p style={{margin:0,fontSize:14,fontWeight:700,color:NAVY}}>{req.title}</p>
                              <Chip color={req.status === 'ACCEPTED' ? G : req.status === 'DECLINED' ? '#ef4444' : '#f59e0b'}>{req.status}</Chip>
                              {req.requestType && <Chip color={B}>{req.requestType}</Chip>}
                            </div>
                            <p style={{margin:'0 0 8px',fontSize:13,color:'#64748b',lineHeight:1.5}}>{req.description}</p>
                            <div style={{display:'flex',flexWrap:'wrap',gap:10}}>
                              <MetaItem iconName="users">{req.requesterName}</MetaItem>
                              <MetaItem iconName="mail">{req.requesterEmail}</MetaItem>
                              {req.requesterPhone && <MetaItem iconName="chat">{req.requesterPhone}</MetaItem>}
                              {req.preferredCity && <MetaItem iconName="location">{req.preferredCity}</MetaItem>}
                            </div>
                          </div>
                          <div style={{display:'flex',gap:6,flexShrink:0}}>
                            <GhostBtn onClick={() => updateSupportRequestStatus(req.id, 'ACCEPTED')} color={G} iconName="check">Accept</GhostBtn>
                            <GhostBtn onClick={() => updateSupportRequestStatus(req.id, 'DECLINED')} color="#ef4444" iconName="x">Decline</GhostBtn>
                          </div>
                        </div>
                      </ListItem>
                    ))}
                  </div>
                )}
              </Panel>
            </div>
          )}

          {/* ── VOLUNTEERS ─────────────────────────────────────────── */}
          {tab === 'volunteers' && (
            <div className="fade-in ngo-two-col" style={{display:'grid',gap:24,alignItems:'start'}}>
              <Panel>
                <PanelHeader title="Add Volunteer Profile" subtitle="Dedicated volunteer records for CSR reporting."/>
                <form onSubmit={createVolunteer} style={{display:'flex',flexDirection:'column',gap:14}}>
                  <div><FieldLabel required>Full Name</FieldLabel><TextInput required value={volunteerForm.fullName} onChange={e=>setVolunteerForm(p=>({...p,fullName:e.target.value}))} /></div>
                  <div><FieldLabel required>Email</FieldLabel><TextInput required type="email" value={volunteerForm.email} onChange={e=>setVolunteerForm(p=>({...p,email:e.target.value}))} /></div>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                    <div><FieldLabel>Phone</FieldLabel><TextInput value={volunteerForm.phone} onChange={e=>setVolunteerForm(p=>({...p,phone:e.target.value}))} /></div>
                    <div><FieldLabel>Preferred City</FieldLabel><TextInput value={volunteerForm.preferredCity} onChange={e=>setVolunteerForm(p=>({...p,preferredCity:e.target.value}))} /></div>
                  </div>
                  <div><FieldLabel>Availability</FieldLabel><TextInput value={volunteerForm.availability} onChange={e=>setVolunteerForm(p=>({...p,availability:e.target.value}))} placeholder="Weekends / evenings"/></div>
                  <div><FieldLabel>Skills</FieldLabel><TextArea rows={3} value={volunteerForm.skills} onChange={e=>setVolunteerForm(p=>({...p,skills:e.target.value}))} /></div>
                  <PrimaryBtn type="submit" iconName="plus">Add Volunteer</PrimaryBtn>
                </form>
              </Panel>
              <Panel>
                <PanelHeader title="Volunteer Profiles" subtitle={`${volunteers.length} records`} />
                {volunteers.length === 0 ? <EmptyPane iconName="users" title="No volunteers yet" body="Add volunteer profiles to track CSR participation."/> : (
                  <div style={{display:'flex',flexDirection:'column',gap:10}}>
                    {volunteers.map((volunteer) => (
                      <ListItem key={volunteer.id}>
                        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:10}}>
                          <div style={{flex:1,minWidth:0}}>
                            <div style={{display:'flex',gap:8,alignItems:'center',flexWrap:'wrap',marginBottom:6}}>
                              <p style={{margin:0,fontSize:14,fontWeight:700,color:NAVY}}>{volunteer.fullName}</p>
                              <Chip color={volunteer.status === 'APPROVED' ? G : volunteer.status === 'REJECTED' ? '#ef4444' : '#f59e0b'}>{volunteer.status}</Chip>
                            </div>
                            <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
                              <MetaItem iconName="mail">{volunteer.email}</MetaItem>
                              {volunteer.phone && <MetaItem iconName="chat">{volunteer.phone}</MetaItem>}
                              {volunteer.preferredCity && <MetaItem iconName="location">{volunteer.preferredCity}</MetaItem>}
                            </div>
                            {volunteer.skills && <p style={{margin:'8px 0 0',fontSize:13,color:'#64748b'}}>{volunteer.skills}</p>}
                          </div>
                          <GhostBtn onClick={() => del(`/ngos/volunteers/${volunteer.id}`)} color="#ef4444" iconName="trash">Delete</GhostBtn>
                        </div>
                      </ListItem>
                    ))}
                  </div>
                )}
              </Panel>
            </div>
          )}

          {/* ── CAMPAIGNS ──────────────────────────────────────────── */}
          {tab === 'campaigns' && (
            <div className="fade-in ngo-two-col" style={{display:'grid',gap:24,alignItems:'start'}}>
              <Panel>
                <PanelHeader title="Add Campaign" subtitle="Track campaign outcomes separate from needs and achievements."/>
                <form onSubmit={createCampaign} style={{display:'flex',flexDirection:'column',gap:14}}>
                  <div><FieldLabel required>Campaign Title</FieldLabel><TextInput required value={campaignForm.title} onChange={e=>setCampaignForm(p=>({...p,title:e.target.value}))} /></div>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                    <div><FieldLabel>Start Date</FieldLabel><TextInput type="date" value={campaignForm.startDate} onChange={e=>setCampaignForm(p=>({...p,startDate:e.target.value}))} /></div>
                    <div><FieldLabel>End Date</FieldLabel><TextInput type="date" value={campaignForm.endDate} onChange={e=>setCampaignForm(p=>({...p,endDate:e.target.value}))} /></div>
                  </div>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                    <div><FieldLabel>Target Beneficiaries</FieldLabel><TextInput type="number" value={campaignForm.targetBeneficiaries} onChange={e=>setCampaignForm(p=>({...p,targetBeneficiaries:e.target.value}))} /></div>
                    <div><FieldLabel>Volunteer Target</FieldLabel><TextInput type="number" value={campaignForm.volunteerTarget} onChange={e=>setCampaignForm(p=>({...p,volunteerTarget:e.target.value}))} /></div>
                  </div>
                  <div><FieldLabel>Spent Amount (INR)</FieldLabel><TextInput type="number" value={campaignForm.spentAmount} onChange={e=>setCampaignForm(p=>({...p,spentAmount:e.target.value}))} /></div>
                  <div><FieldLabel>Objective</FieldLabel><TextArea rows={3} value={campaignForm.objective} onChange={e=>setCampaignForm(p=>({...p,objective:e.target.value}))} /></div>
                  <div><FieldLabel>Impact Summary</FieldLabel><TextArea rows={3} value={campaignForm.impactSummary} onChange={e=>setCampaignForm(p=>({...p,impactSummary:e.target.value}))} /></div>
                  <PrimaryBtn type="submit" iconName="plus">Add Campaign</PrimaryBtn>
                </form>
              </Panel>
              <Panel>
                <PanelHeader title="Campaigns" subtitle={`${campaigns.length} campaigns`} />
                {campaigns.length === 0 ? <EmptyPane iconName="calendar" title="No campaigns yet" body="Create campaign records for detailed CSR reporting."/> : (
                  <div style={{display:'flex',flexDirection:'column',gap:10}}>
                    {campaigns.map((campaign) => (
                      <ListItem key={campaign.id}>
                        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:10}}>
                          <div style={{flex:1,minWidth:0}}>
                            <div style={{display:'flex',gap:8,alignItems:'center',flexWrap:'wrap',marginBottom:6}}>
                              <p style={{margin:0,fontSize:14,fontWeight:700,color:NAVY}}>{campaign.title}</p>
                              <Chip color={B}>{campaign.status}</Chip>
                            </div>
                            <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
                              {campaign.startDate && <MetaItem iconName="calendar">{campaign.startDate}</MetaItem>}
                              {campaign.targetBeneficiaries && <MetaItem iconName="users">Beneficiaries: {campaign.targetBeneficiaries}</MetaItem>}
                              {campaign.spentAmount && <MetaItem iconName="currency">INR {Number(campaign.spentAmount).toLocaleString('en-IN')}</MetaItem>}
                            </div>
                            {campaign.objective && <p style={{margin:'8px 0 0',fontSize:13,color:'#64748b'}}>{campaign.objective}</p>}
                          </div>
                          <GhostBtn onClick={() => del(`/ngos/campaigns/${campaign.id}`)} color="#ef4444" iconName="trash">Delete</GhostBtn>
                        </div>
                      </ListItem>
                    ))}
                  </div>
                )}
              </Panel>
            </div>
          )}

          {/* ── REQUIREMENTS ────────────────────────────────────────── */}
          {tab === 'requirements' && (
            <div className="fade-in ngo-two-col" style={{display:'grid',gap:24,alignItems:'start'}}>
              <Panel>
                <PanelHeader title="Post a Requirement" subtitle="Describe what your NGO needs from the community."/>
                <form onSubmit={createNeed} style={{display:'flex',flexDirection:'column',gap:14}}>
                  <div><FieldLabel required>Title</FieldLabel><TextInput value={needForm.title} onChange={e=>setNeedForm(p=>({...p,title:e.target.value}))} placeholder="e.g. Laptops for students" required/></div>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                    <div><FieldLabel>Target Amount (₹)</FieldLabel><TextInput type="number" value={needForm.targetAmount} onChange={e=>setNeedForm(p=>({...p,targetAmount:e.target.value}))} placeholder="0"/></div>
                    <div><FieldLabel>Category</FieldLabel><TextInput value={needForm.category} onChange={e=>setNeedForm(p=>({...p,category:e.target.value}))} placeholder="SUPPORT"/></div>
                  </div>
                  <label style={{display:'flex',alignItems:'center',gap:8,cursor:'pointer',padding:'10px 12px',background:'#fff8e1',borderRadius:radius.md,border:'1px solid #fde68a'}}>
                    <input type="checkbox" checked={needForm.urgent} onChange={e=>setNeedForm(p=>({...p,urgent:e.target.checked}))} style={{width:15,height:15,accentColor:'#f59e0b'}}/>
                    <span style={{fontSize:13,fontWeight:600,color:'#92400e'}}>Mark as Urgent</span>
                  </label>
                  <div><FieldLabel required>Description</FieldLabel><TextArea value={needForm.description} onChange={e=>setNeedForm(p=>({...p,description:e.target.value}))} placeholder="Provide details…" rows={4} required/></div>
                  <PrimaryBtn type="submit" iconName="plus">Post Requirement</PrimaryBtn>
                </form>
              </Panel>

              <Panel>
                <PanelHeader title="Posted Requirements" subtitle={`${needs.length} total`}/>
                {needs.length===0 ? <EmptyPane iconName="clipboard" title="No requirements yet" body="Post your first requirement using the form."/> :
                  <div style={{display:'flex',flexDirection:'column',gap:10}}>
                    {needs.map(n=>(
                      <ListItem key={n.id}>
                        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:10}}>
                          <div style={{flex:1,minWidth:0}}>
                            <div style={{display:'flex',alignItems:'center',flexWrap:'wrap',gap:6,marginBottom:5}}>
                              <span style={{fontSize:14,fontWeight:700,color:NAVY}}>{n.title}</span>
                              {n.urgent && <Chip color="#ef4444" iconName="warning">Urgent</Chip>}
                              <Chip color={n.status==='ACTIVE'?G:'#94a3b8'}>{n.status}</Chip>
                            </div>
                            <p style={{margin:'0 0 8px',fontSize:13,color:'#64748b',lineHeight:1.5}}>{n.description}</p>
                            {n.targetAmount>0 && <MetaItem iconName="currency">₹{Number(n.targetAmount).toLocaleString('en-IN')}</MetaItem>}
                          </div>
                          <div style={{display:'flex',gap:6,flexShrink:0}}>
                            {n.status==='ACTIVE' && <GhostBtn onClick={()=>closeNeed(n.id)} color="#f59e0b" iconName="x">Close</GhostBtn>}
                            <GhostBtn onClick={()=>del(`/ngos/needs/${n.id}`)} color="#ef4444" iconName="trash">Delete</GhostBtn>
                          </div>
                        </div>
                      </ListItem>
                    ))}
                  </div>
                }
              </Panel>
            </div>
          )}

          {/* ── JOBS ────────────────────────────────────────────────── */}
          {tab === 'jobs' && (
            <div className="fade-in ngo-two-col" style={{display:'grid',gap:24,alignItems:'start'}}>
              <Panel>
                <PanelHeader title="Post a Job" subtitle="Recruit for your NGO's team."/>
                <form onSubmit={createJob} style={{display:'flex',flexDirection:'column',gap:14}}>
                  <div><FieldLabel required>Job Title</FieldLabel><TextInput value={jobForm.title} onChange={e=>setJobForm(p=>({...p,title:e.target.value}))} placeholder="e.g. Community Outreach Officer" required/></div>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                    <div><FieldLabel>Employment Type</FieldLabel><TextInput value={jobForm.employmentType} onChange={e=>setJobForm(p=>({...p,employmentType:e.target.value}))} placeholder="FULL_TIME"/></div>
                    <div><FieldLabel>Location</FieldLabel><TextInput value={jobForm.location} onChange={e=>setJobForm(p=>({...p,location:e.target.value}))} placeholder="City or Remote"/></div>
                    <div><FieldLabel>Salary Range</FieldLabel><TextInput value={jobForm.salaryRange} onChange={e=>setJobForm(p=>({...p,salaryRange:e.target.value}))} placeholder="₹20,000–₹35,000"/></div>
                    <div><FieldLabel>Last Date to Apply</FieldLabel><TextInput type="date" value={jobForm.lastDateToApply} onChange={e=>setJobForm(p=>({...p,lastDateToApply:e.target.value}))}/></div>
                  </div>
                  <div><FieldLabel>Application URL</FieldLabel><TextInput value={jobForm.applicationUrl} onChange={e=>setJobForm(p=>({...p,applicationUrl:e.target.value}))} placeholder="https://…"/></div>
                  <div><FieldLabel required>Job Description</FieldLabel><TextArea value={jobForm.description} onChange={e=>setJobForm(p=>({...p,description:e.target.value}))} placeholder="Responsibilities, requirements…" rows={4} required/></div>
                  <PrimaryBtn type="submit" iconName="plus">Post Job</PrimaryBtn>
                </form>
              </Panel>

              <Panel>
                <PanelHeader title="Job Listings" subtitle={`${jobs.length} active`}/>
                {jobs.length===0 ? <EmptyPane iconName="briefcase" title="No jobs listed" body="Post your first job using the form."/> :
                  <div style={{display:'flex',flexDirection:'column',gap:10}}>
                    {jobs.map(j=>(
                      <ListItem key={j.id}>
                        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:10}}>
                          <div style={{flex:1,minWidth:0}}>
                            <p style={{margin:'0 0 6px',fontSize:14,fontWeight:700,color:NAVY}}>{j.title}</p>
                            <div style={{display:'flex',flexWrap:'wrap',gap:8,marginBottom:6}}>
                              {j.employmentType && <Chip color={B}>{j.employmentType}</Chip>}
                              {j.location && <MetaItem iconName="location">{j.location}</MetaItem>}
                              {j.salaryRange && <MetaItem iconName="currency">{j.salaryRange}</MetaItem>}
                              {j.lastDateToApply && <MetaItem iconName="calendar">By {j.lastDateToApply}</MetaItem>}
                            </div>
                            <p style={{margin:0,fontSize:13,color:'#64748b',lineHeight:1.5}}>{j.description}</p>
                          </div>
                          <GhostBtn onClick={()=>del(`/ngos/jobs/${j.id}`)} color="#ef4444" iconName="trash">Delete</GhostBtn>
                        </div>
                      </ListItem>
                    ))}
                  </div>
                }
              </Panel>
            </div>
          )}

          {/* ── PRODUCTS ────────────────────────────────────────────── */}
          {tab === 'products' && (
            <div className="fade-in" style={{display:'flex',flexDirection:'column',gap:24}}>
              <Panel>
                <PanelHeader title="Post a Product" subtitle="List assistive products for the community marketplace."/>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:18}}>
                  <div><FieldLabel required>Product Name</FieldLabel><TextInput value={productForm.name} onChange={e=>setProductForm(p=>({...p,name:e.target.value}))} placeholder="e.g. Hearing Aid Kit" required/></div>
                  <div><FieldLabel>Category</FieldLabel><TextInput value={productForm.category} onChange={e=>setProductForm(p=>({...p,category:e.target.value}))} placeholder="e.g. Assistive Device"/></div>
                  <div><FieldLabel required>Price (₹)</FieldLabel><TextInput type="number" value={productForm.price} onChange={e=>setProductForm(p=>({...p,price:e.target.value}))} placeholder="0" required/></div>
                  <div><FieldLabel>Stock Quantity</FieldLabel><TextInput type="number" value={productForm.stockQuantity} onChange={e=>setProductForm(p=>({...p,stockQuantity:e.target.value}))} placeholder="0"/></div>
                  <div style={{gridColumn:'1/-1'}}><FieldLabel>Description</FieldLabel><TextArea value={productForm.description} onChange={e=>setProductForm(p=>({...p,description:e.target.value}))} placeholder="Describe the product…" rows={3}/></div>
                  <label style={{display:'flex',alignItems:'center',gap:8,cursor:'pointer'}}>
                    <input type="checkbox" checked={productForm.available} onChange={e=>setProductForm(p=>({...p,available:e.target.checked}))} style={{width:15,height:15,accentColor:G}}/>
                    <span style={{fontSize:13,fontWeight:600,color:'#475569'}}>Currently Available</span>
                  </label>
                </div>
                <div style={{marginTop:20,paddingTop:16,borderTop:'1px solid #f1f5f9'}}>
                  <PrimaryBtn onClick={createProduct} iconName="plus">Post Product</PrimaryBtn>
                </div>
              </Panel>

              <Panel>
                <PanelHeader title="Product Catalogue" subtitle={`${products.length} products`}/>
                {products.length===0 ? <EmptyPane iconName="box" title="No products listed" body="Add your first product using the form above."/> :
                  <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))',gap:14}}>
                    {products.map(p=>(
                      <ListItem key={p.id}>
                        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:8,marginBottom:6}}>
                          <p style={{margin:0,fontSize:14,fontWeight:700,color:NAVY,lineHeight:1.3}}>{p.name}</p>
                          <Chip color={p.available?G:'#94a3b8'} iconName={p.available?'check':'x'}>{p.available?'Available':'Out of Stock'}</Chip>
                        </div>
                        <div style={{display:'flex',gap:12,marginBottom:8}}>
                          <MetaItem iconName="currency">₹{Number(p.price||0).toLocaleString('en-IN')}</MetaItem>
                          <MetaItem iconName="box">Qty: {p.stockQuantity}</MetaItem>
                        </div>
                        <p style={{margin:'0 0 10px',fontSize:13,color:'#64748b',lineHeight:1.5}}>{p.description}</p>
                        <GhostBtn onClick={()=>del(`/ngos/products/${p.id}`)} color="#ef4444" iconName="trash">Remove</GhostBtn>
                      </ListItem>
                    ))}
                  </div>
                }
              </Panel>
            </div>
          )}

          {/* ── SERVICES ────────────────────────────────────────────── */}
          {tab === 'services' && (
            <div className="fade-in ngo-two-col" style={{display:'grid',gap:24,alignItems:'start'}}>
              <Panel>
                <PanelHeader title="Post a Service" subtitle="Services appear on your public NGO profile."/>
                <form onSubmit={createService} style={{display:'flex',flexDirection:'column',gap:14}}>
                  <div><FieldLabel required>Service Title</FieldLabel><TextInput value={serviceForm.title} onChange={e=>setServiceForm(p=>({...p,title:e.target.value}))} placeholder="e.g. Counselling Support" required/></div>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                    <div><FieldLabel>Category</FieldLabel><TextInput value={serviceForm.category} onChange={e=>setServiceForm(p=>({...p,category:e.target.value}))} placeholder="e.g. Mental Health"/></div>
                    <div><FieldLabel>Availability</FieldLabel><TextInput value={serviceForm.availability} onChange={e=>setServiceForm(p=>({...p,availability:e.target.value}))} placeholder="Mon–Fri, 9am–5pm"/></div>
                  </div>
                  <div><FieldLabel>Contact Info</FieldLabel><TextInput value={serviceForm.contactInfo} onChange={e=>setServiceForm(p=>({...p,contactInfo:e.target.value}))} placeholder="Phone or email"/></div>
                  <div><FieldLabel required>Description</FieldLabel><TextArea value={serviceForm.description} onChange={e=>setServiceForm(p=>({...p,description:e.target.value}))} placeholder="Describe the service…" rows={4} required/></div>
                  <PrimaryBtn type="submit" iconName="plus">Post Service</PrimaryBtn>
                </form>
              </Panel>

              <Panel>
                <PanelHeader title="Active Services" subtitle={`${services.length} total`}/>
                {services.length===0 ? <EmptyPane iconName="users" title="No services posted" body="Add a service using the form."/> :
                  <div style={{display:'flex',flexDirection:'column',gap:10}}>
                    {services.map(s=>(
                      <ListItem key={s.id}>
                        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:10}}>
                          <div style={{flex:1,minWidth:0}}>
                            <p style={{margin:'0 0 6px',fontSize:14,fontWeight:700,color:NAVY}}>{s.title}</p>
                            <div style={{display:'flex',flexWrap:'wrap',gap:8,marginBottom:6}}>
                              {s.category && <Chip color={G}>{s.category}</Chip>}
                              {s.availability && <MetaItem iconName="clock">{s.availability}</MetaItem>}
                              {s.contactInfo && <MetaItem iconName="mail">{s.contactInfo}</MetaItem>}
                            </div>
                            <p style={{margin:0,fontSize:13,color:'#64748b',lineHeight:1.5}}>{s.description}</p>
                          </div>
                          <GhostBtn onClick={()=>del(`/ngos/services/${s.id}`)} color="#ef4444" iconName="trash">Delete</GhostBtn>
                        </div>
                      </ListItem>
                    ))}
                  </div>
                }
              </Panel>
            </div>
          )}

          {/* ── ACHIEVEMENTS ────────────────────────────────────────── */}
          {tab === 'achievements' && (
            <div className="fade-in" style={{display:'flex',flexDirection:'column',gap:24}}>
              <Panel>
                <PanelHeader title="Post an Achievement" subtitle="Achievements are shown prominently on your public profile."/>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:18}}>
                  <div><FieldLabel required>Achievement Title</FieldLabel><TextInput value={achievementForm.title} onChange={e=>setAchievementForm(p=>({...p,title:e.target.value}))} placeholder="e.g. Served 10,000 families" required/></div>
                  <div><FieldLabel>Category</FieldLabel><TextInput value={achievementForm.category} onChange={e=>setAchievementForm(p=>({...p,category:e.target.value}))} placeholder="e.g. Outreach"/></div>
                  <div><FieldLabel>Achievement Date</FieldLabel><TextInput type="date" value={achievementForm.achievementDate} onChange={e=>setAchievementForm(p=>({...p,achievementDate:e.target.value}))}/></div>
                  <div><FieldLabel>Image URL</FieldLabel><TextInput value={achievementForm.imageUrl} onChange={e=>setAchievementForm(p=>({...p,imageUrl:e.target.value}))} placeholder="https://…"/></div>
                  <div style={{gridColumn:'1/-1'}}><FieldLabel required>Description</FieldLabel><TextArea value={achievementForm.description} onChange={e=>setAchievementForm(p=>({...p,description:e.target.value}))} placeholder="Tell the story of this achievement…" rows={3} required/></div>
                </div>
                <div style={{marginTop:20,paddingTop:16,borderTop:'1px solid #f1f5f9'}}>
                  <PrimaryBtn onClick={createAchievement} iconName="plus">Post Achievement</PrimaryBtn>
                </div>
              </Panel>

              <Panel>
                <PanelHeader title="Achievements Gallery" subtitle={`${achievements.length} milestones`}/>
                {achievements.length===0 ? <EmptyPane iconName="star" title="No achievements yet" body="Post your first milestone using the form above."/> :
                  <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))',gap:14}}>
                    {achievements.map(a=>(
                      <ListItem key={a.id}>
                        {a.imageUrl && <img src={a.imageUrl} alt={a.title} style={{width:'100%',height:130,objectFit:'cover',borderRadius:radius.md,marginBottom:10,border:'1px solid #e9ecef'}}/>}
                        <p style={{margin:'0 0 6px',fontSize:14,fontWeight:700,color:NAVY,lineHeight:1.3}}>{a.title}</p>
                        <div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:8}}>
                          {a.category && <Chip color={G}>{a.category}</Chip>}
                          {a.achievementDate && <MetaItem iconName="calendar">{a.achievementDate}</MetaItem>}
                        </div>
                        <p style={{margin:'0 0 10px',fontSize:13,color:'#64748b',lineHeight:1.5}}>{a.description}</p>
                        <GhostBtn onClick={()=>del(`/ngos/achievements/${a.id}`)} color="#ef4444" iconName="trash">Remove</GhostBtn>
                      </ListItem>
                    ))}
                  </div>
                }
              </Panel>
            </div>
          )}

          {/* ── MESSAGES ────────────────────────────────────────────── */}
          {tab === 'messages' && (
            <div className="fade-in ngo-msg-container" style={{background:'#fff',borderRadius:radius.xl,border:'1px solid #e9ecef',overflow:'hidden',boxShadow:shadow.sm,height:'calc(100vh - 130px)',display:'flex',flexDirection:'column'}}>

              {/* Desktop inbox header (hidden on mobile via CSS) */}
              <div className="ngo-inbox-header" style={{background:NAVY,padding:'14px 22px',display:'flex',alignItems:'center',gap:12,flexShrink:0}}>
                <div style={{width:36,height:36,borderRadius:9,background:'rgba(255,255,255,.08)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                  <Ic n="inbox" s={18} c="#fff"/>
                </div>
                <div>
                  <p style={{margin:0,fontSize:15,fontWeight:800,color:'#fff'}}>Inbox</p>
                  <p style={{margin:0,fontSize:11.5,color:'rgba(255,255,255,.4)'}}>
                    {threads.length} conversation{threads.length!==1?'s':''} · {totalUnread} unread
                  </p>
                </div>
              </div>

              <div className="ngo-msg-grid" style={{display:'grid',flex:1,minHeight:0}}>

                {/* ── THREAD LIST (WhatsApp-style) ── */}
                <aside className={`ngo-msg-threads${mobileView === 'chat' ? ' hidden-panel' : ''}`}
                  style={{borderRight:'1px solid #e9ecef',background:'#fff',display:'flex',flexDirection:'column'}}>

                  {/* Mobile: green WhatsApp-like header */}
                  <div style={{padding:'14px 16px',background:NAVY,display:'flex',alignItems:'center',gap:10,flexShrink:0}}>
                    <div style={{flex:1}}>
                      <p style={{margin:0,fontSize:16,fontWeight:800,color:'#fff'}}>Messages</p>
                      <p style={{margin:0,fontSize:10.5,color:'rgba(255,255,255,.45)'}}>
                        {totalUnread > 0 ? `${totalUnread} unread` : 'All caught up'}
                      </p>
                    </div>
                    <div style={{width:32,height:32,borderRadius:8,background:'rgba(255,255,255,.1)',display:'flex',alignItems:'center',justifyContent:'center'}}>
                      <Ic n="chat" s={16} c="#fff"/>
                    </div>
                  </div>

                  {/* Search bar */}
                  <div style={{padding:'9px 12px',background:'#f8fafc',borderBottom:'1px solid #f1f5f9',flexShrink:0}}>
                    <div style={{display:'flex',alignItems:'center',gap:8,background:'#fff',borderRadius:22,padding:'7px 14px',border:'1px solid #e9ecef'}}>
                      <svg width={13} height={13} fill="none" stroke="#94a3b8" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                      <span style={{fontSize:12.5,color:'#94a3b8'}}>Search conversations…</span>
                    </div>
                  </div>

                  <div style={{flex:1,overflowY:'auto'}}>
                    {threads.length === 0
                      ? <div style={{textAlign:'center',padding:'44px 20px'}}>
                          <div style={{width:56,height:56,borderRadius:'50%',background:'#f1f5f9',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 12px'}}>
                            <Ic n="chat" s={26} c="#cbd5e1"/>
                          </div>
                          <p style={{fontSize:13,color:'#64748b',fontWeight:600,margin:'0 0 4px'}}>No messages yet</p>
                          <p style={{fontSize:11.5,color:'#94a3b8',margin:0}}>User conversations appear here</p>
                        </div>
                      : threads.map(t => {
                          const active   = t.email === selThread
                          const mine     = t.last?.senderEmail === user?.email
                          const initials = (t.name || t.email || '?').slice(0,2).toUpperCase()
                          const unread   = t.unreadCount || 0
                          return (
                            <button
                              key={t.email}
                              onClick={() => {
                                setSelThread(t.email)
                                setMobileView('chat')  // ← WhatsApp: open chat on mobile
                              }}
                              style={{
                                width:'100%', textAlign:'left',
                                padding:'12px 16px',
                                border:'none', borderBottom:'1px solid #f4f6f8',
                                cursor:'pointer',
                                background: active ? '#f0fdf9' : '#fff',
                                borderLeft: `3px solid ${active ? TEAL : 'transparent'}`,
                                transition:'background .12s',
                                display:'flex', alignItems:'center', gap:12,
                              }}
                              onMouseEnter={e => { if(!active) e.currentTarget.style.background = '#f8fafc' }}
                              onMouseLeave={e => { if(!active) e.currentTarget.style.background = '#fff' }}
                            >
                              {/* Avatar */}
                              <div style={{
                                width:44, height:44, borderRadius:'50%', flexShrink:0,
                                background: active ? `${TEAL}20` : '#e9ecef',
                                display:'flex', alignItems:'center', justifyContent:'center',
                                fontSize:15, fontWeight:800,
                                color: active ? TEAL : '#64748b',
                                border: `2px solid ${active ? TEAL + '40' : 'transparent'}`,
                                position:'relative',
                              }}>
                                {initials}
                                {unread > 0 && (
                                  <span style={{
                                    position:'absolute', top:-3, right:-3,
                                    width:18, height:18, borderRadius:'50%',
                                    background: TEAL, color:'#fff',
                                    fontSize:9, fontWeight:800,
                                    display:'flex', alignItems:'center', justifyContent:'center',
                                    border:'2px solid #fff',
                                  }}>{unread > 9 ? '9+' : unread}</span>
                                )}
                              </div>
                              <div style={{flex:1, minWidth:0}}>
                                <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:6}}>
                                  <p style={{margin:0, fontSize:14, fontWeight: unread > 0 ? 800 : 600, color:NAVY, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>
                                    {t.name}
                                  </p>
                                  <span style={{fontSize:11, color:'#94a3b8', flexShrink:0, marginTop:1}}>
                                    {fmt(t.last?.createdAt)}
                                  </span>
                                </div>
                                <p style={{
                                  margin:'2px 0 0', fontSize:12.5,
                                  color: unread > 0 ? '#374151' : '#94a3b8',
                                  overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap',
                                  fontWeight: unread > 0 ? 600 : 400,
                                }}>
                                  {mine ? '✓ ' : ''}{t.last?.content || '—'}
                                </p>
                              </div>
                            </button>
                          )
                        })
                    }
                  </div>
                </aside>

                {/* ── CHAT WINDOW (WhatsApp-style) ── */}
                <section className={`ngo-msg-chat${mobileView === 'threads' ? ' hidden-panel' : ''}`}
                  style={{display:'flex', flexDirection:'column', minHeight:0}}>
                  {selThread ? (
                    <>
                      {/* Chat header with back button */}
                      <div style={{
                        padding:'10px 16px', display:'flex', alignItems:'center', gap:10,
                        background: NAVY, flexShrink:0,
                      }}>
                        {/* Mobile back arrow */}
                        <button
                          className="ngo-mob-back"
                          onClick={() => setMobileView('threads')}
                          style={{
                            alignItems:'center', padding:'4px 0',
                            border:'none', background:'transparent', cursor:'pointer',
                          }}
                        >
                          <svg width={22} height={22} fill="none" stroke="#fff" strokeWidth={2.5} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>
                          </svg>
                        </button>

                        {/* Avatar */}
                        <div style={{
                          width:38, height:38, borderRadius:'50%', flexShrink:0,
                          background:'rgba(255,255,255,.15)',
                          display:'flex', alignItems:'center', justifyContent:'center',
                          fontSize:13, fontWeight:800, color:'#fff',
                        }}>
                          {(threads.find(t=>t.email===selThread)?.name || selThread).slice(0,2).toUpperCase()}
                        </div>
                        <div style={{flex:1, minWidth:0}}>
                          <p style={{margin:0, fontWeight:800, fontSize:14, color:'#fff', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>
                            {threads.find(t=>t.email===selThread)?.name || selThread}
                          </p>
                          <p style={{margin:0, fontSize:10.5, color:'rgba(255,255,255,.5)'}}>tap for info</p>
                        </div>
                        <div style={{display:'flex',gap:8}}>
                          <div style={{width:34,height:34,borderRadius:'50%',background:'rgba(255,255,255,.1)',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer'}}>
                            <Ic n="send" s={14} c="#fff"/>
                          </div>
                        </div>
                      </div>

                      {/* WhatsApp-style chat wallpaper background */}
                      <div style={{
                        flex:1, overflowY:'auto',
                        background:'#e5ddd5',
                        backgroundImage:'radial-gradient(circle at 1px 1px, rgba(0,0,0,.04) 1px, transparent 0)',
                        backgroundSize:'20px 20px',
                        padding:'12px',
                        display:'flex', flexDirection:'column', gap:6,
                      }}>
                        {/* Date separator */}
                        {threadMsgs.length > 0 && (
                          <div style={{textAlign:'center',marginBottom:4}}>
                            <span style={{fontSize:11,color:'#667781',background:'rgba(255,255,255,.75)',padding:'3px 10px',borderRadius:10,boxShadow:'0 1px 2px rgba(0,0,0,.1)'}}>
                              Today
                            </span>
                          </div>
                        )}
                        {threadMsgs.length === 0
                          ? <div style={{textAlign:'center',marginTop:60}}>
                              <div style={{background:'rgba(255,255,255,.85)',padding:'12px 20px',borderRadius:12,display:'inline-block',boxShadow:'0 1px 4px rgba(0,0,0,.1)'}}>
                                <p style={{fontSize:13,color:'#667781',margin:0}}>No messages in this conversation yet</p>
                              </div>
                            </div>
                          : threadMsgs.map(m => {
                              const mine = m.senderEmail === user.email
                              return (
                                <div key={m.id} style={{display:'flex', justifyContent: mine ? 'flex-end' : 'flex-start'}}>
                                  <div style={{
                                    maxWidth:'78%', position:'relative',
                                    borderRadius: mine ? '12px 12px 3px 12px' : '12px 12px 12px 3px',
                                    padding:'7px 10px 4px',
                                    background: mine ? '#dcf8c6' : '#fff',  // WhatsApp green/white
                                    boxShadow:'0 1px 2px rgba(0,0,0,.15)',
                                  }}>
                                    {!mine && (
                                      <p style={{margin:'0 0 2px',fontSize:11,fontWeight:700,color: TEAL}}>{m.senderName||m.senderEmail}</p>
                                    )}
                                    <p style={{margin:'0 0 14px',fontSize:14,lineHeight:1.45,whiteSpace:'pre-wrap',wordBreak:'break-word',color:'#111b21'}}>{m.content}</p>
                                    <div style={{position:'absolute',bottom:5,right:8,display:'flex',alignItems:'center',gap:3}}>
                                      <span style={{fontSize:10,color:'#667781'}}>{fmt(m.createdAt)}</span>
                                      {mine && <span style={{fontSize:12,color: m.seen ? '#53bdeb' : '#667781'}}>{m.seen ? '✓✓' : '✓'}</span>}
                                    </div>
                                  </div>
                                </div>
                              )
                            })
                        }
                        <div ref={chatEndRef}/>
                      </div>

                      {/* WhatsApp-style reply bar */}
                      <form onSubmit={sendMsg} style={{background:'#f0f2f5',padding:'8px 12px',flexShrink:0,borderTop:'1px solid #e9ecef'}}>
                        <div style={{display:'flex',gap:8,alignItems:'center'}}>
                          <div style={{flex:1,display:'flex',alignItems:'center',background:'#fff',borderRadius:24,padding:'8px 16px',boxShadow:'0 1px 2px rgba(0,0,0,.08)',border:'1px solid #e9ecef'}}>
                            <input
                              value={msgText}
                              onChange={e => setMsgText(e.target.value)}
                              placeholder="Type a message"
                              style={{flex:1,border:'none',outline:'none',fontSize:14,color:'#111b21',background:'transparent'}}
                            />
                          </div>
                          <button
                            type="submit"
                            disabled={sending || !msgText.trim()}
                            style={{
                              width:44, height:44, borderRadius:'50%', flexShrink:0,
                              border:'none', cursor: sending || !msgText.trim() ? 'not-allowed' : 'pointer',
                              background: sending || !msgText.trim() ? '#e9ecef' : TEAL,
                              display:'flex', alignItems:'center', justifyContent:'center',
                              transition:'background .15s',
                              boxShadow:'0 2px 6px rgba(0,0,0,.15)',
                            }}
                          >
                            <Ic n="send" s={18} c={sending || !msgText.trim() ? '#94a3b8' : '#fff'} sw={2}/>
                          </button>
                        </div>
                      </form>
                    </>
                  ) : (
                    /* Desktop: no thread selected placeholder */
                    <div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column',gap:14,background:'#f0f2f5'}}>
                      <div style={{textAlign:'center',padding:'0 32px'}}>
                        <div style={{width:80,height:80,borderRadius:'50%',background:'#e2e8f0',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 16px'}}>
                          <Ic n="inbox" s={36} c="#94a3b8"/>
                        </div>
                        <p style={{fontSize:16,margin:'0 0 6px',fontWeight:700,color:'#374151'}}>Inclusive Connect</p>
                        <p style={{fontSize:13,margin:0,color:'#94a3b8',lineHeight:1.6}}>Select a conversation from the left<br/>to start reading messages</p>
                      </div>
                    </div>
                  )}
                </section>

              </div>
            </div>
          )}

        </div>{/* /scrollable */}
      </main>

      {/* ══════════ MOBILE BOTTOM NAV ══════════ */}
      <nav className="ngo-bottom-nav" style={{
        position:'fixed', bottom:0, left:0, right:0, zIndex:60,
        background:'#fff', borderTop:'1px solid #e9ecef',
        boxShadow:'0 -2px 12px rgba(0,0,0,.08)',
        height:64, alignItems:'stretch',
        justifyContent:'space-around',
      }}>
        {TABS.map(t => {
          const active = tab === t.id
          const count  = counts[t.id]
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                flex:1, display:'flex', flexDirection:'column', alignItems:'center',
                justifyContent:'center', gap:2, border:'none', background:'transparent',
                cursor:'pointer', padding:'6px 2px', position:'relative',
                borderTop: active ? `3px solid ${TEAL}` : '3px solid transparent',
                transition:'border-color .15s',
              }}
            >
              {count > 0 && (
                <span style={{
                  position:'absolute', top:4, right:'50%', marginRight:-14,
                  fontSize:9, fontWeight:800, color:'#fff',
                  background: active ? TEAL : G,
                  padding:'1px 5px', borderRadius:8, minWidth:16, textAlign:'center',
                  lineHeight:'14px',
                }}>{count}</span>
              )}
              <Ic n={t.icon} s={19} c={active ? TEAL : '#94a3b8'} sw={active ? 2.2 : 1.7}/>
              <span style={{fontSize:9.5, fontWeight: active ? 700 : 500, color: active ? TEAL : '#94a3b8'}}>
                {t.label}
              </span>
            </button>
          )
        })}
      </nav>

    </div>
  )
}
