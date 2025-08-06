/**
 * User store using Zustand for user management state.
 */

import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

import type { User, UserResponse } from '@/types/user'

interface UserState {
  // Estado
  currentUser: UserResponse | null
  users: UserResponse[]
  isLoading: boolean
  isUpdating: boolean
  error: string | null

  // Ações
  setCurrentUser: (user: UserResponse | null) => void
  setUsers: (users: UserResponse[]) => void
  setLoading: (loading: boolean) => void
  setUpdating: (updating: boolean) => void
  setError: (error: string | null) => void
  updateCurrentUser: (updates: Partial<User>) => void
  updateUserInList: (userId: string, updates: Partial<User>) => void
  clearData: () => void
}

const initialState = {
  currentUser: null,
  users: [],
  isLoading: false,
  isUpdating: false,
  error: null,
}

export const useUserStore = create<UserState>()(
  devtools(
    (set, get) => ({
      ...initialState,

      setCurrentUser: currentUser => set({ currentUser }),
      setUsers: users => set({ users }),
      setLoading: isLoading => set({ isLoading }),
      setUpdating: isUpdating => set({ isUpdating }),
      setError: error => set({ error }),

      updateCurrentUser: updates => {
        const { currentUser } = get()
        if (currentUser) {
          set({ currentUser: { ...currentUser, ...updates } })
        }
      },

      updateUserInList: (userId, updates) => {
        const { users } = get()
        const updatedUsers = users.map(user =>
          user.id === userId ? { ...user, ...updates } : user
        )
        set({ users: updatedUsers })
      },

      clearData: () => set(initialState),
    }),
    { name: 'user-store' }
  )
)

// Alias for backward compatibility
export const useUsersStore = useUserStore
