import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { BrowserRouter, Link, Route, Routes } from 'react-router-dom'
import Dashboard from './components/Dashboard.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import RepositoryDetail from './components/RepositoryDetail.jsx'
import { GithubApiProvider } from './contexts/GithubApiContext.jsx'
import { toggleTheme } from './store.js'
import './App.css'

function AppLayout() {
  const dispatch = useDispatch()
  const theme = useSelector((state) => state.preferences.theme)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">Skip to main content</a>
      <header className="site-header">
        <Link className="brand" to="/" aria-label="DevFinder home">
          <span className="brand-mark" aria-hidden="true">&lt;/&gt;</span>
          devfinder
        </Link>
        <button
          className="theme-toggle"
          type="button"
          onClick={() => dispatch(toggleTheme())}
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          <span aria-hidden="true">{theme === 'light' ? '☾' : '☀'}</span>
          {theme === 'light' ? 'Dark' : 'Light'} mode
        </button>
      </header>
      <main id="main-content" tabIndex="-1">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/repos/:owner/:repo" element={<RepositoryDetail />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <footer className="site-footer">
        <p>Discover developers and explore what they build.</p>
        <a href="https://docs.github.com/en/rest" target="_blank" rel="noreferrer">
          Powered by the GitHub REST API
        </a>
      </footer>
    </div>
  )
}

function NotFound() {
  return (
    <section className="not-found" aria-labelledby="not-found-title">
      <p className="eyebrow">404 · page not found</p>
      <h1 id="not-found-title">Looks like this page is off the grid.</h1>
      <Link className="button button-primary" to="/">Back to search</Link>
    </section>
  )
}

function App() {
  return (
    <GithubApiProvider>
      <BrowserRouter>
        <ErrorBoundary>
          <AppLayout />
        </ErrorBoundary>
      </BrowserRouter>
    </GithubApiProvider>
  )
}

export default App
