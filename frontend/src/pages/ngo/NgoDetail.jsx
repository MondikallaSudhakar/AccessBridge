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
    <div style={{ minHeight:'100vh', background:'#f1f5f9', fontFamily:"'Inter',sans-serif" }}>
      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes fadeIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        .ngo-job-card:hover{border-color:${G} !important; box-shadow:0 4px 24px rgba(22,163,74,.10) !important}
        .ngo-tab-btn:hover{background:rgba(22,163,74,.08) !important}
      `}</style>

      {/* ── Topbar ── */}
      <div style={{ background:'#fff', borderBottom:'1px solid #e9ecef', padding:'14px 32px', display:'flex', alignItems:'center', gap:12, position:'sticky', top:0, zIndex:50 }}>
        <button onClick={() => navigate('/')} style={{ display:'flex', alignItems:'center', gap:6, background:'none', border:'none', cursor:'pointer', fontSize:13, fontWeight:600, color:'#64748b' }}>
          ← Back to Home
        </button>
        <div style={{ flex:1 }}/>
        <span style={{ ...chip(G), fontSize:12 }}>{ngo.verified ? '✓ Verified NGO' : '⏳ Pending Verification'}</span>
      </div>

      <div style={{ maxWidth:1100, margin:'0 auto', padding:'32px 24px 60px' }}>

        {/* ── Hero card ── */}
        <div style={{ ...card, padding:0, overflow:'hidden', animation:'fadeIn .4s ease', marginBottom:24 }}>
          {/* Gradient banner */}
          <div style={{ height:120, background:`linear-gradient(135deg, ${G}22 0%, ${B}18 100%)`, position:'relative' }}>
            <div style={{ position:'absolute', bottom:-30, left:32, width:64, height:64, borderRadius:16, background:'#fff', border:`2px solid ${G}40`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:26, fontWeight:900, color:G }}>
              {ngo.name?.charAt(0).toUpperCase()}
            </div>
          </div>
          <div style={{ padding:'42px 32px 28px', display:'flex', gap:32, alignItems:'flex-start', flexWrap:'wrap' }}>
            <div style={{ flex:1, minWidth:220 }}>
              <h1 style={{ margin:0, fontSize:26, fontWeight:900, color:NAVY }}>{ngo.name}</h1>
              <p style={{ margin:'4px 0 10px', fontSize:13, color:'#64748b' }}>{[ngo.city,ngo.state,ngo.country].filter(Boolean).join(', ')}</p>
              {(ngo.category||ngo.focusArea) && <span style={chip(B)}>{ngo.category||ngo.focusArea}</span>}
              <p style={{ margin:'14px 0 0', fontSize:14, color:'#374151', lineHeight:1.7, maxWidth:600 }}>{ngo.description||ngo.mission||'Committed to inclusive growth and accessibility.'}</p>
            </div>
            {/* Stat cards */}
            <div style={{ display:'flex', gap:14, flexWrap:'wrap' }}>
              {[
                { label:'Open Jobs',    value: openJobs.length,    color: G },
                { label:'Active Needs', value: activeNeeds.length, color: B },
                { label:'Last Date',    value: lastDate ? new Date(lastDate).toLocaleDateString('en-IN',{day:'numeric',month:'short'}) : '—', color:'#f59e0b' },
              ].map(s => (
                <div key={s.label} style={{ background:`${s.color}0D`, border:`1px solid ${s.color}30`, borderRadius:14, padding:'14px 20px', textAlign:'center', minWidth:100 }}>
                  <p style={{ margin:'0 0 2px', fontSize:22, fontWeight:900, color:s.color }}>{s.value}</p>
                  <p style={{ margin:0, fontSize:11, color:'#64748b', fontWeight:600 }}>{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Tab bar ── */}
        <div style={{ display:'flex', gap:6, marginBottom:20, overflowX:'auto', paddingBottom:4 }}>
          {TABS.map(t => (
            <button key={t.key} className="ngo-tab-btn"
              onClick={() => setTab(t.key)}
              style={{ display:'flex', alignItems:'center', gap:6, padding:'9px 18px', borderRadius:10, border:'none', cursor:'pointer', fontFamily:"'Inter',sans-serif", fontWeight:tab===t.key?700:500, fontSize:13, transition:'all .15s', whiteSpace:'nowrap',
                background: tab===t.key ? G : '#fff',
                color: tab===t.key ? '#fff' : '#374151',
                boxShadow: tab===t.key ? `0 2px 12px ${G}40` : '0 1px 3px rgba(0,0,0,.06)',
              }}
            >
              {t.label}
              <span style={{ fontSize:11, fontWeight:700, background: tab===t.key?'rgba(255,255,255,.3)':'#f1f5f9', color: tab===t.key?'#fff':'#64748b', padding:'1px 7px', borderRadius:10 }}>{t.count}</span>
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
                style={{ ...card, transition:'all .18s', display:'flex', gap:20, alignItems:'flex-start', flexWrap:'wrap' }}>
                {/* Info */}
                <div style={{ flex:1, minWidth:200 }}>
                  <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:6 }}>
                    <span style={chip(G)}>OPEN</span>
                    {j.employmentType && <span style={chip(B)}>{EMP_LABELS[j.employmentType]||j.employmentType}</span>}
                  </div>
                  <h3 style={{ margin:'0 0 4px', fontSize:16, fontWeight:800, color:NAVY }}>{j.title}</h3>
                  <div style={{ display:'flex', gap:14, flexWrap:'wrap', marginBottom:8 }}>
                    {j.location && <span style={{ fontSize:12, color:'#64748b' }}>Location: {j.location}</span>}
                    {j.salaryRange && <span style={{ fontSize:12, color:G, fontWeight:700 }}>Salary: {j.salaryRange}</span>}
                    {j.lastDateToApply && <span style={{ fontSize:12, color:'#f59e0b', fontWeight:700 }}>Last date: {j.lastDateToApply}</span>}
                  </div>
                  <p style={{ margin:0, fontSize:13, color:'#64748b', lineHeight:1.6 }}>{j.description}</p>
                </div>
                {/* Actions */}
                <div style={{ display:'flex', flexDirection:'column', gap:8, flexShrink:0 }}>
                  <button
                    onClick={() => { setApplyJob(j); setApplyMsg(null) }}
                    style={{ padding:'9px 20px', background:G, color:'#fff', border:'none', borderRadius:10, fontWeight:700, fontSize:13, cursor:'pointer', boxShadow:`0 2px 10px ${G}40` }}
                  >Apply Now</button>
                  <button
                    onClick={() => openChat('hiring', j.title)}
                    style={{ padding:'9px 20px', background:`${B}12`, color:B, border:`1px solid ${B}30`, borderRadius:10, fontWeight:700, fontSize:13, cursor:'pointer' }}
                  >Chat</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── REQUIREMENTS tab ── */}
        {tab === 'requirements' && (
          <div style={{ display:'flex', flexDirection:'column', gap:12, animation:'fadeIn .3s ease' }}>
            {activeNeeds.length === 0 && <div style={{ ...card, textAlign:'center', color:'#94a3b8', padding:'40px' }}><p style={{fontSize:14}}>No active requirements posted.</p></div>}
            {activeNeeds.map(n => (
              <div key={n.id} style={card}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:12 }}>
                  <div style={{ flex:1, minWidth:0 }}>
                    <h3 style={{ margin:'0 0 4px', fontSize:15, fontWeight:800, color:NAVY }}>{n.title}</h3>
                    <span style={chip(B)}>{n.category}</span>
                    <p style={{ margin:'8px 0 0', fontSize:13, color:'#64748b', lineHeight:1.6 }}>{n.description}</p>
                    {n.targetAmount > 0 && <p style={{ margin:'8px 0 0', fontSize:13, fontWeight:700, color:G }}>Target: Rs {Number(n.targetAmount).toLocaleString('en-IN')}</p>}
                  </div>
                  <button onClick={() => { setSupportNeed(n); setSupportMsg(null); setSupportForm({ name:'', email:'', message:'' }) }}
                    style={{ whiteSpace:'nowrap', padding:'9px 18px', background:G, color:'#fff', border:'none', borderRadius:10, fontWeight:700, fontSize:12, cursor:'pointer', flexShrink:0 }}>
                    Support
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── PRODUCTS tab ── */}
        {tab === 'products' && (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:16, animation:'fadeIn .3s ease' }}>
            {products.length === 0 && <div style={{ ...card, textAlign:'center', color:'#94a3b8', gridColumn:'1/-1', padding:40 }}><p>No products listed.</p></div>}
            {products.map(p => (
              <div key={p.id} style={card}>
                <h3 style={{ margin:'0 0 4px', fontSize:15, fontWeight:800, color:NAVY }}>{p.name}</h3>
                <span style={chip('#6366f1')}>{p.category||'General'}</span>
                <p style={{ margin:'8px 0 4px', fontSize:13, color:'#64748b' }}>{p.description}</p>
                <p style={{ margin:'8px 0 0', fontSize:16, fontWeight:800, color:G }}>₹{Number(p.price||0).toLocaleString('en-IN')}</p>
                <p style={{ margin:'2px 0 0', fontSize:11, color:'#94a3b8' }}>Stock: {p.stockQuantity}</p>
              </div>
            ))}
          </div>
        )}

        {/* ── SERVICES tab ── */}
        {tab === 'services' && (
          <div style={{ display:'flex', flexDirection:'column', gap:12, animation:'fadeIn .3s ease' }}>
            {services.length === 0 && <div style={{ ...card, textAlign:'center', color:'#94a3b8' }}><p>No services listed.</p></div>}
            {services.map(s => (
              <div key={s.id} style={card}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:12 }}>
                  <div>
                    <h3 style={{ margin:'0 0 4px', fontSize:15, fontWeight:800, color:NAVY }}>{s.title}</h3>
                    <span style={chip('#6366f1')}>{s.category||'Service'}</span>
                    <p style={{ margin:'8px 0', fontSize:13, color:'#64748b' }}>{s.description}</p>
                    {s.contactInfo && <p style={{ margin:0, fontSize:12, color:G, fontWeight:600 }}>Contact: {s.contactInfo}</p>}
                  </div>
                  <button onClick={() => openChat('service', s.title)} style={{ whiteSpace:'nowrap', padding:'8px 16px', background:`${G}12`, color:G, border:`1px solid ${G}30`, borderRadius:10, fontWeight:700, fontSize:12, cursor:'pointer' }}>Enquire</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── ACHIEVEMENTS tab ── */}
        {tab === 'achievements' && (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:16, animation:'fadeIn .3s ease' }}>
            {achievements.length === 0 && <div style={{ ...card, textAlign:'center', color:'#94a3b8', gridColumn:'1/-1', padding:40 }}><p>No achievements posted.</p></div>}
            {achievements.map(a => (
              <div key={a.id} style={{ ...card, borderLeft:`4px solid ${G}` }}>
                <h3 style={{ margin:'0 0 4px', fontSize:15, fontWeight:800, color:NAVY }}>{a.title}</h3>
                {a.achievementDate && <p style={{ margin:'0 0 6px', fontSize:11, color:'#94a3b8' }}>{a.achievementDate}</p>}
                <p style={{ margin:0, fontSize:13, color:'#64748b', lineHeight:1.6 }}>{a.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Apply Modal ── */}
      {applyJob && (
        <div onClick={() => setApplyJob(null)}
          style={{ position:'fixed', top:0, left:0, width:'100vw', height:'100vh', background:'rgba(15,23,42,.52)', zIndex:9999, display:'flex', alignItems:'center', justifyContent:'center', padding:20, boxSizing:'border-box', overflowY:'auto' }}>
          <div onClick={e => e.stopPropagation()}
            style={{ background:'#fff', borderRadius:20, boxShadow:'0 24px 64px rgba(0,0,0,.25)', width:'100%', maxWidth:540, maxHeight:'90vh', display:'flex', flexDirection:'column', overflow:'hidden', position:'relative' }}>
            <button onClick={() => setApplyJob(null)}
              style={{ position:'absolute', top:14, right:14, width:32, height:32, borderRadius:'50%', border:'none', background:'#f1f5f9', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', zIndex:10, fontSize:15, color:'#64748b', fontWeight:700 }}>x</button>
            {/* Header */}
            <div style={{ padding:'22px 24px 16px', borderBottom:'1px solid #f1f5f9', flexShrink:0 }}>
              <p style={{ margin:'0 0 2px', fontSize:11, fontWeight:700, color:G, textTransform:'uppercase', letterSpacing:'0.08em' }}>Apply for</p>
              <h2 style={{ margin:0, fontSize:18, fontWeight:900, color:NAVY }}>{applyJob.title}</h2>
              <p style={{ margin:'2px 0 0', fontSize:12, color:'#64748b' }}>{ngo.name}</p>
            </div>
            {/* Form */}
            <form onSubmit={handleApply} style={{ flex:1, overflowY:'auto', padding:'18px 24px', display:'flex', flexDirection:'column', gap:13 }}>
              {[['name','Full Name','text',true],['email','Email','email',true],['phone','Phone Number','tel',false]].map(([f,l,t,req])=>(
                <div key={f}>
                  <label style={{ display:'block', fontSize:12, fontWeight:700, color:'#64748b', marginBottom:5 }}>{l}{req&&' *'}</label>
                  <input required={req} type={t} value={form[f]} onChange={e=>setForm(p=>({...p,[f]:e.target.value}))}
                    style={{ width:'100%', boxSizing:'border-box', border:'1.5px solid #e2e8f0', borderRadius:10, padding:'9px 13px', fontSize:14, color:NAVY, outline:'none', fontFamily:"'Inter',sans-serif" }}/>
                </div>
              ))}
              <div>
                <label style={{ display:'block', fontSize:12, fontWeight:700, color:'#64748b', marginBottom:5 }}>Disability Type</label>
                <select value={form.disabilityType} onChange={e=>setForm(p=>({...p,disabilityType:e.target.value}))}
                  style={{ width:'100%', border:'1.5px solid #e2e8f0', borderRadius:10, padding:'9px 13px', fontSize:14, color:NAVY, outline:'none', fontFamily:"'Inter',sans-serif", background:'#fff' }}>
                  <option value="">Select (optional)</option>
                  {['visual','hearing','mobility','cognitive','speech','other'].map(d=><option key={d} value={d}>{d.charAt(0).toUpperCase()+d.slice(1)}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display:'block', fontSize:12, fontWeight:700, color:'#64748b', marginBottom:5 }}>Cover Letter *</label>
                <textarea required rows={4} value={form.coverLetter} onChange={e=>setForm(p=>({...p,coverLetter:e.target.value}))} placeholder="Why are you interested in this role?"
                  style={{ width:'100%', boxSizing:'border-box', border:'1.5px solid #e2e8f0', borderRadius:10, padding:'9px 13px', fontSize:13, color:NAVY, outline:'none', fontFamily:"'Inter',sans-serif", resize:'vertical' }}/>
              </div>
              <div>
                <label style={{ display:'block', fontSize:12, fontWeight:700, color:'#64748b', marginBottom:5 }}>Resume / Skills *</label>
                <textarea required rows={3} value={form.resumeText} onChange={e=>setForm(p=>({...p,resumeText:e.target.value}))} placeholder="Brief summary of your skills and experience"
                  style={{ width:'100%', boxSizing:'border-box', border:'1.5px solid #e2e8f0', borderRadius:10, padding:'9px 13px', fontSize:13, color:NAVY, outline:'none', fontFamily:"'Inter',sans-serif", resize:'vertical' }}/>
              </div>
              {applyMsg && (
                <div style={{ padding:'10px 14px', borderRadius:10, fontSize:13, fontWeight:600,
                  background: applyMsg.type==='ok'?'#f0fdf4':applyMsg.type==='warn'?'#fffbeb':'#fef2f2',
                  color: applyMsg.type==='ok'?G:applyMsg.type==='warn'?'#b45309':'#dc2626',
                  border: `1px solid ${applyMsg.type==='ok'?'#bbf7d0':applyMsg.type==='warn'?'#fde68a':'#fecaca'}` }}>
                  {applyMsg.text}
                </div>
              )}
              <button type="submit" disabled={submitting}
                style={{ padding:'12px', background: submitting?'#94a3b8':G, color:'#fff', border:'none', borderRadius:12, fontWeight:800, fontSize:15, cursor: submitting?'not-allowed':'pointer', transition:'background .15s' }}>
                {submitting ? 'Submitting...' : 'Submit Application'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── Support Request Modal ── */}
      {supportNeed && (
        <div onClick={() => setSupportNeed(null)}
          style={{ position:'fixed', top:0, left:0, width:'100vw', height:'100vh', background:'rgba(15,23,42,.52)', zIndex:9999, display:'flex', alignItems:'center', justifyContent:'center', padding:20, boxSizing:'border-box' }}>
          <div onClick={e => e.stopPropagation()}
            style={{ background:'#fff', borderRadius:20, boxShadow:'0 24px 64px rgba(0,0,0,.22)', width:'100%', maxWidth:480, position:'relative', overflow:'hidden' }}>
            <button onClick={() => setSupportNeed(null)}
              style={{ position:'absolute', top:14, right:14, width:32, height:32, borderRadius:'50%', border:'none', background:'#f1f5f9', cursor:'pointer', fontSize:15, fontWeight:700, color:'#64748b', display:'flex', alignItems:'center', justifyContent:'center' }}>x</button>
            <div style={{ padding:'22px 24px 16px', borderBottom:'1px solid #f1f5f9' }}>
              <p style={{ margin:'0 0 2px', fontSize:11, fontWeight:700, color:B, textTransform:'uppercase', letterSpacing:'0.08em' }}>Support Request</p>
              <h2 style={{ margin:0, fontSize:17, fontWeight:900, color:NAVY }}>{supportNeed.title}</h2>
              <p style={{ margin:'2px 0 0', fontSize:12, color:'#64748b' }}>{ngo.name}</p>
            </div>
            <form onSubmit={handleSupport} style={{ padding:'18px 24px', display:'flex', flexDirection:'column', gap:13 }}>
              {[['name','Your Name','text',true],['email','Your Email','email',true]].map(([f,l,t,req]) => (
                <div key={f}>
                  <label style={{ display:'block', fontSize:12, fontWeight:700, color:'#64748b', marginBottom:5 }}>{l} {req?'*':''}</label>
                  <input required={req} type={t} value={supportForm[f]} onChange={e => setSupportForm(p => ({...p,[f]:e.target.value}))}
                    style={{ width:'100%', boxSizing:'border-box', border:'1.5px solid #e2e8f0', borderRadius:10, padding:'9px 13px', fontSize:14, color:NAVY, outline:'none', fontFamily:"'Inter',sans-serif" }}/>
                </div>
              ))}
              <div>
                <label style={{ display:'block', fontSize:12, fontWeight:700, color:'#64748b', marginBottom:5 }}>How can you help / what do you need? *</label>
                <textarea required rows={4} value={supportForm.message} onChange={e => setSupportForm(p => ({...p,message:e.target.value}))}
                  placeholder={`Describe how you want to support "${supportNeed.title}" or what help you need...`}
                  style={{ width:'100%', boxSizing:'border-box', border:'1.5px solid #e2e8f0', borderRadius:10, padding:'9px 13px', fontSize:13, color:NAVY, outline:'none', fontFamily:"'Inter',sans-serif", resize:'vertical' }}/>
              </div>
              {supportMsg && (
                <div style={{ padding:'10px 14px', borderRadius:10, fontSize:13, fontWeight:600,
                  background: supportMsg.type==='ok'?'#f0fdf4':'#fffbeb',
                  color: supportMsg.type==='ok'?G:'#b45309',
                  border: `1px solid ${supportMsg.type==='ok'?'#bbf7d0':'#fde68a'}` }}>
                  {supportMsg.text}
                </div>
              )}
              <button type="submit" disabled={supportSubmitting}
                style={{ padding:'12px', background: supportSubmitting?'#94a3b8':G, color:'#fff', border:'none', borderRadius:12, fontWeight:800, fontSize:15, cursor: supportSubmitting?'not-allowed':'pointer' }}>
                {supportSubmitting ? 'Sending...' : 'Send Support Request'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
