import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

async function getClient() {
  const supabase = await createClient()
  if (!supabase) return null
  const { data: { user } } = await supabase.auth.getUser()
  return { supabase, user }
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const result = await getClient()
  if (!result?.user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  const { supabase, user } = result

  const { data: brand, error } = await supabase.from('brands').select('*').eq('id', id).eq('user_id', user.id).single()
  if (error || !brand) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })

  return NextResponse.json({ success: true, brand })
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const result = await getClient()
  if (!result?.user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  const { supabase, user } = result

  const { error } = await supabase.from('brands').delete().eq('id', id).eq('user_id', user.id)
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}
