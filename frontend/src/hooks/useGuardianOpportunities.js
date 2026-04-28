import { useEffect, useState } from 'react'
import { loadGuardianOpportunities } from '../pages/guardian/guardianData'

const EMPTY_OPPORTUNITIES = {
  jobs: [],
  schools: [],
  ngos: [],
  learning: [],
  events: [],
  therapy: [],
}

export default function useGuardianOpportunities() {
  const [opportunities, setOpportunities] = useState(EMPTY_OPPORTUNITIES)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    const load = async () => {
      setLoading(true)
      setError('')
      try {
        const data = await loadGuardianOpportunities()
        if (active) {
          setOpportunities(data)
        }
      } catch (err) {
        if (active) {
          setOpportunities(EMPTY_OPPORTUNITIES)
          setError(err.message || 'Failed to load opportunities from server.')
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    load()

    return () => {
      active = false
    }
  }, [])

  return { opportunities, loading, error }
}
