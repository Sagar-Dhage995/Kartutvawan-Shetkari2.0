// ═══════════════════════════════════════════════════
//  कर्तृत्ववान शेतकरी — supabase-config.js v2
//  Supabase Auth (Google OAuth) + Role-Based Access
// ═══════════════════════════════════════════════════

window.SUPABASE_URL      = 'https://ofuafirvhpetjebgvble.supabase.co';
window.SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9mdWFmaXJ2aHBldGplYmd2YmxlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE1ODk2NzIsImV4cCI6MjA5NzE2NTY3Mn0.VdC-EupncLaZoJCZkaaTdfP4sh4OHba4gFDDlhYyBtg';

// ── Authorized roles ──
// Only these emails can upload/manage content
window.KS_ROLES = {
  'harilokhande2011988@gmail.com': 'owner',   // Full access
  'sagardhage995@gmail.com':       'client',  // Upload only
};

// Secondary password (after Google OAuth)
// Change this to any strong password
window.KS_UPLOAD_PASSWORD = 'Hari@123';

/* ════════════════════════════════════════════
   REQUIRED SQL — Run once in Supabase SQL Editor
   ════════════════════════════════════════════

-- 1. Newspapers table
CREATE TABLE IF NOT EXISTS public.newspapers (
  id          BIGSERIAL PRIMARY KEY,
  title       TEXT NOT NULL,
  date_text   TEXT NOT NULL,
  description TEXT DEFAULT '',
  pdf_url     TEXT DEFAULT '',
  thumb_url   TEXT DEFAULT '',
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  uploaded_by TEXT DEFAULT ''
);

-- 2. User logins table
CREATE TABLE IF NOT EXISTS public.user_logins (
  id         BIGSERIAL PRIMARY KEY,
  email      TEXT NOT NULL,
  name       TEXT DEFAULT '',
  role       TEXT DEFAULT 'viewer',
  logged_at  TIMESTAMPTZ DEFAULT NOW(),
  device     TEXT DEFAULT '',
  user_agent TEXT DEFAULT ''
);

-- 3. Disable existing RLS (reset)
ALTER TABLE public.newspapers  DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_logins DISABLE ROW LEVEL SECURITY;

-- 4. Re-enable RLS
ALTER TABLE public.newspapers  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_logins ENABLE ROW LEVEL SECURITY;

-- 5. Drop old policies if any
DROP POLICY IF EXISTS "Public read newspapers"  ON public.newspapers;
DROP POLICY IF EXISTS "Anon insert newspapers"  ON public.newspapers;
DROP POLICY IF EXISTS "Anon delete newspapers"  ON public.newspapers;
DROP POLICY IF EXISTS "Anon insert logins"      ON public.user_logins;
DROP POLICY IF EXISTS "Public read logins"      ON public.user_logins;

-- 6. Create new policies
CREATE POLICY "Anyone can read newspapers"
  ON public.newspapers FOR SELECT USING (true);

CREATE POLICY "Anyone can insert newspapers"
  ON public.newspapers FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can delete newspapers"
  ON public.newspapers FOR DELETE USING (true);

CREATE POLICY "Anyone can insert logins"
  ON public.user_logins FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can read logins"
  ON public.user_logins FOR SELECT USING (true);

-- 7. Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.newspapers;

-- 8. Storage policies (run in SQL editor)
INSERT INTO storage.buckets (id, name, public)
VALUES ('newspapers-pdfs', 'newspapers-pdfs', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Public read storage"  ON storage.objects;
DROP POLICY IF EXISTS "Public upload storage" ON storage.objects;
DROP POLICY IF EXISTS "Public delete storage" ON storage.objects;

CREATE POLICY "Public read storage"
  ON storage.objects FOR SELECT USING (bucket_id = 'newspapers-pdfs');

CREATE POLICY "Public upload storage"
  ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'newspapers-pdfs');

CREATE POLICY "Public delete storage"
  ON storage.objects FOR DELETE USING (bucket_id = 'newspapers-pdfs');

════════════════════════════════════════════════

   GOOGLE OAUTH SETUP IN SUPABASE:
   1. Supabase Dashboard → Authentication → Providers → Google → Enable
   2. Add your Google Client ID and Secret
   3. Authorized redirect URI: https://YOUR-PROJECT.supabase.co/auth/v1/callback
   4. Also add your site URL in: Auth → URL Configuration → Site URL
   5. Add redirect URL: https://your-vercel-app.vercel.app/login.html

════════════════════════════════════════════════ */

const _BUCKET = 'newspapers-pdfs';
let _sb = null;

// ── Initialize Supabase client ──
function _getClient() {
  if (!_sb && window.SUPABASE_URL !== 'YOUR_SUPABASE_PROJECT_URL' && window.supabase) {
    _sb = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      }
    });
    console.log('[SB] Client initialized');
  }
  return _sb;
}

function _isReady() {
  return window.SUPABASE_URL !== 'YOUR_SUPABASE_PROJECT_URL' &&
         window.SUPABASE_ANON_KEY !== 'YOUR_SUPABASE_ANON_PUBLIC_KEY' &&
         typeof window.supabase !== 'undefined';
}

// ════════════════════════════════════════════
//  AUTH FUNCTIONS
// ════════════════════════════════════════════

// Get current Supabase Auth session (cryptographically secure)
async function sbGetSession() {
  const sb = _getClient(); if (!sb) return null;
  const { data: { session }, error } = await sb.auth.getSession();
  if (error) { console.error('[SB Auth] getSession error:', error.message); return null; }
  return session;
}

// Get current user from Supabase Auth
async function sbGetUser() {
  const session = await sbGetSession();
  return session ? session.user : null;
}

// Get current user email from Supabase Auth session
async function sbGetUserEmail() {
  const user = await sbGetUser();
  return user ? (user.email || '') : '';
}

// Get role for a given email
function sbGetRole(email) {
  if (!email) return 'viewer';
  return (window.KS_ROLES && window.KS_ROLES[email.toLowerCase().trim()]) || 'viewer';
}

// Sign in with Google OAuth
async function sbSignInGoogle() {
  const sb = _getClient();
  if (!sb) { console.error('[SB Auth] Client not ready'); return { error: 'Supabase not configured' }; }
  const { data, error } = await sb.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin + '/login.html',
      queryParams: { access_type: 'offline', prompt: 'select_account' },
    }
  });
  if (error) console.error('[SB Auth] Google sign-in error:', error.message);
  return { data, error };
}

// Sign out
async function sbSignOut() {
  const sb = _getClient(); if (!sb) return;
  const { error } = await sb.auth.signOut();
  if (error) console.error('[SB Auth] Sign-out error:', error.message);
  else console.log('[SB Auth] Signed out');
}

// Listen for auth state changes
function sbOnAuthChange(callback) {
  const sb = _getClient(); if (!sb) return;
  sb.auth.onAuthStateChange(function(event, session) {
    console.log('[SB Auth] State change:', event, session?.user?.email || 'no user');
    callback(event, session);
  });
}

// ════════════════════════════════════════════
//  DATABASE FUNCTIONS
// ════════════════════════════════════════════

// Fetch all newspapers
async function sbFetch() {
  const sb = _getClient(); if (!sb) return null;
  console.log('[SB] Fetching newspapers...');
  const { data, error } = await sb
    .from('newspapers')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10000);  // fetch all — no artificial cap
  if (error) {
    console.error('[SB] Fetch error:', error.message, error.code, error.details);
    return null;
  }
  console.log('[SB] Fetched', data.length, 'newspapers');
  return data;
}

// Upload PDF to storage
async function sbUploadPDF(file) {
  const sb = _getClient(); if (!sb) throw new Error('Supabase not configured');
  const name = 'pdfs/' + Date.now() + '_' + file.name.replace(/\s+/g, '_');
  console.log('[SB] Uploading PDF:', name, file.size, 'bytes');
  const { data, error } = await sb.storage.from(_BUCKET).upload(name, file, {
    contentType: 'application/pdf', upsert: false
  });
  if (error) {
    console.error('[SB] PDF upload error:', error.message, error.statusCode);
    throw new Error('PDF upload failed: ' + error.message);
  }
  const url = sb.storage.from(_BUCKET).getPublicUrl(name).data.publicUrl;
  console.log('[SB] PDF uploaded:', url);
  return url;
}

// Upload thumbnail to storage
async function sbUploadThumb(file) {
  const sb = _getClient(); if (!sb) throw new Error('Supabase not configured');
  const name = 'thumbs/' + Date.now() + '_' + file.name.replace(/\s+/g, '_');
  console.log('[SB] Uploading thumbnail:', name);
  const { data, error } = await sb.storage.from(_BUCKET).upload(name, file, {
    contentType: file.type, upsert: false
  });
  if (error) {
    console.error('[SB] Thumb upload error:', error.message, error.statusCode);
    throw new Error('Thumbnail upload failed: ' + error.message);
  }
  const url = sb.storage.from(_BUCKET).getPublicUrl(name).data.publicUrl;
  console.log('[SB] Thumbnail uploaded:', url);
  return url;
}

// Insert newspaper record
async function sbInsert(record) {
  const sb = _getClient(); if (!sb) throw new Error('Supabase not configured');
  const payload = {
    title:       record.title,
    date_text:   record.date_text,
    description: record.description || record.title + ' — ' + record.date_text,
    pdf_url:     record.pdf_url     || '',
    thumb_url:   record.thumb_url   || '',
    uploaded_by: record.uploaded_by || '',
  };
  console.log('[SB] Inserting newspaper:', payload.title);
  const { data, error } = await sb.from('newspapers').insert([payload]).select();
  if (error) {
    console.error('[SB] Insert error:', error.message, error.code, error.details, error.hint);
    throw new Error('Database insert failed: ' + error.message);
  }
  console.log('[SB] Newspaper inserted, id:', data[0]?.id);
  return data[0];
}

// Delete newspaper
async function sbDelete(id) {
  const sb = _getClient(); if (!sb) throw new Error('Supabase not configured');
  console.log('[SB] Deleting newspaper id:', id);
  const { error } = await sb.from('newspapers').delete().eq('id', id);
  if (error) {
    console.error('[SB] Delete error:', error.message);
    throw new Error(error.message);
  }
  console.log('[SB] Deleted');
}

// Realtime
let _realtimeSub = null;
function sbSubscribe(onInsert, onDelete) {
  const sb = _getClient(); if (!sb) return;
  if (_realtimeSub) { sb.removeChannel(_realtimeSub); _realtimeSub = null; }
  _realtimeSub = sb.channel('newspapers_rt')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'newspapers' },
      function(p) { console.log('[SB Realtime] INSERT:', p.new.title); onInsert && onInsert(p.new); })
    .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'newspapers' },
      function(p) { console.log('[SB Realtime] DELETE:', p.old.id); onDelete && onDelete(p.old); })
    .subscribe(function(status) { console.log('[SB Realtime] Status:', status); });
}

// Track login
async function sbTrackLogin(email, name, role) {
  const sb = _getClient(); if (!sb) return;
  const { error } = await sb.from('user_logins').insert([{
    email:      email.toLowerCase(),
    name:       name || email.split('@')[0],
    role:       role || 'viewer',
    logged_at:  new Date().toISOString(),
    device:     /Mobi|Android/i.test(navigator.userAgent) ? 'Mobile' : 'Desktop',
    user_agent: navigator.userAgent.slice(0, 250),
  }]);
  if (error) console.warn('[SB] Track login error:', error.message);
}

// Analytics
async function sbAnalytics() {
  const sb = _getClient(); if (!sb) return null;
  const now = new Date();
  const ago = function(d) { return new Date(now - d * 86400000).toISOString(); };
  const [all, today, week, month, year] = await Promise.all([
    sb.from('user_logins').select('id', { count: 'exact', head: true }),
    sb.from('user_logins').select('id', { count: 'exact', head: true }).gte('logged_at', ago(1)),
    sb.from('user_logins').select('id', { count: 'exact', head: true }).gte('logged_at', ago(7)),
    sb.from('user_logins').select('id', { count: 'exact', head: true }).gte('logged_at', ago(30)),
    sb.from('user_logins').select('id', { count: 'exact', head: true }).gte('logged_at', ago(365)),
  ]);
  const { data: allRows }   = await sb.from('user_logins').select('email');
  const { data: recent }    = await sb.from('user_logins').select('email,name,role,logged_at,device').order('logged_at', { ascending: false }).limit(100);
  const { data: deviceRows} = await sb.from('user_logins').select('device');
  const { data: dailyRows } = await sb.from('user_logins').select('logged_at').gte('logged_at', ago(30));
  const unique = allRows ? new Set(allRows.map(function(r) { return r.email; })).size : 0;
  let mobile = 0, desktop = 0;
  (deviceRows || []).forEach(function(r) { r.device === 'Mobile' ? mobile++ : desktop++; });
  const dailyMap = {};
  (dailyRows || []).forEach(function(r) {
    const d = r.logged_at.slice(0, 10);
    dailyMap[d] = (dailyMap[d] || 0) + 1;
  });
  return { total: all.count||0, today: today.count||0, week: week.count||0, month: month.count||0, year: year.count||0, unique, mobile, desktop, recent: recent||[], dailyMap };
}

// Export
window.SB = {
  isReady:     _isReady,
  getClient:   _getClient,
  getSession:  sbGetSession,
  getUser:     sbGetUser,
  getUserEmail: sbGetUserEmail,
  getRole:     sbGetRole,
  signInGoogle: sbSignInGoogle,
  signOut:     sbSignOut,
  onAuthChange: sbOnAuthChange,
  fetch:       sbFetch,
  uploadPDF:   sbUploadPDF,
  uploadThumb: sbUploadThumb,
  insert:      sbInsert,
  delete:      sbDelete,
  subscribe:   sbSubscribe,
  trackLogin:  sbTrackLogin,
  analytics:   sbAnalytics,
};

console.log('[SB] supabase-config.js loaded. isReady:', _isReady());
