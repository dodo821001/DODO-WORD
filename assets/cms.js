(function(){
  const asBool=v=>typeof v==="boolean"?v:!["false","0","off","no",""].includes(String(v??"").trim().toLowerCase());
  const esc=s=>String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));

  function renderStoreCard(s){
    const tags=(s.tags||[]).map(t=>`<span class="tag">${esc(t)}</span>`).join("");
    const phone=s.phone?`<div>☎ ${esc(s.phone)}</div>`:"";
    const map=s.map_url?`<a class="store-map-btn" href="${esc(s.map_url)}" target="_blank" rel="noopener">지도에서 보기 →</a>`:"";
    return `<article class="store-card reveal show">
      <div class="photo"><img src="${esc(s.image||"assets/images/v2-hero.webp")}" alt="${esc(s.name||"")}"></div>
      <div class="body">
        <div class="eyebrow">${esc(s.region||"")}</div>
        <h3>${esc(s.name||"")}</h3>
        <p>${esc(s.desc||"")}</p>
        <div class="store-detail"><div>📍 ${esc(s.address||"")}</div><div>🕒 ${esc(s.hours||"")}</div>${phone}</div>
        <div class="meta">${tags}</div>${map}
      </div>
    </article>`;
  }

  function renderStores(d){
    const items=(d["stores.items"]||[]).filter(x=>asBool(x.visible));
    const all=document.getElementById("storesGrid");
    if(all) all.innerHTML=items.map(renderStoreCard).join("");
    const preview=document.getElementById("storesPreview");
    if(preview) preview.innerHTML=items.slice(0,3).map(renderStoreCard).join("");
  }

  function setCmsImage(el,src){
    if(!src)return;
    el.classList.remove("cms-image-ready");

    const isCms=/^assets\/images\/cms\/[A-Za-z0-9._-]+$/.test(src);
    let attempt=0;
    const retryDelays=[0,900,1800,3500];

    const reveal=()=>{
      requestAnimationFrame(()=>el.classList.add("cms-image-ready"));
    };

    const load=()=>{
      // 첫 요청은 원래 파일 경로 그대로 사용해서 브라우저/CDN 캐시를 살립니다.
      // 새 이미지가 아직 GitHub Pages에 배포되지 않아 실패했을 때만 캐시 우회 재시도합니다.
      const url = attempt===0
        ? src
        : src + (src.includes("?")?"&":"?") + "retry=" + Date.now() + "-" + attempt;

      el.onload=()=>reveal();
      el.onerror=()=>{
        attempt++;
        if(isCms && attempt<retryDelays.length){
          setTimeout(load,retryDelays[attempt]);
        }else{
          reveal();
        }
      };

      el.src=url;
      if(el.complete && el.naturalWidth>0) reveal();
    };

    load();
  }

  function apply(d){
    window.DODO_CURRENT_CONTENT=d||{};
    const root=document.documentElement;

    const vars={
      "theme.primary":"--forest","theme.secondary":"--forest-2","theme.accent":"--gold","theme.paper":"--paper",
      "typography.heading_color":"--heading-color","typography.body_color":"--body-color",
      "typography.muted_color":"--muted-color","typography.nav_color":"--nav-color"
    };
    Object.entries(vars).forEach(([k,v])=>{if(d[k])root.style.setProperty(v,d[k])});

    const sizes={
      "typography.body_size":"--body-size","typography.h1_size":"--h1-size",
      "typography.h2_size":"--h2-size","typography.card_title_size":"--card-title-size"
    };
    Object.entries(sizes).forEach(([k,v])=>{
      if(d[k]!==undefined&&d[k]!=="")root.style.setProperty(v,Number(d[k])+"px")
    });

    document.querySelectorAll("[data-cms]").forEach(el=>{
      const k=el.dataset.cms;
      if(!(k in d))return;
      el.dataset.cmsHtml==="1"?el.innerHTML=d[k]:el.textContent=d[k]??"";
    });

    document.querySelectorAll("[data-cms-href]").forEach(el=>{
      const k=el.dataset.cmsHref;
      if(d[k])el.href=d[k];
    });

    document.querySelectorAll("[data-cms-src]").forEach(el=>{
      const k=el.dataset.cmsSrc;
      if(d[k])setCmsImage(el,d[k]);
    });

    document.querySelectorAll("[data-cms-visible]").forEach(el=>{
      const k=el.dataset.cmsVisible,raw=d[k];
      const show=(k.endsWith("_url")||k.endsWith("_phone")||k.endsWith("_email"))
        ?!!String(raw??"").trim():asBool(raw);
      el.classList.toggle("cms-hidden",!show);
    });

    renderStores(d);
  }

  const fallback=window.DODO_DEFAULT_CONTENT||{};

  // 공개 홈페이지도 GitHub의 최신 content.json을 Worker를 통해 직접 읽습니다.
  // GitHub Pages 배포 지연 때문에 CMS 저장 직후 예전 내용이 보이는 문제를 방지합니다.
  if(location.protocol==="file:"){
    apply(fallback);
  }else{
    fetch("/cms-public/content?_="+Date.now(),{
      method:"GET",
      cache:"no-store",
      credentials:"omit",
      headers:{"Accept":"application/json"}
    })
      .then(async r=>{
        if(!r.ok) throw new Error("public cms api failed");
        const j=await r.json();
        if(!j?.ok || !j?.content) throw new Error(j?.error||"invalid cms response");
        return j.content;
      })
      .then(apply)
      .catch(()=>{
        // Worker 경로가 일시적으로 문제여도 기존 content.json으로 폴백
        fetch("content.json?_="+Date.now(),{cache:"no-store"})
          .then(r=>r.ok?r.json():Promise.reject(new Error("content.json load failed")))
          .then(apply)
          .catch(()=>apply(fallback));
      });
  }
})();
