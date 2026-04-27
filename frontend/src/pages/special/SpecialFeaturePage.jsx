import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const BASE = 'http://localhost:8081/api'
const G = '#16a34a'
const B = '#1A8FD1'
const NAVY = '#0f172a'

const hdr = { 'Content-Type': 'application/json' }
const authHdr = () => {
  const t = localStorage.getItem('token')
  return t ? { ...hdr, Authorization: `Bearer ${t}` } : hdr
}
const get = url => fetch(url, { headers: authHdr() }).then(r => r.ok ? r.json() : []).catch(() => [])

/* ── tiny shared styles ── */
const card = { background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0', padding: '18px 20px', boxShadow: '0 1px 4px rgba(0,0,0,.06)' }
const chip = (c) => ({ display: 'inline-block', fontSize: 10, fontWeight: 700, color: c, background: c + '18', padding: '2px 9px', borderRadius: 20, letterSpacing: '0.04em' })
const btn = (bg, color = '#fff') => ({ background: bg, color, border: 'none', borderRadius: 9, padding: '8px 16px', fontSize: 12, fontWeight: 700, cursor: 'pointer' })
const outBtn = (c) => ({ background: 'none', border: `1px solid ${c}`, color: c, borderRadius: 9, padding: '8px 16px', fontSize: 12, fontWeight: 700, cursor: 'pointer' })

function Spinner() {
  return (
    <div style={{ textAlign: 'center', padding: '60px 0', color: '#94a3b8' }}>
      <div style={{ width: 34, height: 34, borderRadius: '50%', border: `4px solid ${G}25`, borderTopColor: G, animation: 'spin .8s linear infinite', margin: '0 auto 10px' }} />
      <p style={{ fontSize: 13, margin: 0 }}>Loading...</p>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}

function Empty({ msg = 'Nothing available yet.' }) {
  return <div style={{ textAlign: 'center', padding: '50px 20px', color: '#94a3b8' }}><p style={{ fontSize: 14, margin: 0 }}>{msg}</p></div>
}

function SectionHeader({ title, sub }) {
  return (
    <div style={{ ...card, marginBottom: 18 }}>
      <h2 style={{ margin: '0 0 4px', fontSize: 20, fontWeight: 900, color: NAVY }}>{title}</h2>
      <p style={{ margin: 0, fontSize: 13, color: '#64748b' }}>{sub}</p>
    </div>
  )
}

/* ═══════════════════════════════ NGOs TAB ═══════════════════════════════ */
function NgosTab() {
  const navigate = useNavigate()
  const [ngos, setNgos] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => { get(`${BASE}/ngos`).then(d => setNgos(Array.isArray(d) ? d : [])).finally(() => setLoading(false)) }, [])

  const filtered = ngos.filter(n => !search || n.name?.toLowerCase().includes(search.toLowerCase()) || n.city?.toLowerCase().includes(search.toLowerCase()))

  return (
    <section>
      <SectionHeader title="NGOs & Services" sub="Connect with NGOs providing support for specially abled persons." />
      <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search NGOs..." style={{ width: '100%', boxSizing: 'border-box', border: '1.5px solid #e2e8f0', borderRadius: 10, padding: '9px 14px', fontSize: 13, marginBottom: 14, outline: 'none' }} />
      {loading ? <Spinner /> : filtered.length === 0 ? <Empty msg="No NGOs found." /> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 14 }}>
          {filtered.map(n => (
            <div key={n.id} style={card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 8 }}>
                <h4 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: NAVY }}>{n.name}</h4>
                <span style={chip(n.verified ? G : '#f59e0b')}>{n.verified ? 'Verified' : 'Pending'}</span>
              </div>
              <p style={{ margin: '0 0 6px', fontSize: 12, color: '#64748b' }}>{[n.city, n.state].filter(Boolean).join(', ') || 'Location not listed'}</p>
              <p style={{ margin: '0 0 12px', fontSize: 13, color: '#64748b', lineHeight: 1.6 }}>{n.description || n.mission || 'Support services for the community.'}</p>
              <div style={{ display: 'flex', gap: 8 }}>
                <button style={btn(G)} onClick={() => navigate(`/ngos/${n.id}`)}>View NGO</button>
                <button style={outBtn(B)} onClick={() => navigate(`/ngos/${n.id}`)}>Request Help</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

/* ═══════════════════════════════ TRAINING TAB ═══════════════════════════ */
function TrainingTab() {
  const navigate = useNavigate()
  const [schools, setSchools] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => { get(`${BASE}/schools`).then(d => setSchools(Array.isArray(d) ? d : [])).finally(() => setLoading(false)) }, [])

  const filtered = schools.filter(s => !search || s.name?.toLowerCase().includes(search.toLowerCase()) || s.city?.toLowerCase().includes(search.toLowerCase()))

  return (
    <section>
      <SectionHeader title="Schools & Training Programs" sub="Special schools and skill development programs for all abilities." />
      <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search schools..." style={{ width: '100%', boxSizing: 'border-box', border: '1.5px solid #e2e8f0', borderRadius: 10, padding: '9px 14px', fontSize: 13, marginBottom: 14, outline: 'none' }} />
      {loading ? <Spinner /> : filtered.length === 0 ? <Empty msg="No schools or training programs found." /> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 14 }}>
          {filtered.map(s => (
            <div key={s.id} style={card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, marginBottom: 8 }}>
                <h4 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: NAVY }}>{s.name}</h4>
                {s.specialSchool && <span style={chip(B)}>Special School</span>}
              </div>
              <p style={{ margin: '0 0 4px', fontSize: 12, color: '#64748b' }}>{[s.city, s.state].filter(Boolean).join(', ') || 'Location not listed'}</p>
              {s.disabilityTypes && <p style={{ margin: '0 0 6px', fontSize: 11, color: G, fontWeight: 600 }}>{s.disabilityTypes}</p>}
              <p style={{ margin: '0 0 12px', fontSize: 13, color: '#64748b', lineHeight: 1.6 }}>{s.description || 'Programs for skill development and learning.'}</p>
              <div style={{ display: 'flex', gap: 8 }}>
                <button style={btn(G)} onClick={() => navigate(`/schools/${s.id}`)}>View Programs</button>
                {s.websiteUrl && <a href={s.websiteUrl} target="_blank" rel="noreferrer" style={{ ...outBtn(B), textDecoration: 'none' }}>Website</a>}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

/* ═══════════════════════════════ EVENTS TAB ═══════════════════════════════ */
function EventsTab() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [registering, setRegistering] = useState(null)
  const [regMsg, setRegMsg] = useState(null)
  const [regForm, setRegForm] = useState({ name: '', email: '' })

  useEffect(() => { get(`${BASE}/events/public`).then(d => setEvents(Array.isArray(d) ? d : [])).finally(() => setLoading(false)) }, [])

  const handleRegister = async e => {
    e.preventDefault()
    setRegMsg(null)
    try {
      const r = await fetch(`${BASE}/events/${registering.id}/register`, {
        method: 'POST', headers: authHdr(), body: JSON.stringify(regForm)
      })
      setRegMsg(r.ok ? { type: 'ok', text: 'Registered successfully!' } : { type: 'err', text: 'Registration failed. Try again.' })
      if (r.ok) setTimeout(() => setRegistering(null), 2000)
    } catch { setRegMsg({ type: 'err', text: 'Network error.' }) }
  }

  return (
    <section>
      <SectionHeader title="Upcoming Events" sub="Accessibility meetups, workshops, and awareness events." />
      {loading ? <Spinner /> : events.length === 0 ? <Empty msg="No upcoming events." /> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 14 }}>
          {events.map(ev => (
            <div key={ev.id} style={card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, marginBottom: 8 }}>
                <h4 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: NAVY }}>{ev.title}</h4>
                {ev.eventType && <span style={chip(B)}>{ev.eventType}</span>}
              </div>
              <p style={{ margin: '0 0 4px', fontSize: 12, color: '#64748b' }}>{ev.location}{ev.city ? ` • ${ev.city}` : ''}</p>
              <p style={{ margin: '0 0 6px', fontSize: 12, fontWeight: 700, color: G }}>{ev.eventDate ? new Date(ev.eventDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}</p>
              <p style={{ margin: '0 0 12px', fontSize: 13, color: '#64748b', lineHeight: 1.6 }}>{ev.description}</p>
              <button style={btn(G)} onClick={() => { setRegistering(ev); setRegMsg(null); setRegForm({ name: '', email: '' }) }}>Register</button>
            </div>
          ))}
        </div>
      )}

      {registering && (
        <div onClick={() => setRegistering(null)} style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(15,23,42,.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, boxSizing: 'border-box' }}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 18, boxShadow: '0 20px 60px rgba(0,0,0,.2)', maxWidth: 420, width: '100%', padding: 26, position: 'relative' }}>
            <button onClick={() => setRegistering(null)} style={{ position: 'absolute', top: 12, right: 14, border: 'none', background: '#f1f5f9', borderRadius: '50%', width: 30, height: 30, cursor: 'pointer', fontWeight: 700, color: '#64748b' }}>x</button>
            <p style={{ margin: '0 0 4px', fontSize: 11, fontWeight: 700, color: G, textTransform: 'uppercase' }}>Register for Event</p>
            <h3 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 900, color: NAVY }}>{registering.title}</h3>
            <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[['name', 'Your Name', 'text'], ['email', 'Email', 'email']].map(([f, l, t]) => (
                <div key={f}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#64748b', marginBottom: 4 }}>{l} *</label>
                  <input required type={t} value={regForm[f]} onChange={e => setRegForm(p => ({ ...p, [f]: e.target.value }))} style={{ width: '100%', boxSizing: 'border-box', border: '1.5px solid #e2e8f0', borderRadius: 9, padding: '9px 12px', fontSize: 14, outline: 'none' }} />
                </div>
              ))}
              {regMsg && <div style={{ padding: '9px 12px', borderRadius: 9, fontSize: 13, fontWeight: 600, background: regMsg.type === 'ok' ? '#f0fdf4' : '#fef2f2', color: regMsg.type === 'ok' ? G : '#dc2626' }}>{regMsg.text}</div>}
              <button type="submit" style={btn(G, '#fff')}>Submit Registration</button>
            </form>
          </div>
        </div>
      )}
    </section>
  )
}

/* ═══════════════════════════════ CAMPAIGNS TAB ══════════════════════════ */
function CampaignsTab() {
  const navigate = useNavigate()
  const [campaigns, setCampaigns] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    get(`${BASE}/ngos`).then(async ngos => {
      if (!Array.isArray(ngos)) return []
      const arrays = await Promise.all(ngos.map(n =>
        get(`${BASE}/ngos/${n.id}/campaigns`).then(c => (Array.isArray(c) ? c : []).map(camp => ({ ...camp, _ngoName: n.name, _ngoId: n.id })))
      ))
      setCampaigns(arrays.flat().filter(c => c.status !== 'COMPLETED'))
    }).finally(() => setLoading(false))
  }, [])

  return (
    <section>
      <SectionHeader title="Active Campaigns" sub="Join NGO-led inclusion and support campaigns." />
      {loading ? <Spinner /> : campaigns.length === 0 ? <Empty msg="No active campaigns right now." /> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 14 }}>
          {campaigns.map(c => (
            <div key={c.id} style={{ ...card, borderLeft: `4px solid ${G}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, marginBottom: 8 }}>
                <h4 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: NAVY }}>{c.title}</h4>
                <span style={chip(c.status === 'ACTIVE' ? G : '#f59e0b')}>{c.status}</span>
              </div>
              <p style={{ margin: '0 0 4px', fontSize: 12, color: B, fontWeight: 600 }}>{c._ngoName}</p>
              {(c.startDate || c.endDate) && <p style={{ margin: '0 0 4px', fontSize: 11, color: '#94a3b8' }}>{c.startDate} {c.endDate ? `→ ${c.endDate}` : ''}</p>}
              <p style={{ margin: '0 0 12px', fontSize: 13, color: '#64748b', lineHeight: 1.6 }}>{c.objective || 'Supporting the community through this campaign.'}</p>
              {c.volunteerTarget && <p style={{ margin: '0 0 10px', fontSize: 12, color: G, fontWeight: 700 }}>Volunteers needed: {c.volunteerTarget}</p>}
              <button style={btn(G)} onClick={() => navigate(`/ngos/${c._ngoId}`)}>View NGO & Join</button>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

/* ═══════════════════════════════ SCHEMES TAB (static info) ══════════════ */
const SCHEMES_INFO = [
  { id: 1, title: 'UDID Card (Unique Disability ID)', body: 'Official disability certificate providing access to govt benefits. Apply at swavlambancard.gov.in', link: 'https://swavlambancard.gov.in' },
  { id: 2, title: 'NHFDC Loan Scheme', body: 'Concessional loans for self-employment of persons with disabilities. Apply via state channelising agencies.', link: 'https://nhfdc.nic.in' },
  { id: 3, title: 'Scholarship for Students with Disabilities', body: 'Post-matric scholarship for students with benchmark disabilities by Ministry of Social Justice.', link: 'https://scholarships.gov.in' },
  { id: 4, title: 'ADIP Scheme (Assistive Devices)', body: 'Free/subsidised assistive devices for persons with disabilities below income threshold. Via ALIMCO.', link: 'https://alimco.in' },
]

function SchemesTab() {
  return (
    <section>
      <SectionHeader title="Govt Schemes & Benefits" sub="Key government schemes for persons with disabilities. Click to learn more." />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 14 }}>
        {SCHEMES_INFO.map(s => (
          <div key={s.id} style={{ ...card, borderLeft: `4px solid ${B}` }}>
            <h4 style={{ margin: '0 0 8px', fontSize: 15, fontWeight: 800, color: NAVY }}>{s.title}</h4>
            <p style={{ margin: '0 0 14px', fontSize: 13, color: '#64748b', lineHeight: 1.6 }}>{s.body}</p>
            <a href={s.link} target="_blank" rel="noreferrer" style={{ ...btn(B, '#fff'), textDecoration: 'none', display: 'inline-block' }}>Open Official Site</a>
          </div>
        ))}
      </div>
    </section>
  )
}

/* ═══════════════════════════════ MARKETPLACE TAB ════════════════════════ */
function MarketplaceTab() {
  const navigate = useNavigate()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [cat, setCat] = useState('ALL')
  const [enquiry, setEnquiry] = useState(null)

  useEffect(() => {
    Promise.all([
      get(`${BASE}/products`),
      get(`${BASE}/ngos`).then(async ngos => {
        if (!Array.isArray(ngos)) return []
        const arr = await Promise.all(ngos.map(n => get(`${BASE}/ngos/${n.id}/products`).then(p => (Array.isArray(p) ? p : []).map(x => ({ ...x, _source: 'NGO', _key: `n-${x.id}` })))))
        return arr.flat()
      })
    ]).then(([sp, np]) => {
      const startup = (Array.isArray(sp) ? sp : []).filter(p => p.available).map(p => ({ ...p, _source: 'Startup', _key: `s-${p.id}` }))
      setProducts([...startup, ...np.filter(p => p.available)])
    }).finally(() => setLoading(false))
  }, [])

  const cats = ['ALL', ...Array.from(new Set(products.map(p => p.category).filter(Boolean)))]
  const filtered = products.filter(p => (cat === 'ALL' || p.category === cat) && (!search || p.name?.toLowerCase().includes(search.toLowerCase())))

  return (
    <section>
      <SectionHeader title="Marketplace" sub="Assistive products listed by NGOs and startups." />
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 14 }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products..." style={{ flex: 1, minWidth: 160, border: '1.5px solid #e2e8f0', borderRadius: 10, padding: '9px 14px', fontSize: 13, outline: 'none' }} />
        {cats.map(c => <button key={c} onClick={() => setCat(c)} style={{ border: 'none', borderRadius: 20, padding: '7px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer', background: cat === c ? G : '#f1f5f9', color: cat === c ? '#fff' : '#64748b' }}>{c}</button>)}
      </div>
      {loading ? <Spinner /> : filtered.length === 0 ? <Empty msg={products.length === 0 ? 'No products listed yet.' : 'No products match your search.'} /> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: 14 }}>
          {filtered.map(p => (
            <div key={p._key || p.id} style={{ ...card, display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, marginBottom: 6 }}>
                <h4 style={{ margin: 0, fontSize: 14, fontWeight: 800, color: NAVY }}>{p.name}</h4>
                <span style={{ fontSize: 14, fontWeight: 900, color: G, whiteSpace: 'nowrap' }}>{p.price != null ? `₹${Number(p.price).toLocaleString('en-IN')}` : 'Free'}</span>
              </div>
              <span style={chip(p._source === 'NGO' ? G : B)}>{p._source}</span>
              {p.category && <span style={{ ...chip('#6366f1'), marginLeft: 6 }}>{p.category}</span>}
              <p style={{ margin: '8px 0 12px', fontSize: 12, color: '#64748b', lineHeight: 1.6, flex: 1 }}>{p.description || 'No description.'}</p>
              {!p.available || p.stockQuantity === 0
                ? <button disabled style={{ ...btn('#94a3b8'), cursor: 'not-allowed' }}>Out of Stock</button>
                : <button style={btn(G)} onClick={() => setEnquiry(p)}>Enquire / Buy</button>}
            </div>
          ))}
        </div>
      )}
      {enquiry && (
        <div onClick={() => setEnquiry(null)} style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(15,23,42,.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, boxSizing: 'border-box' }}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 18, maxWidth: 400, width: '100%', padding: 24, position: 'relative' }}>
            <button onClick={() => setEnquiry(null)} style={{ position: 'absolute', top: 12, right: 14, border: 'none', background: '#f1f5f9', borderRadius: '50%', width: 30, height: 30, cursor: 'pointer', fontWeight: 700, color: '#64748b' }}>x</button>
            <p style={{ margin: '0 0 4px', fontSize: 11, fontWeight: 700, color: G, textTransform: 'uppercase' }}>Product Enquiry</p>
            <h3 style={{ margin: '0 0 8px', fontSize: 16, fontWeight: 900, color: NAVY }}>{enquiry.name}</h3>
            <p style={{ margin: '0 0 4px', fontSize: 13, color: NAVY, fontWeight: 700 }}>Price: <span style={{ color: G }}>{enquiry.price != null ? `₹${Number(enquiry.price).toLocaleString('en-IN')}` : 'Free'}</span></p>
            <p style={{ margin: '0 0 14px', fontSize: 12, color: '#64748b' }}>Stock: {enquiry.stockQuantity} units | Source: {enquiry._source}</p>
            <p style={{ margin: '0 0 16px', fontSize: 13, color: '#64748b' }}>To purchase, contact the listing organisation via the Help section.</p>
            <button style={{ ...btn(G, '#fff'), width: '100%', padding: '12px' }} onClick={() => { setEnquiry(null); navigate('/special/help') }}>Go to Help / Contact</button>
          </div>
        </div>
      )}
    </section>
  )
}

/* ═══════════════════════════════ MAIN COMPONENT ═════════════════════════ */
export default function SpecialFeaturePage({ type }) {
  const components = {
    marketplace: <MarketplaceTab />,
    ngos: <NgosTab />,
    training: <TrainingTab />,
    events: <EventsTab />,
    campaigns: <CampaignsTab />,
    schemes: <SchemesTab />,
  }

  return components[type] || (
    <div style={{ padding: 20, color: '#ef4444', fontSize: 14 }}>Invalid feature route: {type}</div>
  )
}
