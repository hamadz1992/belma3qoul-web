export const siteConfig = {
  name: 'Belma3qoul',
  arabicName: 'كل شيء بالمعقول',
  tagline: 'الموقع الرسمي للمحل: صورة، منشورات، وروابط تواصل في صفحة واحدة.',
  description: `✨ كل شيء بالمعقول ✨
👶 ملابس رضع
👗 ملابس رجالية • نسائية • أطفال
💄 كوسميتيك وعطور أصلية
🏠 مستلزمات منزلية مختارة
💰 أسعار منافسة
🚚 توصيل داخل ولاية الوادي`,
  whatsapp: '+213779156397',
  address: 'طريق التكوين المهني – بالزڨم، حساني عبد الكريم، ولاية الوادي',
 hours: `السبت - الخميس
08:30 صباحًا - 12:00 ظهرًا
04:00 مساءً - 08:00 مساءً
الجمعة
الفترة الصباحية: مغلق
04:00 مساءً - 08:00 مساءً`,  siteUrl: 'https://belma3qoul.com',
  facebookUrl: 'https://www.facebook.com/ma3qoulshop',
  instagramUrl: 'https://www.instagram.com/belma3qoul',
  messengerUrl: 'https://m.me/ma3qoulshop',
  tiktokUrl: 'https://www.tiktok.com/@belma3qoul',
  mapsUrl:
    'https://www.google.com/maps/dir/?api=1&destination=%D8%B7%D8%B1%D9%8A%D9%82%20%D8%A7%D9%84%D8%AA%D9%83%D9%88%D9%8A%D9%86%20%D8%A7%D9%84%D9%85%D9%87%D9%86%D9%8A%20%E2%80%93%20%D8%A8%D8%A7%D9%84%D8%B2%DA%AF%D9%85%2C%20%D8%AD%D8%B3%D8%A7%D9%86%D9%8A%20%D8%B9%D8%A8%D8%AF%20%D8%A7%D9%84%D9%83%D8%B1%D9%8A%D9%85%2C%20%D9%88%D9%84%D8%A7%D9%8A%D8%A9%20%D8%A7%D9%84%D9%88%D8%A7%D8%AF%D9%8A',
} as const

export const navLinks = [
  { label: 'الرئيسية', href: '#home' },
  { label: 'المنشورات', href: '#featured' },
  { label: 'آخر المنشورات', href: '#latest' },
  { label: 'الموقع', href: '#location' },
] as const

export const socialLinks = [
  {
    label: 'Facebook',
    href: siteConfig.facebookUrl,
    platform: 'facebook',
    hint: 'تابع صفحتنا',
  },
  {
    label: 'Instagram',
    href: siteConfig.instagramUrl,
    platform: 'instagram',
    hint: 'شاهد الصور',
  },
  {
    label: 'WhatsApp',
    href: `https://wa.me/${siteConfig.whatsapp.replace(/\D/g, '')}`,
    platform: 'whatsapp',
    hint: 'تواصل مباشر',
  },
  {
    label: 'Messenger',
    href: siteConfig.messengerUrl,
    platform: 'messenger',
    hint: 'رسالة فورية',
  },
  {
    label: 'TikTok',
    href: siteConfig.tiktokUrl,
    platform: 'tiktok',
    hint: 'تابع الڤيديوهات',
  },
] as const

export const featuredPosts = [
  {
    platform: 'Facebook',
    badge: 'مثبت',
    title: 'منشور مميز في أعلى الصفحة',
    text: 'مكان جاهز للمنشور الذي تريد تثبيته ليظهر أولًا للزائر.',
    href: siteConfig.facebookUrl,
  },
  {
    platform: 'Instagram',
    badge: 'مميز',
    title: 'صورة أو فيديو لافت',
    text: 'عرض بصري مختصر للمنشور الذي تريد إبرازَه دون أي تعقيد.',
    href: siteConfig.instagramUrl,
  },
  {
    platform: 'Messenger',
    badge: 'تواصل',
    title: 'رسالة مباشرة',
    text: 'بطاقة مخصصة لتشجيع الزائر على التواصل السريع عند الحاجة.',
    href: siteConfig.messengerUrl,
  },
] as const

export const latestPosts = [
  {
    platform: 'Facebook',
    time: 'قبل قليل',
    title: 'أحدث منشور من الصفحة',
    text: 'سيظهر هنا آخر محتوى منشور على الصفحة مع صورة أو نص مختصر.',
    href: siteConfig.facebookUrl,
  },
  {
    platform: 'Instagram',
    time: 'منذ ساعة',
    title: 'منشور جديد من الحساب',
    text: 'مكان مخصص للمنشورات الحديثة التي تريد إبرازها في الواجهة.',
    href: siteConfig.instagramUrl,
  },
  {
    platform: 'Facebook',
    time: 'اليوم',
    title: 'منشور آخر قابل للعرض',
    text: 'بطاقة بسيطة ومباشرة بدون أي عناصر غير ضرورية.',
    href: siteConfig.facebookUrl,
  },
  {
    platform: 'Messenger',
    time: 'مفتوح الآن',
    title: 'التواصل السريع',
    text: 'مؤشر بسيط يوضح أن الرسائل المباشرة متاحة للزائر.',
    href: siteConfig.messengerUrl,
  },
] as const
