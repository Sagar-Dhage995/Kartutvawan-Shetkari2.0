// ═══════════════════════════════════════════════════
// कर्तृत्ववान शेतकरी  —  youtube.js  v4
// YouTube API + Horizontal Scroll Row
// ═══════════════════════════════════════════════════

const YT_API_KEY    = 'AIzaSyChaay8FKxy9d4LPsQB0mgiYcYB9MxcE20';
const YT_CHANNEL_ID = 'UCIFfq0fE7BKofwGe4wax6Eg';
const YT_MAX        = 18; // fetch 18 videos

let ytAll = [], ytDetailsMap = {};

function isYTReady(){ return YT_API_KEY!=='YOUR_YOUTUBE_API_KEY' && YT_CHANNEL_ID!=='YOUR_CHANNEL_ID'; }

function fmtDur(iso){ if(!iso)return''; const m=iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/); if(!m)return''; const h=parseInt(m[1]||0),mn=parseInt(m[2]||0),s=parseInt(m[3]||0); return h?`${h}:${String(mn).padStart(2,'0')}:${String(s).padStart(2,'0')}`:`${mn}:${String(s).padStart(2,'0')}`; }
function fmtViews(n){ const v=parseInt(n); if(v>=10000000)return`${(v/10000000).toFixed(1)} कोटी`; if(v>=100000)return`${(v/100000).toFixed(1)} लाख`; if(v>=1000)return`${(v/1000).toFixed(1)} हजार`; return`${v}`; }
function fmtDate(iso){ const d=new Date(iso); const M=['जानेवारी','फेब्रुवारी','मार्च','एप्रिल','मे','जून','जुलै','ऑगस्ट','सप्टेंबर','ऑक्टोबर','नोव्हेंबर','डिसेंबर']; return`${d.getDate()} ${M[d.getMonth()]} ${d.getFullYear()}`; }

async function fetchYouTubeVideos(){
  const wrap = document.getElementById('yt-scroll-outer');
  if(!wrap) return;

  if(!isYTReady()){
    loadDemoYT(); return;
  }

  const row = document.getElementById('yt-scroll-row');
  if(row) row.innerHTML=`<div style="padding:3rem 2rem;color:#aaa;white-space:nowrap">⏳ Videos लोड होत आहेत...</div>`;

  try{
    const sr=await fetch(`https://www.googleapis.com/youtube/v3/search?key=${YT_API_KEY}&channelId=${YT_CHANNEL_ID}&part=snippet&order=date&maxResults=${YT_MAX}&type=video`);
    if(!sr.ok)throw new Error(`API ${sr.status}`);
    const sd=await sr.json();
    if(!sd.items?.length){ if(row)row.innerHTML=`<div style="padding:2rem;color:#aaa">❌ Videos नाहीत.</div>`; return; }
    const ids=sd.items.map(i=>i.id.videoId).join(',');
    const dr=await fetch(`https://www.googleapis.com/youtube/v3/videos?key=${YT_API_KEY}&id=${ids}&part=contentDetails,statistics`);
    const dd=await dr.json();
    ytDetailsMap={}; (dd.items||[]).forEach(v=>{ytDetailsMap[v.id]=v;});
    ytAll=sd.items; renderYTScroll();
  }catch(err){
    console.error('YT error:',err);
    loadDemoYT();
  }
}

function loadDemoYT(){
  ytAll=[
    {_d:true,id:'v1',title:'शेती तंत्रज्ञान – ठिबक सिंचन पद्धत',date:'०१ एप्रिल २०२५',views:'२.५ लाख',dur:'8:24',color:'#0f6b28'},
    {_d:true,id:'v2',title:'खरीप हंगाम – सोयाबीन लागवड मार्गदर्शन',date:'०८ एप्रिल २०२५',views:'१.८ लाख',dur:'12:10',color:'#178534'},
    {_d:true,id:'v3',title:'शेतकरी यश कथा – अहमदनगरचे प्रगतशील शेतकरी',date:'१५ एप्रिल २०२५',views:'३.२ लाख',dur:'15:33',color:'#e07b1a'},
    {_d:true,id:'v4',title:'सरकारी योजना – PM किसान योजनेची नवीन माहिती',date:'२२ एप्रिल २०२५',views:'४.१ लाख',dur:'6:45',color:'#052e0f'},
    {_d:true,id:'v5',title:'जैविक शेती – रासायनिक खतांना पर्याय',date:'२९ एप्रिल २०२५',views:'२.० लाख',dur:'10:18',color:'#3dbe5e'},
    {_d:true,id:'v6',title:'पशुपालन – गाय-म्हशींची काळजी',date:'०६ मे २०२५',views:'१.५ लाख',dur:'9:52',color:'#c9940f'},
    {_d:true,id:'v7',title:'पाणी व्यवस्थापन – शेतात नियोजन',date:'१३ मे २०२५',views:'१.२ लाख',dur:'7:30',color:'#178534'},
    {_d:true,id:'v8',title:'फळबाग लागवड – आंबा बागेचे व्यवस्थापन',date:'२० मे २०२५',views:'०.९ लाख',dur:'11:15',color:'#e07b1a'},
    {_d:true,id:'v9',title:'कांदा लागवड – उत्पन्न वाढवण्याचे उपाय',date:'२७ मे २०२५',views:'२.३ लाख',dur:'9:04',color:'#0f6b28'},
    {_d:true,id:'v10',title:'हळद लागवड – शेतकरी यशोगाथा',date:'०३ जून २०२५',views:'१.७ लाख',dur:'13:22',color:'#c9940f'},
    {_d:true,id:'v11',title:'दुग्धव्यवसाय – जास्त दूध उत्पादनाचे रहस्य',date:'१० जून २०२५',views:'३.५ लाख',dur:'8:50',color:'#052e0f'},
    {_d:true,id:'v12',title:'ऊस शेती – सिंचन आणि खत व्यवस्थापन',date:'१७ जून २०२५',views:'२.८ लाख',dur:'14:10',color:'#178534'},
  ];
  renderYTScroll();
}

function renderYTScroll(){
  const row=document.getElementById('yt-scroll-row');
  if(!row)return;
  row.innerHTML='';
  ytAll.forEach((item,i)=>{
    const card=document.createElement('div');
    card.className='yt-card reveal';
    card.style.transitionDelay=`${i*0.04}s`;
    if(item._d){
      const c=item.color;
      card.onclick=()=>window.open(`https://www.youtube.com`,`_blank`);
      card.innerHTML=`<div class="yt-thumb" style="background:${c}"><img src="https://placehold.co/320x180/${c.replace('#','')}/ffffff?text=▶" alt="${item.title}" loading="lazy"><div class="yt-play-btn"><div class="yt-play-icon">▶</div></div><span class="yt-duration">${item.dur}</span></div><div class="yt-body"><p class="yt-title">${item.title}</p><div class="yt-meta"><span>👁 ${item.views}</span><span>📅 ${item.date}</span></div></div>`;
    } else {
      const {snippet}=item; const vid=item.id.videoId;
      const det=ytDetailsMap[vid]; const dur=det?fmtDur(det.contentDetails?.duration):''; const views=det?fmtViews(det.statistics?.viewCount||0):'';
      const th=snippet.thumbnails?.high?.url||snippet.thumbnails?.medium?.url||'';
      card.onclick=()=>window.open(`https://www.youtube.com/watch?v=${vid}`,'_blank');
      card.innerHTML=`<div class="yt-thumb"><img src="${th}" alt="${snippet.title}" loading="lazy"><div class="yt-play-btn"><div class="yt-play-icon">▶</div></div>${dur?`<span class="yt-duration">${dur}</span>`:''}</div><div class="yt-body"><p class="yt-title">${snippet.title}</p><div class="yt-meta">${views?`<span>👁 ${views}</span>`:''}<span>📅 ${fmtDate(snippet.publishedAt)}</span></div></div>`;
    }
    row.appendChild(card);
  });
  window.revealObs && document.querySelectorAll('.yt-card.reveal').forEach(el=>window.revealObs.observe(el));
}

// Scroll arrows
function scrollYTLeft()  { const r=document.getElementById('yt-scroll-row'); if(r)r.scrollBy({left:-340,behavior:'smooth'}); }
function scrollYTRight() { const r=document.getElementById('yt-scroll-row'); if(r)r.scrollBy({left:340,behavior:'smooth'}); }

window.fetchYouTubeVideos = fetchYouTubeVideos;
