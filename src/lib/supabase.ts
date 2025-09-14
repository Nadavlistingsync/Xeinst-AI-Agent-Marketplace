import { createClient } from '@supabase/supabase-js'
import { createBrowserClient, createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Browser client (for client-side operations)
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Admin client (for server-side operations with elevated privileges)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Server client for SSR
export function createSupabaseServerClient() {
  const cookieStore = cookies()

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        } catch {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
    },
  })
}

// Browser client for client components
export function createSupabaseBrowserClient() {
  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}

// Helper function to get user session
export async function getUserSession() {
  try {
    const supabase = createSupabaseServerClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error) {
      console.error('Error getting user session:', error)
      return null
    }
    
    return user
  } catch (error) {
    console.error('Error in getUserSession:', error)
    return null
  }
}

// Helper function to get user profile
export async function getUserProfile(userId: string) {
  try {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    
    if (error) {
      console.error('Error getting user profile:', error)
      return null
    }
    
    return data
  } catch (error) {
    console.error('Error in getUserProfile:', error)
    return null
  }
}

// Helper function to update user profile
export async function updateUserProfile(userId: string, updates: any) {
  try {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()
    
    if (error) {
      console.error('Error updating user profile:', error)
      return { success: false, error }
    }
    
    return { success: true, data }
  } catch (error) {
    console.error('Error in updateUserProfile:', error)
    return { success: false, error }
  }
}

// Helper function to get agents from Supabase
export async function getSupabaseAgents() {
  try {
    const { data, error } = await supabaseAdmin
      .from('agents')
      .select('*')
      .eq('is_public', true)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error getting agents:', error)
      return []
    }
    
    return data || []
  } catch (error) {
    console.error('Error in getSupabaseAgents:', error)
    return []
  }
}

// Helper function to create agent in Supabase
export async function createSupabaseAgent(agentData: any) {
  try {
    const { data, error } = await supabaseAdmin
      .from('agents')
      .insert(agentData)
      .select()
      .single()
    
    if (error) {
      console.error('Error creating agent:', error)
      return { success: false, error }
    }
    
    return { success: true, data }
  } catch (error) {
    console.error('Error in createSupabaseAgent:', error)
    return { success: false, error }
  }
}

export default supabase
