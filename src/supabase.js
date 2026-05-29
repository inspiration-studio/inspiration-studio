import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://iwxhnskwynspujglvlzm.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml3eGhuc2t3eW5zcHVqZ2x2bHptIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk5NzA4MTcsImV4cCI6MjA5NTU0NjgxN30.1uBDiB6xCdXCOmGdzt8cxX-HWj91yUHWcEXUGVXOl-Y'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
