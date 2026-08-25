(() => {
  if (!location.pathname.endsWith('/surprise')) return;

  const style = document.createElement('style');
  style.textContent = `
    .bm-direct-overlay{position:fixed;inset:0;z-index:100000;display:grid;place-items:center;padding:16px;background:rgba(3,20,14,.78);backdrop-filter:blur(6px)}
    .bm-direct-modal{position:relative;width:min(92vw,560px);max-height:90vh;overflow:auto;background:#fff;border:2px solid #c79a32;border-radius:26px;padding:24px;text-align:center;box-shadow:0 25px 90px rgba(0,0,0,.4);animation:bmDirectPop .35s ease-out}
    .bm-direct-modal h2{margin:10px 0 6px;color:#064b32;font-size:clamp(25px,6vw,38px)}
    .bm-direct-value{font-size:20px;font-weight:900;color:#c79a32;margin:8px 0 14px}
    .bm-direct-media{display:block;width:100%;max-height:52vh;object-fit:contain;border-radius:18px;margin:0 auto 12px;background:#f5f7f6}
    .bm-direct-close{position:absolute;top:10px;right:10px;width:42px;height:42px;border:0;border-radius:50%;background:#111827;color:#fff;font-size:24px;cursor:pointer;z-index:3}
    .bm-direct-link{display:inline-flex;align-items:center;justify-content:center;min-height:44px;padding:12px 20px;border-radius:12px;background:#064b32;color:#fff;text-decoration:none;font-weight:900;margin-top:4px}
    .bm-direct-fireworks{position:absolute;inset:0;pointer-events:none;overflow:hidden;border-radius:26px}
    .bm-direct-spark{position:absolute;width:5px;height:5px;border-radius:50%;animation:bmDirectBurst 1.15s ease-out forwards;box-shadow:0 0 12px 3px currentColor}
    @keyframes bmDirectPop{from{opacity:0;transform:scale(.88)}to{opacity:1;transform:scale(1)}}
    @keyframes bmDirectBurst{0%{transform:translate(0,0) scale(.5);opacity:1}100%{transform:translate(var(--dx),var(--dy)) scale(0);opacity:0}}
    @media(prefers-reduced-motion:reduce){.bm-direct-modal{animation:none}.bm-direct-spark{animation:none;opacity:.7}}
  `;
  document.head.appendChild(style);

  function fireworks(layer){
    const colors=['#ff375f','#ffd60a','#32d74b','#64d2ff','#bf5af2','#ff9f0a'];
    for(let burst=0;burst<8;burst++){
      const cx=8+Math.random()*84,cy=8+Math.random()*70;
      for(let i=0;i<18;i++){
        const s=document.createElement('i');
        const a=Math.random()*Math.PI*2,d=45+Math.random()*110;
        s.className='bm-direct-spark';
        s.style.left=cx+'%';s.style.top=cy+'%';s.style.color=colors[(burst+i)%colors.length];
        s.style.setProperty('--dx',Math.cos(a)*d+'px');s.style.setProperty('--dy',Math.sin(a)*d+'px');
        layer.appendChild(s);
      }
    }
  }

  function show(){
    if(document.querySelector('.bm-direct-overlay')||document.querySelector('.bm-win-overlay')) return;
    const card=document.querySelector('.surpriseCard');
    if(!card||!card.querySelector('.gift.opened')) return;
    const name=card.querySelector('h1')?.textContent?.trim()||'مبروك!';
    const value=card.querySelector('.resultValue')?.textContent?.trim()||'';
    const link=card.querySelector('a.primary[href]');
    const overlay=document.createElement('div');overlay.className='bm-direct-overlay';
    const modal=document.createElement('div');modal.className='bm-direct-modal';
    const fire=document.createElement('div');fire.className='bm-direct-fireworks';
    const close=document.createElement('button');close.type='button';close.className='bm-direct-close';close.textContent='×';close.setAttribute('aria-label','إغلاق');
    const mediaSrc=window.__belma3qoulWinMedia||'';
    const media=mediaSrc?`<img class="bm-direct-media" src="${mediaSrc}" alt="صورة الجائزة">`:'';
    modal.innerHTML=media+'<div style="font-size:52px;line-height:1">🎉</div><h2>'+escapeHtml(name)+'</h2><div class="bm-direct-value">'+escapeHtml(value)+'</div>'+(link?'<a class="bm-direct-link" href="'+link.href+'" target="_blank" rel="noopener noreferrer">فتح رابط الجائزة ↗</a>':'')+'<p style="color:#606a64;font-size:12px;margin:14px 0 0">احتفظ بهذه النتيجة عند الحاجة.</p>';
    modal.append(close,fire);overlay.appendChild(modal);document.body.appendChild(overlay);fireworks(fire);
    close.addEventListener('click',()=>overlay.remove());overlay.addEventListener('click',e=>{if(e.target===overlay)overlay.remove()});
  }

  async function boot(){
    try{const data=await fetch('/api/promotion/public').then(r=>r.json());window.__belma3qoulWinMedia=data.winMedia||'';}catch{}
    const observer=new MutationObserver(show);
    observer.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['class']});
    show();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();

  function escapeHtml(value){return String(value??'').replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]));}
})();
