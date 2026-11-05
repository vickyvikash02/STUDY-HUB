// ======================== SUPABASE CONFIG ========================
const SUPABASE_URL = 'https://ywholggeqayjcyasyyvk.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_pEqG9WFJMIS_gfA9LbLsAg_P-ocpt79';
const ADMIN_EMAIL = 'vickyvikash021196@gmail.com';

var sb = null;
if (window.supabase && window.supabase.createClient) {
  sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

const APP_STATE_TABLE = 'app_state';
const APP_STATE_ID = 1;
const EBOOK_BUCKET = 'ebooks';
