import { configureStore, createSlice } from '@reduxjs/toolkit'

function loadFavorites() {
  try {
    const savedFavorites = window.localStorage.getItem('devfinder-favorites')
    return savedFavorites ? JSON.parse(savedFavorites) : []
  } catch (error) {
    console.error('Unable to load saved developers from local storage.', error)
    return []
  }
}

const preferencesSlice = createSlice({
  name: 'preferences',
  initialState: {
    theme: 'light',
    favorites: loadFavorites(),
  },
  reducers: {
    toggleTheme(state) {
      state.theme = state.theme === 'light' ? 'dark' : 'light'
    },
    toggleFavorite(state, action) {
      const profile = action.payload
      const existingIndex = state.favorites.findIndex(
        (favorite) => favorite.login === profile.login,
      )

      if (existingIndex >= 0) {
        state.favorites.splice(existingIndex, 1)
      } else {
        state.favorites.push(profile)
      }
    },
  },
})

export const { toggleFavorite, toggleTheme } = preferencesSlice.actions

export const store = configureStore({
  reducer: {
    preferences: preferencesSlice.reducer,
  },
})

store.subscribe(() => {
  try {
    window.localStorage.setItem(
      'devfinder-favorites',
      JSON.stringify(store.getState().preferences.favorites),
    )
  } catch (error) {
    console.error('Unable to save developers to local storage.', error)
  }
})
