
let current={},dirty=false;const pendingFiles=new Map(),$=s=>document.querySelector(s);
const E=s=>String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));
const B=v=>typeof v==="boolean"?v:!["false","0","off","no",""].includes(String(v??"").trim().toLowerCase());
const C=x=>JSON.parse(JSON.stringify(x));
function D(v=true){dirty=v;$("#dirty")?.classList.toggle("show",v)}function S(t,e=false){let x=$("#status");x.textContent=t;x.className="status show"+(e?" err":"");clearTimeout(window._st);window._st=setTimeout(()=>x.className="status",5000)}

function adminImageSrc(path){
  path=String(path||"").trim();
  if(!path)return "";
  if(/^assets\/images\/cms\/[A-Za-z0-9._-]+$/.test(path)){
    return "/admin-api/image?path="+encodeURIComponent(path)+"&_="+Date.now();
  }
  return path;
}

function field(k,l,t){let f=document.createElement("div");f.className="field "+(["textarea","html","image"].includes(t)?"full":"");f.innerHTML=`<label>${E(l)}</label><small>${E(k)}</small>`;
 if(t==="toggle"){let r=document.createElement("div");r.className="toggle-row";let tx=document.createElement("span");tx.textContent=B(current[k])?"표시":"숨김";let b=document.createElement("button");b.type="button";b.className="switch "+(B(current[k])?"on":"");b.onclick=()=>{let on=!b.classList.contains("on");b.classList.toggle("on",on);tx.textContent=on?"표시":"숨김";current[k]=on;D()};r.append(tx,b);f.append(r);return f}
 if(t==="color"){let w=document.createElement("div");w.className="color-wrap";let c=document.createElement("input");c.type="color";c.value=current[k]||"#17372f";let x=document.createElement("input");x.value=current[k]||"#17372f";x.dataset.key=k;c.oninput=()=>{x.value=c.value;current[k]=c.value;D()};x.oninput=()=>{current[k]=x.value;if(/^#[0-9a-fA-F]{6}$/.test(x.value))c.value=x.value;D()};w.append(c,x);f.append(w);return f}
 if(t==="number"){let x=document.createElement("input");x.type="number";x.min="10";x.max="140";x.value=current[k]??"";x.dataset.key=k;x.oninput=()=>{current[k]=Number(x.value);D()};f.append(x);return f}
 if(t==="image"){let box=document.createElement("div");box.className="image-field";let p=document.createElement("div");p.className="image-preview";let im=document.createElement("img");im.src=adminImageSrc(current[k]);p.append(im);let ctr=document.createElement("div");ctr.className="image-controls";let x=document.createElement("input");x.value=current[k]||"";x.dataset.key=k;let fi=document.createElement("input");fi.type="file";fi.accept="image/*";let h=document.createElement("div");h.className="image-help";h.textContent="이미지 선택 가능 · 저장 시 최대 1920px / WebP로 자동 최적화됩니다.";x.oninput=()=>{current[k]=x.value;im.src=adminImageSrc(x.value);D()};fi.onchange=()=>{let q=fi.files?.[0];if(!q)return;pendingFiles.set(k,q);im.src=URL.createObjectURL(q);h.textContent="새 이미지 선택됨 · 저장 시 함께 업로드";D()};ctr.append(x,fi,h);box.append(p,ctr);f.append(box);return f}
 let x=(t==="textarea"||t==="html")?document.createElement("textarea"):document.createElement("input");x.value=current[k]??"";x.dataset.key=k;x.oninput=()=>{current[k]=x.value;D()};f.append(x);return f}
function fresh(){return{id:"store-"+Date.now(),visible:true,region:"REGION",name:"신규 매장",desc:"매장 설명을 입력해주세요.",image:"assets/images/brand-shelf.webp",address:"주소 입력",hours:"영업시간 입력",phone:"",map_url:"",tags:["만화","OTT"]}}
function stores(){let h=$("#storeManager");if(!h)return;h.innerHTML="";(current["stores.items"]||[]).forEach((s,i)=>{let c=document.createElement("div");c.className="store-edit-card";c.innerHTML=`<div class="store-edit-top"><div class="store-edit-title"><span class="store-index">${i+1}</span><span>${E(s.name)}</span></div><div class="store-actions"><button data-up>↑ 위로</button><button data-down>↓ 아래로</button><button class="danger" data-del>삭제</button></div></div><div class="store-fields"><div><label>노출 여부</label><div class="store-visible-row"><input type="checkbox" data-f="visible" ${B(s.visible)?"checked":""}> 홈페이지에 표시</div></div><div><label>지역 표기</label><input data-f="region" value="${E(s.region)}"></div><div><label>매장명</label><input data-f="name" value="${E(s.name)}"></div><div><label>전화번호</label><input data-f="phone" value="${E(s.phone)}"></div><div class="wide"><label>매장 설명</label><textarea data-f="desc">${E(s.desc)}</textarea></div><div><label>주소</label><input data-f="address" value="${E(s.address)}"></div><div><label>영업시간</label><input data-f="hours" value="${E(s.hours)}"></div><div><label>지도 링크</label><input data-f="map_url" value="${E(s.map_url)}"></div><div><label>태그</label><input data-f="tags" value="${E((s.tags||[]).join(", "))}"></div><div class="wide"><label>매장 이미지</label><div class="store-image-row"><div class="store-image-preview"><img data-img src="${E(adminImageSrc(s.image))}"></div><div class="store-image-controls"><input data-f="image" value="${E(s.image)}"><input type="file" accept="image/*" data-file></div></div></div></div>`;
 c.querySelectorAll("[data-f]").forEach(x=>{let k=x.dataset.f,ev=k==="visible"?"change":"input";x.addEventListener(ev,()=>{s[k]=k==="visible"?x.checked:k==="tags"?x.value.split(",").map(v=>v.trim()).filter(Boolean):x.value;if(k==="name")c.querySelector(".store-edit-title span:last-child").textContent=s.name;if(k==="image")c.querySelector("[data-img]").src=adminImageSrc(s.image);D()})});c.querySelector("[data-file]").onchange=e=>{let q=e.target.files?.[0];if(!q)return;pendingFiles.set("stores.items."+s.id+".image",q);c.querySelector("[data-img]").src=URL.createObjectURL(q);D()};c.querySelector("[data-del]").onclick=()=>{if(confirm(`'${s.name}'을 삭제할까요?`)){current["stores.items"].splice(i,1);stores();D()}};c.querySelector("[data-up]").onclick=()=>{if(i>0){let a=current["stores.items"];[a[i-1],a[i]]=[a[i],a[i-1]];stores();D()}};c.querySelector("[data-down]").onclick=()=>{let a=current["stores.items"];if(i<a.length-1){[a[i+1],a[i]]=[a[i],a[i+1]];stores();D()}};h.append(c)})}
function render(d){current=Object.assign({},window.DODO_DEFAULT_CONTENT||{},C(d||{}));if(!Array.isArray(current["stores.items"]))current["stores.items"]=[];pendingFiles.clear();D(false);let r=$("#groups"),side=$("#sideLinks");r.innerHTML="";side.innerHTML="";let i=0;Object.entries(window.DODO_SCHEMA).forEach(([n,fs])=>{let id="g"+i++,b=document.createElement("button");b.className="side-link";b.textContent=n;b.onclick=()=>document.getElementById(id).scrollIntoView({behavior:"smooth"});side.append(b);let g=document.createElement("section");g.className="group";g.id=id;g.innerHTML=`<div class="gh"><h2>${E(n)}</h2><span>${fs.length}개 항목</span></div><div class="fields"></div>`;fs.forEach(x=>g.querySelector(".fields").append(field(...x)));r.append(g)});let b=document.createElement("button");b.className="side-link";b.textContent="매장 추가 / 관리";b.onclick=()=>$("#storeGroup").scrollIntoView({behavior:"smooth"});side.append(b);let g=document.createElement("section");g.className="store-manager";g.id="storeGroup";g.innerHTML=`<div class="store-manager-head"><div><h2>매장 추가 / 관리</h2><div style="font-size:10px;color:#7d8580;margin-top:3px">신규 매장은 원하는 만큼 계속 추가할 수 있습니다.</div></div><button id="addStore" class="add-store-btn">+ 신규 매장 추가</button></div><div id="storeManager" class="store-list"></div>`;r.append(g);$("#addStore").onclick=()=>{current["stores.items"].push(fresh());stores();D()};stores()}
async function load(){
  let d=window.DODO_DEFAULT_CONTENT||{};

  if(location.protocol==="file:"){
    render(d);
    return;
  }

  try{
    S("GitHub의 최신 저장 내용을 불러오는 중입니다...");

    const r=await fetch("/admin-api/content?_="+Date.now(),{
      method:"GET",
      credentials:"same-origin",
      cache:"no-store",
      redirect:"follow",
      headers:{"Accept":"application/json"}
    });

    const ct=r.headers.get("content-type")||"";
    if(!ct.includes("application/json")){
      const text=await r.text();
      if(r.redirected || /cloudflareaccess\.com|Log in to/i.test(text)){
        throw new Error("Cloudflare Access 인증이 만료되었습니다. 페이지를 새로고침해 다시 로그인해주세요.");
      }
      throw new Error(`최신 데이터 서버가 예상하지 못한 응답을 보냈습니다. (${r.status})`);
    }

    const result=await r.json();
    if(!r.ok || !result?.ok || !result?.content){
      throw new Error(result?.error || `최신 데이터 불러오기 실패 (${r.status})`);
    }

    d=result.content;
    render(d);
    S("GitHub의 최신 저장 내용을 불러왔습니다.");
  }catch(e){
    console.error("DODO CMS load error:",e);
    render(d);
    S("최신 저장 내용을 불러오지 못했습니다: "+(e?.message||"알 수 없는 오류"),true);
  }
}
function collect(){let d=C(current);document.querySelectorAll("[data-key]").forEach(x=>d[x.dataset.key]=x.type==="number"?Number(x.value):x.value);return d}

function humanSize(bytes){
  const n=Number(bytes||0);
  if(n<1024)return n+" B";
  if(n<1024*1024)return (n/1024).toFixed(1)+" KB";
  return (n/(1024*1024)).toFixed(2)+" MB";
}
function loadLocalImage(file){
  return new Promise((resolve,reject)=>{
    const url=URL.createObjectURL(file);
    const img=new Image();
    img.onload=()=>{URL.revokeObjectURL(url);resolve(img)};
    img.onerror=()=>{URL.revokeObjectURL(url);reject(new Error("이미지를 읽을 수 없습니다."))};
    img.src=url;
  });
}
function canvasBlob(canvas,type,quality){
  return new Promise(resolve=>canvas.toBlob(resolve,type,quality));
}
async function optimizeImageFile(file,key){
  if(!file || !/^image\//.test(file.type||""))return file;
  if(["image/svg+xml","image/gif"].includes(file.type))return file;

  try{
    const img=await loadLocalImage(file);
    const ow=img.naturalWidth||img.width;
    const oh=img.naturalHeight||img.height;
    if(!ow||!oh)return file;

    const isLogo=String(key||"").includes("logo");
    const maxSide=isLogo?1200:1920;
    const scale=Math.min(1,maxSide/Math.max(ow,oh));
    const w=Math.max(1,Math.round(ow*scale));
    const h=Math.max(1,Math.round(oh*scale));

    const canvas=document.createElement("canvas");
    canvas.width=w;
    canvas.height=h;
    const ctx=canvas.getContext("2d",{alpha:true});
    if(!ctx)return file;

    ctx.imageSmoothingEnabled=true;
    ctx.imageSmoothingQuality="high";
    ctx.clearRect(0,0,w,h);
    ctx.drawImage(img,0,0,w,h);

    // WebP는 투명 배경도 유지합니다.
    const quality=isLogo?0.92:0.84;
    const blob=await canvasBlob(canvas,"image/webp",quality);
    if(!blob)return file;

    // 리사이즈가 없고 오히려 더 커지면 원본 유지
    if(scale===1 && blob.size>=file.size)return file;

    const stem=(file.name||"image")
      .replace(/\.[^.]+$/,"")
      .replace(/[^a-zA-Z0-9가-힣_-]+/g,"-")||"image";

    const optimized=new File([blob],stem+".webp",{
      type:"image/webp",
      lastModified:Date.now()
    });
    optimized._dodoOriginalSize=file.size;
    optimized._dodoOriginalName=file.name;
    return optimized;
  }catch(e){
    console.warn("DODO image optimize fallback:",e);
    return file;
  }
}

function b64(ab){let a=new Uint8Array(ab),s="";for(let i=0;i<a.length;i+=32768)s+=String.fromCharCode(...a.subarray(i,Math.min(i+32768,a.length)));return btoa(s)}
function nm(n){let e=(n.split(".").pop()||"jpg").replace(/[^a-zA-Z0-9]/g,"")||"jpg";return"cms-"+Date.now()+"-"+Math.random().toString(36).slice(2,7)+"."+e}

async function saveHomepage(){
  const btn=$("#save");
  const originalText=btn?.textContent||"홈페이지에 저장";

  try{
    if(btn){
      btn.disabled=true;
      btn.textContent="저장 중...";
      btn.style.opacity=".72";
      btn.style.cursor="wait";
    }

    S("저장 요청을 준비하고 있습니다...");

    const d=collect();
    const images=[];

    // 선택한 이미지는 브라우저에서 먼저 자동 최적화한 뒤 Worker/GitHub로 업로드
    let beforeBytes=0,afterBytes=0,processed=0;
    for(const [k,original] of pendingFiles){
      beforeBytes+=original.size||0;
      processed++;
      S(`이미지 자동 최적화 중... ${processed}/${pendingFiles.size}`);

      const f=await optimizeImageFile(original,k);
      afterBytes+=f.size||0;

      const path="assets/images/cms/"+nm(f.name);
      const base64=b64(await f.arrayBuffer());
      images.push({path,base64});

      if(k.startsWith("stores.items.")){
        const id=k.split(".")[2];
        const st=d["stores.items"]?.find(x=>x.id===id);
        if(st) st.image=path;
      }else{
        d[k]=path;
      }
    }

    if(pendingFiles.size){
      const saved=Math.max(0,beforeBytes-afterBytes);
      console.info(
        `DODO 이미지 최적화: ${humanSize(beforeBytes)} → ${humanSize(afterBytes)}`
        +(saved?` / ${humanSize(saved)} 절감`:"")
      );
    }

    // Worker 라우팅/Access 세션이 정상인지 먼저 확인
    S("Cloudflare 저장 서버 연결을 확인하고 있습니다...");
    const health=await fetch("/admin-api/health?_="+Date.now(),{
      method:"GET",
      credentials:"same-origin",
      cache:"no-store",
      redirect:"follow"
    });

    let healthData=null;
    try{ healthData=await health.json(); }catch(e){}

    if(!health.ok || !healthData?.ok){
      throw new Error("Cloudflare 저장 서버 연결을 확인하지 못했습니다. 관리자 페이지를 새로고침한 뒤 다시 시도해주세요.");
    }

    S(images.length
      ? `최적화된 이미지 ${images.length}개와 홈페이지 설정을 저장 중입니다...`
      : "홈페이지 설정을 저장 중입니다..."
    );

    const r=await fetch("/admin-api/save",{
      method:"POST",
      credentials:"same-origin",
      cache:"no-store",
      redirect:"follow",
      headers:{
        "Content-Type":"application/json",
        "Accept":"application/json"
      },
      body:JSON.stringify({content:d,images})
    });

    const contentType=r.headers.get("content-type")||"";
    let result=null;

    if(contentType.includes("application/json")){
      try{ result=await r.json(); }catch(e){}
    }else{
      const text=await r.text();
      if(r.redirected || /cloudflareaccess\.com|Log in to/i.test(text)){
        throw new Error("Cloudflare Access 인증이 만료되었습니다. 페이지를 새로고침해 다시 로그인한 뒤 저장해주세요.");
      }
      throw new Error(`저장 서버가 예상하지 못한 응답을 보냈습니다. (${r.status})`);
    }

    if(!r.ok || !result?.ok){
      throw new Error(result?.error || `서버 저장 실패 (${r.status})`);
    }

    current=d;
    pendingFiles.clear();
    D(false);
    render(d);

    if(btn) btn.textContent="✓ 저장 완료";
    S("저장 완료! 이미지 자동 최적화 후 GitHub에 안전하게 반영됐습니다.");

    setTimeout(()=>{
      if(btn) btn.textContent=originalText;
    },1800);

  }catch(e){
    console.error("DODO CMS save error:",e);
    S(e?.message||"저장 중 오류가 발생했습니다.",true);
    if(btn) btn.textContent="저장 실패";
    setTimeout(()=>{
      if(btn) btn.textContent=originalText;
    },2200);
  }finally{
    if(btn){
      btn.disabled=false;
      btn.style.opacity="";
      btn.style.cursor="";
    }
  }
}

function backup(){let a=document.createElement("a");a.href=URL.createObjectURL(new Blob([JSON.stringify(collect(),null,2)],{type:"application/json"}));a.download="content-backup.json";a.click()}
function restoreBackup(file){
  const reader=new FileReader();
  reader.onload=()=>{
    try{
      const data=JSON.parse(reader.result);
      render(data);
      D(true);
      S("백업을 불러왔습니다. 실제 반영하려면 '홈페이지에 저장'을 눌러주세요.");
    }catch(e){
      S("올바른 JSON 백업 파일이 아닙니다.",true);
    }
  };
  reader.readAsText(file,"utf-8");
}

document.addEventListener("DOMContentLoaded",()=>{
  load();

  const saveBtn=$("#save");
  if(saveBtn){
    saveBtn.type="button";
    saveBtn.addEventListener("click",(e)=>{
      e.preventDefault();
      e.stopPropagation();
      saveHomepage();
    });
  }

  const reloadBtn=$("#reload");
  if(reloadBtn){
    reloadBtn.type="button";
    reloadBtn.addEventListener("click",(e)=>{
      e.preventDefault();
      if(dirty && !confirm("저장하지 않은 변경사항이 있습니다. 현재값을 다시 불러올까요?")) return;
      load();
    });
  }

  const previewBtn=$("#preview");
  if(previewBtn){
    previewBtn.type="button";
    previewBtn.addEventListener("click",(e)=>{
      e.preventDefault();
      open("index.html","_blank");
    });
  }

  const backupBtn=$("#backup");
  if(backupBtn){
    backupBtn.type="button";
    backupBtn.addEventListener("click",(e)=>{
      e.preventDefault();
      backup();
    });
  }

  const restoreBtn=$("#restoreBtn");
  const restoreFile=$("#restoreFile");
  if(restoreBtn && restoreFile){
    restoreBtn.type="button";
    restoreBtn.addEventListener("click",(e)=>{
      e.preventDefault();
      restoreFile.click();
    });
    restoreFile.addEventListener("change",(e)=>{
      const file=e.target.files?.[0];
      if(file) restoreBackup(file);
      e.target.value="";
    });
  }

  window.addEventListener("beforeunload",(e)=>{
    if(!dirty) return;
    e.preventDefault();
    e.returnValue="";
  });
});
