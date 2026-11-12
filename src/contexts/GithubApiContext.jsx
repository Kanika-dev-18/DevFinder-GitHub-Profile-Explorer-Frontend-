import { useMemo } from 'react'
import { GithubApiContext } from './githubApi.js'

const CACHE_DURATION = 5 * 60 * 1000
const responseCache = new Map()

async function readResponse(response) {
  const data = await response.json()

  if (!response.ok) {
    const message = data.message || `GitHub request failed (${response.status}).`
    const isRateLimitError = response.status === 429
      || response.headers.get('X-RateLimit-Remaining') === '0'
      || message.toLowerCase().includes('rate limit')

    if (isRateLimitError) {
      const resetTimestamp = Number(response.headers.get('X-RateLimit-Reset'))
      const resetDate = Number.isFinite(resetTimestamp) && resetTimestamp > 0
        ? new Date(resetTimestamp * 1000)
        : null
      const resetMessage = resetDate && !Number.isNaN(resetDate.getTime())
        ? ` Try again after ${resetDate.toLocaleTimeString()}.`
        : ' Please try again later.'

      throw new Error(`GitHub API rate limit reached.${resetMessage}`)
    }

    throw new Error(message)
  }

  return data
}

async function fetchCached(url, signal) {
  if (signal?.aborted) {
    throw new DOMException('The request was aborted.', 'AbortError')
  }

  const cached = responseCache.get(url)
  if (cached && cached.expiresAt > Date.now()) {
    return cached.data
  }
  responseCache.delete(url)

  const data = await fetch(url, { signal }).then(readResponse)
  responseCache.set(url, { data, expiresAt: Date.now() + CACHE_DURATION })
  return data
}

export function GithubApiProvider({ children }) {
  const api = useMemo(() => ({
    async findDeveloper(username, { signal } = {}) {
      const encodedUsername = encodeURIComponent(username)
      const [profile, repositories] = await Promise.all([
        fetchCached(`https://api.github.com/users/${encodedUsername}`, signal),
        fetchCached(`https://api.github.com/users/${encodedUsername}/repos?per_page=100&sort=updated`, signal),
      ])

      return { profile, repositories }
    },
    async getRepository(owner, repository, { signal } = {}) {
      const path = `${encodeURIComponent(owner)}/${encodeURIComponent(repository)}`
      return fetchCached(`https://api.github.com/repos/${path}`, signal)
    },
  }), [])

  return (
    <GithubApiContext.Provider value={api}>
      {children}
    </GithubApiContext.Provider>
  )
}
