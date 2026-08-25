(() => {
  const api = async (path, options = {}) => {
    const r = await fetch(path, options);
    const data = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(data.error || `HTTP ${r.status}`);
    return data;
  };

  const style = document.createElement('style');
  style.textContent = `
    .bm-media-before{width:min(100%,420px);max-height:280px;object-fit:contain;border-radius:18px;margin:0 auto 18px;display:block;box-shadow:0 10px 30px rgba(0,0,0,.12)}
    .bm-win-overlay{position:fixed;inset:0;z-index:99999;display:grid;place-items:center;background:rgba(5,10,25,.72);backdrop-filter:blur(5px);padding:20px}
    .bm-win-modal{position:relative;width:min(92vw,560px);max-height:88vh;overflow:auto;background:#fff;border-radius:26px;padding:24px;text-align:center;box-shadow:0 25px 80px rgba(0,0,0,.35);animation:bmPop .35s ease-out}
    .bm-win-modal img{display:block;width:100%;max-height:62vh;object-fit:contain;border-radius:18px;margin:auto;background:#f6f7f9}
    .bm-win-modal h2{margin:18px 0 6px;font-size:clamp(24px,5vw,38px)}
    .bm-win-close{position:absolute;top:10px;right:10px;width:42px;height:42px;border:0;border-radius:50%;background:#111827;color:#fff;font-size:24px;cursor:pointer;z-index:2}
    .bm-fireworks{position:absolute;inset:0;pointer-events:none;overflow:hidden;border-radius:26px}
    .bm-spark{position:absolute;width:5px;height:5px;border-radius:50%;animation:bmBurst 1.1s ease-out forwards;box-shadow:0 0 10px 3px currentColor}
    .bm-admin-media{margin-top:18px;padding:18px;border:1px solid #e5e7eb;border-radius:18px;background:#fafafa}
    .bm-admin-media h3{margin:0 0 12px}.bm-admin-media label{display:block;margin:12px 0;font-weight:600}.bm-admin-media input[type=file]{display:block;width:100%;margin-top:7px}.bm-admin-media img{max-width:180px;max-height:110px;object-fit:contain;border-radius:12px;margin-top:10px}.bm-admin-media button{margin-top:8px;padding:10px 16px;border:0;border-radius:10px;cursor:pointer}
    @keyframes bmPop{from{opacity:0;transform:scale(.88)}to{opacity:1;transform:scale(1)}}
    @keyframes bmBurst{0%{transform:translate(0,0) scale(.4);opacity:1}100%{transform:translate(var(--dx),var(--dy)) scale(0);opacity:0}}
    @media(prefers-reduced-motion:reduce){.bm-win-modal{animation:none}.bm-spark{animation:none;opacity:.7}}
  `;
  document.head.appendChild(style);

  const mediaState = { beforeMedia:'', winMedia:'', beforeEnabled:true, winEnabled:true };

  function addBeforeMedia(data) {
    if (!data?.beforeMedia || !mediaState.beforeEnabled || !location.pathname.endsWith('/surprise')) return;
    const card = document.querySelector('.surpriseCard');
    if (!card || card.querySelector('.bm-media-before')) return;
    const img = document.createElement('img');
    img.className = 'bm-media-before';
    img.src = data.beforeMedia;
    img.alt = 'صورة المفاجأة';
    const gift = card.querySelector('.gift');
    if (gift) gift.insertAdjacentElement('afterend', img); else card.prepend(img);
  }

  function fireworks(container) {
    const colors = ['#ff375f','#ffd60a','#32d74b','#64d2ff','#bf5af2','#ff9f0a'];
    for (let burst = 0; burst < 7; burst++) {
      const cx = 10 + Math.random()*80, cy = 8 + Math.random()*70;
      for (let i = 0; i < 18; i++) {
        const s = document.createElement('i');
        const angle = Math.random()*Math.PI*2, dist = 45 + Math.random()*95;
        s.className='bm-spark'; s.style.left=cx+'%'; s.style.top=cy+'%'; s.style.color=colors[(burst+i)%colors.length];
        s.style.setProperty('--dx', Math.cos(angle)*dist+'px'); s.style.setProperty('--dy', Math.sin(angle)*dist+'px');
        container.appendChild(s);
      }
    }
  }

  function showWinMedia(prize) {
    if (!mediaState.winEnabled || !mediaState.winMedia || document.querySelector('.bm-win-overlay')) return;
    const overlay=document.createElement('div'); overlay.className='bm-win-overlay';
    const modal=document.createElement('div'); modal.className='bm-win-modal';
    const fireworksLayer=document.createElement('div'); fireworksLayer.className='bm-fireworks';
    const close=document.createElement('button'); close.className='bm-win-close'; close.type='button'; close.textContent='×'; close.setAttribute('aria-label','إغلاق');
    const img=document.createElement('img'); img.src=mediaState.winMedia; img.alt='صورة الفوز';
    const title=document.createElement('h2'); title.textContent=prize?.name || 'مبروك!';
    const value=document.createElement('div'); value.textContent=prize?.value || 'لقد فزت!'; value.style.fontWeight='700'; value.style.fontSize='20px';
    modal.append(close,fireworksLayer,img,title,value); overlay.appendChild(modal); document.body.appendChild(overlay); fireworks(fireworksLayer);
    const remove=()=>overlay.remove(); close.addEventListener('click',remove); overlay.addEventListener('click',e=>{if(e.target===overlay)remove()});
  }

  async function loadPublicMedia(){
    if (!location.pathname.endsWith('/surprise')) return;
    try { const data=await api('/api/promotion/public'); Object.assign(mediaState,data); addBeforeMedia(data); observeSurprise(); } catch {}
  }

  function observeSurprise(){
    if (!location.pathname.endsWith('/surprise')) return;
    const observer=new MutationObserver(()=>{
      const opened=document.querySelector('.gift.opened');
      if (opened && !document.querySelector('.bm-win-overlay')) {
        const name=document.querySelector('.surpriseCard h1')?.textContent||'';
        const value=document.querySelector('.resultValue')?.textContent||'';
        showWinMedia({name,value});
      }
      addBeforeMedia(mediaState);
    });
    observer.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['class']});
  }

  async function upload(kind,input,status,preview){
    const file=input.files?.[0]; if(!file)return;
    if(!/^image\/(png|jpe?g|gif|webp)$/.test(file.type)){status.textContent='اختر صورة أو GIF فقط.';return;}
    if(file.size>8*1024*1024){status.textContent='الحد الأقصى 8MB.';return;}
    status.textContent='جارٍ الرفع…';
    const reader=new FileReader(); reader.onload=async()=>{
      try{const r=await api('/api/admin/promotion/media',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({kind,mime:file.type,name:file.name,data:reader.result})}); preview.src=r.url; preview.hidden=false; status.textContent='تم الحفظ.';}
      catch(e){status.textContent=e.message||'تعذر الحفظ.';}
    }; reader.readAsDataURL(file);
  }

  async function addAdminMediaPanel(){
    if(!location.pathname.endsWith('/admin'))return;
    const target=[...document.querySelectorAll('.adminCard.formCard')].find(el=>el.querySelector('button.primary'));
    if(!target || document.querySelector('.bm-admin-media'))return;
    let data; try{data=await api('/api/admin/promotion')}catch{return}
    const box=document.createElement('section'); box.className='bm-admin-media';
    box.innerHTML=`<h3>🎨 مظهر صفحة المفاجأة</h3><label>صورة / GIF قبل الفوز<input id="bmBeforeFile" type="file" accept="image/png,image/jpeg,image/gif,image/webp"></label><img id="bmBeforePreview" alt="معاينة" ${data.beforeMedia?'src="'+data.beforeMedia+'"':'hidden'}><p id="bmBeforeStatus"></p><label>صورة / GIF عند الفوز<input id="bmWinFile" type="file" accept="image/png,image/jpeg,image/gif,image/webp"></label><img id="bmWinPreview" alt="معاينة" ${data.winMedia?'src="'+data.winMedia+'"':'hidden'}><p id="bmWinStatus"></p><label><input id="bmBeforeEnabled" type="checkbox" ${data.beforeEnabled!==false?'checked':''}> إظهار صورة قبل الفوز</label><label><input id="bmWinEnabled" type="checkbox" ${data.winEnabled!==false?'checked':''}> إظهار نافذة الفوز</label>`;
    target.appendChild(box);
    box.querySelector('#bmBeforeFile').addEventListener('change',e=>upload('before',e.target,box.querySelector('#bmBeforeStatus'),box.querySelector('#bmBeforePreview')));
    box.querySelector('#bmWinFile').addEventListener('change',e=>upload('win',e.target,box.querySelector('#bmWinStatus'),box.querySelector('#bmWinPreview')));
    for(const id of ['bmBeforeEnabled','bmWinEnabled'])box.querySelector('#'+id).addEventListener('change',async()=>{try{await api('/api/admin/promotion/settings',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({beforeEnabled:box.querySelector('#bmBeforeEnabled').checked,winEnabled:box.querySelector('#bmWinEnabled').checked})});}catch{}});
  }

  const boot=()=>{loadPublicMedia(); if(location.pathname.endsWith('/admin')){const mo=new MutationObserver(addAdminMediaPanel);mo.observe(document.body,{subtree:true,childList:true});addAdminMediaPanel();}};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
