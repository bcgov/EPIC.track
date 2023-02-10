import { configureStore } from '@reduxjs/toolkit'
import userSlice from './services/userService/userSlice'

export default configureStore({
  reducer: {
    user: userSlice,
  },
})