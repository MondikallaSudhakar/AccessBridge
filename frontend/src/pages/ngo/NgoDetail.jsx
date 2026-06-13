import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import logoImg from '../../assets/logo.jpeg'

const BASE = '/api'
const G = '#84cc16'
const B = '#4d7c0f'
const NAVY = '#1e293b'

const EMP_LABELS = {
  FULL_TIME:'Full-time', PART_TIME:'Part-time', CONTRACT:'Contract',
  INTERNSHIP:'Internship', VOLUNTEER:'Volunteer'
}

async function fetchJSON(url) {
  try { const r = await fetch(url); return r.ok ? r.json() : null } catch { return null }
}

function normalizeExternalUrl(url) {
  if (!url) return ''
  if (/^[a-z][a-z\d+.-]*:\/\//i.test(url)) return url
  return `https://${url}`
}

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
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', backgroundColor:'#ffffff', fontFamily:"'Inter',sans-serif" }}>
      <div style={{ textAlign:'center' }}>
        <div style={{ width:42, height:42, borderRadius:'50%', border:`4px solid ${G}30`, borderTopColor:G, animation:'spin .8s linear infinite', margin:'0 auto 12px', boxShadow:`0 0 0 6px ${G}10` }}/>
        <p style={{ color:'#64748b', fontSize:14 }}>Loading NGO profile...</p>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  if (!ngo) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', backgroundColor:'#ffffff' }}>
      <div style={{ textAlign:'center', padding:40, background:'rgba(255,255,255,.9)', border:'1px solid #e7f2cf', borderRadius:24, boxShadow:'0 18px 50px rgba(132, 204, 22, 0.12)' }}>
        <p style={{ fontSize:18, fontWeight:700, color:NAVY }}>NGO not found</p>
        <button onClick={() => navigate('/')} style={{ marginTop:16, padding:'10px 24px', background:G, color:'#fff', border:'none', borderRadius:14, fontWeight:700, cursor:'pointer', boxShadow:'0 10px 24px rgba(132, 204, 22, 0.22)' }}>Go Home</button>
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
    ...(ngo?.mentorshipEnabled ? [{ key:'contact',      label:'Mentor Contact', count: 0 }] : []),
    { key:'achievements', label:'Achievements',  count: achievements.length },
  ]

  return (
    <div className="min-h-screen font-sans" style={{ backgroundColor:'#ffffff' }}>
      {/* ── Topbar ── */}
      <header className="sticky top-0 z-50 border-b backdrop-blur" style={{ borderColor:'#dcecc0', backgroundColor:'rgba(255,255,255,.9)' }}>
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 md:px-6">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/')} className="flex items-center gap-2 text-sm font-medium transition-colors hover:text-lime-700" style={{ color:'#64748b' }}>
              ← Back
            </button>
            <a href="/" className="flex items-center gap-2">
              <img src={logoImg} alt="KnotneX" className="h-8 w-8 rounded-lg object-cover" style={{ border: '1px solid #d9ebaa' }} />
              <span className="hidden text-base font-bold md:inline" style={{ color:B }}>KnotneX</span>
            </a>
          </div>
          <span className="px-3 py-1 text-xs font-medium rounded-full" style={{ color:B, backgroundColor:'#eff7d4', border:'1px solid #d9ebaa' }}>
            {ngo.verified ? '✓ Verified' : '⏳ Pending'}
          </span>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 pb-12 pt-8 md:px-6">
        {/* ── Hero card ── */}
        <div className="mb-8 rounded-3xl border p-6 md:p-8" style={{ borderColor:'#dfecc2', background:'linear-gradient(135deg, rgba(240,248,217,.95) 0%, rgba(255,255,255,.95) 52%, rgba(235,244,207,.9) 100%)', boxShadow:'0 16px 40px rgba(132, 204, 22, 0.10)' }}>
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl border grid place-items-center" style={{ borderColor:'#dfecc2', backgroundColor:'#f7fbe9', boxShadow:'0 10px 22px rgba(132, 204, 22, 0.12)' }}>
              {ngo.logoUrl ? (
                <img 
                  src={ngo.logoUrl.startsWith('http') ? ngo.logoUrl : `${ngo.logoUrl.startsWith('/') ? '' : '/'}${ngo.logoUrl}`} 
                  alt={ngo.name} 
                  className="h-full w-full object-contain p-1" 
                />
              ) : (
                <span className="text-3xl font-bold" style={{ color:B }}>{ngo.name?.charAt(0).toUpperCase()}</span>
              )}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold" style={{ color:NAVY }}>{ngo.name}</h1>
              <p className="mt-1 text-sm" style={{ color:'#64748b' }}>{[ngo.city,ngo.state,ngo.country].filter(Boolean).join(', ')}</p>
              {(ngo.category||ngo.focusArea) && <span className="mt-3 inline-block rounded-full px-3 py-1 text-xs font-semibold" style={{ backgroundColor:'#eff7d4', color:B, border:'1px solid #d9ebaa' }}>{ngo.category||ngo.focusArea}</span>}
              <p className="mt-4 text-sm leading-relaxed max-w-2xl" style={{ color:'#475569' }}>{ngo.description||ngo.mission||'Committed to inclusive growth and accessibility.'}</p>
            </div>
            
            {/* Stat cards */}
            <div className="flex flex-wrap gap-3 mt-6 md:mt-0 justify-start md:justify-end">
              {[
                { label:'Jobs', count: openJobs.length },
                { label:'Needs', count: activeNeeds.length },
                { label:'Products', count: products.length },
              ].map(s => (
                <div key={s.label} className="flex min-w-[90px] flex-col items-center justify-center rounded-2xl border bg-white/85 p-3" style={{ borderColor:'#dfecc2', boxShadow:'0 8px 18px rgba(132, 204, 22, 0.08)' }}>
                  <span className="text-lg font-bold" style={{ color:B }}>{s.count}</span>
                  <span className="text-xs" style={{ color:'#64748b' }}>{s.label}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            {ngo?.mentorshipEnabled && (
              <button onClick={() => setTab('contact')} className="rounded-full px-5 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90" style={{ backgroundColor:G, boxShadow:'0 10px 24px rgba(132, 204, 22, 0.20)' }}>
                Mentor Contact
              </button>
            )}
            <button onClick={() => setTab('services')} className="rounded-full px-5 py-2 text-sm font-medium transition-colors" style={{ border:`1px solid #d9ebaa`, color:B, backgroundColor:'rgba(255,255,255,.75)' }}>
              View Services
            </button>
          </div>
        </div>

        {/* ── Tab bar ── */}
        <div className="mb-8 border-b" style={{ borderColor:'#dfecc2' }}>
          <div className="flex gap-6 overflow-x-auto">
            {TABS.map(t => (
              <button key={t.key}
                onClick={() => setTab(t.key)}
                className="pb-3 text-sm font-medium transition-colors whitespace-nowrap"
                style={{
                  color: tab===t.key ? B : '#64748b',
                  borderBottom: tab===t.key ? `2px solid ${G}` : 'none'
                }}
              >
                {t.label} <span style={{ color:'#94a3b8' }}>({t.count})</span>
              </button>
            ))}
          </div>
        </div>

        {/* ── JOBS tab ── */}
        {tab === 'jobs' && (
          <div className="flex flex-col gap-4">
            {openJobs.length === 0 && (
              <div className="rounded-2xl border bg-white/90 p-12 text-center" style={{ borderColor:'#dfecc2' }}>
                <p className="text-base" style={{ color:'#64748b' }}>No open positions right now</p>
              </div>
            )}
            {openJobs.map(j => (
              <div key={j.id} className="flex flex-col md:flex-row gap-6 items-start rounded-2xl border bg-white/90 p-6" style={{ borderColor:'#dfecc2', boxShadow:'0 10px 24px rgba(132, 204, 22, 0.08)' }}>
                <div className="flex-1 min-w-0">
                  <div className="mb-3 flex flex-wrap gap-2">
                    <span className="px-2 py-1 text-xs font-medium rounded-full" style={{ backgroundColor:'#eff7d4', color:B, border:'1px solid #d9ebaa' }}>HIRING</span>
                    {j.employmentType && <span className="px-2 py-1 text-xs font-medium rounded-full" style={{ backgroundColor:'#f8fce8', color:B, border:'1px solid #e2efbf' }}>{EMP_LABELS[j.employmentType]||j.employmentType}</span>}
                  </div>
                  <h3 className="mb-2 text-base font-bold" style={{ color:NAVY }}>{j.title}</h3>
                  <div className="mb-3 flex flex-wrap gap-4 text-sm" style={{ color:'#64748b' }}>
                    {j.location && <span>{j.location}</span>}
                    {j.salaryRange && <span>{j.salaryRange}</span>}
                  </div>
                  <p className="text-sm leading-relaxed" style={{ color:'#475569' }}>{j.description}</p>
                </div>
                <div className="shrink-0 mt-4 md:mt-0">
                  <button onClick={() => { setApplyJob(j); setApplyMsg(null) }} className="rounded-full px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90" style={{ backgroundColor:G, boxShadow:'0 10px 22px rgba(132, 204, 22, 0.20)' }}>Apply Now</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── REQUIREMENTS tab ── */}
        {tab === 'requirements' && (
          <div className="flex flex-col gap-4">
            {activeNeeds.length === 0 && (
              <div className="rounded-2xl border bg-white/90 p-12 text-center" style={{ borderColor:'#dfecc2' }}>
                <p className="text-base" style={{ color:'#64748b' }}>No active requirements</p>
              </div>
            )}
            {activeNeeds.map(n => (
              <div key={n.id} className="flex flex-col md:flex-row gap-6 items-start rounded-2xl border bg-white/90 p-6" style={{ borderColor:'#dfecc2', boxShadow:'0 10px 24px rgba(132, 204, 22, 0.08)' }}>
                <div className="flex-1 min-w-0">
                  <h3 className="mb-2 text-base font-bold" style={{ color:NAVY }}>{n.title}</h3>
                  <span className="mb-3 inline-block rounded-full px-2 py-1 text-xs font-medium" style={{ backgroundColor:'#eff7d4', color:B, border:'1px solid #d9ebaa' }}>{n.category}</span>
                  <p className="mb-3 text-sm leading-relaxed" style={{ color:'#475569' }}>{n.description}</p>
                  {n.targetAmount > 0 && <p className="text-sm font-medium" style={{ color:G }}>Target: Rs {Number(n.targetAmount).toLocaleString('en-IN')}</p>}
                </div>
                <div className="shrink-0 mt-4 md:mt-0">
                  <button onClick={() => { setSupportNeed(n); setSupportMsg(null); setSupportForm({ name:'', email:'', message:'' }) }} className="rounded-full px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90" style={{ backgroundColor:B, boxShadow:'0 10px 22px rgba(77, 124, 15, 0.18)' }}>Support</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'contact' && (
          <div className="flex flex-col gap-4">
            <div className="rounded-2xl border bg-white/90 p-6" style={{ borderColor:'#dfecc2', boxShadow:'0 10px 24px rgba(132, 204, 22, 0.08)' }}>
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <span className="px-2 py-1 text-xs font-medium rounded-full" style={{ backgroundColor:'#eff7d4', color:B, border:'1px solid #d9ebaa' }}>Mentor Support</span>
                <span className="px-2 py-1 text-xs font-medium rounded-full" style={{ backgroundColor:'#f8fce8', color:B, border:'1px solid #e2efbf' }}>Open for volunteers</span>
              </div>
              <h3 className="mb-2 text-base font-bold" style={{ color:NAVY }}>Contact the NGO</h3>
              <p className="mb-4 text-sm leading-relaxed" style={{ color:'#475569' }}>
                {ngo.supportProvidedSummary || ngo.mission || 'This NGO welcomes volunteer contact for mentoring, support, and community collaboration.'}
              </p>
              <div className="grid gap-3 md:grid-cols-3">
                {ngo.email && (
                  <a href={`mailto:${ngo.email}`} className="rounded-2xl border px-4 py-3 text-sm font-medium transition-colors hover:border-lime-200 hover:bg-lime-50" style={{ borderColor:'#dfecc2', color:B, backgroundColor:'rgba(255,255,255,.75)' }}>
                    Email: {ngo.email}
                  </a>
                )}
                {ngo.phone && (
                  <a href={`tel:${ngo.phone}`} className="rounded-2xl border px-4 py-3 text-sm font-medium transition-colors hover:border-lime-200 hover:bg-lime-50" style={{ borderColor:'#dfecc2', color:B, backgroundColor:'rgba(255,255,255,.75)' }}>
                    Phone: {ngo.phone}
                  </a>
                )}
                {ngo.websiteUrl && (
                  <a href={normalizeExternalUrl(ngo.websiteUrl)} target="_blank" rel="noopener noreferrer" className="rounded-2xl border px-4 py-3 text-sm font-medium transition-colors hover:border-lime-200 hover:bg-lime-50" style={{ borderColor:'#dfecc2', color:B, backgroundColor:'rgba(255,255,255,.75)' }}>
                    Website
                  </a>
                )}
              </div>
              <div className="mt-5 flex flex-wrap gap-3">
                <button onClick={() => openChat('mentor-contact', ngo.name)} className="rounded-full px-5 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90" style={{ backgroundColor:G, boxShadow:'0 10px 22px rgba(132, 204, 22, 0.20)' }}>
                  Message NGO
                </button>
                {user ? (
                  <a href="/dashboard" className="rounded-full px-5 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90" style={{ backgroundColor:B, boxShadow:'0 10px 22px rgba(77, 124, 15, 0.18)' }}>
                    Support from Dashboard
                  </a>
                ) : (
                  <a href="/register" className="rounded-full px-5 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90" style={{ backgroundColor:B, boxShadow:'0 10px 22px rgba(77, 124, 15, 0.18)' }}>
                    Join to Connect
                  </a>
                )}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {services.filter(service => service.contactInfo || service.availability).map(service => (
                <div key={service.id} className="rounded-2xl border bg-white/90 p-5" style={{ borderColor:'#dfecc2', boxShadow:'0 10px 24px rgba(132, 204, 22, 0.08)' }}>
                  <h4 className="mb-2 text-base font-bold" style={{ color:NAVY }}>{service.title}</h4>
                  <p className="mb-3 text-sm leading-relaxed" style={{ color:'#475569' }}>{service.description}</p>
                  {service.availability && <p className="text-sm font-medium" style={{ color:B }}>Availability: {service.availability}</p>}
                  {service.contactInfo && <p className="text-sm font-medium" style={{ color:G }}>Contact: {service.contactInfo}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── PRODUCTS tab ── */}
        {tab === 'products' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.length === 0 && (
              <div className="col-span-full rounded-2xl border bg-white/90 p-12 text-center" style={{ borderColor:'#dfecc2' }}>
                <p className="text-base" style={{ color:'#64748b' }}>No products listed</p>
              </div>
            )}
            {products.map(p => (
              <div key={p.id} className="rounded-2xl border bg-white/90 p-5 flex flex-col" style={{ borderColor:'#dfecc2', boxShadow:'0 10px 24px rgba(132, 204, 22, 0.08)' }}>
                <h3 className="mb-2 text-base font-bold" style={{ color:NAVY }}>{p.name}</h3>
                <span className="mb-3 inline-block self-start rounded-full px-2 py-1 text-xs font-medium" style={{ backgroundColor:'#eff7d4', color:B, border:'1px solid #d9ebaa' }}>{p.category||'General'}</span>
                <p className="mb-4 text-sm leading-relaxed flex-1" style={{ color:'#475569' }}>{p.description}</p>
                <div className="flex items-center justify-between border-t pt-4" style={{ borderColor:'#e6efc7' }}>
                  <p className="text-lg font-bold" style={{ color:G }}>₹{Number(p.price||0).toLocaleString('en-IN')}</p>
                  <p className="text-xs" style={{ color:'#64748b' }}>📦 Stock: {p.stockQuantity}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── SERVICES tab ── */}
        {tab === 'services' && (
          <div className="flex flex-col gap-4">
            {services.length === 0 && (
              <div className="rounded-2xl border bg-white/90 p-12 text-center" style={{ borderColor:'#dfecc2' }}>
                <p className="text-base" style={{ color:'#64748b' }}>No services listed</p>
              </div>
            )}
            {services.map(s => (
              <div key={s.id} className="rounded-2xl border bg-white/90 p-6" style={{ borderColor:'#dfecc2', boxShadow:'0 10px 24px rgba(132, 204, 22, 0.08)' }}>
                <h3 className="mb-2 text-base font-bold" style={{ color:NAVY }}>{s.title}</h3>
                <span className="mb-3 inline-block rounded-full px-2 py-1 text-xs font-medium" style={{ backgroundColor:'#eff7d4', color:B, border:'1px solid #d9ebaa' }}>{s.category||'Service'}</span>
                <p className="mb-3 text-sm leading-relaxed" style={{ color:'#475569' }}>{s.description}</p>
                {s.contactInfo && <p className="text-sm font-medium" style={{ color:G }}>Contact: {s.contactInfo}</p>}
              </div>
            ))}
          </div>
        )}

        {/* ── ACHIEVEMENTS tab ── */}
        {tab === 'achievements' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {achievements.length === 0 && (
              <div className="col-span-full rounded-2xl border bg-white/90 p-12 text-center" style={{ borderColor:'#dfecc2' }}>
                <p className="text-base" style={{ color:'#64748b' }}>No achievements posted</p>
              </div>
            )}
            {achievements.map(a => (
              <div key={a.id} className="rounded-2xl border bg-white/90 p-6" style={{ borderColor:'#dfecc2', boxShadow:'0 10px 24px rgba(132, 204, 22, 0.08)' }}>
                <h3 className="mb-2 text-base font-bold" style={{ color:NAVY }}>{a.title}</h3>
                {a.achievementDate && <p className="mb-3 text-xs" style={{ color:'#64748b' }}>{a.achievementDate}</p>}
                <p className="text-sm leading-relaxed" style={{ color:'#475569' }}>{a.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Apply Modal ── */}
      {applyJob && (
        <div onClick={() => setApplyJob(null)}
          style={{ position:'fixed', top:0, left:0, width:'100vw', height:'100vh', background:'rgba(15,23,42,.45)', zIndex:9999, display:'flex', alignItems:'center', justifyContent:'center', padding:20, boxSizing:'border-box', overflowY:'auto', backdropFilter:'blur(6px)' }}>
          <div onClick={e => e.stopPropagation()}
            style={{ background:'rgba(255,255,255,.96)', borderRadius:24, boxShadow:'0 24px 70px rgba(132, 204, 22, .16)', width:'100%', maxWidth:540, maxHeight:'90vh', display:'flex', flexDirection:'column', overflow:'hidden', position:'relative', border:'1px solid #dfecc2' }}>
            <button onClick={() => setApplyJob(null)}
              style={{ position:'absolute', top:14, right:14, width:36, height:36, borderRadius:'50%', border:'1px solid #e2efbf', background:'#f8fce8', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', zIndex:10, fontSize:18, color:'#64748b', fontWeight:700, transition:'all .2s' }}>×</button>
            {/* Header */}
            <div style={{ padding:'24px 28px 16px', borderBottom:'1px solid #e2efbf', flexShrink:0, background:'linear-gradient(135deg, #f8fce8 0%, #ffffff 100%)' }}>
              <p style={{ margin:'0 0 6px', fontSize:12, fontWeight:800, color:B, textTransform:'uppercase', letterSpacing:'0.08em' }}>Apply Now</p>
              <h2 style={{ margin:0, fontSize:20, fontWeight:900, color:NAVY }}>{applyJob.title}</h2>
              <p style={{ margin:'4px 0 0', fontSize:13, color:'#64748b', fontWeight:600 }}>{ngo.name}</p>
            </div>
            {/* Form */}
            <form onSubmit={handleApply} style={{ flex:1, overflowY:'auto', padding:'20px 28px', display:'flex', flexDirection:'column', gap:14 }}>
              {[['name','Full Name','text',true],['email','Email','email',true],['phone','Phone Number','tel',false]].map(([f,l,t,req])=>(
                <div key={f}>
                  <label style={{ display:'block', fontSize:13, fontWeight:700, color:'#334155', marginBottom:6 }}>{l}{req&&' *'}</label>
                  <input required={req} type={t} value={form[f]} onChange={e=>setForm(p=>({...p,[f]:e.target.value}))}
                    style={{ width:'100%', boxSizing:'border-box', border:'1.5px solid #dbe8c0', borderRadius:12, padding:'10px 14px', fontSize:14, color:NAVY, outline:'none', fontFamily:"'Inter',sans-serif", transition:'border .2s', backgroundColor:'#fff' }}/>
                </div>
              ))}
              <div>
                <label style={{ display:'block', fontSize:13, fontWeight:700, color:'#334155', marginBottom:6 }}>Disability Type</label>
                <select value={form.disabilityType} onChange={e=>setForm(p=>({...p,disabilityType:e.target.value}))}
                  style={{ width:'100%', border:'1.5px solid #dbe8c0', borderRadius:12, padding:'10px 14px', fontSize:14, color:NAVY, outline:'none', fontFamily:"'Inter',sans-serif", background:'#fff' }}>
                  <option value="">Select (optional)</option>
                  {['visual','hearing','mobility','cognitive','speech','other'].map(d=><option key={d} value={d}>{d.charAt(0).toUpperCase()+d.slice(1)}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display:'block', fontSize:13, fontWeight:700, color:'#334155', marginBottom:6 }}>Cover Letter *</label>
                <textarea required rows={4} value={form.coverLetter} onChange={e=>setForm(p=>({...p,coverLetter:e.target.value}))} placeholder="Why are you interested in this role?"
                  style={{ width:'100%', boxSizing:'border-box', border:'1.5px solid #dbe8c0', borderRadius:12, padding:'10px 14px', fontSize:13, color:NAVY, outline:'none', fontFamily:"'Inter',sans-serif", resize:'vertical', backgroundColor:'#fff' }}/>
              </div>
              <div>
                <label style={{ display:'block', fontSize:13, fontWeight:700, color:'#334155', marginBottom:6 }}>Resume / Skills *</label>
                <textarea required rows={3} value={form.resumeText} onChange={e=>setForm(p=>({...p,resumeText:e.target.value}))} placeholder="Brief summary of your skills and experience"
                  style={{ width:'100%', boxSizing:'border-box', border:'1.5px solid #dbe8c0', borderRadius:12, padding:'10px 14px', fontSize:13, color:NAVY, outline:'none', fontFamily:"'Inter',sans-serif", resize:'vertical', backgroundColor:'#fff' }}/>
              </div>
              {applyMsg && (
                <div style={{ padding:'12px 16px', borderRadius:10, fontSize:13, fontWeight:600,
                  background: applyMsg.type==='ok'?'#eff7d4':applyMsg.type==='warn'?'#fffbeb':'#fef2f2',
                  color: applyMsg.type==='ok'?B:applyMsg.type==='warn'?'#b45309':'#dc2626',
                  border: `1px solid ${applyMsg.type==='ok'?'#d9ebaa':applyMsg.type==='warn'?'#fde68a':'#fecaca'}` }}>
                  {applyMsg.text}
                </div>
              )}
              <button type="submit" disabled={submitting}
                style={{ padding:'13px', background: submitting?'#94a3b8':G, color:'#fff', border:'none', borderRadius:14, fontWeight:800, fontSize:15, cursor: submitting?'not-allowed':'pointer', transition:'background .2s', boxShadow: submitting?'none':'0 10px 22px rgba(132, 204, 22, 0.20)' }}>
                {submitting ? 'Submitting...' : 'Submit Application'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── Support Request Modal ── */}
      {supportNeed && (
        <div onClick={() => setSupportNeed(null)}
          style={{ position:'fixed', top:0, left:0, width:'100vw', height:'100vh', background:'rgba(15,23,42,.45)', zIndex:9999, display:'flex', alignItems:'center', justifyContent:'center', padding:20, boxSizing:'border-box', backdropFilter:'blur(6px)' }}>
          <div onClick={e => e.stopPropagation()}
            style={{ background:'rgba(255,255,255,.96)', borderRadius:24, boxShadow:'0 24px 70px rgba(132, 204, 22, .16)', width:'100%', maxWidth:480, position:'relative', overflow:'hidden', border:'1px solid #dfecc2' }}>
            <button onClick={() => setSupportNeed(null)}
              style={{ position:'absolute', top:14, right:14, width:36, height:36, borderRadius:'50%', border:'1px solid #e2efbf', background:'#f8fce8', cursor:'pointer', fontSize:18, fontWeight:700, color:'#64748b', display:'flex', alignItems:'center', justifyContent:'center', transition:'all .2s' }}>×</button>
            <div style={{ padding:'24px 28px 16px', borderBottom:'1px solid #e2efbf', background:'linear-gradient(135deg, #f8fce8 0%, #ffffff 100%)' }}>
              <p style={{ margin:'0 0 6px', fontSize:12, fontWeight:800, color:G, textTransform:'uppercase', letterSpacing:'0.08em' }}>Support Request</p>
              <h2 style={{ margin:0, fontSize:19, fontWeight:900, color:NAVY }}>{supportNeed.title}</h2>
              <p style={{ margin:'4px 0 0', fontSize:13, color:'#64748b', fontWeight:600 }}>{ngo.name}</p>
            </div>
            <form onSubmit={handleSupport} style={{ padding:'20px 28px', display:'flex', flexDirection:'column', gap:14 }}>
              {[['name','Your Name','text',true],['email','Your Email','email',true]].map(([f,l,t,req]) => (
                <div key={f}>
                  <label style={{ display:'block', fontSize:13, fontWeight:700, color:'#334155', marginBottom:6 }}>{l} {req?'*':''}</label>
                  <input required={req} type={t} value={supportForm[f]} onChange={e => setSupportForm(p => ({...p,[f]:e.target.value}))}
                    style={{ width:'100%', boxSizing:'border-box', border:'1.5px solid #dbe8c0', borderRadius:12, padding:'10px 14px', fontSize:14, color:NAVY, outline:'none', fontFamily:"'Inter',sans-serif", transition:'border .2s', backgroundColor:'#fff' }}/>
                </div>
              ))}
              <div>
                <label style={{ display:'block', fontSize:13, fontWeight:700, color:'#334155', marginBottom:6 }}>How can you help? *</label>
                <textarea required rows={4} value={supportForm.message} onChange={e => setSupportForm(p => ({...p,message:e.target.value}))}
                  placeholder={`Describe how you want to support "${supportNeed.title}"...`}
                  style={{ width:'100%', boxSizing:'border-box', border:'1.5px solid #dbe8c0', borderRadius:12, padding:'10px 14px', fontSize:13, color:NAVY, outline:'none', fontFamily:"'Inter',sans-serif", resize:'vertical', backgroundColor:'#fff' }}/>
              </div>
              {supportMsg && (
                <div style={{ padding:'12px 16px', borderRadius:10, fontSize:13, fontWeight:600,
                  background: supportMsg.type==='ok'?'#eff7d4':'#fffbeb',
                  color: supportMsg.type==='ok'?B:'#b45309',
                  border: `1px solid ${supportMsg.type==='ok'?'#d9ebaa':'#fde68a'}` }}>
                  {supportMsg.text}
                </div>
              )}
              <button type="submit" disabled={supportSubmitting}
                style={{ padding:'13px', background: supportSubmitting?'#94a3b8':G, color:'#fff', border:'none', borderRadius:14, fontWeight:800, fontSize:15, cursor: supportSubmitting?'not-allowed':'pointer', transition:'background .2s', boxShadow: supportSubmitting?'none':'0 10px 22px rgba(132, 204, 22, 0.20)' }}>
                {supportSubmitting ? 'Sending...' : 'Send Support Request'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
