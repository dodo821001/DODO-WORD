
document.addEventListener("DOMContentLoaded",()=>{
  const nav=document.querySelector(".navbar");
  const menuBtn=document.querySelector(".menu-btn");
  const mobile=document.querySelector(".mobile-menu");

  const onScroll=()=>{if(nav)nav.classList.toggle("is-scrolled",window.scrollY>30)};
  onScroll();
  window.addEventListener("scroll",onScroll,{passive:true});

  if(menuBtn&&mobile){
    menuBtn.addEventListener("click",()=>mobile.classList.toggle("open"));
    mobile.querySelectorAll("a").forEach(a=>a.addEventListener("click",()=>mobile.classList.remove("open")));
  }

  const io=new IntersectionObserver(entries=>{
    entries.forEach(e=>{
      if(e.isIntersecting){
        e.target.classList.add("show");
        io.unobserve(e.target);
      }
    });
  },{threshold:.10});
  document.querySelectorAll(".reveal").forEach(el=>io.observe(el));

  const form=document.getElementById("franchiseForm");
  if(form){
    const statusBox=document.getElementById("inquiryStatus");
    const submitBtn=document.getElementById("inquirySubmit");
    const pageUrl=document.getElementById("inqPageUrl");
    if(pageUrl) pageUrl.value=location.href;

    function showStatus(message,type){
      if(!statusBox)return;
      statusBox.textContent=message;
      statusBox.className="inquiry-status show "+type;
    }

    function normalizePhone(v){
      return String(v||"").replace(/[^\d]/g,"");
    }

    form.addEventListener("submit",async e=>{
      e.preventDefault();

      const cfg=window.DODO_CURRENT_CONTENT || window.DODO_DEFAULT_CONTENT || {};
      const endpoint=String(cfg["franchise.form_endpoint"]||"").trim();
      const successMessage=cfg["franchise.success_message"] || "상담 신청이 정상적으로 접수되었습니다.";
      const errorMessage=cfg["franchise.error_message"] || "접수 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.";

      if(!endpoint){
        showStatus("관리자 페이지에서 ‘상담 접수 Web App URL’을 먼저 입력해주세요.","error");
        return;
      }

      const name=form.elements["name"].value.trim();
      const phone=form.elements["phone"].value.trim();
      const region=form.elements["region"].value.trim();
      const privacy=document.getElementById("inqPrivacy");

      if(!name || !phone || !region){
        showStatus("이름, 연락처, 창업 희망 지역을 입력해주세요.","error");
        return;
      }
      if(normalizePhone(phone).length < 9){
        showStatus("연락처를 다시 확인해주세요.","error");
        return;
      }
      if(!privacy || !privacy.checked){
        showStatus("개인정보 수집 및 이용에 동의해주세요.","error");
        return;
      }

      submitBtn.disabled=true;
      submitBtn.classList.add("is-loading");
      showStatus("상담 신청을 접수하고 있습니다.","success");

      const fd=new FormData(form);
      fd.append("submitted_at",new Date().toISOString());
      const body=new URLSearchParams();
      fd.forEach((v,k)=>body.append(k,String(v)));

      try{
        const controller=new AbortController();
        const timer=setTimeout(()=>controller.abort(),12000);

        await fetch(endpoint,{
          method:"POST",
          mode:"no-cors",
          headers:{"Content-Type":"application/x-www-form-urlencoded;charset=UTF-8"},
          body:body.toString(),
          signal:controller.signal
        });
        clearTimeout(timer);

        form.reset();
        if(pageUrl) pageUrl.value=location.href;
        showStatus(successMessage,"success");
      }catch(err){
        showStatus(errorMessage,"error");
      }finally{
        submitBtn.disabled=false;
        submitBtn.classList.remove("is-loading");
      }
    });
  }
});

/* =========================================================
   DODO KakaoTalk floating consultation button
   Applies to every public page that loads assets/app.js
   Channel: https://pf.kakao.com/_LxfALn
========================================================= */
(function(){
  function mountDodoKakaoFloat(){
    if(document.getElementById('dodoKakaoFloat')) return;

    var style = document.createElement('style');
    style.id = 'dodoKakaoFloatStyle';
    style.textContent = [
      '.dodo-kakao-float{position:fixed;right:24px;bottom:24px;z-index:99999;display:flex;align-items:center;gap:10px;padding:10px 16px 10px 11px;background:#FEE500;color:#191919;border-radius:999px;text-decoration:none;box-shadow:0 8px 24px rgba(0,0,0,.20);font-family:Pretendard,"Noto Sans KR",Arial,sans-serif;transition:transform .18s ease,box-shadow .18s ease}',
      '.dodo-kakao-float:hover{transform:translateY(-2px);box-shadow:0 12px 30px rgba(0,0,0,.26)}',
      '.dodo-kakao-bubble{width:40px;height:40px;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#191919;flex:0 0 40px}',
      '.dodo-kakao-label{display:flex;flex-direction:column;line-height:1.15;white-space:nowrap}',
      '.dodo-kakao-label strong{font-size:14px;font-weight:800;letter-spacing:-.02em}',
      '.dodo-kakao-label small{margin-top:4px;font-size:10px;font-weight:600;opacity:.67}',
      '@media(max-width:768px){.dodo-kakao-float{right:14px;bottom:18px;padding:9px 13px 9px 9px;gap:8px}.dodo-kakao-bubble{width:36px;height:36px;flex-basis:36px}.dodo-kakao-label strong{font-size:13px}.dodo-kakao-label small{font-size:9px}}'
    ].join('');
    document.head.appendChild(style);

    var a = document.createElement('a');
    a.id = 'dodoKakaoFloat';
    a.className = 'dodo-kakao-float';
    a.href = 'https://pf.kakao.com/_LxfALn/chat';
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.setAttribute('aria-label','카카오톡 채널 실시간 상담');
    a.innerHTML = '<span class="dodo-kakao-bubble" aria-hidden="true"><svg viewBox="0 0 24 24" width="26" height="26"><path fill="currentColor" d="M12 3C6.48 3 2 6.58 2 11c0 2.83 1.84 5.31 4.61 6.73L5.44 22l4.84-2.74c.56.08 1.13.12 1.72.12 5.52 0 10-3.58 10-8.38S17.52 3 12 3z"/></svg></span><span class="dodo-kakao-label"><strong>카카오톡 상담</strong><small>실시간 문의하기</small></span>';
    document.body.appendChild(a);
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', mountDodoKakaoFloat);
  }else{
    mountDodoKakaoFloat();
  }
})();
