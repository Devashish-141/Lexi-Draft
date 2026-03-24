import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase with the SERVICE_ROLE key (bypasses RLS for cleanup)
// We only want the service role key to be used in secure server environments like this API route.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(request: Request) {
  // Verify the request is coming from Vercel's Cron scheduler
  // Vercel naturally passes the CRON_SECRET header to prevent unauthorized firing
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  // Delete expired sessions to maintain the Zero-Storage Identity Protocol
  const { error } = await supabase
    .from('temp_session_data')
    .delete()
    .lt('expires_at', new Date().toISOString());

  if (error) {
    console.error("Failed to clean up transient sessions:", error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }

  return NextResponse.json({ message: 'Stateless Protocol cleanup complete' }, { status: 200 });
}
