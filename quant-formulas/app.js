(function(){
const SECTIONS=[
 {id:'arithmetic',title:'Arithmetic',blurb:'Ratio, mixtures, averages, profit and loss, interest, TSD, work'},
 {id:'algebra',title:'Algebra',blurb:'Equations, inequalities, progressions, logs and indices'},
 {id:'geometry',title:'Geometry & Mensuration',blurb:'Coordinates, triangles, circles, polygons, areas and volumes'},
 {id:'numbers',title:'Number System',blurb:'Factors, divisibility, cyclicity, remainders'},
 {id:'modern',title:'Modern Math',blurb:'Sets, permutations and combinations, probability'}
];
const CH=(window.QF_DATA||[]).slice().sort((a,b)=>(a.order||0)-(b.order||0));
const byId={};CH.forEach(c=>byId[c.id]=c);
const app=document.getElementById('app'),crumbs=document.getElementById('crumbs'),q=document.getElementById('q');
const KEY='qf-revised-v1';
const revised=()=>{try{return JSON.parse(localStorage.getItem(KEY))||{}}catch(e){return {}}};
const setRev=(id,v)=>{const r=revised();if(v)r[id]=Date.now();else delete r[id];try{localStorage.setItem(KEY,JSON.stringify(r))}catch(e){}};
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function km(tex,display){try{return katex.renderToString(tex,{displayMode:!!display,throwOnError:false,strict:false})}catch(e){return esc(tex)}}
function rich(s){ // text with $inline$ math; supports **bold**
  if(!s)return '';const parts=String(s).split(/(\$[^$]+\$)/g);
  return parts.map(p=>p.length>1&&p[0]==='$'&&p[p.length-1]==='$'?km(p.slice(1,-1),false):esc(p).replace(/\*\*([^*]+)\*\*/g,'<b>$1</b>').replace(/\n/g,'<br>')).join('');}
const count=c=>c.blocks.reduce((a,b)=>a+b.items.length,0);
const sec=id=>SECTIONS.find(s=>s.id===id);
const chaps=id=>CH.filter(c=>c.section===id);
function setCrumbs(list){crumbs.innerHTML=list.map((x,i)=>i<list.length-1?`<a href="${x[1]}">${esc(x[0])}</a> › `:`<span>${esc(x[0])}</span>`).join('');}

function home(){
  setCrumbs([]);const r=revised();
  app.innerHTML=`<h1>Quant formula revision</h1><p class="lead">Pick a section, then a chapter. Every formula is grouped and explained so you can revise a topic top to bottom.</p><div class="grid">`+
  SECTIONS.map(s=>{const cs=chaps(s.id);const done=cs.filter(c=>r[c.id]).length;const n=cs.reduce((a,c)=>a+count(c),0);
   return `<a class="tile" href="#/${s.id}"><h2>${esc(s.title)}</h2><p>${esc(s.blurb)}</p><div class="meta">${cs.length} chapters · ${n} entries · ${done}/${cs.length} revised</div><div class="bar"><i style="width:${cs.length?done/cs.length*100:0}%"></i></div></a>`}).join('')+`</div>`;
}
function section(id){
  const s=sec(id);if(!s)return home();const r=revised();
  setCrumbs([['Home','#/'],[s.title]]);
  app.innerHTML=`<h1>${esc(s.title)}</h1><p class="lead">${esc(s.blurb)}</p>`+
   chaps(id).map((c,i)=>`<a class="chap" href="#/${id}/${c.id}"><span class="n">${i+1}</span><span class="t"><b>${esc(c.title)}</b><small>${c.blocks.length} topics · ${count(c)} entries</small></span>${r[c.id]?'<span class="ok">✓ Revised</span>':''}</a>`).join('');
}
function item(it){
  const add=it.added?'<span class="badge">Added</span>':'';
  if(it.type==='table'){
    return `<div class="item table">${it.name?`<div class="nm">${rich(it.name)}${add}</div>`:''}<div class="tbl"><table><thead><tr>${(it.headers||[]).map(h=>`<th>${rich(h)}</th>`).join('')}</tr></thead><tbody>${(it.rows||[]).map(r=>`<tr>${r.map(c=>`<td>${rich(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>${it.note?`<div class="note">${rich(it.note)}</div>`:''}</div>`;}
  const t=it.type||'point';
  return `<div class="item ${t}">${it.name?`<div class="nm">${rich(it.name)}${add}</div>`:''}${it.tex?`<div class="tex">${km(it.tex,true)}</div>`:''}${it.text?`<div>${rich(it.text)}${!it.name?add:''}</div>`:''}${it.note?`<div class="note">${rich(it.note)}</div>`:''}${it.example?`<div class="note"><i>e.g.</i> ${rich(it.example)}</div>`:''}</div>`;
}
function chapter(sid,cid){
  const c=byId[cid];if(!c)return section(sid);const s=sec(c.section);
  setCrumbs([['Home','#/'],[s.title,'#/'+s.id],[c.title]]);
  const list=chaps(c.section),i=list.indexOf(c),prev=list[i-1],next=list[i+1];const done=!!revised()[c.id];
  app.innerHTML=`<h1>${esc(c.title)}</h1>${c.intro?`<p class="lead">${rich(c.intro)}</p>`:''}
  <div class="toc">${c.blocks.map((b,j)=>`<a href="#" data-j="${j}">${esc(b.heading)}</a>`).join('')}</div>
  ${c.blocks.map((b,j)=>`<section class="block" id="b${j}"><h2>${rich(b.heading)}</h2>${b.items.map(item).join('')}</section>`).join('')}
  <div class="actions">${prev?`<a class="btn" href="#/${sid}/${prev.id}">← ${esc(prev.title)}</a>`:'<span></span>'}
  <button class="btn ${done?'done':'primary'}" id="mark">${done?'✓ Revised':'Mark as revised'}</button>
  ${next?`<a class="btn" href="#/${sid}/${next.id}">${esc(next.title)} →</a>`:`<a class="btn" href="#/${sid}">Back to ${esc(s.title)}</a>`}</div>`;
  app.querySelectorAll('.toc a').forEach(a=>a.onclick=e=>{e.preventDefault();document.getElementById('b'+a.dataset.j).scrollIntoView({behavior:'smooth'})});
  document.getElementById('mark').onclick=()=>{setRev(c.id,!revised()[c.id]);chapter(sid,cid)};
}
function plain(it){return [it.name,it.text,it.note,it.tex,it.example,(it.headers||[]).join(' '),(it.rows||[]).map(r=>r.join(' ')).join(' ')].join(' ').toLowerCase()}
function search(term){
  term=term.trim().toLowerCase();if(!term){route();return}
  setCrumbs([['Home','#/'],['Search']]);const words=term.split(/\s+/);const hits=[];
  CH.forEach(c=>c.blocks.forEach(b=>b.items.forEach(it=>{const p=plain(it)+' '+b.heading.toLowerCase()+' '+c.title.toLowerCase();if(words.every(w=>p.includes(w)))hits.push({c,b,it})})));
  app.innerHTML=`<h1>Search</h1><p class="lead">${hits.length} match${hits.length===1?'':'es'} for “${esc(term)}”</p>`+
   (hits.slice(0,60).map(h=>`<div><small style="color:var(--mute)"><a href="#/${h.c.section}/${h.c.id}">${esc(h.c.title)}</a> › ${esc(h.b.heading)}</small>${item(h.it)}</div>`).join('')||'<p class="empty">Nothing found. Try a shorter word.</p>');
}
let t;q.addEventListener('input',()=>{clearTimeout(t);t=setTimeout(()=>search(q.value),180)});
function route(){
  const p=location.hash.replace(/^#\/?/,'').split('/').filter(Boolean);
  if(p.length===0)home();else if(p.length===1)section(p[0]);else chapter(p[0],p[1]);
  window.scrollTo(0,0);
}
window.addEventListener('hashchange',()=>{q.value='';route()});
route();
})();
