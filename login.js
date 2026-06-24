// ═══════════════════════════════════════════════════
// कर्तृत्ववान शेतकरी  —  login.js  (Updated v3)
// EmailJS — User + Admin ला email, FIXED
// ═══════════════════════════════════════════════════

// ── EMAILJS CONFIG ──
const EJ_PUBLIC_KEY     = 'PQZ8-cpqNCQY88aoe';   // emailjs.com वरून
const EJ_SERVICE_ID     = 'service_3mwcpmt';            // service_xxxxxxx
const EJ_USER_TEMPLATE  = 'template_nsz9w6n';     // user ला email
const EJ_ADMIN_TEMPLATE = 'template_nsz9w6n';    // admin ला notification
const ADMIN_EMAIL       = 'harilokhande2011988@gmail.com';


// var EJ_PUBLIC_KEY     = 'PQZ8-cpqNCQY88aoe';
// var EJ_SERVICE_ID     = 'service_3mwcpmt';
// var EJ_USER_TEMPLATE  = 'template_nsz9w6n';
// var EJ_ADMIN_TEMPLATE = 'template_nsz9w6n';
// var ADMIN_EMAIL       = 'harilokhande2011988@gmail.com';
// var OWNER_EMAIL       = 'harilokhande2011988@gmail.com';  for using example this is not part of this project

// OWNER email (यांना login वर special access मिळतो)
const OWNER_EMAIL = 'harilokhande2011988@gmail.com';

function isEJConfigured() {
  return EJ_PUBLIC_KEY !== 'YOUR_EMAILJS_PUBLIC_KEY' && EJ_SERVICE_ID !== 'YOUR_SERVICE_ID';
}

// Already logged in → home वर redirect
window.addEventListener('DOMContentLoaded', () => {
  if (localStorage.getItem('ks_user_email')) {
    window.location.href = 'index.html';
    return;
  }
  updateLoginDate();
  // EmailJS init (configured असल्यास)
  if (isEJConfigured() && typeof emailjs !== 'undefined') {
    emailjs.init(EJ_PUBLIC_KEY);
  }
});

function updateLoginDate() {
  const MM = ['जानेवारी','फेब्रुवारी','मार्च','एप्रिल','मे','जून','जुलै','ऑगस्ट','सप्टेंबर','ऑक्टोबर','नोव्हेंबर','डिसेंबर'];
  const DD = ['रविवार','सोमवार','मंगळवार','बुधवार','गुरुवार','शुक्रवार','शनिवार'];
  const now = new Date();
  const el = document.getElementById('login-date');
  if (el) el.textContent = `${DD[now.getDay()]}, ${now.getDate()} ${MM[now.getMonth()]} ${now.getFullYear()}`;
}

function validEmail(e) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e); }

const form = document.getElementById('login-form');
const msg  = document.getElementById('login-msg');
const btn  = document.getElementById('login-btn');

if (form) {
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const email = document.getElementById('login-email').value.trim();
    if (!email) { showMsg('❌ कृपया Email Address टाका.', 'error'); return; }
    if (!validEmail(email)) { showMsg('❌ Email Address योग्य नाही. उदा: name@gmail.com', 'error'); return; }

    btn.disabled = true;
    btn.textContent = '⏳ पाठवत आहे...';

    const userName  = email.split('@')[0];
    const loginTime = new Date().toLocaleString('mr-IN');
    const siteUrl   = window.location.origin;
    const isOwner   = email.toLowerCase() === OWNER_EMAIL.toLowerCase();

    if (isEJConfigured() && typeof emailjs !== 'undefined') {
      try {
        // 1. User ला email पाठवा
        await emailjs.send(EJ_SERVICE_ID, EJ_USER_TEMPLATE, {
          to_email:   email,
          to_name:    userName,
          user_email: email,
          user_name:  userName,
          login_time: loginTime,
          site_url:   siteUrl,
          is_owner:   isOwner ? 'हो (Owner)' : 'नाही',
        });

        // 2. Admin ला notification
        if (email.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
          await emailjs.send(EJ_SERVICE_ID, EJ_ADMIN_TEMPLATE, {
            to_email:   ADMIN_EMAIL,
            user_email: email,
            user_name:  userName,
            login_time: loginTime,
            site_url:   siteUrl,
          });
        }

        localStorage.setItem('ks_user_email', email);
        localStorage.setItem('ks_user_name', userName);

        btn.textContent = '✅ Email पाठवले!';
        showMsg(
          `✅ <strong>${email}</strong> वर confirmation email पाठवण्यात आले!<br>
           📧 Inbox आणि Spam folder तपासा.<br>
           ${isOwner ? '<strong style="color:#0f6b28">🔐 Owner Account — विशेष access मिळेल.</strong><br>' : ''}
           <small>काही सेकंदात redirect होईल...</small>`,
          'success'
        );
        showConfetti();
        setTimeout(() => window.location.href = 'index.html', 3000);

      } catch (err) {
        console.error('EmailJS Error:', err);
        btn.disabled = false;
        btn.textContent = '🚀 Login करा';
        showMsg(`❌ Email error: ${err.text || err.message || 'Unknown error'}<br><small>EmailJS credentials तपासा.</small>`, 'error');
      }

    } else {
      // DEMO MODE
      await new Promise(r => setTimeout(r, 1600));
      localStorage.setItem('ks_user_email', email);
      localStorage.setItem('ks_user_name', userName);
      btn.textContent = '✅ यशस्वी!';
      showMsg(
        `✅ <strong>${email}</strong> — Login यशस्वी!<br>
         📌 <em>Demo Mode:</em> खरे email साठी EmailJS setup करा.<br>
         ${isOwner ? '<strong style="color:#0f6b28">🔐 Owner access मिळेल — अंक add/delete करता येतील.</strong><br>' : ''}
         <small>काही सेकंदात redirect होईल...</small>`,
        'success'
      );
      showConfetti();
      setTimeout(() => window.location.href = 'index.html', 3000);
    }
  });
}

function showMsg(html, type) {
  if (!msg) return;
  msg.innerHTML = html;
  msg.className = `form-msg ${type}`;
  msg.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function showConfetti() {
  const colors = ['#0f6b28','#e07b1a','#c9940f','#3dbe5e','#fff'];
  for (let i = 0; i < 70; i++) {
    const d = document.createElement('div');
    const sz = 5 + Math.random() * 9;
    d.style.cssText = `position:fixed;width:${sz}px;height:${sz}px;background:${colors[Math.floor(Math.random()*colors.length)]};border-radius:${Math.random()>.5?'50%':'3px'};top:-20px;left:${Math.random()*100}vw;z-index:9999;pointer-events:none;animation:cf ${1.5+Math.random()*2}s ease-in forwards;animation-delay:${Math.random()*.6}s;`;
    document.body.appendChild(d);
    setTimeout(() => d.remove(), 3800);
  }
  if (!document.getElementById('cf-css')) {
    const s = document.createElement('style'); s.id='cf-css';
    s.textContent = '@keyframes cf{to{top:110vh;transform:rotate(720deg) translateX(100px);opacity:0}}';
    document.head.appendChild(s);
  }
}
