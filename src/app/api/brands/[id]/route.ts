import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  
  const { data: brand, error } = await supabase.from('brands').select('*').eq('id', id).eq('user_id', user.id).single()
  if (error || !brand) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })
  
  return NextResponse.json({ success: true, brand })
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  
  const { error } = await supabase.from('brands').delete().eq('id', id).eq('user_id', user.id)
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  
  return NextResponse.json({ success: true })
}
