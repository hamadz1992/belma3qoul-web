import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './style.css';

const SOCIALS = [
  ['واتساب','تواصل معنا مباشرة','https://wa.me/213779156397','wa','☘'],
  ['رسائل فيسبوك','تواصل عبر ماسنجر','https://m.me/ma3qoulshop','msg','✉'],
  ['إنستغرام','تابعنا على إنستغرام','https://www.instagram.com/belma3qoul','ig','◎'],
  ['فيسبوك','تابعنا على فيسبوك','https://www.facebook.com/ma3qoulshop','fb','f'],
  ['تيك توك','شاهد أحدث العروض والمنتجات','https://www.tiktok.com/@belma3qoul','tt','♪'],
  ['الموقع','اعرف موقعنا على الخريطة','https://maps.app.goo.gl/2mNGwYgXfj8bSGm9A','map','⌖']
];
const TYPES={voucher:'قسيمة شراء',link:'رابط',message:'رسالة',product:'جائزة عينية'};

async function api(path,options={}){const r=await fetch(path,options);const data=await r.json().catch(()=>({}));if(!r.ok)throw new Error(data.error||`HTTP ${r.status}`);return data;}
function Logo(){return <div className="brand"><strong>بزار</strong><span>كل شيء بالمعقول</span></div>}
function Layout({children}){return <div className="site">{children}</div>}

function Home(){return <Layout><main className="home">
  <section className="hero"><div className="cartLogo">🛒</div><h1>بزار <b>كل شيء بالمعقول</b></h1><div className="ornament">ـــــ ◆ ـــــ</div><p className="tagline">كل شيء بالمعقول… جودة تستحقها وسعر يناسبك</p></section>
  <section className="about"><h2>بزار كل شيء بالمعقول</h2><p>وجهتكم لتشكيلة متنوعة تلبي احتياجات العائلة، من ملابس الرضع والرجالية والنسائية والأطفال، إلى الكوسميتيك والعطور الأصلية والمستلزمات المنزلية المختارة، مع أسعار مناسبة وخدمة توصيل متوفرة داخل الولاية وخارجها.</p></section>
  <nav className="socialGrid">{SOCIALS.map(([n,s,u,k,i])=><a key={k} className={`social ${k}`} href={u} target="_blank" rel="noreferrer"><span>{i}</span><div><b>{n}</b><small>{s}</small></div><i>›</i></a>)}</nav>
  <section className="infoGrid"><a className="infoCard" href="https://maps.app.goo.gl/2mNGwYgXfj8bSGm9A" target="_blank" rel="noreferrer"><b>📍 عنوان المحل</b><span>طريق التكوين المهني بالزقم، حساني عبد الكريم، الوادي</span></a><div className="infoCard"><b>🕐 ساعات العمل</b><span>السبت إلى الخميس: 08:30–12:00 و17:00–20:00<br/>الجمعة: مساءً فقط</span></div></section>
  <div className="qrPromo" id="qr"><img src="/api/qr" alt="QR للمفاجأة"/><div><strong>✨ امسح وقد تكون من الفائزين</strong><p>امسح الكود بكاميرا هاتفك لاكتشاف مفاجأتك 🎁</p></div></div>
</main><footer>جودة تستحقها .. وسعر يناسبك<br/><small>بزار — كل شيء بالمعقول</small></footer></Layout>}

function Surprise(){
 const [state,setState]=useState('ready');
 const [result,setResult]=useState(null);
 const [error,setError]=useState('');
 const [pub,setPub]=useState(null);
 useEffect(()=>{api('/api/promotion/public').then(setPub).catch(e=>setError(e.message));},[]);
 const play=async()=>{setState('loading');setError('');try{const r=await api('/api/promotion/play',{method:'POST'});setResult(r.play);setState('done');}catch(e){setError(e.message);setState('error');}};
 const prize=result?.prize;
 const fireworkParticles=Array.from({length:56},(_,i)=>({i,left:8+((i*17)%84),top:8+((i*29)%68),x:Math.cos(i*0.72)*(55+(i%7)*14),y:Math.sin(i*0.72)*(55+(i%6)*16),delay:(i%12)*0.035}));
 return <div className="surprisePage"><style>{`
 .surpriseButton{min-width:220px;cursor:pointer}
 .winOverlay{position:fixed;inset:0;z-index:9999;display:grid;place-items:center;padding:20px;background:rgba(3,24,17,.72);backdrop-filter:blur(5px);animation:winFade .25s ease-out}
 .winModal{position:relative;width:min(560px,100%);max-height:90vh;overflow:auto;background:#fff;border:2px solid #d6aa43;border-radius:28px;padding:28px 22px;text-align:center;box-shadow:0 30px 100px rgba(0,0,0,.45);animation:winPop .45s cubic-bezier(.2,.9,.2,1.2)}
 .winModal .winIcon{font-size:64px;line-height:1;margin-bottom:8px;animation:winBounce .8s ease-in-out infinite alternate}
 .winModal h2{margin:8px 0;color:#064b32;font-size:30px}
 .winModal .winPrize{font-size:24px;font-weight:900;color:#b98b24;margin:10px 0}
 .winModal .winMedia{display:block;width:100%;max-height:46vh;object-fit:contain;border-radius:18px;margin:14px auto}
 .winClose{position:absolute;top:10px;left:12px;width:38px;height:38px;border:0;border-radius:50%;background:#f2eee4;color:#064b32;font-size:24px;cursor:pointer}
 .fireworks{position:fixed;inset:0;pointer-events:none;overflow:hidden;z-index:10000}
 .fireParticle{position:absolute;width:7px;height:7px;border-radius:50%;background:hsl(var(--h) 95% 62%);box-shadow:0 0 12px 3px hsl(var(--h) 95% 62%);left:var(--left);top:var(--top);animation:fireBurst 1.25s cubic-bezier(.15,.7,.25,1) var(--delay) both}
 .celebrate{font-size:18px;font-weight:900;color:#064b32;margin:6px 0 12px}
 @keyframes fireBurst{0%{transform:translate(0,0) scale(1);opacity:1}75%{opacity:1}100%{transform:translate(var(--x),var(--y)) scale(.15);opacity:0}}
 @keyframes winFade{from{opacity:0}to{opacity:1}}
 @keyframes winPop{from{transform:scale(.72) translateY(20px);opacity:0}to{transform:scale(1) translateY(0);opacity:1}}
 @keyframes winBounce{from{transform:translateY(0) rotate(-4deg)}to{transform:translateY(-8px) rotate(4deg)}}
 `}</style><a href="/" className="back">← العودة للرئيسية</a><div className="surpriseCard"><div className={`gift ${state==='done'?'opened':''}`}>{state==='done'?'🎉':'🎁'}</div><span className="eyebrow">BELMA3QOUL • مفاجأة</span>{state!=='done'?<><h1>{pub?.title||'مفاجأتك بانتظارك'}</h1><p>{pub?.message||'اضغط الزر واكتشف جائزتك.'}</p>{pub?.beforeMedia&&pub?.beforeEnabled&&<img className="surpriseMedia" src={pub.beforeMedia} alt="المفاجأة"/>}<button className="primary surpriseButton" disabled={state==='loading'} onClick={play}>{state==='loading'?'جارٍ السحب…':(pub?.buttonText||'اكتشف جائزتي 🎁')}</button>{error&&<div className="error">{error}</div>}</>:<p>جاري عرض نتيجتك…</p>}</div>{state==='done'&&<><div className="fireworks">{fireworkParticles.map(p=><i key={p.i} className="fireParticle" style={{'--left':`${p.left}%`,'--top':`${p.top}%`,'--x':`${p.x}px`,'--y':`${p.y}px`,'--delay':`${p.delay}s`,'--h':`${(p.i*47)%360}`}}/> )}</div><div className="winOverlay"><div className="winModal"><button className="winClose" aria-label="إغلاق" onClick={()=>setState('ready')}>×</button><div className="winIcon">🎉</div><div className="celebrate">🎆 مبروك! احتفال الفوز 🎆</div>{pub?.winMedia&&pub?.winEnabled&&<img className="winMedia" src={pub.winMedia} alt="صورة الفوز"/>}<span className="eyebrow">BELMA3QOUL • مبروك</span><h2>{prize?.name}</h2><p className="winPrize">{prize?.value}</p>{prize?.type==='link'&&prize.link&&<a className="primary" href={prize.link} target="_blank" rel="noreferrer">فتح الرابط ↗</a>}<small className="hint">احتفظ بهذه النتيجة عند الحاجة.</small></div></div></>}</div>
}

function Login({onLogin}){const [pass,setPass]=useState('');const [error,setError]=useState('');const submit=async()=>{try{await api('/api/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({password:pass})});onLogin();}catch(e){setError(e.message||'كلمة المرور غير صحيحة');}};return <div className="login"><div className="loginCard"><Logo/><span className="eyebrow">ADMIN PANEL</span><h1>لوحة التحكم</h1><p>إدارة المسابقة والجوائز والفائزين.</p><input type="password" autoFocus placeholder="كلمة المرور" value={pass} onChange={e=>setPass(e.target.value)} onKeyDown={e=>e.key==='Enter'&&submit()}/>{error&&<div className="error">{error}</div>}<button className="primary full" onClick={submit}>دخول</button><a href="/">العودة للموقع</a></div></div>}

function Admin(){
 const [logged,setLogged]=useState(false);const [tab,setTab]=useState('overview');const [data,setData]=useState(null);const [plays,setPlays]=useState([]);const [stats,setStats]=useState({});
 const [mediaBusy,setMediaBusy]=useState(''); const [saveState,setSaveState]=useState('');
 const load=async()=>{const [d,s,p]=await Promise.all([api('/api/admin/promotion'),api('/api/stats'),api('/api/admin/plays')]);setData(d);setStats(s);setPlays(p);};
 useEffect(()=>{api('/api/auth/me').then(r=>{setLogged(r.authenticated);if(r.authenticated)load();});},[]);
 if(!logged)return <Login onLogin={()=>{setLogged(true);load();}}/>; if(!data)return <div className="loading">جارٍ تحميل لوحة التحكم…</div>;
 const updateSettings=async(patch)=>{const r=await api('/api/admin/promotion/settings',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(patch)});setData({...data,settings:{...data.settings,...r.data},beforeMedia:r.beforeMedia||data.beforeMedia,winMedia:r.winMedia||data.winMedia,beforeEnabled:r.beforeEnabled??data.beforeEnabled,winEnabled:r.winEnabled??data.winEnabled});};
 const saveAll=async()=>{setSaveState('saving');try{await updateSettings({...data.settings,beforeEnabled:data.beforeEnabled!==false,winEnabled:data.winEnabled!==false});setSaveState('saved');setTimeout(()=>setSaveState(''),2200);}catch(e){setSaveState('error');alert(e.message);}};
 const claim=async p=>{await api(`/api/admin/plays/${p.id}`,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({claimed:!p.claimed})});const r=await api('/api/admin/plays');setPlays(r);};
 const uploadMedia=async(kind,file)=>{if(!file)return;setMediaBusy(kind);try{const dataUrl=await new Promise((resolve,reject)=>{const fr=new FileReader();fr.onload=()=>resolve(fr.result);fr.onerror=reject;fr.readAsDataURL(file);});const r=await api('/api/admin/promotion/media',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({kind,data:dataUrl,mime:file.type})});setData({...data,[kind==='before'?'beforeMedia':'winMedia']:r.url});}catch(e){alert(e.message);}finally{setMediaBusy('');}};
 const logout=async()=>{await api('/api/auth/logout',{method:'POST'});setLogged(false);};
 const previewUrl=`/surprise?token=${encodeURIComponent(data.qrToken||'')}`;
 const campaignForm=<>
   <div className="adminCard formCard"><h2>⚙️ إعدادات المفاجأة</h2><label><input type="checkbox" checked={data.settings.enabled} onChange={e=>setData({...data,settings:{...data.settings,enabled:e.target.checked}})}/> المفاجأة مفعلة</label><label>عنوان شاشة المفاجأة<input value={data.settings.title} onChange={e=>setData({...data,settings:{...data.settings,title:e.target.value}})}/></label><label>الرسالة<input value={data.settings.message} onChange={e=>setData({...data,settings:{...data.settings,message:e.target.value}})}/></label><label>نص زر المفاجأة<input value={data.settings.buttonText||'اكتشف جائزتي 🎁'} onChange={e=>setData({...data,settings:{...data.settings,buttonText:e.target.value}})}/></label><label>عدد المحاولات لكل زائر<input type="number" min="1" value={data.settings.attemptsPerVisitor} onChange={e=>setData({...data,settings:{...data.settings,attemptsPerVisitor:e.target.value}})}/></label><div className="two"><label>بداية الحملة<input type="datetime-local" value={data.settings.campaignStart||''} onChange={e=>setData({...data,settings:{...data.settings,campaignStart:e.target.value||null}})}/></label><label>نهاية الحملة<input type="datetime-local" value={data.settings.campaignEnd||''} onChange={e=>setData({...data,settings:{...data.settings,campaignEnd:e.target.value||null}})}/></label></div></div>
   <div className="adminCard formCard"><h2>🖼️ مظهر المفاجأة</h2><p>هذه الوسائط تظهر في صفحة المفاجأة. GIF مدعوم.</p><div className="two"><label>صورة/GIF قبل الفوز<input type="file" accept="image/png,image/jpeg,image/gif,image/webp" disabled={mediaBusy==='before'} onChange={e=>uploadMedia('before',e.target.files?.[0])}/>{data.beforeMedia&&<img className="adminMediaPreview" src={data.beforeMedia} alt="قبل الفوز"/>}<span><input type="checkbox" checked={data.beforeEnabled!==false} onChange={e=>setData({...data,beforeEnabled:e.target.checked})}/> إظهارها</span></label><label>صورة/GIF عند الفوز<input type="file" accept="image/png,image/jpeg,image/gif,image/webp" disabled={mediaBusy==='win'} onChange={e=>uploadMedia('win',e.target.files?.[0])}/>{data.winMedia&&<img className="adminMediaPreview" src={data.winMedia} alt="عند الفوز"/>}<span><input type="checkbox" checked={data.winEnabled!==false} onChange={e=>setData({...data,winEnabled:e.target.checked})}/> إظهارها</span></label></div></div>
   <div className="adminCard formCard saveSettingsCard"><h2>💾 حفظ الإعدادات</h2><p>احفظ جميع إعدادات المفاجأة ومظهرها دفعة واحدة.</p><div className="two"><button className="primary" onClick={saveAll}>{saveState==='saving'?'جارٍ الحفظ…':saveState==='saved'?'✓ تم الحفظ':saveState==='error'?'إعادة المحاولة':'حفظ الإعدادات'}</button><a className="primary" href={previewUrl} target="_blank" rel="noreferrer">👁️ مشاهدة صفحة المفاجأة</a></div></div>
 </>;
 return <div className="admin"><aside><a href="/admin" className="sideLogo"><Logo/></a><button className={tab==='overview'?'active':''} onClick={()=>setTab('overview')}>📊 نظرة عامة</button><button className={tab==='campaign'?'active':''} onClick={()=>setTab('campaign')}>🎯 الحملة</button><button className={tab==='plays'?'active':''} onClick={()=>setTab('plays')}>🏆 الفائزون والمشاركات</button><a href="/">🌐 عرض الموقع</a><button className="logout" onClick={logout}>↪ تسجيل الخروج</button></aside><main className="adminMain"><header className="adminHeader"><div><span className="eyebrow">BELMA3QOUL ADMIN</span><h1>{tab==='overview'?'نظرة عامة':tab==='campaign'?'الحملة':'المشاركات والفائزون'}</h1></div><span className="online">● النظام متصل</span></header>
 {tab==='overview'&&<><div className="stats">{[['مسح/مشاركة QR',stats.qrScans||0,'📱'],['الفائزون',stats.winners||0,'🏆'],['الجوائز المتبقية',stats.remainingPrizes||0,'🎁'],['حالة المفاجأة',data.settings.enabled?'مفعلة':'متوقفة','🎯']].map(x=><div className="stat" key={x[0]}><span>{x[2]}</span><small>{x[0]}</small><strong>{x[1]}</strong></div>)}</div><div className="adminCard"><h2>رابط المفاجأة</h2><p>هذا هو الرابط الذي يشير إليه QR المطبوع في المحل.</p><code>/surprise?token=...</code><img className="adminQr" src="/api/qr" alt="QR"/><a className="primary smallBtn" href="/api/qr" target="_blank">فتح QR للطباعة</a></div></>}
 {tab==='campaign'&&campaignForm}
 {tab==='plays'&&<div className="adminCard"><div className="tableWrap"><table><thead><tr><th>الوقت</th><th>الجائزة</th><th>الحالة</th><th>إجراء</th></tr></thead><tbody>{plays.map(p=><tr key={p.id}><td>{new Date(p.createdAt).toLocaleString('ar-DZ')}</td><td><b>{p.prizeName||'—'}</b></td><td>{p.claimed?'تم الاستلام':'غير مستلمة'}</td><td><button onClick={()=>claim(p)}>{p.claimed?'إلغاء الاستلام':'تأكيد الاستلام'}</button></td></tr>)}</tbody></table></div></div>}
 </main></div>;
}

function App(){const path=window.location.pathname.replace(/\/$/,'')||'/';if(path==='/surprise')return <Surprise/>;if(path==='/admin')return <Admin/>;return <Home/>;}

createRoot(document.getElementById('root')).render(<App/>);
