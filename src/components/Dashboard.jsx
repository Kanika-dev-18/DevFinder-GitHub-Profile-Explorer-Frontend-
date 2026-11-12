import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { toggleFavorite } from '../store.js'
import { useGithubApi } from '../contexts/useGithubApi.js'

function Dashboard() {
  const { findDeveloper } = useGithubApi()
  const dispatch = useDispatch()
  const favorites = useSelector((state) => state.preferences.favorites)
  const [username, setUsername] = useState('')
  const [developer, setDeveloper] = useState(null)
  const [repositories, setRepositories] = useState([])
  const [query, setQuery] = useState('')
  const [language, setLanguage] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const requestController = useRef(null)

  useEffect(() => () => requestController.current?.abort(), [])

  const languages = useMemo(() => {
    return [...new Set(repositories.map((repository) => repository.language).filter(Boolean))]
      .sort((first, second) => first.localeCompare(second))
  }, [repositories])

  const filteredRepositories = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    return repositories.filter((repository) => {
      const matchesLanguage = !language || repository.language === language
      const matchesQuery = !normalizedQuery
        || repository.name.toLowerCase().includes(normalizedQuery)
        || (repository.description || '').toLowerCase().includes(normalizedQuery)

      return matchesLanguage && matchesQuery
    })
  }, [language, query, repositories])

  const searchDeveloper = useCallback(async (requestedUsername) => {
    requestController.current?.abort()

    if (!requestedUsername) {
      setError('Enter a GitHub username to search.')
      setLoading(false)
      return
    }

    const controller = new AbortController()
    requestController.current = controller
    setLoading(true)
    setError('')
    setDeveloper(null)
    setRepositories([])
    setLanguage('')
    setQuery('')

    try {
      const result = await findDeveloper(requestedUsername, { signal: controller.signal })
      if (!controller.signal.aborted) {
        setDeveloper(result.profile)
        setRepositories(result.repositories)
      }
    } catch (requestError) {
      if (!controller.signal.aborted) {
        setError(requestError.message || 'Unable to load this GitHub profile. Please try again.')
      }
    } finally {
      if (requestController.current === controller) {
        requestController.current = null
        setLoading(false)
      }
    }
  }, [findDeveloper])

  const handleSearch = useCallback((event) => {
    event.preventDefault()
    searchDeveloper(username.trim())
  }, [searchDeveloper, username])

  const isFavorite = developer
    ? favorites.some((favorite) => favorite.login === developer.login)
    : false

  return (
    <>
      <section className="hero-copy" aria-labelledby="page-title">
        <p className="eyebrow">For the curious and the creative</p>
        <h1 id="page-title">Find your next<br />favorite developer.</h1>
        <p>Explore GitHub profiles and the projects behind the people building the web.</p>
      </section>

      <form className="search-form" onSubmit={handleSearch} role="search" aria-label="Search GitHub developers">
        <span className="search-icon" aria-hidden="true">⌕</span>
        <label className="visually-hidden" htmlFor="developer-search">GitHub username</label>
        <input
          id="developer-search"
          name="username"
          type="search"
          autoComplete="off"
          placeholder="Try a GitHub username, e.g. gaearon"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          aria-describedby={error ? 'search-error' : 'search-help'}
          aria-invalid={Boolean(error)}
        />
        <span className="visually-hidden" id="search-help">Search for one GitHub username.</span>
        <button className="button button-primary" type="submit" disabled={loading}>
          {loading ? 'Searching…' : 'Search'}
        </button>
      </form>

      {error && <p className="search-error" id="search-error" role="alert">{error}</p>}

      {loading && (
        <div className="loading-state" role="status" aria-live="polite">
          <span className="spinner" aria-hidden="true" />
          <span>Looking up the profile and repositories…</span>
        </div>
      )}

      {developer && (
        <section className="results-section" aria-labelledby="developer-name">
          <article className="developer-card">
            <img
              className="avatar"
              src={developer.avatar_url}
              alt={`${developer.login}'s GitHub avatar`}
              width="108"
              height="108"
            />
            <div className="developer-content">
              <div className="developer-heading">
                <div>
                  <h2 id="developer-name">{developer.name || developer.login}</h2>
                  <a className="github-handle" href={developer.html_url} target="_blank" rel="noreferrer">
                    @{developer.login}
                  </a>
                </div>
                <button
                  className="icon-button"
                  type="button"
                  onClick={() => dispatch(toggleFavorite(developer))}
                  aria-label={isFavorite ? `Remove ${developer.login} from saved developers` : `Save ${developer.login} as a favorite`}
                  aria-pressed={isFavorite}
                >
                  <span aria-hidden="true">{isFavorite ? '★' : '☆'}</span>
                </button>
              </div>
              <p className="developer-bio">{developer.bio || 'This developer has not added a bio yet.'}</p>
              <dl className="developer-stats" aria-label={`${developer.login} GitHub statistics`}>
                <div><dt>Repositories</dt><dd>{developer.public_repos}</dd></div>
                <div><dt>Followers</dt><dd>{developer.followers}</dd></div>
                <div><dt>Following</dt><dd>{developer.following}</dd></div>
                {developer.location && <div><dt>Location</dt><dd>{developer.location}</dd></div>}
              </dl>
            </div>
          </article>

          <div className="repository-toolbar">
            <div>
              <h2 id="repositories-heading">Repositories</h2>
              <p className="muted">{filteredRepositories.length} of {repositories.length} shown</p>
            </div>
            <div className="filter-controls">
              <label className="filter-field" htmlFor="repository-filter">
                Filter repositories
                <input
                  id="repository-filter"
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Name or description"
                />
              </label>
              <label className="filter-field" htmlFor="language-filter">
                Programming language
                <select
                  id="language-filter"
                  value={language}
                  onChange={(event) => setLanguage(event.target.value)}
                >
                  <option value="">All languages</option>
                  {languages.map((option) => <option key={option} value={option}>{option}</option>)}
                </select>
              </label>
            </div>
          </div>

          {filteredRepositories.length > 0 ? (
            <ul className="repo-grid" aria-labelledby="repositories-heading">
              {filteredRepositories.map((repository) => (
                <li className="repo-card" key={repository.id}>
                  <h3>
                    <Link className="repo-title" to={`/repos/${encodeURIComponent(developer.login)}/${encodeURIComponent(repository.name)}`}>
                      {repository.name}
                    </Link>
                  </h3>
                  <p>{repository.description || 'No description provided.'}</p>
                  <div className="repo-meta" aria-label={`Details for ${repository.name}`}>
                    {repository.language && (
                      <span><span className="language-dot" aria-hidden="true" />{repository.language}</span>
                    )}
                    <span aria-label={`${repository.stargazers_count} stars`}>★ {repository.stargazers_count}</span>
                    <span aria-label={`${repository.forks_count} forks`}>⑂ {repository.forks_count}</span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="empty-state" role="status">
              {repositories.length
                ? 'No repositories match these filters.'
                : 'This developer has no public repositories.'}
            </p>
          )}
        </section>
      )}

      {favorites.length > 0 && (
        <section className="favorites-section" aria-labelledby="favorites-title">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Your shortlist</p>
              <h2 id="favorites-title">Saved developers</h2>
            </div>
          </div>
          <div className="favorites-list">
            {favorites.map((favorite) => (
              <a
                className="favorite-chip"
                href={`/?username=${encodeURIComponent(favorite.login)}`}
                key={favorite.login}
                onClick={(event) => {
                  event.preventDefault()
                  setUsername(favorite.login)
                  searchDeveloper(favorite.login)
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
                aria-label={`Search for saved developer ${favorite.login}`}
              >
                <img src={favorite.avatar_url} alt="" width="28" height="28" />
                <span>{favorite.name || favorite.login}</span>
              </a>
            ))}
          </div>
        </section>
      )}
    </>
  )
}

export default Dashboard
