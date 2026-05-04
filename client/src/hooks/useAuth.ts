import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase, User } from '@/services/supabase'
import { userApi } from '@/services/api'

export function useAuth() {
  const queryClient = useQueryClient()

  const { data: session, isLoading } = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession()
      return session
    },
  })

  const { data: user } = useQuery({
    queryKey: ['user', session?.user.id],
    queryFn: async () => {
      if (!session?.user.id) return null
      const { data } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single()
      return data
    },
    enabled: !!session?.user.id,
  })

  const signIn = useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['session'] })
    },
  })

  const signUp = useMutation({
    mutationFn: async ({
      email,
      password,
      fullName,
      role
    }: {
      email: string
      password: string
      fullName: string
      role: 'student' | 'consultant' | 'admin'
    }) => {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      })
      if (authError) throw authError

      if (authData.user) {
        const { error: profileError } = await supabase
          .from('users')
          .insert({
            id: authData.user.id,
            email,
            full_name: fullName,
            role,
          })
        if (profileError) throw profileError
      }

      return authData
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['session'] })
    },
  })

  const signOut = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.clear()
    },
  })

  const updateProfile = useMutation({
    mutationFn: async (updates: Partial<User>) => {
      if (!user?.id) throw new Error('No user logged in')
      return userApi.updateProfile(updates)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', session?.user.id] })
    },
  })

  return {
    session,
    user,
    isLoading,
    signIn,
    signUp,
    signOut,
    updateProfile,
  }
}
