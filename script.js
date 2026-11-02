/* =====================================================================
   Ojas Shirode — Portfolio  |  script.js  (UI behaviour)
   Live data (Firebase + Supabase) lives in data.js
   ===================================================================== */
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const root=document.documentElement;

/* ---- icon helper (shared with data.js) ---- */
const I=(id,cls)=>'<svg class="'+(cls||'ic')+'"><use href="#'+id+'"/></svg>';
window.I=I;

/* ---- technology logos (Devicon library) ---- */
const DEV='https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/';
const LOGO={Java:'java',Python:'python',JavaScript:'javascript',C:'c','C++':'cplusplus',SQL:'mysql',HTML5:'html5',CSS3:'css3',Firebase:'firebase',MongoDB:'mongodb',Git:'git',GitHub:'github','VS Code':'vscode',Supabase:'supabase'};
const logo=(name)=>{
  const k=LOGO[name];if(!k)return '';
  const dark=(k==='github')?' inv':'';
  return '<img class="ti'+dark+'" src="'+DEV+k+'/'+k+'-original.svg" alt="" loading="lazy" onerror="if(!this.dataset.f){this.dataset.f=1;this.src=this.src.replace(\'-original\',\'-plain\')}else{this.remove()}">';
};
const pill=n=>'<span>'+logo(n)+n+'</span>';

/* orbit icons */
const orb=(list,xy)=>list.map((n,i)=>'<span style="--x:'+xy[i][0]+';--y:'+xy[i][1]+'" title="'+n+'"><em>'+logo(n)+'</em></span>').join('');
$('#orbit1').innerHTML=orb(['Firebase','JavaScript','Java','Python'],[['50%','0%'],['100%','50%'],['50%','100%'],['0%','50%']]);
$('#orbit2').innerHTML=orb(['HTML5','Git'],[['15%','15%'],['85%','85%']]);

/* skills */
const SKILLS=[
  ['i-code','Languages',['Java','Python','JavaScript','C','C++','SQL']],
  ['i-globe','Web & Databases',['HTML5','CSS3','Firebase','MongoDB','Supabase']],
  ['i-tool','Tools & Platforms',['Git','GitHub','VS Code','EmailJS']],
  ['i-cpu','Core Concepts',['DSA','OOP','CRUD','SDLC','Agile']]
];
$('#skills-grid').innerHTML=SKILLS.map((g,i)=>'<div class="card skill-card rv d'+i+' spot"><h3 class="ico-title">'+I(g[0])+g[1]+'</h3><div class="pills">'+g[2].map(pill).join('')+'</div></div>').join('');
$('#exploring').innerHTML=['Firebase','REST APIs','DSA','Agentic AI'].map(pill).join('');

/* marquee */
const techs=['Java','Python','JavaScript','Firebase','Supabase','HTML5','CSS3','MongoDB','Git','GitHub','C++','SQL'];
const mq=techs.map(t=>'<span>'+logo(t)+t+'</span>').join('');
$('#mq').innerHTML=mq+mq;

/* ---- hero name: letter animation (re-used when Firebase changes the name) ----
   [LIGHT FIX] the lightness comes from the CSS variable --nl, so the gradient
   letters automatically get darker in light mode (66% dark / 36% light). */
function renderName(lines,delay0){
  $$('#name .line').forEach((l,li)=>{
    const t=lines[li]||'';l.dataset.t=t;l.textContent='';
    [...t].forEach((c,i)=>{
      const s=document.createElement('span');s.className='ch';s.textContent=c===' '?' ':c;
      s.style.animationDelay=(delay0+li*.25+i*.045)+'s';
      if(l.dataset.color){
        const n=t.length,k=n>1?i/(n-1):0,h=k<.5?265-(75*k*2):190+(140*(k-.5)*2);
        s.style.color='hsl('+h+' 90% var(--nl))';
      }
      l.appendChild(s);
    });
  });
}
renderName(['OJAS','SHIRODE'],1.5);
window.renderName=renderName;

/* ---- profile photo ---- */
const photo=$('#profile-photo'),initEl=$('#init');
window.showPhoto=url=>{
  photo.onload=()=>{photo.hidden=false;initEl.classList.remove('show')};
  photo.onerror=()=>{photo.hidden=true;initEl.classList.add('show')};
  photo.src=url;
};
window.showInitials=()=>{if(photo.hidden)initEl.classList.add('show')};
setTimeout(()=>{if(photo.hidden)initEl.classList.add('show')},6000);

/* ---- loader ---- */
/* intro: monogram draws itself, boot lines cycle, then the screen splits open */
(function(){
  const L=$('#loader'),txt=$('#ldtxt'),bar=$('#ldb');
  const steps=['booting portfolio','connecting firebase','syncing supabase','loading projects','ready'];
  let i=0,finished=false;
  const finish=()=>{if(finished)return;finished=true;L.classList.add('done');setTimeout(()=>L.remove(),2400)};
  (function next(){
    txt.textContent=steps[i];bar.style.width=((i+1)/steps.length*100)+'%';
    if(i<steps.length-1){i++;setTimeout(next,520)}else setTimeout(finish,650);
  })();
  setTimeout(finish,5000); // safety net
})();

/* ---- toast + "no live demo" ---- */
let toastT;
window.toast=msg=>{const t=$('#toast');t.textContent=msg;t.classList.add('show');clearTimeout(toastT);toastT=setTimeout(()=>t.classList.remove('show'),2400)};
document.addEventListener('click',e=>{
  const b=e.target.closest&&e.target.closest('[data-nolive]');
  if(b)window.toast('No Live Demo Available For '+(b.dataset.nolive||'This Project')+' Yet');
});

/* ---- theme ---- */
const tb=$('#theme');
const sync=()=>tb.innerHTML=I(root.dataset.theme==='dark'?'i-moon':'i-sun');sync();
tb.onclick=()=>{root.dataset.theme=root.dataset.theme==='dark'?'light':'dark';try{localStorage.setItem('theme',root.dataset.theme)}catch(e){};sync()};

/* ---- menu ---- */
const links=$('#links'),burger=$('#burger');
const setMenu=o=>{links.classList.toggle('open',o);burger.innerHTML=I(o?'i-x':'i-menu')};
burger.onclick=()=>setMenu(!links.classList.contains('open'));
$$('#links a').forEach(a=>a.onclick=()=>setMenu(false));
addEventListener('resize',()=>{if(innerWidth>960)setMenu(false)});

/* ---- typing ---- */
const words=['Full-Stack Developer','Computer Engineering Student','Firebase & REST API Builder','DSA Enthusiast'];
window.__words=words;
let wi=0,ci=0,del=false;const ty=$('#typed');
(function type(){const w=words[wi];ty.textContent=w.slice(0,ci);
  if(!del&&ci===w.length){del=true;return setTimeout(type,1600)}
  if(del&&ci===0){del=false;wi=(wi+1)%words.length}
  ci+=del?-1:1;setTimeout(type,del?40:85)})();

/* ---- scroll: progress, active link, back-to-top ---- */
const secs=$$('section'),navA=$$('#links a');
addEventListener('scroll',()=>{
  const h=root;$('#bar').style.width=(h.scrollTop/(h.scrollHeight-h.clientHeight)*100)+'%';
  let cur=secs[0].id;secs.forEach(s=>{if(scrollY>=s.offsetTop-240)cur=s.id});
  navA.forEach(a=>a.classList.toggle('active',a.getAttribute('href')==='#'+cur));
  $('#top').classList.toggle('show',scrollY>700);
},{passive:true});
$('#top').onclick=()=>scrollTo({top:0,behavior:'smooth'});

/* ---- counters + reveal ---- */
function countUp(el){
  const t=parseFloat(el.dataset.count);if(isNaN(t))return;
  const dec=String(el.dataset.count).includes('.')?2:0,suf=el.dataset.suffix||'';
  const t0=performance.now(),dur=1100;
  (function tick(now){const k=Math.min((now-t0)/dur,1),v=t*(1-Math.pow(1-k,3));
    el.textContent=v.toFixed(dec)+suf;if(k<1)requestAnimationFrame(tick)})(t0);
}
window.countUp=countUp;
const io=new IntersectionObserver(es=>es.forEach(e=>{
  if(!e.isIntersecting)return;const el=e.target;el.classList.add('in');
  el.querySelectorAll('[data-count]').forEach(countUp);
  io.unobserve(el);
}),{threshold:.1});
$$('.rv').forEach(el=>io.observe(el));
window.__io=io;

/* ---- spotlight cards (delegated so dynamic cards work too) ---- */
document.addEventListener('pointermove',e=>{
  const c=e.target.closest&&e.target.closest('.spot');if(!c)return;
  const r=c.getBoundingClientRect();c.style.setProperty('--mx',(e.clientX-r.left)+'px');c.style.setProperty('--my',(e.clientY-r.top)+'px');
},{passive:true});

/* ---- resume modal ---- */
let resumeUrl='resume.pdf';
window.setResumeUrl=u=>{resumeUrl=u};
function openResume(e){
  e&&e.preventDefault();
  $('#resume-iframe').src=resumeUrl;$('#resume-dl').href=resumeUrl;
  $('#resume-modal').classList.add('open');document.body.style.overflow='hidden';
}
function closeResume(){$('#resume-modal').classList.remove('open');document.body.style.overflow='';$('#resume-iframe').src='about:blank'}
$('#resume-btn').onclick=openResume;$('#resume-btn2').onclick=openResume;
$('#resume-close').onclick=closeResume;
$('#resume-modal').addEventListener('click',e=>{if(e.target.id==='resume-modal')closeResume()});

/* ---- certificate lightbox ---- */
window.openCert=(url,name,issuer)=>{
  $('#lb-img').src=url;$('#lb-name').textContent=name||'';$('#lb-issuer').textContent=issuer||'';
  $('#lb').classList.add('open');document.body.style.overflow='hidden';
};
function closeCert(){$('#lb').classList.remove('open');document.body.style.overflow=''}
$('#lb-close').onclick=closeCert;
$('#lb').addEventListener('click',e=>{if(e.target.id==='lb')closeCert()});
addEventListener('keydown',e=>{if(e.key==='Escape'){closeResume();closeCert()}});

/* ---- contact form -> opens email app (no backend) ---- */
window.__email='oshirode07@gmail.com';
$('#form').addEventListener('submit',e=>{
  e.preventDefault();
  const n=$('#n').value,em=$('#e').value,m=$('#m').value;
  location.href='mailto:'+window.__email+'?subject='+encodeURIComponent('Portfolio message from '+n)+'&body='+encodeURIComponent(m+'\n\n— '+n+' ('+em+')');
});

/* ---- particle network background ---- */
(function(){
  const cv=$('#net'),cx=cv.getContext('2d');let W,H,P=[],mx=-999,my=-999;
  const rs=()=>{W=cv.width=innerWidth;H=cv.height=innerHeight;P=Array.from({length:Math.min(80,Math.floor(W/18))},()=>({x:Math.random()*W,y:Math.random()*H,vx:(Math.random()-.5)*.45,vy:(Math.random()-.5)*.45}))};
  rs();addEventListener('resize',rs);addEventListener('orientationchange',()=>setTimeout(rs,300));
  addEventListener('pointermove',e=>{mx=e.clientX;my=e.clientY},{passive:true});
  (function draw(){
    cx.clearRect(0,0,W,H);
    /* [LIGHT FIX] darker, more opaque particles on the light background */
    const dark=root.dataset.theme==='dark';
    const col=dark?'160,150,255':'70,40,190',a=dark?.85:.55,la=dark?.2:.16;
    P.forEach((p,i)=>{
      const dx=p.x-mx,dy=p.y-my,dm=Math.hypot(dx,dy);if(dm<140&&dm>0){p.x+=dx/dm*1.2;p.y+=dy/dm*1.2}
      p.x+=p.vx;p.y+=p.vy;if(p.x<0||p.x>W)p.vx*=-1;if(p.y<0||p.y>H)p.vy*=-1;
      cx.beginPath();cx.arc(p.x,p.y,1.7,0,6.3);cx.fillStyle='rgba('+col+','+a+')';cx.fill();
      for(let j=i+1;j<P.length;j++){const q=P[j],d=Math.hypot(p.x-q.x,p.y-q.y);
        if(d<125){cx.beginPath();cx.moveTo(p.x,p.y);cx.lineTo(q.x,q.y);cx.strokeStyle='rgba('+col+','+(la*(1-d/125))+')';cx.stroke()}}
    });
    requestAnimationFrame(draw);
  })();
})();

/* ---- right-click disabled across the whole site ---- */
document.addEventListener('contextmenu',e=>e.preventDefault());
document.addEventListener('dragstart',e=>{if(e.target.tagName==='IMG')e.preventDefault()});