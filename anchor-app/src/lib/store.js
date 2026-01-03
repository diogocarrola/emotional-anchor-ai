import { create } from 'zustand'
import { supabase } from './supabase'

export const useAuthStore = create((set) => ({
  user: null,
  loading: true,
  signUp: async (email, password) => {
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (!error) {
      set({ user: data.user })
    }
    return { data, error }
  },
  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (!error) {
      set({ user: data.user })
    }
    return { data, error }
  },
  signOut: async () => {
    await supabase.auth.signOut()
    set({ user: null })
  },
  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ loading }),
}))

export const useChatStore = create((set, get) => ({
  conversations: [],
  loading: false,
  error: null,

  fetchConversations: async (userId) => {
    set({ loading: true })
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true })

      if (error) throw error
      set({ conversations: data || [], loading: false })
    } catch (err) {
      set({ error: err.message, loading: false })
    }
  },

  addConversation: async (userId, content, sender, mood = 'neutral') => {
    try {
      const { data, error } = await supabase
        .from('conversations')
        .insert([
          {
            user_id: userId,
            content,
            sender,
            detected_mood: mood,
          },
        ])
        .select()

      if (error) throw error
      set((state) => ({
        conversations: [...state.conversations, data[0]],
      }))
      return data[0]
    } catch (err) {
      set({ error: err.message })
      throw err
    }
  },

  clearError: () => set({ error: null }),
}))
