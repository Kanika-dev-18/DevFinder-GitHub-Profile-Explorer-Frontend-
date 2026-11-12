import { Component } from 'react'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    console.error('DevFinder encountered an unexpected error.', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="error-fallback" role="alert">
          <p className="eyebrow">Something went wrong</p>
          <h1>We could not load this page.</h1>
          <p>Please refresh to try again.</p>
          <button className="button button-primary" onClick={() => window.location.reload()}>
            Refresh page
          </button>
        </main>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
