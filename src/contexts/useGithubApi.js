import { useContext } from 'react'
import { GithubApiContext } from './githubApi.js'

export function useGithubApi() {
  const context = useContext(GithubApiContext)

  if (!context) {
    throw new Error('useGithubApi must be used inside GithubApiProvider.')
  }

  return context
}
