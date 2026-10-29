(function(){
  const asBool=v=>typeof v==="boolean"?v:!["false","0","off","no",""].includes(String(v??"").trim().toLowerCase());
  const esc=s=>String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));

  function renderStoreCard(s){
    const tags=(s.tags||[]).map(t=>`<span class="tag">${esc(t)}</span>`).join("");
    const phone=s.phone?`<div>☎ ${esc(s.phone)}</div>`:"";
    const image=esc(s.image||"assets/images/v2-hero.webp");
    const placeUrl=String(s.map_url||"").trim();
    const storeName=esc(s.name||"");
    const nameHtml=placeUrl
      ? `<a class="store-name-link" href="${esc(placeUrl)}" target="_blank" rel="noopener noreferrer" aria-label="${storeName} 네이버 플레이스 열기">${storeName}</a>`
      : storeName;

    return `<article class="store-card reveal show">
      <div class="photo"><img data-store-image="${image}" alt="${storeName}"></div>
      <div class="body">
        <div class="eyebrow">${esc(s.region||"")}</div>
        <h3>${nameHtml}</h3>
        <p>${esc(s.desc||"")}</p>
        <div class="store-detail"><div>📍 ${esc(s.address||"")}</div><div>🕒 ${esc(s.hours||"")}</div>${phone}</div>
        <div class="meta">${tags}</div>
      </div>
    </article>`;
  }

  function activateStoreImages(root){
    if(!root)return;
    root.querySelectorAll("img[data-store-image]").forEach(img=>{
      const src=img.dataset.storeImage;
      if(src)setCmsImage(img,src,"stores.items.image");
    });
  }

  function renderStores(d){
    const items=(d["stores.items"]||[]).filter(x=>asBool(x.visible));
    const all=document.getElementById("storesGrid");
    if(all){
      all.innerHTML=items.map(renderStoreCard).join("");
      activateStoreImages(all);
    }
    const preview=document.getElementById("storesPreview");
    if(preview){
      preview.innerHTML=items.slice(0,3).map(renderStoreCard).join("");
      activateStoreImages(preview);
    }
  }

  function setCmsImage(el,src,key){
    if(!src)return;
    const highPriority = ["home.v2_hero_image","home.feature3_image","cafe.hero_image","cafe.food_image"].includes(key);
    try { el.fetchPriority = highPriority ? "high" : "auto"; } catch(e){}
    el.loading = "eager";
    el.decoding = "async";
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


  function applyHeaderLogo(d){
    const src=String(d["global.logo_image"]||"").trim();

    // CMS 로고가 없을 때만 기존 D 기본 로고를 보여줍니다.
    if(!src){
      document.querySelectorAll(".brand-seal").forEach(seal=>{
        seal.classList.add("logo-resolved","use-default-logo");
      });
      return;
    }

    const isCms=/^assets\/images\/cms\/[A-Za-z0-9._-]+$/.test(src);

    document.querySelectorAll(".brand-seal").forEach(seal=>{
      if(seal.dataset.dodoLogoSrc===src && seal.querySelector("img[data-dodo-header-logo]"))return;

      let attempt=0;
      const retryDelays=[0,900,1800,3500];

      const load=()=>{
        const img=new Image();
        img.alt="DODO WORLD";
        img.setAttribute("data-dodo-header-logo","");
        img.decoding="async";
        img.loading="eager";
        try{img.fetchPriority="high"}catch(e){}

        const url=attempt===0
          ? src
          : src+(src.includes("?")?"&":"?")+"retry="+Date.now()+"-"+attempt;

        img.onload=()=>{
          seal.replaceChildren(img);
          seal.classList.remove("use-default-logo");
          seal.classList.add("has-cms-logo","logo-resolved");
          seal.dataset.dodoLogoSrc=src;
        };

        img.onerror=()=>{
          attempt++;
          if(isCms && attempt<retryDelays.length){
            setTimeout(load,retryDelays[attempt]);
          }else{
            seal.classList.add("logo-resolved","use-default-logo");
          }
        };

        img.src=url;
      };

      load();
    });
  }

  function apply(d){
    window.DODO_CURRENT_CONTENT=d||{};
    const root=document.documentElement;

    applyHeaderLogo(d);

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
      if(d[k])setCmsImage(el,d[k],k);
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

  // V11: <head>에서 이미 시작한 CMS 요청을 재사용합니다.
  // 따라서 HTML 파싱이 끝난 뒤에야 CMS 요청을 시작하던 기존 지연을 줄입니다.
  function loadPublicContent(){
    return fetch("/cms-public/content",{
      method:"GET",
      cache:"no-store",
      credentials:"omit",
      headers:{"Accept":"application/json"}
    }).then(async r=>{
      if(!r.ok) throw new Error("public cms api failed");
      const j=await r.json();
      if(!j?.ok || !j?.content) throw new Error(j?.error||"invalid cms response");
      return j.content;
    });
  }

  function loadFallbackContent(){
    return fetch("content.json",{cache:"no-store"})
      .then(r=>r.ok?r.json():Promise.reject(new Error("content.json load failed")));
  }

  if(location.protocol==="file:"){
    apply(fallback);
  }else{
    const early = window.__DODO_CMS_EARLY__;
    const source = early && typeof early.then==="function"
      ? early.then(d=>d || loadPublicContent())
      : loadPublicContent();

    source
      .then(apply)
      .catch(()=>loadFallbackContent().then(apply))
      .catch(()=>apply(fallback));
  }
})();

/* DODO V10 - basic image save deterrence
   - Blocks right-click context menu on the public site
   - Blocks image dragging
   - Suppresses long-press image callout on supported mobile browsers
   Note: this deters ordinary saving; it cannot prevent screenshots/devtools/network capture.
*/
(()=>{
  if(window.__DODO_IMAGE_PROTECT_V10__) return;
  window.__DODO_IMAGE_PROTECT_V10__ = true;

  const style = document.createElement('style');
  style.id = 'dodo-image-protect-v10-style';
  style.textContent = `
    img,
    picture,
    figure,
    .hero-media,
    .large-photo,
    .stack-photo,
    .story-image,
    .franchise-visual,
    .food-image,
    .trust-image,
    .sub-photo,
    .store-card .photo,
    .cafe-mosaic figure {
      -webkit-user-drag: none !important;
      -webkit-touch-callout: none !important;
      user-select: none !important;
      -webkit-user-select: none !important;
    }
    img { pointer-events: auto; }
    /* V14: CMS 로고가 결정되기 전 기존 D가 순간적으로 보이는 현상 방지 */
    .brand-seal{
      color:transparent !important;
    }
    .brand-seal.logo-resolved.use-default-logo{
      color:inherit !important;
    }
    .brand-seal.has-cms-logo{
      width:50px !important;
      height:50px !important;
      border:0 !important;
      border-radius:0 !important;
      overflow:visible !important;
      display:flex !important;
      align-items:center !important;
      justify-content:center !important;
      flex:0 0 50px !important;
    }
    .brand-seal.has-cms-logo:after{display:none !important;}
    .brand-seal.has-cms-logo img[data-dodo-header-logo]{
      width:100% !important;
      height:100% !important;
      object-fit:contain !important;
      display:block !important;
    }
    @media(max-width:640px){
      .brand-seal.has-cms-logo{
        width:44px !important;
        height:44px !important;
        flex-basis:44px !important;
      }
    }
  `;
  (document.head || document.documentElement).appendChild(style);

  // PC: block right-click menu across the public page.
  document.addEventListener('contextmenu', (e)=>{
    e.preventDefault();
  }, {capture:true});

  // Prevent dragging images out of the page.
  document.addEventListener('dragstart', (e)=>{
    const target = e.target;
    if(target && target.closest && target.closest('img, picture, figure')){
      e.preventDefault();
    }
  }, {capture:true});
})();
