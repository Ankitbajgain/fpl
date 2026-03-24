import { configureStore } from '@reduxjs/toolkit'
import squadReducer from '../features/squad/squadSlice'

export const store = configureStore({
  reducer: {
    squad: squadReducer,
  },
})
