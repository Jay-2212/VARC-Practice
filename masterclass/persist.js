(function(){
  var K="jayVarcMasterclass.v1",st={};
  try{st=JSON.parse(localStorage.getItem(K)||"{}")}catch(e){st={}}
  st.quiz=st.quiz||{};st.ticks=st.ticks||{};st.visited=st.visited||{};
  function save(){try{localStorage.setItem(K,JSON.stringify(st))}catch(e){}}
  var quizzes=[].slice.call(document.querySelectorAll(".x-quiz"));
  quizzes.forEach(function(q,i){
    var id=q.id||("q"+i);
    q.addEventListener("click",function(e){var o=e.target.closest(".x-opt");
      if(o){setTimeout(function(){if(q.classList.contains("is-answered")&&o.getAttribute("aria-pressed")==="true"){st.quiz[id]=o.getAttribute("data-key");save();}},0);}
      if(e.target.closest(".x-reset")){delete st.quiz[id];save();}
    });
    var k=st.quiz[id];
    if(k){var o=q.querySelector('.x-opt[data-key="'+k+'"]');if(o)o.click();}
  });
  var ticks=[].slice.call(document.querySelectorAll(".x-tick"));
  ticks.forEach(function(b,i){
    if(st.ticks[i]&&b.getAttribute("aria-pressed")!=="true")b.click();
    b.addEventListener("click",function(){setTimeout(function(){st.ticks[i]=b.getAttribute("aria-pressed")==="true";save();},0)});
  });
  [].slice.call(document.querySelectorAll(".x-tick-reset")).forEach(function(c){c.addEventListener("click",function(){st.ticks={};save();})});
  function cur(){var s=[].slice.call(document.querySelectorAll(".x-screen")).filter(function(x){return !x.hidden})[0];return s&&s.id;}
  function track(){var id=cur();if(id){st.last=id;st.visited[id]=1;save();}}
  window.addEventListener("hashchange",function(){setTimeout(track,50)});
  var sy;window.addEventListener("scroll",function(){clearTimeout(sy);sy=setTimeout(function(){var id=cur();if(id){st.scroll=st.scroll||{};st.scroll[id]=window.scrollY;save();}},300)},{passive:true});
  var fresh=!location.hash||location.hash==="#welcome";
  if(fresh&&st.last&&st.last!=="welcome"){
    var t=document.getElementById(st.last),name=t&&(t.querySelector("h1,h2")||{}).textContent||st.last;
    var bar=document.createElement("div");
    bar.setAttribute("style","position:fixed;left:12px;right:12px;bottom:12px;z-index:9999;background:#111;color:#fff;padding:12px 14px;border-radius:12px;display:flex;gap:10px;align-items:center;box-shadow:0 6px 24px rgba(0,0,0,.3);font:15px/1.3 system-ui,sans-serif");
    var n=Object.keys(st.visited).length,a=Object.keys(st.quiz).length;
    bar.innerHTML='<span style="flex:1">Welcome back, Jay. '+n+' screens visited, '+a+' questions answered.</span>';
    var r=document.createElement("button");r.textContent="Resume";r.setAttribute("style","background:#fff;color:#111;border:0;border-radius:8px;padding:8px 12px;font-weight:600");
    var x=document.createElement("button");x.textContent="\u00d7";x.setAttribute("style","background:none;color:#fff;border:0;font-size:20px");
    r.onclick=function(){var y=(st.scroll||{})[st.last]||0;location.hash="#"+st.last;setTimeout(function(){window.scrollTo(0,y)},120);bar.remove();};
    x.onclick=function(){bar.remove()};bar.appendChild(r);bar.appendChild(x);document.body.appendChild(bar);
  }
  track();
})();
