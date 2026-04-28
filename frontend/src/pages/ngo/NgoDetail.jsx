import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const BASE = 'http://localhost:8081/api'
const G = '#16a34a'
const B = '#1A8FD1'
const NAVY = '#0f172a'

const EMP_LABELS = {
  FULL_TIME:'Full-time', PART_TIME:'Part-time', CONTRACT:'Contract',
  INTERNSHIP:'Internship', VOLUNTEER:'Volunteer'
}

async function fetchJSON(url) {
  try { const r = await fetch(url); return r.ok ? r.json() : null } catch { return null }
}

/* ── tiny design tokens ── */
const card  = { background:'#fff', borderRadius:16, border:'1px solid #e9ecef', padding:'22px 24px' }
const chip  = (color, bg) => ({ display:'inline-flex', alignItems:'center', gap:4, fontSize:11, fontWeight:700,
  color, background: bg || color+'18', padding:'3px 10px', borderRadius:20, letterSpacing:'0.04em' })

/* ── SVG Icons ── */
const Icons = {
  Briefcase: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
      <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/>
    </svg>
  ),
  Heart: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" strokeWidth="2" className="w-6 h-6">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
    </svg>
  ),
  Package: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
      <line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/>
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
      <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
      <line x1="12" y1="22.08" x2="12" y2="12"/>
    </svg>
  ),
}


export default function NgoDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [loading, setLoading] = useState(true)
  const [ngo, setNgo] = useState(null)
  const [needs, setNeeds] = useState([])
  const [jobs, setJobs] = useState([])
  const [products, setProducts] = useState([])
  const [services, setServices] = useState([])
  const [achievements, setAchievements] = useState([])
  const [tab, setTab] = useState('jobs')
  const [applyJob, setApplyJob] = useState(null)
  const [form, setForm] = useState({ name:'', email:'', phone:'', disabilityType:'', coverLetter:'', resumeText:'' })
  const [submitting, setSubmitting] = useState(false)
  const [applyMsg, setApplyMsg] = useState(null)
  // Support request state
  const [supportNeed, setSupportNeed] = useState(null)
  const [supportForm, setSupportForm] = useState({ name:'', email:'', message:'' })
  const [supportSubmitting, setSupportSubmitting] = useState(false)
  const [supportMsg, setSupportMsg] = useState(null)

  useEffect(() => {
    async function load() {
      setLoading(true)
      const [nd, ne, jd, pd, sd, ad] = await Promise.all([
        fetchJSON(`${BASE}/ngos/${id}`),
        fetchJSON(`${BASE}/ngos/${id}/needs`),
        fetchJSON(`${BASE}/ngos/${id}/jobs`),
        fetchJSON(`${BASE}/ngos/${id}/products`),
        fetchJSON(`${BASE}/ngos/${id}/services`),
        fetchJSON(`${BASE}/ngos/${id}/achievements`),
      ])
      setNgo(nd); setNeeds(Array.isArray(ne)?ne:[]); setJobs(Array.isArray(jd)?jd:[])
      setProducts(Array.isArray(pd)?pd:[]); setServices(Array.isArray(sd)?sd:[])
      setAchievements(Array.isArray(ad)?ad:[]); setLoading(false)
    }
    load()
  }, [id])

  const openJobs = useMemo(() => jobs.filter(j => j.status !== 'CLOSED'), [jobs])
  const activeNeeds = useMemo(() => needs.filter(n => n.status !== 'CLOSED'), [needs])

  const handleApply = async e => {
    e.preventDefault()
    setSubmitting(true); setApplyMsg(null)
    try {
      const token = localStorage.getItem('token')
      const r = await fetch(`${BASE}/ngos/jobs/${applyJob.id}/apply`, {
        method:'POST',
        headers:{ 'Content-Type':'application/json', ...(token?{'Authorization':`Bearer ${token}`}:{}) },
        body: JSON.stringify(form)
      })
      if (r.status === 409) { setApplyMsg({ type:'warn', text:'You have already applied for this job.' }); return }
      if (!r.ok) { setApplyMsg({ type:'error', text:'Application failed. Please try again.' }); return }
      setApplyMsg({ type:'ok', text:'✅ Application submitted successfully!' })
      setForm({ name:'', email:'', phone:'', disabilityType:'', coverLetter:'', resumeText:'' })
      setTimeout(() => setApplyJob(null), 2200)
    } catch { setApplyMsg({ type:'error', text:'Network error. Please try again.' }) }
    finally { setSubmitting(false) }
  }

  const openChat = (source, title) => {
    if (!user || !localStorage.getItem('token')) { navigate('/login'); return }
    navigate(`/messages?${new URLSearchParams({ ngoId: String(id), source: source||'', title: title||'' })}`)
  }

  const handleSupport = async e => {
    e.preventDefault()
    setSupportSubmitting(true); setSupportMsg(null)
    try {
      const token = localStorage.getItem('token')
      const body = {
        requesterName:  supportForm.name,
        requesterEmail: supportForm.email,
        title:       `Support for: ${supportNeed.title}`,
        description: supportForm.message,
        requestType: 'REQUIREMENT_SUPPORT',
        status:      'PENDING'
      }
      const r = await fetch(`${BASE}/ngos/${id}/support-requests`, {
        method: 'POST',
        headers: { 'Content-Type':'application/json', ...(token?{'Authorization':`Bearer ${token}`}:{}) },
        body: JSON.stringify(body)
      })
      if (r.ok || r.status === 201) {
        setSupportMsg({ type:'ok', text:'Support request sent! The NGO will contact you soon.' })
        setSupportForm({ name:'', email:'', message:'' })
        setTimeout(() => setSupportNeed(null), 2500)
      } else {
        setSupportMsg({ type:'error', text:'Failed to send. Please try again.' })
      }
    } catch {
      setSupportMsg({ type:'error', text:'Network error. Please try again.' })
    }
    finally { setSupportSubmitting(false) }
  }

  if (loading) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#f8fafc', fontFamily:"'Inter',sans-serif" }}>
      <div style={{ textAlign:'center' }}>
        <div style={{ width:40, height:40, borderRadius:'50%', border:`4px solid ${G}30`, borderTopColor:G, animation:'spin .8s linear infinite', margin:'0 auto 12px' }}/>
        <p style={{ color:'#64748b', fontSize:14 }}>Loading NGO profile...</p>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  if (!ngo) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#f8fafc' }}>
      <div style={{ textAlign:'center', padding:40 }}>
        <p style={{ fontSize:18, fontWeight:700, color:NAVY }}>NGO not found</p>
        <button onClick={() => navigate('/')} style={{ marginTop:16, padding:'10px 24px', background:G, color:'#fff', border:'none', borderRadius:10, fontWeight:700, cursor:'pointer' }}>Go Home</button>
      </div>
    </div>
  )

  const lastDate = openJobs.length > 0
    ? openJobs.reduce((latest, j) => j.lastDateToApply && j.lastDateToApply > latest ? j.lastDateToApply : latest, '')
    : null

  const TABS = [
    { key:'jobs',         label:'Jobs',         count: openJobs.length },
    { key:'requirements', label:'Requirements',  count: activeNeeds.length },
    { key:'products',     label:'Products',      count: products.length },
    { key:'services',     label:'Services',      count: services.length },
    { key:'achievements', label:'Achievements',  count: achievements.length },
  ]

  return (
    <div style={{ minHeight:'100vh', background:'#ffffff', fontFamily:"'Inter',sans-serif" }}>
      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes fadeIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        .ngo-job-card:hover{border-left-color:${G} !important; box-shadow:0 8px 24px rgba(22,163,74,.12) !important}
        .ngo-tab-btn:hover{background:rgba(22,163,74,.06) !important}
      `}</style>

      {/* ── Topbar ── */}
      <div style={{ background:'#fff', borderBottom:'1px solid #e2e8f0', padding:'16px 32px', display:'flex', alignItems:'center', gap:12, position:'sticky', top:0, zIndex:50, boxShadow:'0 1px 3px rgba(0,0,0,.06)' }}>
        <button onClick={() => navigate('/')} style={{ display:'flex', alignItems:'center', gap:6, background:'none', border:'none', cursor:'pointer', fontSize:14, fontWeight:700, color:'#64748b', transition:'color .2s' }}>
          ← Back
        </button>
        <div style={{ flex:1 }}/>
        <span style={{ ...chip(G), fontSize:12, fontWeight:800 }}>{ngo.verified ? '✓ Verified NGO' : '⏳ Pending'}</span>
      </div>

      <div style={{ maxWidth:1100, margin:'0 auto', padding:'32px 24px 60px' }}>

        {/* ── Hero card ── */}
        <div style={{ ...card, padding:0, overflow:'hidden', animation:'fadeIn .4s ease', marginBottom:24, boxShadow:'0 4px 16px rgba(0,0,0,.08)' }}>
          {/* Solid banner */}
          <div style={{ height:140, background:B, position:'relative', display:'flex', alignItems:'flex-end', paddingLeft:32, paddingBottom:20 }}>
            <div style={{ width:80, height:80, borderRadius:20, background:'#fff', border:'3px solid #fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:36, fontWeight:900, color:B, boxShadow:'0 8px 24px rgba(0,0,0,.15)' }}>
              {ngo.name?.charAt(0).toUpperCase()}
            </div>
          </div>
          <div style={{ padding:'28px 32px 32px', display:'flex', gap:28, alignItems:'flex-start', flexWrap:'wrap' }}>
            <div style={{ flex:1, minWidth:240 }}>
              <h1 style={{ margin:0, fontSize:28, fontWeight:900, color:NAVY }}>{ngo.name}</h1>
              <p style={{ margin:'6px 0 12px', fontSize:14, color:'#64748b', fontWeight:600 }}>{[ngo.city,ngo.state,ngo.country].filter(Boolean).join(', ')}</p>
              {(ngo.category||ngo.focusArea) && <span style={{ ...chip(B), display:'inline-block', marginBottom:12 }}>{ngo.category||ngo.focusArea}</span>}
              <p style={{ margin:'12px 0 0', fontSize:15, color:'#475569', lineHeight:1.8, maxWidth:620 }}>{ngo.description||ngo.mission||'Committed to inclusive growth and accessibility.'}</p>
            </div>
            {/* Stat cards - horizontal */}
            <div style={{ display:'flex', gap:16, flexWrap:'wrap', justifyContent:'flex-end' }}>
              {[
                { label:'Jobs', Icon: Icons.Briefcase, color: G },
                { label:'Needs', Icon: Icons.Heart, color: B },
                { label:'Products', Icon: Icons.Package, color:'#6366f1' },
              ].map(s => (
                <div key={s.label} style={{ background:'#fff', border:'1px solid #e2e8f0', borderRadius:14, padding:'16px 20px', textAlign:'center', minWidth:110, boxShadow:'0 2px 8px rgba(0,0,0,.04)', transition:'all .2s' }}>
                  <div style={{ margin:0, marginBottom:8, display:'flex', justifyContent:'center', width:24, height:24, marginLeft:'auto', marginRight:'auto', color:s.color }}>
                    <s.Icon />
                  </div>
                  <p style={{ margin:'0 0 4px', fontSize:20, fontWeight:900, color:s.color }}>{s.label === 'Jobs' ? openJobs.length : s.label === 'Needs' ? activeNeeds.length : products.length}</p>
                  <p style={{ margin:0, fontSize:12, color:'#64748b', fontWeight:600 }}>{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Tab bar ── */}
        <div style={{ display:'flex', gap:8, marginBottom:24, overflowX:'auto', paddingBottom:6, scrollBehavior:'smooth' }}>
          {TABS.map(t => (
            <button key={t.key} className="ngo-tab-btn"
              onClick={() => setTab(t.key)}
              style={{ display:'flex', alignItems:'center', gap:8, padding:'11px 20px', borderRadius:12, border:'none', cursor:'pointer', fontFamily:"'Inter',sans-serif", fontWeight:tab===t.key?800:600, fontSize:14, transition:'all .2s', whiteSpace:'nowrap',
                background: tab===t.key ? G : '#f8fafc',
                color: tab===t.key ? '#fff' : '#64748b',
                boxShadow: tab===t.key ? `0 4px 12px ${G}30` : 'none',
                border: tab===t.key ? 'none' : '1px solid #e2e8f0',
              }}
            >
              {t.label}
              <span style={{ fontSize:12, fontWeight:800, background: tab===t.key?'rgba(255,255,255,.35)':'#e2e8f0', color: tab===t.key?'#fff':'#64748b', padding:'2px 8px', borderRadius:8 }}>{t.count}</span>
            </button>
          ))}
        </div>

        {/* ── JOBS tab ── */}
        {tab === 'jobs' && (
          <div style={{ display:'flex', flexDirection:'column', gap:14, animation:'fadeIn .3s ease' }}>
            {openJobs.length === 0 && (
              <div style={{ ...card, textAlign:'center', padding:'48px 24px', color:'#94a3b8' }}>
                <p style={{ fontSize:15, fontWeight:700, color:NAVY, margin:'0 0 4px' }}>No open positions right now</p>
                <p style={{ fontSize:13, margin:0 }}>Check back later for new opportunities.</p>
              </div>
            )}
            {openJobs.map(j => (
              <div key={j.id} className="ngo-job-card"
                style={{ ...card, transition:'all .18s', display:'flex', gap:24, alignItems:'flex-start', flexWrap:'wrap', borderLeft:`4px solid ${G}`, boxShadow:'0 2px 8px rgba(0,0,0,.04)' }}>
                {/* Info */}
                <div style={{ flex:1, minWidth:280 }}>
                  <div style={{ display:'flex', gap:10, flexWrap:'wrap', marginBottom:10 }}>
                    <span style={{ ...chip(G, `${G}15`), fontWeight:800 }}>✓ HIRING</span>
                    {j.employmentType && <span style={{ ...chip(B, `${B}12`), fontWeight:700 }}>{EMP_LABELS[j.employmentType]||j.employmentType}</span>}
                  </div>
                  <h3 style={{ margin:'0 0 8px', fontSize:17, fontWeight:900, color:NAVY }}>{j.title}</h3>
                  <div style={{ display:'flex', gap:16, flexWrap:'wrap', marginBottom:12, fontSize:13, color:'#64748b', fontWeight:600 }}>
                    {j.location && <span>{j.location}</span>}
                    {j.salaryRange && <span style={{ color:G, fontWeight:800 }}>{j.salaryRange}</span>}
                  </div>
                  <p style={{ margin:0, fontSize:14, color:'#475569', lineHeight:1.7 }}>{j.description}</p>
                </div>
                {/* Actions */}
                <div style={{ display:'flex', flexDirection:'column', gap:10, flexShrink:0 }}>
                  <button
                    onClick={() => { setApplyJob(j); setApplyMsg(null) }}
                    style={{ padding:'11px 24px', background:G, color:'#fff', border:'none', borderRadius:10, fontWeight:800, fontSize:14, cursor:'pointer', boxShadow:`0 2px 10px ${G}40`, transition:'all .2s' }}
                  >Apply Now</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── REQUIREMENTS tab ── */}
        {tab === 'requirements' && (
          <div style={{ display:'flex', flexDirection:'column', gap:14, animation:'fadeIn .3s ease' }}>
            {activeNeeds.length === 0 && <div style={{ ...card, textAlign:'center', color:'#94a3b8', padding:'48px 24px' }}><p style={{fontSize:15, fontWeight:700, margin:'0 0 4px'}}>No active requirements</p><p style={{fontSize:14, margin:0}}>Check back later for new opportunities.</p></div>}
            {activeNeeds.map(n => (
              <div key={n.id} style={{ ...card, borderLeft:`4px solid ${B}`, boxShadow:'0 2px 8px rgba(0,0,0,.04)' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:16 }}>
                  <div style={{ flex:1, minWidth:0 }}>
                    <h3 style={{ margin:'0 0 8px', fontSize:16, fontWeight:900, color:NAVY }}>{n.title}</h3>
                    <span style={{ ...chip(B, `${B}12`), display:'inline-block', marginBottom:12, fontWeight:700 }}>{n.category}</span>
                    <p style={{ margin:'0 0 10px', fontSize:14, color:'#475569', lineHeight:1.7 }}>{n.description}</p>
                    {n.targetAmount > 0 && <p style={{ margin:0, fontSize:14, fontWeight:800, color:G }}>Target: Rs {Number(n.targetAmount).toLocaleString('en-IN')}</p>}
                  </div>
                  <button onClick={() => { setSupportNeed(n); setSupportMsg(null); setSupportForm({ name:'', email:'', message:'' }) }}
                    style={{ whiteSpace:'nowrap', padding:'11px 24px', background:B, color:'#fff', border:'none', borderRadius:10, fontWeight:800, fontSize:14, cursor:'pointer', flexShrink:0, boxShadow:`0 2px 10px ${B}40` }}>
                    Support
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── PRODUCTS tab ── */}
        {tab === 'products' && (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:18, animation:'fadeIn .3s ease' }}>
            {products.length === 0 && <div style={{ ...card, textAlign:'center', color:'#94a3b8', gridColumn:'1/-1', padding:48 }}><p style={{fontSize:15,fontWeight:700,margin:'0 0 4px'}}>No products listed</p><p style={{fontSize:14, margin:0}}>Check back later for new products.</p></div>}
            {products.map(p => (
              <div key={p.id} style={{ ...card, borderTop:`4px solid #6366f1`, boxShadow:'0 2px 8px rgba(0,0,0,.04)', transition:'all .2s' }}>
                <h3 style={{ margin:'0 0 8px', fontSize:16, fontWeight:900, color:NAVY }}>{p.name}</h3>
                <span style={{ ...chip('#6366f1', '#e0e7ff'), display:'inline-block', marginBottom:12, fontWeight:700 }}>{p.category||'General'}</span>
                <p style={{ margin:'0 0 12px', fontSize:14, color:'#475569', lineHeight:1.6 }}>{p.description}</p>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', paddingTop:12, borderTop:'1px solid #e2e8f0' }}>
                  <p style={{ margin:0, fontSize:18, fontWeight:900, color:G }}>₹{Number(p.price||0).toLocaleString('en-IN')}</p>
                  <p style={{ margin:0, fontSize:12, color:'#64748b', fontWeight:700 }}>📦 Stock: {p.stockQuantity}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── SERVICES tab ── */}
        {tab === 'services' && (
          <div style={{ display:'flex', flexDirection:'column', gap:14, animation:'fadeIn .3s ease' }}>
            {services.length === 0 && <div style={{ ...card, textAlign:'center', color:'#94a3b8' }}><p style={{fontSize:15,fontWeight:700,margin:'0 0 4px'}}>No services listed</p><p style={{fontSize:14,margin:0}}>Check back later for new services.</p></div>}
            {services.map(s => (
              <div key={s.id} style={{ ...card, borderLeft:`4px solid #6366f1`, boxShadow:'0 2px 8px rgba(0,0,0,.04)' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:16 }}>
                  <div style={{ flex:1 }}>
                    <h3 style={{ margin:'0 0 8px', fontSize:16, fontWeight:900, color:NAVY }}>{s.title}</h3>
                    <span style={{ ...chip('#6366f1', '#e0e7ff'), display:'inline-block', marginBottom:12, fontWeight:700 }}>{s.category||'Service'}</span>
                    <p style={{ margin:'0 0 10px', fontSize:14, color:'#475569', lineHeight:1.7 }}>{s.description}</p>
                    {s.contactInfo && <p style={{ margin:0, fontSize:13, color:G, fontWeight:800 }}>Contact: {s.contactInfo}</p>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── ACHIEVEMENTS tab ── */}
        {tab === 'achievements' && (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:18, animation:'fadeIn .3s ease' }}>
            {achievements.length === 0 && <div style={{ ...card, textAlign:'center', color:'#94a3b8', gridColumn:'1/-1', padding:48 }}><p style={{fontSize:15,fontWeight:700,margin:'0 0 4px'}}>No achievements posted</p><p style={{fontSize:14,margin:0}}>Check back later for success stories.</p></div>}
            {achievements.map(a => (
              <div key={a.id} style={{ ...card, borderTop:`4px solid ${G}`, boxShadow:'0 2px 8px rgba(0,0,0,.04)' }}>
                <h3 style={{ margin:'0 0 8px', fontSize:16, fontWeight:900, color:NAVY }}>{a.title}</h3>
                {a.achievementDate && <p style={{ margin:'0 0 12px', fontSize:12, color:'#64748b', fontWeight:700 }}>{a.achievementDate}</p>}
                <p style={{ margin:0, fontSize:14, color:'#475569', lineHeight:1.7 }}>{a.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Apply Modal ── */}
      {applyJob && (
        <div onClick={() => setApplyJob(null)}
          style={{ position:'fixed', top:0, left:0, width:'100vw', height:'100vh', background:'rgba(15,23,42,.55)', zIndex:9999, display:'flex', alignItems:'center', justifyContent:'center', padding:20, boxSizing:'border-box', overflowY:'auto' }}>
          <div onClick={e => e.stopPropagation()}
            style={{ background:'#fff', borderRadius:16, boxShadow:'0 20px 64px rgba(0,0,0,.20)', width:'100%', maxWidth:540, maxHeight:'90vh', display:'flex', flexDirection:'column', overflow:'hidden', position:'relative' }}>
            <button onClick={() => setApplyJob(null)}
              style={{ position:'absolute', top:14, right:14, width:36, height:36, borderRadius:'50%', border:'none', background:'#f1f5f9', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', zIndex:10, fontSize:18, color:'#64748b', fontWeight:700, transition:'all .2s' }}>×</button>
            {/* Header */}
            <div style={{ padding:'24px 28px 16px', borderBottom:'1px solid #e2e8f0', flexShrink:0, background:'#fff' }}>
              <p style={{ margin:'0 0 6px', fontSize:12, fontWeight:800, color:G, textTransform:'uppercase', letterSpacing:'0.08em' }}>Apply Now</p>
              <h2 style={{ margin:0, fontSize:20, fontWeight:900, color:NAVY }}>{applyJob.title}</h2>
              <p style={{ margin:'4px 0 0', fontSize:13, color:'#64748b', fontWeight:600 }}>{ngo.name}</p>
            </div>
            {/* Form */}
            <form onSubmit={handleApply} style={{ flex:1, overflowY:'auto', padding:'20px 28px', display:'flex', flexDirection:'column', gap:14 }}>
              {[['name','Full Name','text',true],['email','Email','email',true],['phone','Phone Number','tel',false]].map(([f,l,t,req])=>(
                <div key={f}>
                  <label style={{ display:'block', fontSize:13, fontWeight:700, color:'#374151', marginBottom:6 }}>{l}{req&&' *'}</label>
                  <input required={req} type={t} value={form[f]} onChange={e=>setForm(p=>({...p,[f]:e.target.value}))}
                    style={{ width:'100%', boxSizing:'border-box', border:'1.5px solid #e2e8f0', borderRadius:10, padding:'10px 14px', fontSize:14, color:NAVY, outline:'none', fontFamily:"'Inter',sans-serif", transition:'border .2s' }}/>
                </div>
              ))}
              <div>
                <label style={{ display:'block', fontSize:13, fontWeight:700, color:'#374151', marginBottom:6 }}>Disability Type</label>
                <select value={form.disabilityType} onChange={e=>setForm(p=>({...p,disabilityType:e.target.value}))}
                  style={{ width:'100%', border:'1.5px solid #e2e8f0', borderRadius:10, padding:'10px 14px', fontSize:14, color:NAVY, outline:'none', fontFamily:"'Inter',sans-serif", background:'#fff' }}>
                  <option value="">Select (optional)</option>
                  {['visual','hearing','mobility','cognitive','speech','other'].map(d=><option key={d} value={d}>{d.charAt(0).toUpperCase()+d.slice(1)}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display:'block', fontSize:13, fontWeight:700, color:'#374151', marginBottom:6 }}>Cover Letter *</label>
                <textarea required rows={4} value={form.coverLetter} onChange={e=>setForm(p=>({...p,coverLetter:e.target.value}))} placeholder="Why are you interested in this role?"
                  style={{ width:'100%', boxSizing:'border-box', border:'1.5px solid #e2e8f0', borderRadius:10, padding:'10px 14px', fontSize:13, color:NAVY, outline:'none', fontFamily:"'Inter',sans-serif", resize:'vertical' }}/>
              </div>
              <div>
                <label style={{ display:'block', fontSize:13, fontWeight:700, color:'#374151', marginBottom:6 }}>Resume / Skills *</label>
                <textarea required rows={3} value={form.resumeText} onChange={e=>setForm(p=>({...p,resumeText:e.target.value}))} placeholder="Brief summary of your skills and experience"
                  style={{ width:'100%', boxSizing:'border-box', border:'1.5px solid #e2e8f0', borderRadius:10, padding:'10px 14px', fontSize:13, color:NAVY, outline:'none', fontFamily:"'Inter',sans-serif", resize:'vertical' }}/>
              </div>
              {applyMsg && (
                <div style={{ padding:'12px 16px', borderRadius:10, fontSize:13, fontWeight:600,
                  background: applyMsg.type==='ok'?'#f0fdf4':applyMsg.type==='warn'?'#fffbeb':'#fef2f2',
                  color: applyMsg.type==='ok'?G:applyMsg.type==='warn'?'#b45309':'#dc2626',
                  border: `1px solid ${applyMsg.type==='ok'?'#bbf7d0':applyMsg.type==='warn'?'#fde68a':'#fecaca'}` }}>
                  {applyMsg.text}
                </div>
              )}
              <button type="submit" disabled={submitting}
                style={{ padding:'13px', background: submitting?'#94a3b8':G, color:'#fff', border:'none', borderRadius:12, fontWeight:800, fontSize:15, cursor: submitting?'not-allowed':'pointer', transition:'background .2s' }}>
                {submitting ? 'Submitting...' : 'Submit Application'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── Support Request Modal ── */}
      {supportNeed && (
        <div onClick={() => setSupportNeed(null)}
          style={{ position:'fixed', top:0, left:0, width:'100vw', height:'100vh', background:'rgba(15,23,42,.55)', zIndex:9999, display:'flex', alignItems:'center', justifyContent:'center', padding:20, boxSizing:'border-box' }}>
          <div onClick={e => e.stopPropagation()}
            style={{ background:'#fff', borderRadius:16, boxShadow:'0 20px 64px rgba(0,0,0,.20)', width:'100%', maxWidth:480, position:'relative', overflow:'hidden' }}>
            <button onClick={() => setSupportNeed(null)}
              style={{ position:'absolute', top:14, right:14, width:36, height:36, borderRadius:'50%', border:'none', background:'#f1f5f9', cursor:'pointer', fontSize:18, fontWeight:700, color:'#64748b', display:'flex', alignItems:'center', justifyContent:'center', transition:'all .2s' }}>×</button>
            <div style={{ padding:'24px 28px 16px', borderBottom:'1px solid #e2e8f0', background:'#fff' }}>
              <p style={{ margin:'0 0 6px', fontSize:12, fontWeight:800, color:B, textTransform:'uppercase', letterSpacing:'0.08em' }}>Support Request</p>
              <h2 style={{ margin:0, fontSize:19, fontWeight:900, color:NAVY }}>{supportNeed.title}</h2>
              <p style={{ margin:'4px 0 0', fontSize:13, color:'#64748b', fontWeight:600 }}>{ngo.name}</p>
            </div>
            <form onSubmit={handleSupport} style={{ padding:'20px 28px', display:'flex', flexDirection:'column', gap:14 }}>
              {[['name','Your Name','text',true],['email','Your Email','email',true]].map(([f,l,t,req]) => (
                <div key={f}>
                  <label style={{ display:'block', fontSize:13, fontWeight:700, color:'#374151', marginBottom:6 }}>{l} {req?'*':''}</label>
                  <input required={req} type={t} value={supportForm[f]} onChange={e => setSupportForm(p => ({...p,[f]:e.target.value}))}
                    style={{ width:'100%', boxSizing:'border-box', border:'1.5px solid #e2e8f0', borderRadius:10, padding:'10px 14px', fontSize:14, color:NAVY, outline:'none', fontFamily:"'Inter',sans-serif", transition:'border .2s' }}/>
                </div>
              ))}
              <div>
                <label style={{ display:'block', fontSize:13, fontWeight:700, color:'#374151', marginBottom:6 }}>How can you help? *</label>
                <textarea required rows={4} value={supportForm.message} onChange={e => setSupportForm(p => ({...p,message:e.target.value}))}
                  placeholder={`Describe how you want to support "${supportNeed.title}"...`}
                  style={{ width:'100%', boxSizing:'border-box', border:'1.5px solid #e2e8f0', borderRadius:10, padding:'10px 14px', fontSize:13, color:NAVY, outline:'none', fontFamily:"'Inter',sans-serif", resize:'vertical' }}/>
              </div>
              {supportMsg && (
                <div style={{ padding:'12px 16px', borderRadius:10, fontSize:13, fontWeight:600,
                  background: supportMsg.type==='ok'?'#f0fdf4':'#fffbeb',
                  color: supportMsg.type==='ok'?G:'#b45309',
                  border: `1px solid ${supportMsg.type==='ok'?'#bbf7d0':'#fde68a'}` }}>
                  {supportMsg.text}
                </div>
              )}
              <button type="submit" disabled={supportSubmitting}
                style={{ padding:'13px', background: supportSubmitting?'#94a3b8':B, color:'#fff', border:'none', borderRadius:12, fontWeight:800, fontSize:15, cursor: supportSubmitting?'not-allowed':'pointer', transition:'background .2s' }}>
                {supportSubmitting ? 'Sending...' : 'Send Support Request'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
