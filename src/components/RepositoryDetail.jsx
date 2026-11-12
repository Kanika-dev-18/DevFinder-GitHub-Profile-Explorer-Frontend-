import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useGithubApi } from '../contexts/useGithubApi.js'

function RepositoryDetail() {
  const { owner, repo } = useParams()
  const { getRepository } = useGithubApi()
  const [repository, setRepository] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const requestController = useRef(null)

  const loadRepository = useCallback(async () => {
    requestController.current?.abort()
    const controller = new AbortController()
    requestController.current = controller

    setLoading(true)
    setError('')
    setRepository(null)

    try {
      const result = await getRepository(owner, repo, { signal: controller.signal })
      if (!controller.signal.aborted) {
        setRepository(result)
      }
    } catch (requestError) {
      if (!controller.signal.aborted) {
        setError(requestError.message || 'Unable to load this repository.')
      }
    } finally {
      if (requestController.current === controller) {
        requestController.current = null
        setLoading(false)
      }
    }
  }, [getRepository, owner, repo])

  useEffect(() => {
    let active = true
    queueMicrotask(() => {
      if (active) {
        loadRepository()
      }
    })

    return () => {
      active = false
      requestController.current?.abort()
    }
  }, [loadRepository])

  return (
    <section className="repository-detail" aria-labelledby="repository-detail-title">
      <Link className="back-link" to="/">← Back to developer search</Link>
      {loading && (
        <div className="loading-state" role="status" aria-live="polite">
          <span className="spinner" aria-hidden="true" />
          <span>Loading repository details…</span>
        </div>
      )}
      {error && (
        <div className="empty-state" role="alert">
          <p>{error}</p>
          <button className="button button-secondary" type="button" onClick={loadRepository}>
            Try again
          </button>
        </div>
      )}
      {repository && !loading && (
        <article className="detail-panel">
          <p className="eyebrow">Repository by {repository.owner.login}</p>
          <h1 id="repository-detail-title">{repository.name}</h1>
          <p className="detail-description">{repository.description || 'No description provided.'}</p>
          <div className="detail-stats" aria-label="Repository statistics">
            <div className="detail-stat"><strong>{repository.stargazers_count}</strong><span>Stars</span></div>
            <div className="detail-stat"><strong>{repository.forks_count}</strong><span>Forks</span></div>
            <div className="detail-stat"><strong>{repository.open_issues_count}</strong><span>Open issues</span></div>
          </div>
          <dl className="developer-stats">
            {repository.language && <div><dt>Language</dt><dd>{repository.language}</dd></div>}
            <div><dt>Visibility</dt><dd>{repository.visibility}</dd></div>
            <div><dt>Last updated</dt><dd>{new Date(repository.updated_at).toLocaleDateString()}</dd></div>
          </dl>
          <div className="detail-actions">
            <a className="button button-primary" href={repository.html_url} target="_blank" rel="noreferrer">
              View on GitHub <span className="visually-hidden">(opens in a new tab)</span>
            </a>
            <Link className="button button-secondary" to="/">Search another developer</Link>
          </div>
        </article>
      )}
    </section>
  )
}

export default RepositoryDetail
