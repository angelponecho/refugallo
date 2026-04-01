import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const admin = serverSupabaseServiceRole(event) as any

  const { data, error } = await admin
    .from('themes')
    .select('*')
    .eq('visible', true)
    .order('likes', { ascending: false })

  if (error) throw createError({ statusCode: 400, message: error.message })

  return data
})
