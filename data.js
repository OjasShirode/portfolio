/* =====================================================================
   Ojas Shirode — Portfolio  |  data.js  (ES module)
   LIVE DATA — Firebase Realtime Database + Supabase
     Firebase  /profile                 -> name, role, location, email
     Supabase  profile_extra (id = 1)   -> cgpa, photo_url, quote, resume_url
     Supabase  projects / certifications / achievements
   If a service is unreachable the static content in index.html stays visible.
   ===================================================================== */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const firebaseConfig = {
  apiKey: "AIzaSyBMxLnqxh-2QOi52NXW0lQEl9S7tjJ0GMc",
  authDomain: "portfolio-ac324.firebaseapp.com",
  databaseURL: "https://portfolio-ac324-default-rtdb.firebaseio.com",
  projectId: "portfolio-ac324",
  storageBucket: "portfolio-ac324.firebasestorage.app",
  messagingSenderId: "670796194875",
  appId: "1:670796194875:web:44801a9c2df57016d6281e",
  measurementId: "G-SB9MQR0G6S"
};
const SUPABASE_URL = "https://qktmpcjxzlqshxcfkdju.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_r-Ouw-UY2tazAh3RPFrPAg_K125hJ-D";

const GITHUB_PROFILE = "https://github.com/OjasShirode";

let db=null, supabase=null;
try{ db=getDatabase(initializeApp(firebaseConfig)); }catch(e){ console.warn('Firebase unavailable — static content shown.'); }
try{ supabase=createClient(SUPABASE_URL,SUPABASE_ANON_KEY); }catch(e){ console.warn('Supabase unavailable — static content shown.'); }

const $=id=>document.getElementById(id);
const I=window.I;
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const safeUrl=u=>{try{const x=new URL(String(u||'').trim());return /^https?:$/.test(x.protocol)?x.href:''}catch(e){return ''}};
/* A real external live-demo link only: must be absolute http(s), and must not point back at this portfolio or be a placeholder */
const realLive=u=>{
  const raw=String(u||'').trim();
  if(!raw||/^(#|\/|\.|null|none|n\/a|na|nil|undefined|-|tbd|coming soon|no live demo|not available)/i.test(raw)) return '';
  const h=safeUrl(raw); if(!h) return '';
  const x=new URL(h), here=location;
  if(x.origin===here.origin && x.pathname.replace(/\/$/,'')===here.pathname.replace(/\/$/,'')) return '';
  if(/^(localhost|127\.0\.0\.1)$/.test(x.hostname) && here.hostname!==x.hostname) return '';
  return h;
};
const safeColor=c=>/^#[0-9a-f]{3,8}$/i.test(c||'')?c:'';
const observe=el=>window.__io&&window.__io.observe(el);
const empty=(c,msg)=>{c.innerHTML='<div class="empty">'+(msg||'No records found')+'</div>'};
const setCount=(id,n)=>{const el=$(id);if(!el)return;el.dataset.count=n;window.countUp(el)};

/* ---------- Firebase: profile ---------- */
async function loadProfile(){
  if(!db) return;
  try{
    const snap=await get(ref(db,'profile'));
    if(!snap.exists()) return;
    const p=snap.val();
    if(p.name){
      const parts=String(p.name).trim().split(/\s+/),first=parts.shift()||'',rest=parts.join(' ');
      window.renderName([first.toUpperCase(),rest.toUpperCase()],.2);
    }
    if(p.role) window.__words[0]=String(p.role);
    if(p.location){const l=$('about-location');if(l)l.textContent=p.location}
    if(p.email){
      window.__email=p.email;
      const b=$('contact-email-btn');if(b)b.href='mailto:'+p.email;
      const l=$('contact-email-link');if(l)l.href='mailto:'+p.email;
      const t=$('contact-email-text');if(t)t.textContent=p.email;
    }
    // phone number is intentionally not displayed (hackathon rule: no sensitive personal info)
  }catch(err){ console.warn('Firebase profile skipped:',err.message); }
}

/* ---------- Supabase: profile_extra ---------- */
async function loadProfileExtra(){
  if(!supabase){ window.showInitials(); return; }
  try{
    const {data,error}=await supabase.from('profile_extra').select('*').eq('id',1).single();
    if(error||!data){ window.showInitials(); return; }
    if(data.cgpa){
      const c=$('stat-cgpa');if(c){c.dataset.count=parseFloat(data.cgpa)||9.36;window.countUp(c)}
      const e=$('edu-cgpa');if(e)e.textContent='CGPA '+data.cgpa;
    }
    const ph=safeUrl(data.photo_url);
    if(ph) window.showPhoto(ph); else window.showInitials();
    if(data.quote){const q=$('hero-quote');if(q)q.textContent='"'+data.quote+'"'}
    if(data.resume_url){const u=safeUrl(data.resume_url);if(u)window.setResumeUrl(u)}
  }catch(err){ console.warn('Supabase profile_extra skipped:',err.message); window.showInitials(); }
}

/* ---------- Supabase: projects ---------- */
async function loadProjects(){
  const box=$('projects-container');
  if(!box) return;
  if(!supabase){ empty(box); return; }
  try{
    const {data,error}=await supabase.from('projects').select('*').order('sort_order',{ascending:true});
    if(error||!data||!data.length){ empty(box); setCount('stat-projects',0); return; }
    box.innerHTML='';
    data.forEach((pr,i)=>{
      const card=document.createElement('article');
      card.className='card pcard rv spot d'+(i%3+1);
      const tc=safeColor(pr.color); if(tc) card.style.setProperty('--tc',tc);
      const chips=(Array.isArray(pr.tech_stack)?pr.tech_stack:[]).map(t=>'<span>'+esc(t)+'</span>').join('');
      const num=String(pr.pass_number??i+1).padStart(3,'0');
      const live=realLive(pr.live_url||pr.demo_url||pr.live||pr.live_link||pr.website||'');
      /* Live Demo: opens the link if the project has one, otherwise shows a "No live demo" message.
         GitHub: always opens your GitHub profile. */
      const ghHref=GITHUB_PROFILE;
      const links='<div class="plinks">'+
        (live
          ?'<a class="btn primary sm" href="'+esc(live)+'" target="_blank" rel="noopener">Live Demo '+I('i-ur','ic arr')+'</a>'
          :'<button type="button" class="btn primary sm nolive" data-nolive="'+esc(pr.name)+'">Live Demo '+I('i-ur','ic arr')+'</button>')+
        '<a class="btn sm" href="'+esc(ghHref)+'" target="_blank" rel="noopener">'+I('b-github','bi')+' GitHub</a></div>';
      card.innerHTML='<div class="strip"></div><div class="pbody">'+
        '<div class="peye"><span>PASS <b>#'+num+'</b></span><span class="st">'+esc(pr.status||'Completed')+'</span></div>'+
        '<h3>'+esc(pr.name)+'</h3><p>'+esc(pr.description)+'</p>'+
        '<div class="pills">'+chips+'</div>'+links+'</div>';
      box.appendChild(card);observe(card);
    });
    setCount('stat-projects',data.length);
  }catch(err){ console.warn('Supabase projects skipped:',err.message); empty(box); }
}

/* ---------- Supabase: certifications ---------- */
async function loadCertifications(){
  const box=$('certs-container');
  if(!box) return;
  if(!supabase){ empty(box); return; }
  try{
    const {data,error}=await supabase.from('certifications').select('*').order('sort_order',{ascending:true});
    if(error||!data||!data.length){ empty(box); setCount('stat-certs',0); return; }
    box.innerHTML='';
    data.forEach((c,i)=>{
      const card=document.createElement('div');
      card.className='card ccard rv spot d'+(i%3+1);
      const c1=safeColor(c.color1),c2=safeColor(c.color2);
      if(c1)card.style.setProperty('--cc1',c1);if(c2)card.style.setProperty('--cc2',c2);
      const img=safeUrl(c.image_url);
      card.innerHTML='<div class="banner'+(img?' has':'')+'">'+
        (img?'<img src="'+esc(img)+'" alt="'+esc(c.name)+' certificate" loading="lazy">':'')+
        (img?'<div class="ov">'+I('i-eye')+' View certificate</div>':'')+'</div>'+
        '<div class="cb"><div class="cn">'+esc(c.name)+'</div><div class="ci">'+esc(c.issuer||'Certification')+'</div></div>';
      if(img){card.style.cursor='pointer';card.addEventListener('click',()=>window.openCert(img,c.name,c.issuer))}
      box.appendChild(card);observe(card);
    });
    setCount('stat-certs',data.length);
  }catch(err){ console.warn('Supabase certifications skipped:',err.message); empty(box); }
}

/* ---------- Supabase: achievements ---------- */
async function loadAchievements(){
  const box=$('achievements-container');
  if(!box) return;
  if(!supabase){ empty(box); return; }
  try{
    const {data,error}=await supabase.from('achievements').select('*').order('sort_order',{ascending:true});
    if(error||!data||!data.length){ empty(box); return; }
    box.innerHTML='';
    data.forEach((a,i)=>{
      const card=document.createElement('div');
      card.className='card acard rv spot d'+(i%3+1);
      card.innerHTML='<div class="topbar"></div><div class="an">'+String(i+1).padStart(2,'0')+'</div><h4>'+esc(a.title)+'</h4><p>'+esc(a.subtitle)+'</p>';
      box.appendChild(card);observe(card);
    });
  }catch(err){ console.warn('Supabase achievements skipped:',err.message); empty(box); }
}

loadProfile(); loadProfileExtra(); loadProjects(); loadCertifications(); loadAchievements();