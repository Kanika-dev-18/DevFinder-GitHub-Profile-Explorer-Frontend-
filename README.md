# DevFinder

DevFinder is a React app for looking up GitHub developers, browsing and filtering their public repositories, and saving favorite profiles.

## Run locally

```sh
npm install
npm run dev
```

The app uses the unauthenticated GitHub REST API, so GitHub's unauthenticated rate limit applies. Successful API responses are cached in memory for five minutes to reduce repeat requests. When GitHub reports a rate-limit error, the app displays the reset time from the response when available. The cache is cleared when the page is closed or refreshed.

## Features

- Search a GitHub username and load the public profile and repositories.
- Filter repositories by name/description and programming language.
- Open a repository detail page at `/repos/:owner/:repo`.
- Save favorite developers in local storage and toggle light/dark mode.
- Use keyboard-accessible form controls, labeled filters, loading/error announcements, and a skip link.

## Project structure

- `src/store.js` - Redux Toolkit preferences slice and store.
- `src/contexts/GithubApiContext.jsx` - shared GitHub REST API requests.
- `src/components/Dashboard.jsx` - profile search, repository filtering, and favorites.
- `src/components/RepositoryDetail.jsx` - routed repository detail view.
- `src/components/ErrorBoundary.jsx` - class-based fallback for unexpected rendering errors.
- `src/App.jsx` - router and shared app layout.

## Scripts

- `npm run dev` - start Vite.
- `npm run build` - create a production build.
- `npm run lint` - run ESLint.
- `npm run preview` - preview the production build.

# Deployement vercel 
https://dev-finder-git-hub-profile-explorer.vercel.app/
