import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './style.css';

const NAV = [
  ['dashboard', 'نظرة عامة', '📊'], ['sales', 'المبيعات', '🛒'], ['products', 'السلع', '📦'],
  ['inventory', 'المخزون', '🏬'], ['customers', 'العملاء', '👤'], ['cash', 'الصندوق', '💼'],
  ['expenses', 'المصاريف', '🧾'], ['reports', 'التقارير', '📈'], ['ads', 'الإعلانات', '📣'],
  ['facebook', 'Facebook', 'ⓕ'], ['links', 'روابط التواصل', '🔗'], ['analytics', 'الإحصائيات', '📉'],
  ['settings', 'الإعدادات', '⚙️']
];

const MODULES = [
  ['sales', 'المبيعات', 'إدارة الفواتير والعمليات', '🛒'], ['products', 'السلع', 'إضافة المنتجات والأسعار والتصنيفات', '📦'],
  ['inventory', 'المخزون', 'متابعة الكميات وحركات المخزون', '🏬'], ['customers', 'العملاء', 'العملاء والديون والمتابعة', '👤'],
  ['cash', 'الصندوق', 'الجلسات والحركات النقدية', '💼'], ['expenses', 'المصاريف', 'تسجيل ومراجعة المصاريف', '🧾'],
  ['reports', 'التقارير', 'تقارير المبيعات والأرباح', '📈'], ['analytics', 'الإحصائيات', 'مؤشرات أداء الموقع', '📊']
];

async function api(path, options) {
  const response = await fetch(path, options);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}

function Logo({ compact = false }) {
  return <div className={compact ? 'brand compact' : 'brand'}><span>بزار</span><b>كل شيء بالمعقول</b></div>;
}

function Layout({ children }) {
  return <div className="app-shell"><header className="public-nav"><a href="/"><Logo /></a><nav><a href="/">الرئيسية</a><a href="/surprise">🎁 المفاجأة</a><a className="nav-admin" href="/admin">🔐 لوحة التحكم</a></nav></header>{children}</div>;
}

function Home() {
  return <Layout><main className="home-page">
    <section className="hero-section">
      <div className="hero-copy"><span className="eyebrow">كل شيء بالمعقول</span><h1>كل ما تحتاجه<br /><em>في مكان واحد</em></h1><p>واجهة حديثة لمتجرنا تجمع التعريف بالمحل، الروابط، العروض، والمحتوى في تجربة واحدة سريعة على الهاتف والكمبيوتر.</p><div className="actions"><a className="primaryBtn" href="/surprise">اكتشف المفاجأة 🎁</a><a className="outlineBtn" href="/admin">إدارة الموقع</a></div></div>
      <div className="hero-card"><div className="hero-logo">🛍️</div><strong>بزار كل شيء بالمعقول</strong><span>محل متنوع • عروض • تواصل سريع</span></div>
    </section>
    <section className="feature-strip">{[['🛍️','منتجات وعروض جديدة','أبرز المنتجات والتحديثات في مكان واضح.'],['✨','آخر منشورات المحل','محتوى المحل وأحدث الأخبار بسهولة.'],['💬','تواصل معنا بسهولة','الوصول إلى الشبكات الاجتماعية والموقع بسرعة.']].map(([i,t,d])=><article key={t}><span className="featureIcon">{i}</span><h3>{t}</h3><p>{d}</p></article>)}</section>
    <section className="public-links"><div><span className="eyebrow">التواصل</span><h2>كل روابطك المهمة</h2></div><div className="link-grid">{[['WhatsApp','التواصل المباشر','wa'],['Instagram','تابع الجديد','ig'],['Facebook','صفحتنا على Facebook','fb'],['TikTok','الفيديوهات والمنشورات','tt'],['الموقع','الوصول إلى المحل','map'],['Messenger','راسلنا','msg']].map(([name,sub,key])=><a key={key} href="#" className={`social-link ${key}`}><span>{key==='wa'?'☘':key==='ig'?'◎':key==='fb'?'f':key==='tt'?'♪':key==='map'?'⌖':'✉'}</span><div><b>{name}</b><small>{sub}</small></div><i>←</i></a>)}</div></section>
  </main><footer className="public-footer">كل شيء بالمعقول — تجربة رقمية بسيطة وسريعة</footer></Layout>;
}

function Surprise() {
  const [opened, setOpened] = useState(false);
  return <div className="surprise-page"><a className="backLink" href="/">← العودة للرئيسية</a><div className="surprise-card"><div className={`gift-art ${opened ? 'opened' : ''}`}>{opened ? '🎉' : '🎁'}</div><span className="eyebrow">BELMA3QOUL</span><h1>{opened ? 'المفاجأة وصلت!' : 'مفاجأة بانتظارك'}</h1><p>{opened ? 'هذه الصفحة أصبحت جاهزة لتحتوي على العرض أو الرسالة التي تختارها من لوحة التحكم.' : 'اضغط على الزر لفتح المفاجأة.'}</p><button className="primaryBtn" onClick={() => setOpened(true)}>{opened ? 'تم الفتح ✓' : 'افتح المفاجأة'}</button><a className="textLink" href="/admin">تخصيص المفاجأة من لوحة التحكم</a></div></div>;
}

function Login({ onLogin }) {
  const [pass, setPass] = useState('');
  const [error, setError] = useState('');
  const submit = async () => {
    try { await api('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password: pass }) }); onLogin(); }
    catch { setError('كلمة المرور غير صحيحة'); }
  };
  return <div className="login-page"><div className="login-card"><Logo /><span className="eyebrow">ADMIN PANEL</span><h1>لوحة التحكم</h1><p>سجّل الدخول لإدارة صفحات الموقع ومحتواه وإعداداته.</p><input type="password" autoFocus value={pass} placeholder="كلمة المرور" onChange={e=>setPass(e.target.value)} onKeyDown={e=>e.key==='Enter'&&submit()} />{error&&<div className="error">{error}</div>}<button className="primaryBtn full" onClick={submit}>دخول إلى اللوحة</button><a href="/">العودة للموقع</a></div></div>;
}

function Dashboard({ stats }) {
  return <><section className="welcome-banner"><div><span className="eyebrow">اليوم</span><h2>مرحبًا بك 👋</h2><p>كل أدوات موقعك وإدارته في مكان واحد.</p></div><a className="outlineBtn" href="/">عرض الموقع ↗</a></section><section className="stat-grid">{[['المبيعات',stats.sales,'🛒'],['السلع',stats.products,'📦'],['العملاء',stats.customers,'👤'],['المخزون',stats.stock,'🏬']].map(([label,value,icon])=><div key={label} className="stat-card"><span>{icon}</span><div><small>{label}</small><strong>{value}</strong></div></div>)}</section><section className="dashboard-section"><div className="section-title"><span className="eyebrow">الوصول السريع</span><h2>أقسام الإدارة</h2></div><div className="module-grid">{MODULES.map(([k,v,d,i])=><a className="module-card" href={`/admin/${k}`} key={k}><span className="module-icon">{i}</span><div><h3>{v}</h3><p>{d}</p></div><b>←</b></a>)}</div></section></>;
}

function Settings({ initial }) {
  const [data, setData] = useState(initial);
  const save = async () => { await api('/api/settings', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(data) }); alert('تم حفظ الإعدادات'); };
  return <section className="admin-panel"><span className="eyebrow">SETTINGS</span><h2>إعدادات الموقع</h2><p>غيّر المحتوى العام المستخدم في الموقع وصفحة المفاجأة.</p>{[['siteName','اسم الموقع'],['news','شريط الأخبار'],['featured','عنوان المنشورات المميزة'],['surpriseTitle','عنوان المفاجأة'],['surpriseMessage','رسالة المفاجأة']].map(([key,label])=><label key={key}>{label}<input value={data[key]||''} onChange={e=>setData({...data,[key]:e.target.value})}/></label>)}<button className="primaryBtn" onClick={save}>حفظ الإعدادات</button></section>;
}

function Module({ name, stats }) {
  const meta = MODULES.find(m=>m[0]===name) || [name, name, '', '⚙️'];
  return <section className="admin-panel module-view"><span className="eyebrow">MODULE</span><div className="module-heading"><span className="big-icon">{meta[3]}</span><div><h2>{meta[1]}</h2><p>{meta[2]}</p></div></div><div className="module-metrics"><div><small>الحالة</small><b>متصل</b></div><div><small>الخدمة</small><b>API</b></div><div><small>السجلات</small><b>{stats[metricFor(name)] ?? 0}</b></div></div><div className="empty-state"><span>🧩</span><h3>هذه الوحدة جاهزة للتوسعة</h3><p>البنية الآن موحدة، ويمكن ربط CRUD وقواعد البيانات والخدمات الخارجية داخل هذا القسم بدون تغيير التنقل العام.</p></div></section>;
}
function metricFor(name){ return name==='sales'?'sales':name==='products'?'products':name==='customers'?'customers':name==='inventory'?'stock':'sales'; }

function Admin() {
  const [logged, setLogged] = useState(sessionStorage.getItem('belma3qoul_admin') === '1');
  const [section, setSection] = useState(location.pathname.split('/')[2] || 'dashboard');
  const [stats, setStats] = useState({sales:0,products:0,customers:0,stock:0});
  const [settings, setSettings] = useState({siteName:'كل شيء بالمعقول',news:'تابعوا أحدث منشورات المحل',featured:'آخر المنشورات',surpriseTitle:'مفاجأة بانتظارك',surpriseMessage:'هناك شيء جميل بانتظارك.'});

  useEffect(()=>{ if(!logged)return; api('/api/stats').then(setStats).catch(()=>{}); api('/api/settings').then(setSettings).catch(()=>{}); },[logged]);
  useEffect(()=>{ const fn=()=>setSection(location.pathname.split('/')[2]||'dashboard'); addEventListener('popstate',fn); return()=>removeEventListener('popstate',fn); },[]);
  const go = key => { const target=key==='dashboard'?'/admin':`/admin/${key}`; history.pushState({},'',target); setSection(key); };
  const logout=async()=>{await api('/api/auth/logout',{method:'POST'}).catch(()=>{});sessionStorage.removeItem('belma3qoul_admin');setLogged(false);};
  if(!logged) return <Login onLogin={()=>{sessionStorage.setItem('belma3qoul_admin','1');setLogged(true)}}/>;
  const title=section==='dashboard'?'نظرة عامة':section==='settings'?'الإعدادات':(NAV.find(n=>n[0]===section)?.[1]||'الإدارة');
  return <div className="admin-layout"><aside className="sidebar"><a href="/admin" onClick={e=>{e.preventDefault();go('dashboard')}}><Logo compact/></a><div className="side-menu">{NAV.map(([k,label,icon])=><button key={k} className={section===k?'active':''} onClick={()=>go(k)}><span>{icon}</span><b>{label}</b></button>)}</div><button className="logout" onClick={logout}>↪ تسجيل الخروج</button></aside><main className="admin-main"><header className="admin-top"><div><span className="eyebrow">لوحة التحكم</span><h1>{title}</h1></div><div className="top-actions"><span className="status-dot">● النظام متصل</span><a href="/">عرض الموقع</a></div></header>{section==='dashboard'?<Dashboard stats={stats}/>:section==='settings'?<Settings initial={settings}/>:<Module name={section} stats={stats}/>}</main></div>;
}

function App(){ const p=location.pathname; if(p==='/surprise'||p.startsWith('/surprise/')) return <Surprise/>; if(p==='/admin'||p.startsWith('/admin/')) return <Admin/>; return <Home/>; }

createRoot(document.getElementById('root')).render(<App/>);
