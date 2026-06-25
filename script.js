// ═══════════════════════════════════════════════════
//  कर्तृत्ववान शेतकरी  —  script.js  (Clean Final)
// ═══════════════════════════════════════════════════

const NEWS_LIMIT = 6;   // Latest 6 shown in main grid; rest in जुने अंक section

// ── Authorized upload emails ──
var UPLOAD_EMAILS = [
  'harilokhande2011988@gmail.com',
  'sagardhage995@gmail.com',
];
var OWNER_EMAIL = 'harilokhande2011988@gmail.com';

// ── Auth helpers ──
function getUser()  { return sessionStorage.getItem('ks_user_email') || ''; }
function getUName() { return sessionStorage.getItem('ks_user_name')  || ''; }
function getRole()  { return sessionStorage.getItem('ks_role')       || 'viewer'; }

function clearUser() {
  sessionStorage.removeItem('ks_user_email');
  sessionStorage.removeItem('ks_user_name');
  sessionStorage.removeItem('ks_role');
}

function isOwner()  { return getRole() === 'owner'; }
function canUpload(){
  var email = getUser().toLowerCase().trim();
  var role  = getRole();
  // Double check: session role AND email in list
  return (role === 'owner' || role === 'client') &&
         UPLOAD_EMAILS.some(function(e){ return e.toLowerCase() === email; });
}

// _initAuth is now sync — no Supabase Auth dependency
function _initAuth() {}

// ── Update header auth button ──
function updateAuthUI() {
  console.log('[Auth] updateAuthUI start');
  try { _initAuth(); } catch(e) { console.warn('[Auth] _initAuth error:', e.message); }
  var role = getRole();
  console.log('[Auth] role source: sessionStorage | role:', role);
  var btn  = document.getElementById('auth-btn');
  var lsec = document.getElementById('logout-section');
  var user = getUser();
  console.log('[Auth] user:', user || 'none');
  if (!btn) { console.warn('[Auth] auth-btn not found'); return; }

  if (user) {
    var nm = (getUName() || user.split('@')[0]).slice(0, 13);
    btn.className = 'auth-btn logged-in';
    btn.innerHTML =
      '<span class="auth-dot"></span>' +
      '<span class="auth-label">' + nm + '</span>' +
      '<span style="font-size:.65rem;opacity:.6;border-left:1px solid rgba(255,255,255,.3);padding-left:6px;margin-left:3px">↩</span>';
    btn.title   = user + ' — Logout';
    btn.onclick = doLogout;
    if (lsec) lsec.classList.add('show');
    if (canUpload()) {
      var up = document.getElementById('owner-add-section');
      if (up) up.style.display = 'block';
      document.body.classList.add('owner-mode');
      var ub = document.getElementById('upload-user-badge');
      var ue = document.getElementById('upload-user-email');
      if (ub) ub.style.display = 'flex';
      var _role = getRole();
      if (ue) ue.textContent = user + ' (' + _role + ')';
      console.log('[Auth] Upload section shown for:', user, _role);
    } else {
      var up2 = document.getElementById('owner-add-section');
      if (up2) up2.style.display = 'none';
      document.body.classList.remove('owner-mode');
      console.log('[Auth] Viewer access only:', user);
    }
  } else {
    btn.className = 'auth-btn';
    btn.innerHTML = '<span class="auth-icon">👤</span><span class="auth-label">Login करा</span>';
    btn.title   = 'Login करा';
    btn.onclick = function() { window.location.href = 'login.html'; };
    if (lsec) lsec.classList.remove('show');
    var upEl = document.getElementById('owner-add-section');
    if (upEl) upEl.style.display = 'none';
    var ub3 = document.getElementById('upload-user-badge');
    if (ub3) ub3.style.display = 'none';
    document.body.classList.remove('owner-mode');
  }
}

function doLogout() {
  if (!confirm(getUser() + '\n\nLogout करायचे का?')) return;
  clearUser();
  showToast('✅ Logout झाले!');
  window.location.href = 'login.html';
}

// ── Toast ──
function showToast(msg) {
  let t = document.getElementById('toast');
  if (!t) { t = document.createElement('div'); t.id = 'toast'; document.body.appendChild(t); }
  t.textContent = msg;
  t.className   = 'show';
  clearTimeout(t._t);
  t._t = setTimeout(() => t.classList.remove('show'), 3500);
}

// ── Page loader ──
window.addEventListener('load', function () {
  setTimeout(function () {
    var l = document.getElementById('page-loader');
    if (l) l.classList.add('out');
  }, 1800);
  updateAuthUI();
});

// ── Live Date/Time ──
function updateDT() {
  var MM = ['जानेवारी','फेब्रुवारी','मार्च','एप्रिल','मे','जून','जुलै','ऑगस्ट','सप्टेंबर','ऑक्टोबर','नोव्हेंबर','डिसेंबर'];
  var DD = ['रविवार','सोमवार','मंगळवार','बुधवार','गुरुवार','शुक्रवार','शनिवार'];
  var n = new Date(), h = n.getHours();
  var m = String(n.getMinutes()).padStart(2,'0'), s = String(n.getSeconds()).padStart(2,'0');
  var ap = h >= 12 ? 'सायं' : 'प्रातः';
  if (h > 12) h -= 12; if (!h) h = 12;
  var de = document.getElementById('live-date'), te = document.getElementById('live-time');
  if (de) de.textContent = DD[n.getDay()] + ', ' + n.getDate() + ' ' + MM[n.getMonth()] + ' ' + n.getFullYear();
  if (te) te.textContent = ap + ' ' + h + ':' + m + ':' + s;
}
updateDT();
setInterval(updateDT, 1000);

// ── Mobile nav ──
function initNav() {
  var hb = document.getElementById('hamburger');
  var nl = document.getElementById('nav-list');
  if (!hb || !nl) return;
  hb.addEventListener('click', function () {
    nl.classList.toggle('open');
    hb.textContent = nl.classList.contains('open') ? '✕' : '☰';
  });
  document.addEventListener('click', function (e) {
    if (!hb.contains(e.target) && !nl.contains(e.target)) {
      nl.classList.remove('open');
      hb.textContent = '☰';
    }
  });
}

// ── Scroll reveal ──
window.revealObs = new IntersectionObserver(function (entries) {
  entries.forEach(function (e) { if (e.isIntersecting) e.target.classList.add('vis'); });
}, { threshold: 0.1 });

function watchReveal() {
  document.querySelectorAll('.reveal,.reveal-left,.reveal-right').forEach(function (el) {
    revealObs.observe(el);
  });
}

// ── Active nav ──
window.addEventListener('scroll', function () {
  var cur = '';
  document.querySelectorAll('section[id]').forEach(function (s) {
    if (window.scrollY >= s.offsetTop - 110) cur = s.id;
  });
  document.querySelectorAll('.nav-list a').forEach(function (a) {
    a.classList.toggle('active', a.getAttribute('href') === '#' + cur);
  });
}, { passive: true });

document.querySelectorAll('a[href^="#"]').forEach(function (a) {
  a.addEventListener('click', function (e) {
    var t = document.querySelector(a.getAttribute('href'));
    if (t) {
      e.preventDefault();
      t.scrollIntoView({ behavior: 'smooth' });
      var nl = document.getElementById('nav-list');
      if (nl) nl.classList.remove('open');
    }
  });
});

// ── Ticker ──
var TQ = [
  '🌾 शेतकरी हा देशाचा आत्मा आहे.',
  '💧 एक थेंब पाणी, एक दाणा अन्न — शेतकऱ्याचे श्रम.',
  '🌱 जो जमिनीशी इमान राखतो, जमीन सोडत नाही.',
  '☀️ उगवत्या सूर्यासारखा शेतकरी — कष्टाने जग उजळवतो.',
  '🏆 शेती हा व्यवसाय नाही, ती एक निष्ठा आहे.',
  '🌿 आधुनिक तंत्रज्ञान + पारंपरिक ज्ञान = समृद्ध शेतकरी.',
  '💪 कष्टाला पर्याय नाही — शेतकरी हे जगाला शिकवतो.',
  '🤝 संघटित शेतकरी — समृद्ध महाराष्ट्र.'
];
function initTicker() {
  var t = document.getElementById('ticker-track');
  if (!t) return;
  t.innerHTML = TQ.concat(TQ).map(function (q) { return '<span class="ticker-item">' + q + '</span>'; }).join('');
}

// ── Rotating quotes ──
var RQ = [
  { q: 'शेतकरी हा देशाचा आत्मा आहे — त्याच्या कष्टावर जग जगते.', a: '— लोकमान्य टिळक' },
  { q: 'जो शेतात घाम गाळतो, त्याच्या ताटात सोनं येतं.', a: '— मराठी सुभाषित' },
  { q: 'शेती हे राष्ट्राचे पोषण आहे, शेतकरी हे रक्षक.', a: '— महात्मा फुले' },
  { q: 'एक सुजाण शेतकरी शंभर वकिलांपेक्षा मौल्यवान.', a: '— महात्मा गांधी' },
  { q: 'जमिनीत घातलेले बी वाया जात नाही.', a: '— मराठी लोकोक्ती' },
  { q: 'शेतकऱ्याचे हात हे देशाचा खरा खजिना.', a: '— डॉ. बाबासाहेब आंबेडकर' }
];
var qI = 0;
function initQuotes() {
  var qE = document.getElementById('rotating-quote');
  var aE = document.getElementById('rotating-author');
  if (!qE) return;
  qE.textContent = '"' + RQ[0].q + '"';
  if (aE) aE.textContent = RQ[0].a;
  setInterval(function () {
    qE.style.opacity = '0';
    if (aE) aE.style.opacity = '0';
    setTimeout(function () {
      qI = (qI + 1) % RQ.length;
      qE.textContent = '"' + RQ[qI].q + '"';
      if (aE) aE.textContent = RQ[qI].a;
      qE.style.opacity = '1';
      if (aE) aE.style.opacity = '1';
    }, 400);
  }, 5500);
}

// ═══════════════════════════════════════════════════
//  OWNER: PDF + Thumbnail upload
// ═══════════════════════════════════════════════════
var _pdfFile   = null;
var _thumbFile = null;

function initOwnerPickers() {
  var pdfInput   = document.getElementById('owner-pdf-input');
  var thumbInput = document.getElementById('owner-thumb-input');

  if (pdfInput) {
    pdfInput.addEventListener('change', function () {
      var f = pdfInput.files[0];
      if (!f || f.type !== 'application/pdf') { ownerMsg('❌ PDF file निवडा.', 'err'); return; }
      _pdfFile = f;
      var pb = document.getElementById('owner-pick-btn');
      var sl = document.getElementById('owner-file-label');
      if (pb) { pb.classList.add('selected'); pb.innerHTML = '✅ ' + f.name.slice(0, 20) + (f.name.length > 20 ? '…' : ''); }
      if (sl) { sl.textContent = '📄 ' + f.name + ' (' + (f.size / 1024).toFixed(0) + ' KB)'; sl.style.display = 'flex'; }
    });
  }

  if (thumbInput) {
    thumbInput.addEventListener('change', function () {
      var f = thumbInput.files[0];
      if (!f || !f.type.startsWith('image/')) { ownerMsg('❌ Image file निवडा.', 'err'); return; }
      _thumbFile = f;
      var tb  = document.getElementById('owner-thumb-btn');
      var prv = document.getElementById('owner-thumb-preview');
      if (tb)  { tb.classList.add('selected'); tb.innerHTML = '🖼️ ' + f.name.slice(0, 16) + (f.name.length > 16 ? '…' : ''); }
      if (prv) { prv.src = URL.createObjectURL(f); prv.style.display = 'block'; }
    });
  }
}

async function ownerAddPaper() {
  var title = (document.getElementById('owner-title') || {}).value;
  var date  = (document.getElementById('owner-date')  || {}).value;
  title = title ? title.trim() : '';
  date  = date  ? date.trim()  : '';

  if (!title)    { ownerMsg('❌ अंकाचे नाव टाका.', 'err'); return; }
  if (!date)     { ownerMsg('❌ तारीख टाका.', 'err'); return; }
  if (!_pdfFile) { ownerMsg('❌ PDF file निवडा.', 'err'); return; }

  var sbtn = document.getElementById('owner-submit-btn');
  if (sbtn) { sbtn.disabled = true; sbtn.textContent = '⏳ Upload...'; }

  console.log('[Upload] Step 1: Upload started. title:', title, '| date:', date);

  try {
    if (window.SB && window.SB.isReady()) {

      // Step 2: Upload PDF
      console.log('[Upload] Step 2: Uploading PDF to Supabase Storage...');
      ownerMsg('📤 PDF upload होत आहे...', 'ok');
      var pdfUrl = '';
      try {
        pdfUrl = await window.SB.uploadPDF(_pdfFile);
        console.log('[Upload] Step 3: PDF upload SUCCESS:', pdfUrl);
      } catch (pdfErr) {
        console.error('[Upload] Step 3: PDF upload FAILED:', pdfErr.message);
        ownerMsg('❌ PDF upload failed: ' + pdfErr.message, 'err');
        if (sbtn) { sbtn.disabled = false; sbtn.textContent = '✅ अंक जोडा'; }
        return;
      }

      // Step 3: Upload Thumbnail (optional)
      var thumbUrl = '';
      if (_thumbFile) {
        console.log('[Upload] Step 4: Uploading thumbnail...');
        ownerMsg('🖼️ Thumbnail upload होत आहे...', 'ok');
        try {
          thumbUrl = await window.SB.uploadThumb(_thumbFile);
          console.log('[Upload] Step 5: Thumbnail upload SUCCESS:', thumbUrl);
        } catch (tErr) {
          console.warn('[Upload] Step 5: Thumbnail upload FAILED (continuing):', tErr.message);
        }
      }

      // Step 4: Insert DB record
      var record = {
        title:       title,
        date_text:   date,
        description: title + ' — ' + date,
        pdf_url:     pdfUrl,
        thumb_url:   thumbUrl,
        uploaded_by: getUser() || '',
      };
      console.log('[Upload] Step 6: Inserting record into DB:', JSON.stringify(record));
      ownerMsg('💾 Database मध्ये save होत आहे...', 'ok');

      try {
        var result = await window.SB.insert(record);
        console.log('[Upload] Step 7: DB insert SUCCESS. id:', result ? result.id : 'unknown');
        ownerMsg('✅ "' + title + '" save झाला! Website आपोआप update होईल.', 'ok');
      } catch (dbErr) {
        console.error('[Upload] Step 7: DB insert FAILED:', dbErr.message);
        ownerMsg('❌ Database error: ' + dbErr.message + ' — Supabase SQL तपासा.', 'err');
        if (sbtn) { sbtn.disabled = false; sbtn.textContent = '✅ अंक जोडा'; }
        return;
      }

    } else {
      // IDB fallback
      console.warn('[Upload] Supabase not ready — using local IDB fallback');
      var pdfDU   = await _readFileAsDataURL(_pdfFile);
      var thumbDU = _thumbFile ? await _readFileAsDataURL(_thumbFile) : '';
      await idbPut({ id: Date.now(), title: title, date_text: date, date: date,
        description: title + ' — ' + date, pdfDataURL: pdfDU, thumbDataURL: thumbDU,
        pdfFileName: _pdfFile.name, created_at: new Date().toISOString() });
      ownerMsg('✅ "' + title + '" browser मध्ये save झाला.', 'ok');
      loadAndRender();
    }

    // Reset form
    console.log('[Upload] Step 8: Resetting form');
    _pdfFile = null; _thumbFile = null;
    ['owner-title','owner-date'].forEach(function(id) { var el = document.getElementById(id); if (el) el.value = ''; });
    ['owner-pdf-input','owner-thumb-input'].forEach(function(id) { var el = document.getElementById(id); if (el) el.value = ''; });
    var pb  = document.getElementById('owner-pick-btn');      if (pb)  { pb.classList.remove('selected'); pb.innerHTML = '📂 PDF निवडा'; }
    var tb  = document.getElementById('owner-thumb-btn');     if (tb)  { tb.classList.remove('selected'); tb.innerHTML = '🖼️ Thumbnail'; }
    var sl  = document.getElementById('owner-file-label');    if (sl)  sl.style.display = 'none';
    var prv = document.getElementById('owner-thumb-preview'); if (prv) prv.style.display = 'none';
    if (sbtn) { sbtn.disabled = false; sbtn.textContent = '✅ अंक जोडा'; }
    showToast('✅ नवीन अंक जोडला!');
    console.log('[Upload] Step 9: Upload complete ✅');

  } catch (err) {
    console.error('[Upload] Unexpected error:', err.message);
    ownerMsg('❌ Error: ' + err.message, 'err');
    if (sbtn) { sbtn.disabled = false; sbtn.textContent = '✅ अंक जोडा'; }
  }
}

function _readFileAsDataURL(file) {
  return new Promise(function (resolve, reject) {
    var r = new FileReader();
    r.onload  = function (e) { resolve(e.target.result); };
    r.onerror = function ()  { reject(new Error('File read failed')); };
    r.readAsDataURL(file);
  });
}

async function _uploadThumb(file) {
  if (!window.SUPABASE_URL || !window.SUPABASE_ANON_KEY) return '';
  var name = 'thumbs/' + Date.now() + '_' + file.name.replace(/\s+/g, '_');
  var client = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);
  var result = await client.storage.from('newspapers-pdfs').upload(name, file, { contentType: file.type, upsert: false });
  if (result.error) throw new Error(result.error.message);
  return client.storage.from('newspapers-pdfs').getPublicUrl(name).data.publicUrl;
}

function ownerMsg(msg, type) {
  var el = document.getElementById('owner-msg');
  if (!el) return;
  el.textContent  = msg;
  el.className    = 'owner-msg ' + type;
  clearTimeout(el._t);
  el._t = setTimeout(function () { el.style.display = 'none'; el.className = 'owner-msg'; }, 8000);
}

// ── IndexedDB ──
var _idbName = 'KS_DB', _idbVer = 3, _idb = null;
function _openDB() {
  return new Promise(function (resolve, reject) {
    if (_idb) return resolve(_idb);
    var req = indexedDB.open(_idbName, _idbVer);
    req.onupgradeneeded = function (e) {
      if (!e.target.result.objectStoreNames.contains('papers'))
        e.target.result.createObjectStore('papers', { keyPath: 'id' });
    };
    req.onsuccess = function (e) { _idb = e.target.result; resolve(_idb); };
    req.onerror   = function (e) { reject(e.target.error); };
  });
}
async function idbAll()   { await _openDB(); return new Promise(function (r, j) { var q = _idb.transaction('papers','readonly').objectStore('papers').getAll(); q.onsuccess = function () { r(q.result || []); }; q.onerror = function () { j(q.error); }; }); }
async function idbPut(p)  { await _openDB(); return new Promise(function (r, j) { var q = _idb.transaction('papers','readwrite').objectStore('papers').put(p); q.onsuccess = function () { r(); }; q.onerror = function () { j(q.error); }; }); }
async function idbDel(id) { await _openDB(); return new Promise(function (r, j) { var q = _idb.transaction('papers','readwrite').objectStore('papers').delete(id); q.onsuccess = function () { r(); }; q.onerror = function () { j(q.error); }; }); }

async function deletePaper(id, isSB) {
  if (!confirm('हा अंक delete करायचा का?')) return;
  try {
    if (isSB && window.SB && window.SB.isReady()) {
      await window.SB.delete(id);
    } else {
      await idbDel(id);
      loadAndRender();
    }
    showToast('🗑️ अंक delete झाला.');
  } catch (err) {
    showToast('❌ Delete error: ' + err.message);
  }
}

// ═══════════════════════════════════════════════════
//  NEWSPAPERS — load, realtime, render
// ═══════════════════════════════════════════════════
var _allPapers = [];

async function loadAndRender() {
  var grid = document.getElementById('news-grid');
  if (grid) grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:2rem;color:#aaa">⏳ लोड होत आहे...</div>';

  var sbP = [];
  // Try Supabase — wait a moment for CDN to load if needed
  try {
    if (window.SB && window.SB.isReady()) {
      var res = await window.SB.fetch();
      if (res && res.length >= 0) {
        sbP = res.map(function (p) {
          return Object.assign({}, p, { date: p.date_text, pdf: p.pdf_url, thumbnail: p.thumb_url || '', _sb: true });
        });
      }
    } else if (window.SUPABASE_URL && window.SUPABASE_URL !== 'YOUR_SUPABASE_PROJECT_URL' && window.supabase) {
      // Direct Supabase call if window.SB not ready yet
      var _c = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);
      var _r = await _c.from('newspapers').select('*').order('created_at', { ascending: false });
      if (_r.data) {
        sbP = _r.data.map(function (p) {
          return Object.assign({}, p, { date: p.date_text, pdf: p.pdf_url, thumbnail: p.thumb_url || '', _sb: true });
        });
      }
    }
  } catch (e) { console.warn('Supabase load:', e.message); }

  var idbP = [];
  try { idbP = (await idbAll()).reverse().map(function (p) { return Object.assign({}, p, { _idb: true }); }); } catch (e) {}

  // JSON — only if pdf field has real URL
  var jsonP = [];
  try {
    var res2 = await fetch('news.json');
    var raw  = await res2.json();
    jsonP = raw.filter(function (p) { return p.pdf && p.pdf.trim().length > 5; });
  } catch (e) {}

  _allPapers = sbP.concat(idbP).concat(jsonP);

  if (_allPapers.length === 0) {
    if (grid) grid.innerHTML =
      '<div style="grid-column:1/-1;text-align:center;padding:4rem 2rem;color:#aaa">' +
      '<div style="font-size:3rem;margin-bottom:1rem">📰</div>' +
      '<h3 style="color:#555;margin-bottom:.5rem">अजून कोणतेही अंक नाहीत</h3>' +
      '<p style="font-size:.88rem">' + (canUpload() ? '👆 वर अंक जोडा.' : 'लवकरच नवीन अंक येतील.') + '</p>' +
      '</div>';
    var mw = document.getElementById('news-more-wrap'); if (mw) mw.style.display = 'none';
    return;
  }
  renderAll(_allPapers);
}

function setupRealtime() {
  if (!window.SB || !window.SB.isReady()) return;
  window.SB.subscribe(
    function (newP) {
      if (!newP.pdf_url) return;
      var p = Object.assign({}, newP, { date: newP.date_text, pdf: newP.pdf_url, thumbnail: newP.thumb_url || '', _sb: true });
      _allPapers = [p].concat(_allPapers);
      renderAll(_allPapers);
      showToast('📰 नवीन अंक: ' + newP.title);
    },
    function (delP) {
      _allPapers = _allPapers.filter(function (p) { return !(p._sb && p.id === delP.id); });
      renderAll(_allPapers);
    }
  );
}

function renderAll(papers) {
  var grid     = document.getElementById('news-grid');
  var moreWrap = document.getElementById('news-more-wrap');
  var moreRow  = document.getElementById('news-scroll-row');
  if (!grid) return;
  var ow    = canUpload();

  // Latest 6 in main grid
  var first = papers.slice(0, NEWS_LIMIT);
  // ALL remaining in जुने अंक section (no limit — all newspapers preserved)
  var rest  = papers.slice(NEWS_LIMIT);

  grid.innerHTML = '';
  first.forEach(function (p, i) { buildCard(p, i, ow, grid); });

  if (moreWrap && moreRow) {
    if (rest.length > 0) {
      moreWrap.style.display = 'block';
      moreRow.innerHTML = '';
      rest.forEach(function (p, i) { buildCard(p, i, ow, moreRow); });
    } else {
      moreWrap.style.display = 'none';
    }
  }
  watchReveal();
}

function buildCard(p, i, ow, container) {
  var isSB  = !!p._sb;
  var isIDB = !!p._idb;

  // Thumbnail: Supabase URL > IDB base64 > news.json field > placeholder
  var thumb = p.thumb_url    ||
              p.thumbDataURL  ||
              p.thumbnail     ||
              ('https://placehold.co/480x280/0f6b28/ffffff?text=' + encodeURIComponent((p.title || 'अंक').slice(0, 8)));

  var card = document.createElement('div');
  card.className = 'news-card reveal';
  card.style.transitionDelay = (i * 0.05) + 's';

  var delBtn = (ow && (isIDB || isSB))
    ? '<button class="nc-delete-btn" onclick="deletePaper(' + p.id + ',' + isSB + ')">🗑️</button>'
    : '';

  card.innerHTML =
    '<div class="nc-img">' +
      '<img src="' + thumb + '" alt="' + p.title + '" loading="lazy" ' +
           'onerror="this.src=\'https://placehold.co/480x280/0f6b28/ffffff?text=अंक\'">' +
      '<div class="nc-badge">📰 साप्ताहिक</div>' +
    '</div>' +
    '<div class="nc-body">' +
      '<div class="nc-date">📅 ' + (p.date || p.date_text || '') + '</div>' +
      '<h3 class="nc-title">' + p.title + '</h3>' +
      '<p class="nc-desc">' + (p.description || '') + '</p>' +
    '</div>' +
    '<div class="nc-footer">' +
      '<span></span>' +
      '<div style="display:flex;gap:.4rem;align-items:center">' + delBtn + '<button class="read-btn">📖 वाचा</button></div>' +
    '</div>';

  // "वाचा" button
  card.querySelector('.read-btn').addEventListener('click', function (e) {
    e.stopPropagation();
    openPDF(p);
  });
  // Whole card click → also open PDF
  card.addEventListener('click', function (e) {
    if (!e.target.closest('.nc-delete-btn') && !e.target.closest('.read-btn')) {
      openPDF(p);
    }
  });
  container.appendChild(card);
}

// ═══════════════════════════════════════════════════
//  PDF VIEWER — Clean Final
//  • Read Mode: PDF.js canvas, fully scrollable
//  • Click/Hold on news → Download Selected News
//  • Download PDF button
//  • 4K quality, no stretch, clear text
// ═══════════════════════════════════════════════════

var _pdfAB    = null;   // raw ArrayBuffer of current PDF
var _pdfDoc   = null;   // PDF.js document
var _pdfTitle = '';

// ── Open PDF from card ──
async function openPDF(p) {
  var modal = document.getElementById('pdf-modal');
  if (!modal) return;

  _pdfAB    = null;
  _pdfDoc   = null;
  _pdfTitle = p.title || 'newspaper';
  window._currentPaperDate = p.date_text || p.date || '';

  var titleEl = document.getElementById('modal-title');
  if (titleEl) titleEl.textContent = _pdfTitle;

  var pagesEl = document.getElementById('pdf-pages');
  if (pagesEl) pagesEl.innerHTML = '<div style="padding:3rem;text-align:center;color:#aaa">⏳ PDF लोड होत आहे...</div>';

  modal.classList.add('open');
  document.body.style.overflow = 'hidden';


  // Fetch raw bytes
  var url = p.pdf || p.pdf_url || '';
  try {
    if (p.pdfDataURL) {
      var b64  = p.pdfDataURL.split(',')[1];
      var raw  = atob(b64);
      var ab   = new ArrayBuffer(raw.length);
      var view = new Uint8Array(ab);
      for (var i = 0; i < raw.length; i++) view[i] = raw.charCodeAt(i);
      _pdfAB = ab;
    } else if (url && url.length > 4) {
      var res = await fetch(url);
      if (!res.ok) throw new Error('HTTP ' + res.status);
      _pdfAB = await res.arrayBuffer();
    }
  } catch(e) {
    if (pagesEl) pagesEl.innerHTML = '<div style="padding:3rem;text-align:center;color:#aaa">❌ PDF लोड झाला नाही: ' + e.message + '</div>';
    return;
  }

  if (!_pdfAB || _pdfAB.byteLength === 0) {
    if (pagesEl) pagesEl.innerHTML = '<div style="padding:3rem;text-align:center;color:#aaa">📄 PDF उपलब्ध नाही.</div>';
    return;
  }

  // Load PDF.js
  if (typeof pdfjsLib === 'undefined') {
    if (pagesEl) pagesEl.innerHTML = '<div style="padding:3rem;text-align:center;color:#aaa">⚠️ PDF.js load झाला नाही. Refresh करा.</div>';
    return;
  }
  pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js';

  try {
    _pdfDoc = await pdfjsLib.getDocument({ data: new Uint8Array(_pdfAB.slice(0)) }).promise;
    var n = _pdfDoc.numPages;
    var pi = document.getElementById('pdf-page-info');
    if (pi) pi.textContent = n + ' pages';
    if (pagesEl) pagesEl.innerHTML = '';

    // SWIPE NAVIGATION: pages render as a horizontal, swipeable carousel
    // (native CSS scroll-snap = smooth, GPU-accelerated, no custom JS swipe
    // handling needed for navigation itself — most performant approach).
    // Page 1 renders immediately; the rest lazy-render just before they
    // swipe into view so opening a PDF feels instant.
    pagesEl.classList.add('pdf-swipe-track');
    pagesEl.style.cssText = 'flex:1;display:flex;flex-direction:row;overflow-x:auto;overflow-y:hidden;' +
      'scroll-snap-type:x mandatory;-webkit-overflow-scrolling:touch;background:#555;' +
      'will-change:scroll-position;contain:content;height:100%';

    await _renderPage(1, n, pagesEl);

    if (n > 1) {
      _setupLazyPages(2, n, pagesEl);
    }
    _setupSwipeIndicator(pagesEl, n);
  } catch(err) {
    if (pagesEl) pagesEl.innerHTML = '<div style="padding:3rem;text-align:center;color:#aaa">❌ ' + err.message + '</div>';
  }
}

// ── Update "x / n" page indicator as the user swipes ──
function _setupSwipeIndicator(container, total) {
  var pi = document.getElementById('pdf-page-info');
  if (!pi) return;
  var ticking = false;
  container.addEventListener('scroll', function() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function() {
      var w = container.clientWidth || 1;
      var idx = Math.round(container.scrollLeft / w) + 1;
      if (idx < 1) idx = 1;
      if (idx > total) idx = total;
      pi.textContent = idx + ' / ' + total;
      ticking = false;
    });
  }, { passive: true });
}

// ── Create lightweight placeholders for remaining pages, render lazily ──
// Each placeholder/page is a full-width "slide" (flex:0 0 100%) that snaps
// into place — same swipeable layout as the immediately-rendered page 1.
function _setupLazyPages(startPage, total, container) {
  var placeholders = [];
  for (var pg = startPage; pg <= total; pg++) {
    var ph = document.createElement('div');
    ph.className = 'pdf-page-placeholder';
    ph.dataset.page = pg;
    ph.style.cssText = 'flex:0 0 100%;scroll-snap-align:start;height:100%;display:flex;' +
      'align-items:center;justify-content:center;background:#666;color:#ccc;' +
      'font-size:.8rem;font-family:sans-serif';
    ph.textContent = '⏳ Page ' + pg + ' / ' + total;
    container.appendChild(ph);
    placeholders.push(ph);
  }

  if (typeof IntersectionObserver === 'undefined') {
    // Fallback: no lazy loading support — render all immediately
    placeholders.forEach(function(ph) {
      var pg = parseInt(ph.dataset.page, 10);
      _renderLazyPage(pg, total, ph);
    });
    return;
  }

  // root = the swipe container itself (not the viewport) since pages sit
  // side-by-side horizontally; rootMargin preloads ~1 page ahead/behind
  // so the next/previous page is already rendered by the time the user
  // swipes to it — keeps swiping feeling instant.
  var observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        var ph = entry.target;
        observer.unobserve(ph);
        _renderLazyPage(parseInt(ph.dataset.page, 10), total, ph);
      }
    });
  }, { root: container, rootMargin: '0px 600px 0px 600px', threshold: 0.01 });

  placeholders.forEach(function(ph) { observer.observe(ph); });
}

// ── Render a lazily-loaded page, replacing its placeholder in place ──
// Fits the page to the FULL slide (container width AND height), since each
// page is now a single full-screen swipeable slide rather than part of a
// vertically stacked list.
async function _renderLazyPage(num, total, placeholderEl) {
  try {
    var page = await _pdfDoc.getPage(num);
    var built = _buildPageSlide(page, num, total, placeholderEl);
    await built.renderPromise;
    if (placeholderEl.parentNode) {
      placeholderEl.parentNode.replaceChild(built.wrap, placeholderEl);
    }
  } catch(e) {
    placeholderEl.textContent = '❌ Page ' + num + ' load error';
  }
}

// ── Render one PDF page as a full-screen swipeable slide ──
// Fast load: render at a scale that fits the slide for quick, crisp display.
// HD download: re-render at dpr×3 only when the user actually downloads.
async function _renderPage(num, total, container) {
  var page = await _pdfDoc.getPage(num);
  var built = _buildPageSlide(page, num, total, null);
  container.appendChild(built.wrap);
  await built.renderPromise;
}

// ── Shared slide builder used by both immediate and lazy page rendering ──
function _buildPageSlide(page, num, total, refEl) {
  var slideW = (refEl ? refEl.clientWidth  : 0) || document.getElementById('pdf-pages').clientWidth  || window.innerWidth  || 700;
  var slideH = (refEl ? refEl.clientHeight : 0) || document.getElementById('pdf-pages').clientHeight || window.innerHeight || 700;

  var dpr = window.devicePixelRatio || 1;
  var nat = page.getViewport({ scale: 1 });

  // Fit the page fully inside the slide (contain), then render slightly
  // sharper than the display size needs for crisp text on Retina/mobile.
  var fitScale   = Math.min(slideW / nat.width, slideH / nat.height);
  var DISPLAY_SCALE = Math.max(fitScale * Math.min(dpr, 2), 0.5);
  var vp   = page.getViewport({ scale: DISPLAY_SCALE });
  var dispW = Math.round(vp.width  / Math.min(dpr, 2));
  var dispH = Math.round(vp.height / Math.min(dpr, 2));

  // Slide — full width/height, snaps into place, centers the page box
  var wrap = document.createElement('div');
  wrap.className = 'pdf-page-slide';
  wrap.style.cssText = 'flex:0 0 100%;scroll-snap-align:start;height:100%;display:flex;' +
    'align-items:center;justify-content:center;background:#555;overflow:hidden';

  // Page box — exact rendered size, centered by the slide's flex layout
  var box = document.createElement('div');
  box.style.cssText = 'position:relative;width:' + dispW + 'px;height:' + dispH + 'px;' +
    'background:#fff;box-shadow:0 2px 12px rgba(0,0,0,.35);border-radius:4px;overflow:hidden;' +
    'user-select:none;-webkit-user-select:none';

  // Page label
  var lbl = document.createElement('div');
  lbl.style.cssText = 'position:absolute;top:6px;left:6px;background:rgba(0,0,0,.55);color:#fff;font-size:.68rem;font-weight:700;padding:2px 8px;border-radius:50px;z-index:4;pointer-events:none;font-family:sans-serif';
  lbl.textContent = num + ' / ' + total;

  // Display canvas
  var cv = document.createElement('canvas');
  cv.width  = vp.width;
  cv.height = vp.height;
  cv.style.cssText = 'position:absolute;top:0;left:0;width:' + dispW + 'px;height:' + dispH + 'px;display:block';

  // Selection overlay
  var ov = document.createElement('canvas');
  ov.width  = dispW;
  ov.height = dispH;
  ov.style.cssText = 'position:absolute;top:0;left:0;width:' + dispW + 'px;height:' + dispH + 'px;z-index:3;touch-action:none;display:none';
  ov.dataset.selMode = '0';

  box.appendChild(lbl);
  box.appendChild(cv);
  box.appendChild(ov);
  wrap.appendChild(box);

  var renderPromise = page.render({ canvasContext: cv.getContext('2d'), viewport: vp }).promise.then(function() {
    cv._pageRef   = page;
    cv._dispScale = DISPLAY_SCALE;
    cv._cssW      = dispW;
    cv._cssH      = dispH;

    // Long-press (hold) on the page box → select an individual news item
    // to download. Swiping (horizontal movement) cancels the hold so it
    // never interferes with normal page-to-page swipe navigation.
    _attachTouchSel(ov, cv, box, dispW, dispH, num);
    _attachMouseSel(ov, cv, dispW, dispH, num);
  });

  return { wrap: wrap, renderPromise: renderPromise };
}

// ── Touch: tap=scroll, hold=select ──
function _attachTouchSel(ov, pdfCv, wrap, cssW, cssH, pageNum) {
  var holdTimer = null;
  var holdActive = false;
  var sx = 0, sy = 0, ex = 0, ey = 0;
  var ctx = ov.getContext('2d');
  var moveHandler = null;       // blocking listener — attached only during active select
  var preHoldMoveHandler = null; // lightweight, passive — only watches for swipe-cancel

  function getPos(e) {
    var r = ov.getBoundingClientRect();
    var t = e.touches ? e.touches[0] : e;
    return {
      x: Math.max(0, Math.min(cssW, t.clientX - r.left)),
      y: Math.max(0, Math.min(cssH, t.clientY - r.top))
    };
  }

  function _detachMove() {
    if (moveHandler) {
      wrap.removeEventListener('touchmove', moveHandler);
      moveHandler = null;
    }
  }
  function _detachPreHold() {
    if (preHoldMoveHandler) {
      wrap.removeEventListener('touchmove', preHoldMoveHandler);
      preHoldMoveHandler = null;
    }
  }

  wrap.addEventListener('touchstart', function(e) {
    var p = getPos(e);
    sx = p.x; sy = p.y; ex = p.x; ey = p.y;
    holdActive = false;

    // SWIPE FIX: a long-press only counts as "hold to select" if the
    // finger stays roughly still. If the user is actually swiping to the
    // next/previous page, cancel the pending hold immediately so it never
    // interferes with page navigation. This listener is passive (it never
    // calls preventDefault), so it does not block the native swipe at all.
    preHoldMoveHandler = function(ev) {
      var p2 = getPos(ev);
      if (Math.abs(p2.x - sx) > 10 || Math.abs(p2.y - sy) > 10) {
        clearTimeout(holdTimer);
        _detachPreHold();
      }
    };
    wrap.addEventListener('touchmove', preHoldMoveHandler, { passive: true });

    holdTimer = setTimeout(function() {
      // Hold detected (finger stayed still for 450ms) — enter select mode.
      // The blocking (non-passive) touchmove listener is attached ONLY
      // now, while the user is actively selecting — never during normal
      // swipe/scroll — so page-swiping always stays smooth.
      _detachPreHold();
      holdActive = true;
      ov.style.display = 'block';
      _clearAllOverlays(ov);
      _hideSelBtn();
      _drawBox(ctx, sx, sy, ex, ey, cssW, cssH);

      moveHandler = function(ev) {
        ev.preventDefault();
        var p2 = getPos(ev);
        ex = p2.x; ey = p2.y;
        _drawBox(ctx, sx, sy, ex, ey, cssW, cssH);
      };
      wrap.addEventListener('touchmove', moveHandler, { passive: false });
    }, 450);
  }, { passive: true });

  wrap.addEventListener('touchend', function() {
    clearTimeout(holdTimer);
    _detachPreHold();
    _detachMove();
    if (!holdActive) return;
    holdActive = false;
    _finishSel(ctx, ov, pdfCv, sx, sy, ex, ey, cssW, cssH, pageNum);
  }, { passive: true });

  wrap.addEventListener('touchcancel', function() {
    clearTimeout(holdTimer);
    _detachPreHold();
    _detachMove();
    holdActive = false;
  }, { passive: true });
}

// ── Mouse: drag to select ──
function _attachMouseSel(ov, pdfCv, cssW, cssH, pageNum) {
  var ctx = ov.getContext('2d');
  var sx = 0, sy = 0, ex = 0, ey = 0;
  var dragging = false;

  function getPos(e) {
    var r = ov.getBoundingClientRect();
    return {
      x: Math.max(0, Math.min(cssW, e.clientX - r.left)),
      y: Math.max(0, Math.min(cssH, e.clientY - r.top))
    };
  }

  ov.style.display = 'block';  // always visible for mouse

  ov.addEventListener('mousedown', function(e) {
    e.preventDefault();
    dragging = true;
    _clearAllOverlays(ov);
    _hideSelBtn();
    var p = getPos(e);
    sx = p.x; sy = p.y; ex = p.x; ey = p.y;
    _drawBox(ctx, sx, sy, ex, ey, cssW, cssH);
  });

  ov.addEventListener('mousemove', function(e) {
    if (!dragging) return;
    var p = getPos(e);
    ex = p.x; ey = p.y;
    _drawBox(ctx, sx, sy, ex, ey, cssW, cssH);
  });

  document.addEventListener('mouseup', function() {
    if (!dragging) return;
    dragging = false;
    _finishSel(ctx, ov, pdfCv, sx, sy, ex, ey, cssW, cssH, null);
  });
}

// ── Common finish selection ──
function _finishSel(ctx, ov, pdfCv, sx, sy, ex, ey, cssW, cssH, pageNum) {
  var selW = Math.abs(ex - sx), selH = Math.abs(ey - sy);
  if (selW < 20 || selH < 20) {
    ctx.clearRect(0, 0, cssW, cssH);
    return;
  }
  var x1 = Math.min(sx, ex), y1 = Math.min(sy, ey);
  // ratio: display canvas pixel / CSS px
  var ratio = pdfCv.width / cssW;
  var hx = Math.round(x1 * ratio), hy = Math.round(y1 * ratio);
  var hw = Math.round(selW * ratio), hh = Math.round(selH * ratio);
  _showSelBtn(x1 + selW/2, y1 + selH/2, ov, pdfCv, hx, hy, hw, hh, pageNum || 1);
}

// ── Draw selection box on overlay ──
function _drawBox(ctx, sx, sy, ex, ey, W, H) {
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = 'rgba(0,0,0,.35)';
  ctx.fillRect(0, 0, W, H);
  var x1 = Math.min(sx,ex), y1 = Math.min(sy,ey);
  var w  = Math.abs(ex-sx), h  = Math.abs(ey-sy);
  ctx.clearRect(x1, y1, w, h);
  ctx.strokeStyle = '#f59332';
  ctx.lineWidth = 2.5;
  ctx.setLineDash([8, 4]);
  ctx.strokeRect(x1+1, y1+1, w-2, h-2);
  ctx.setLineDash([]);
  ctx.fillStyle = '#f59332';
  [[x1,y1],[x1+w,y1],[x1,y1+h],[x1+w,y1+h]].forEach(function(pt) {
    ctx.beginPath(); ctx.arc(pt[0], pt[1], 5, 0, Math.PI*2); ctx.fill();
  });
}

function _clearAllOverlays(except) {
  document.querySelectorAll('#pdf-pages canvas').forEach(function(o) {
    if (o !== except && o.dataset && o.dataset.selMode !== undefined) {
      o.getContext('2d').clearRect(0, 0, o.width, o.height);
    }
  });
}

// ── Floating "Download Selected News" button ──
var _selData = null;

function _showSelBtn(cx, cy, ov, pdfCv, hx, hy, hw, hh, pageNum) {
  _selData = { pdfCv: pdfCv, hx: hx, hy: hy, hw: hw, hh: hh, pageNum: pageNum };

  // Position button using fixed coords (viewport)
  var r  = ov.getBoundingClientRect();
  var vx = r.left + cx;
  var vy = r.top  + cy;

  var btn = document.getElementById('_sel_btn');
  if (!btn) {
    btn = document.createElement('button');
    btn.id = '_sel_btn';
    btn.style.cssText = 'position:fixed;z-index:99999;padding:12px 22px;background:linear-gradient(135deg,#e07b1a,#f59332);color:#fff;font-size:.9rem;font-weight:800;border:none;border-radius:50px;cursor:pointer;font-family:sans-serif;white-space:nowrap;box-shadow:0 4px 18px rgba(0,0,0,.5);display:none;align-items:center;gap:6px';
    btn.textContent = '📥 Download Selected News';
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      if (_selData) _downloadSelected(_selData);
      btn.style.display = 'none';
      _selData = null;
      document.querySelectorAll('#pdf-pages canvas[style*="z-index:3"]').forEach(function(o) {
        o.getContext('2d').clearRect(0, 0, o.width, o.height);
      });
    });
    document.body.appendChild(btn);
  }

  btn.style.display   = 'flex';
  btn.style.left      = vx + 'px';
  btn.style.top       = vy + 'px';
  btn.style.transform = 'translate(-50%, -50%)';
}

function _hideSelBtn() {
  var btn = document.getElementById('_sel_btn');
  if (btn) btn.style.display = 'none';
  _selData = null;
}

// ── Build & download selected news image (HD re-render) ──
// FIX: removed buggy ternary that caused _buildDownload to be called TWICE
// (once from broken `.then` check, once from the unconditional _hdRender call)
function _downloadSelected(d) {
  showToast('⏳ HD image तयार होत आहे...');

  // Re-render page at dpr×3 for 4K quality download
  var dpr        = window.devicePixelRatio || 1;
  var hdScale    = Math.max(dpr * 3, 4);   // never below 4x — guarantees crisp 4K-grade output
  var dispScale  = d.pdfCv._dispScale || 1.5;
  var scaleRatio = hdScale / dispScale;

  var vp   = d.pdfCv._pageRef.getViewport({ scale: hdScale });
  var hdCv = document.createElement('canvas');
  hdCv.width  = vp.width;
  hdCv.height = vp.height;

  d.pdfCv._pageRef.render({ canvasContext: hdCv.getContext('2d'), viewport: vp }).promise
    .then(function() {
      var hx2 = Math.round(d.hx * scaleRatio);
      var hy2 = Math.round(d.hy * scaleRatio);
      var hw2 = Math.round(d.hw * scaleRatio);
      var hh2 = Math.round(d.hh * scaleRatio);
      _buildDownload(d, hdCv, hx2, hy2, hw2, hh2, d.pageNum);   // called exactly ONCE
    })
    .catch(function() {
      // Fallback to display-resolution canvas if HD re-render fails
      _buildDownload(d, d.pdfCv, d.hx, d.hy, d.hw, d.hh, d.pageNum);
    });
}

function _buildDownload(d, srcCv, hx, hy, hw, hh, pageNum) {
  // ═══════════════════════════════════════════════════════
  //  NEWSPAPER MASTHEAD — White/cream bg | Bold RED title
  //  Title (fits inside header) + full Date & Day + editor
  //  contact bottom-right INSIDE header | 6px padding
  // ═══════════════════════════════════════════════════════
  var DAYS_MR  = ['रविवार','सोमवार','मंगळवार','बुधवार','गुरुवार','शुक्रवार','शनिवार'];
  var MONTHS_MR = ['जानेवारी','फेब्रुवारी','मार्च','एप्रिल','मे','जून','जुलै','ऑगस्ट','सप्टेंबर','ऑक्टोबर','नोव्हेंबर','डिसेंबर'];

  // Masthead height — taller so title + date + contact line fit comfortably
  var HDR  = Math.max(130, Math.min(240, Math.round(hw * 0.20)));
  // Main title font — responsive, but fraction of HDR reduced (0.36) so the
  // title + its ascenders always stay inside the header (fixes top overflow)
  var FONT = Math.min(
    Math.max(Math.round(hw * 0.075), 34),
    Math.round(HDR * 0.36)
  );
  FONT = Math.min(FONT, 100);
  // Sub-text (date/day)
  var SUB = Math.max(Math.round(FONT * 0.30), 16);

  var PAD = 6; // padding increased by 4px (was 2px → now 6px)

  // Inner (unpadded) composed size
  var innerW = hw;
  var innerH = hh + HDR;

  // Final canvas includes padding on all sides
  var out = document.createElement('canvas');
  out.width  = innerW + PAD * 2;
  out.height = innerH + PAD * 2;
  var ctx = out.getContext('2d');

  // Fill padding background (matches masthead cream tone)
  ctx.fillStyle = '#FFFDF5';
  ctx.fillRect(0, 0, out.width, out.height);

  // Shift all drawing by PAD so content sits inset with the padding border
  ctx.save();
  ctx.translate(PAD, PAD);

  // ── Background: white/cream ──
  ctx.fillStyle = '#FFFDF5';
  ctx.fillRect(0, 0, hw, HDR);

  // ── Top border ──
  var borderH = Math.max(3, Math.round(hw * 0.004));
  ctx.fillStyle = '#1a1a1a';
  ctx.fillRect(0, 0, hw, borderH);

  // ── Bottom border ──
  ctx.fillStyle = '#1a1a1a';
  ctx.fillRect(0, HDR - borderH, hw, borderH);

  // ── Red accent line above bottom border ──
  var redLine = Math.max(2, Math.round(hw * 0.003));
  ctx.fillStyle = '#CC0000';
  ctx.fillRect(0, HDR - borderH - redLine - 2, hw, redLine);

  // ── Title + date area ──
  var textAreaLeft = Math.round(hw * 0.05);
  var textAreaW    = hw - textAreaLeft * 2;
  var textCX       = hw / 2;

  // Main Title: BOLD RED "कर्तृत्ववान शेतकरी"
  // FIX: use 'middle' baseline + font-relative offset (not alphabetic) so the
  // title's ascenders never extend above the header / above the top border
  ctx.fillStyle    = '#CC0000';
  ctx.font         = 'bold ' + FONT + 'px "Noto Sans Devanagari", "Mangal", serif';
  ctx.textAlign    = 'center';
  ctx.textBaseline = 'middle';

  var titleText = 'कर्तृत्ववान शेतकरी';
  var measured  = ctx.measureText(titleText).width;
  if (measured > textAreaW * 0.95) {
    var shrunk = Math.floor(FONT * (textAreaW * 0.95 / measured));
    FONT = shrunk;
    ctx.font = 'bold ' + FONT + 'px "Noto Sans Devanagari", "Mangal", serif';
  }

  // Title vertical position — enough top margin so nothing overflows
  var titleY = Math.max(borderH + FONT * 0.62, HDR * 0.30);
  ctx.fillText(titleText, textCX, titleY);

  // ── Date + Day below title — full format: "Wednesday, 24 June 2026" style ──
  var dateStr = window._currentPaperDate || '';
  var fullDate = '';
  try {
    var d2 = dateStr ? new Date(dateStr) : null;
    if (d2 && !isNaN(d2.getTime())) {
      fullDate = DAYS_MR[d2.getDay()] + ', ' + d2.getDate() + ' ' + MONTHS_MR[d2.getMonth()] + ' ' + d2.getFullYear();
    } else {
      fullDate = dateStr || _pdfTitle || '';
    }
  } catch(e2) {
    fullDate = dateStr || _pdfTitle || '';
  }

  var dateY = titleY + FONT * 0.95;
  if (fullDate.trim()) {
    ctx.fillStyle    = '#333333';
    ctx.font         = 'bold ' + SUB + 'px "Noto Sans Devanagari", "Mangal", serif';
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(fullDate, textCX, dateY);
  }

  // ── Editor contact — bottom-right corner, INSIDE the header (not over content) ──
  var contactFont = Math.min(
    Math.max(Math.round(hw * 0.0145), 12),
    Math.round(FONT * 0.32)
  );
  var rightMargin = Math.round(hw * 0.025);
  var contactBottomY = HDR - borderH - redLine - 7; // just above the red accent line
  var combined = 'संपादक: हरी लोखंडे | Mo. No.: 9763445290 / 9762229920';

  ctx.font = contactFont + 'px "Noto Sans Devanagari", "Mangal", sans-serif';
  ctx.fillStyle    = '#444444';
  ctx.textAlign    = 'right';

  var combinedW = ctx.measureText(combined).width;
  if (combinedW <= textAreaW * 0.50) {
    // Fits on a single line
    ctx.textBaseline = 'alphabetic';
    ctx.fillText(combined, hw - rightMargin, contactBottomY);
  } else {
    // Split into two lines at the separator
    var parts = combined.split('|');
    var line1 = (parts[0] || '').trim();
    var line2 = (parts[1] || '').trim();
    ctx.textBaseline = 'alphabetic';
    ctx.fillText(line2, hw - rightMargin, contactBottomY);
    ctx.fillText(line1, hw - rightMargin, contactBottomY - Math.round(contactFont * 1.35));
  }

  // Thin decorative line between header text block and content
  ctx.strokeStyle = '#888';
  ctx.lineWidth   = 1;
  ctx.beginPath();
  ctx.moveTo(textAreaLeft, HDR - borderH - redLine - 6);
  ctx.lineTo(hw - textAreaLeft, HDR - borderH - redLine - 6);
  ctx.stroke();

  // ── Paste selected news content ──
  try { ctx.drawImage(srcCv, hx, hy, hw, hh, 0, HDR, hw, hh); }
  catch(e) { console.warn('[Header] drawImage error:', e); }

  ctx.restore(); // undo PAD translate

  // Thin border line outlining the full padded image
  ctx.strokeStyle = '#ddd';
  ctx.lineWidth   = 1;
  ctx.strokeRect(PAD * 0.5, PAD * 0.5, out.width - PAD, out.height - PAD);

  var fname = 'KS_news_p' + pageNum + '_' + Date.now() + '.png';
  _doSave(out, fname);   // single save call — fixes the double-download bug
}

// ── Download full PDF ──
function downloadPDF() {
  if (!_pdfAB || _pdfAB.byteLength === 0) { showToast('❌ PDF data नाही'); return; }

  // Safe Uint8Array → base64 conversion (chunked to avoid stack overflow)
  var u8    = new Uint8Array(_pdfAB);
  var CHUNK = 8192;
  var str   = '';
  for (var i = 0; i < u8.length; i += CHUNK) {
    str += String.fromCharCode.apply(null, u8.subarray(i, i + CHUNK));
  }
  var b64  = btoa(str);
  var mime = 'application/pdf';
  var safe = (_pdfTitle || 'newspaper').replace(/[^a-zA-Z0-9ऀ-ॿ]/g,'_').slice(0,25) + '.pdf';

  // Build blob and download
  var blob = new Blob([u8], { type: mime });
  _saveBlob(blob, safe);
}

// ── Save canvas as PNG ──
function _doSave(canvas, filename) {
  canvas.toBlob(function(blob) {
    if (!blob) { showToast('❌ Image तयार झाली नाही'); return; }
    _saveBlob(blob, filename);
  }, 'image/png', 1.0);
}

// ── Save blob — Desktop + Android + iOS ──
function _saveBlob(blob, filename) {
  var url = URL.createObjectURL(blob);
  var isImg = blob.type.indexOf('image') !== -1;

  // Method 1: anchor click (Desktop Chrome/FF + Android Chrome)
  try {
    var a = document.createElement('a');
    a.href = url; a.download = filename;
    a.style = 'position:fixed;top:-999px;left:-999px';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast('✅ Download सुरू झाले!');
  } catch(e) {}

  // Method 2: Always show modal so iOS can save (hold → Save)
  _saveModal(url, blob, filename, isImg);
}

// ── In-page Save Modal (iOS fallback + confirmation) ──
function _saveModal(objUrl, blob, filename, isImg) {
  var old = document.getElementById('_dlpanel');
  if (old) old.remove();

  var panel = document.createElement('div');
  panel.id  = '_dlpanel';
  panel.style.cssText = 'position:fixed;inset:0;z-index:999998;background:rgba(0,0,0,.93);display:flex;flex-direction:column;align-items:center;padding:1rem;gap:.8rem;overflow-y:auto;-webkit-overflow-scrolling:touch;font-family:sans-serif';

  // Header
  var hdr = document.createElement('div');
  hdr.style.cssText = 'width:100%;max-width:580px;background:linear-gradient(135deg,#052e0f,#0f6b28);border-radius:10px;padding:.85rem 1rem;display:flex;justify-content:space-between;align-items:center;flex-shrink:0';
  hdr.innerHTML = '<span style="color:#f0c040;font-weight:800;font-size:.95rem">🌾 कर्तृत्ववान शेतकरी</span>';
  var cx = document.createElement('button');
  cx.textContent = '✕';
  cx.style.cssText = 'background:rgba(255,255,255,.2);color:#fff;border:none;border-radius:50%;width:32px;height:32px;font-size:1rem;cursor:pointer';
  hdr.appendChild(cx);

  // Download anchor
  var dl = document.createElement('a');
  dl.href = objUrl; dl.download = filename;
  dl.style.cssText = 'display:block;width:100%;max-width:580px;background:linear-gradient(135deg,#e07b1a,#f59332);color:#fff;text-align:center;text-decoration:none;padding:14px;border-radius:50px;font-size:1rem;font-weight:800;box-sizing:border-box';
  dl.textContent = isImg ? '⬇️ Image Save करा' : '⬇️ PDF Save करा';

  // Tips
  var tip = document.createElement('div');
  tip.style.cssText = 'width:100%;max-width:580px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.12);border-radius:10px;padding:.8rem;color:rgba(255,255,255,.7);font-size:.82rem;line-height:1.9;text-align:center';
  tip.innerHTML = isImg
    ? '<b style="color:#fff">Android/Desktop:</b> "Image Save करा" button दाबा<br><b style="color:#fff">iPhone:</b> खाली Image वर <b style="color:#fff">Hold करा</b> → "Save to Photos"'
    : '<b style="color:#fff">Android/Desktop:</b> "PDF Save करा" button दाबा<br><b style="color:#fff">iPhone:</b> Button दाबा → Share → Save to Files';

  panel.appendChild(hdr);
  panel.appendChild(dl);
  panel.appendChild(tip);

  // Show content
  if (isImg) {
    var img = document.createElement('img');
    img.src = objUrl;
    img.style.cssText = 'max-width:580px;width:100%;border-radius:8px;box-shadow:0 4px 20px rgba(0,0,0,.6)';
    panel.appendChild(img);
  } else {
    var fr = document.createElement('iframe');
    fr.src = objUrl;
    fr.style.cssText = 'width:100%;max-width:580px;height:70vh;border:none;border-radius:8px;background:#fff';
    panel.appendChild(fr);
  }

  document.body.appendChild(panel);

  cx.onclick = function() { panel.remove(); URL.revokeObjectURL(objUrl); };
  panel.addEventListener('click', function(e) {
    if (e.target === panel) { panel.remove(); URL.revokeObjectURL(objUrl); }
  });
}

// ── Pinch-to-zoom on PDF pages ──
function _initPinchZoom(container) {
  if (!container) return;

  var scale = 1;
  var lastDist = 0;
  var originX = 0, originY = 0;
  var pinchMoveHandler = null;   // attached/detached dynamically — see fix below

  // Wrap all pages in one zoomable div
  var wrap = document.createElement('div');
  wrap.id = '_pdf_zoom_wrap';
  wrap.style.cssText = 'transform-origin:top left;will-change:transform;width:100%;transition:none';
  // Move all children into wrap
  var children = Array.prototype.slice.call(container.children);
  children.forEach(function(c) { wrap.appendChild(c); });
  container.appendChild(wrap);

  function dist2(t) {
    return Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY);
  }

  function applyZoom() {
    wrap.style.transform = 'scale(' + scale + ')';
    wrap.style.transformOrigin = originX + 'px ' + originY + 'px';
    // Adjust container height so scrolling works
    container.style.minHeight = Math.round(wrap.offsetHeight * scale) + 'px';
  }

  function _detachPinchMove() {
    if (pinchMoveHandler) {
      container.removeEventListener('touchmove', pinchMoveHandler);
      pinchMoveHandler = null;
    }
  }

  container.addEventListener('touchstart', function(e) {
    if (e.touches.length === 2) {
      e.preventDefault();
      lastDist = dist2(e.touches);
      var r = container.getBoundingClientRect();
      originX = (e.touches[0].clientX + e.touches[1].clientX) / 2 - r.left;
      originY = (e.touches[0].clientY + e.touches[1].clientY) / 2 - r.top + container.scrollTop;

      // FIX (mobile scroll perf): the blocking (non-passive) touchmove
      // listener for pinch-zoom is attached ONLY while 2 fingers are
      // actually down. For normal single-finger scrolling there is no
      // non-passive touchmove listener on the container at all, so the
      // browser is free to use its fast native scroll path — this was
      // the other cause of scrolling feeling stuck/slow on mobile.
      if (!pinchMoveHandler) {
        pinchMoveHandler = function(ev) {
          if (ev.touches.length === 2) {
            ev.preventDefault();
            var d = dist2(ev.touches);
            scale = Math.min(5, Math.max(1, scale * (d / lastDist)));
            lastDist = d;
            applyZoom();
          }
        };
        container.addEventListener('touchmove', pinchMoveHandler, { passive: false });
      }
    }
  }, { passive: false });

  container.addEventListener('touchend', function(e) {
    if (e.touches.length < 2) {
      lastDist = 0;
      _detachPinchMove();
    }
    if (scale < 1.05) { scale = 1; applyZoom(); }
  }, { passive: true });

  container.addEventListener('touchcancel', function() {
    lastDist = 0;
    _detachPinchMove();
  }, { passive: true });
}

// ── Close PDF viewer ──
function closePDF() {
  var modal = document.getElementById('pdf-modal');
  if (modal) { modal.classList.remove('open'); document.body.style.overflow = ''; }
  var pages = document.getElementById('pdf-pages');
  if (pages) pages.innerHTML = '';
  pages && (pages._lastTap = 0);
  _pdfAB = null; _pdfDoc = null;
  _hideSelBtn();
  var dp = document.getElementById('_dlpanel'); if (dp) dp.remove();
  var sb = document.getElementById('_sel_btn');  if (sb) sb.remove();
}

function closePreview()    {}
function confirmDownload() {}
function _doDownload()     {}
function _showSavePanel()  {}
function _fullPdfDownload(e) { if (e) e.preventDefault(); downloadPDF(); return false; }
function togglePDFMode()   {}
function _downloadFromHeader() { if (_selData) { _downloadSelected(_selData); _hideSelBtn(); } }

document.addEventListener('keydown', function(e) { if (e.key === 'Escape') closePDF(); });
setTimeout(function() {
  var m = document.getElementById('pdf-modal');
  if (m) m.addEventListener('click', function(e) { if (e.target.id === 'pdf-modal') closePDF(); });
}, 500);



// ── Scroll buttons ──
function scrollNewsLeft()  { var r = document.getElementById('news-scroll-row'); if (r) r.scrollBy({ left: -320, behavior: 'smooth' }); }
function scrollNewsRight() { var r = document.getElementById('news-scroll-row'); if (r) r.scrollBy({ left:  320, behavior: 'smooth' }); }

// ═══════════════════════════════════════════════════
//  INIT — single DOMContentLoaded
// ═══════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', function () {
  updateAuthUI();
  initNav();
  initTicker();
  initQuotes();
  initOwnerPickers();
  loadAndRender();
  setupRealtime();
  if (typeof fetchYouTubeVideos === 'function') fetchYouTubeVideos();
  watchReveal();
});
