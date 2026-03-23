import type { Theme } from '~/types'
import type { Database } from '~/types/database.types'

export const useThemes = () => {
  const supabase = useSupabaseClient<Database>()

  async function getThemes(): Promise<Theme[]> {
    const { data } = await supabase
      .from('themes')
      .select('*')
      .eq('visible', true)
      .order('order', { ascending: true })
    return (data as Theme[]) ?? []
  }

  async function getAllThemes(): Promise<Theme[]> {
    const { data, error } = await supabase
      .from('themes')
      .select('*')
      .order('order', { ascending: true })
    if (error) throw error
    return (data as Theme[]) ?? []
  }

  async function getTheme(id: number): Promise<Theme | null> {
    const { data } = await supabase
      .from('themes')
      .select('*')
      .eq('id', id)
      .single()
    return data as Theme | null
  }

  async function getRanking(): Promise<Theme[]> {
    const { data } = await supabase
      .from('themes')
      .select('*')
      .eq('visible', true)
      .order('likes', { ascending: false })
    return (data as Theme[]) ?? []
  }

  async function createTheme(theme: Partial<Theme>): Promise<Theme | null> {
    const { data, error } = await supabase
      .from('themes')
      .insert(theme)
      .select()
      .single()
    if (error) throw error
    return data as Theme
  }

  async function updateTheme(id: number, updates: Partial<Theme>): Promise<void> {
    const { error } = await supabase.from('themes').update(updates).eq('id', id)
    if (error) throw error
  }

  async function deleteTheme(id: number): Promise<void> {
    const { error } = await supabase.from('themes').delete().eq('id', id)
    if (error) throw error
  }

  async function reorderThemes(orderedIds: number[]): Promise<void> {
    const updates = orderedIds.map((id, index) => ({ id, order: index + 1 }))
    const { error } = await supabase.from('themes').upsert(updates)
    if (error) throw error
  }

  return { getThemes, getAllThemes, getTheme, getRanking, createTheme, updateTheme, deleteTheme, reorderThemes }
}
