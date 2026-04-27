import { useNavigate } from 'react-router-dom'

const NAVY = '#0f172a'
const G = '#16a34a'

export default function SpecialSavedPage() {
  const navigate = useNavigate()

  return (
    <section style={{ background: '#fff', borderRadius: 20, border: '1px solid #e2e8f0', padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,.05)', fontFamily: "'Inter',sans-serif" }}>
      <h2 style={{ margin: '0 0 6px', fontSize: 20, fontWeight: 900, color: NAVY }}>Saved Opportunities</h2>
      <p style={{ margin: '0 0 24px', fontSize: 13, color: '#64748b' }}>
        Items you bookmark across Jobs, NGOs, Events, and Marketplace will appear here.
      </p>

      <div style={{ border: '2px dashed #e2e8f0', borderRadius: 14, padding: '40px 24px', textAlign: 'center', color: '#94a3b8' }}>
        <p style={{ fontSize: 28, margin: '0 0 8px' }}>🔖</p>
        <p style={{ fontSize: 15, fontWeight: 700, color: NAVY, margin: '0 0 6px' }}>No saved items yet</p>
        <p style={{ fontSize: 13, margin: '0 0 20px' }}>
          Browse jobs, NGOs, events, and products — save anything you want to revisit later.
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => navigate('/special/jobs')} style={{ background: G, color: '#fff', border: 'none', borderRadius: 9, padding: '9px 18px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>Browse Jobs</button>
          <button onClick={() => navigate('/special/ngos')} style={{ background: '#1A8FD1', color: '#fff', border: 'none', borderRadius: 9, padding: '9px 18px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>Browse NGOs</button>
          <button onClick={() => navigate('/special/marketplace')} style={{ background: '#6366f1', color: '#fff', border: 'none', borderRadius: 9, padding: '9px 18px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>Marketplace</button>
        </div>
      </div>
    </section>
  )
}
