
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
