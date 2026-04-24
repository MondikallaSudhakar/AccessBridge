import api from './api'
import { USER_TYPE_GUIDES } from '../data/userTypes'

export async function fetchUserTypeGuides() {
  try {
    const data = await api.get('/meta/user-types')
    if (Array.isArray(data) && data.length > 0) {
      return data
    }
  } catch {
    // Fall back to the local copy when the metadata endpoint is unavailable.
  }

  return USER_TYPE_GUIDES
}