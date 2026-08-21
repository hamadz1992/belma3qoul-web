type SocialButtonProps = {
  label: string
  hint: string
  href: string
  tone: 'facebook' | 'instagram' | 'whatsapp' | 'messenger' | 'tiktok'
}

const toneStyles: Record<SocialButtonProps['tone'], string> = {
  facebook: 'from-blue-600 to-blue-700 text-white',
  instagram: 'from-fuchsia-500 via-pink-500 to-orange-400 text-white',
  whatsapp: 'from-emerald-500 to-emerald-600 text-white',
  messenger: 'from-sky-500 to-blue-600 text-white',
  tiktok: 'from-neutral-900 to-black text-white',
}

const initials: Record<SocialButtonProps['tone'], string> = {
  facebook: 'f',
  instagram: 'ig',
  whatsapp: 'wa',
  messenger: 'm',
  tiktok: 'tt',
}

function SocialButton({ label, hint, href, tone }: SocialButtonProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={`group flex items-center gap-4 rounded-[1.75rem] border border-slate-200 bg-white p-4 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl`}
    >
      <span className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-[1.2rem] bg-gradient-to-br ${toneStyles[tone]} shadow-lg`}>
        <span className="text-sm font-black uppercase tracking-[0.12em]">{initials[tone]}</span>
      </span>

      <span className="flex min-w-0 flex-1 flex-col text-right">
        <span className="text-base font-bold text-slate-950">{label}</span>
        <span className="mt-1 text-sm text-slate-500">{hint}</span>
      </span>

      <span className="mr-auto text-xl text-slate-400 transition group-hover:translate-x-1 group-hover:text-rose-600">
        ↗
      </span>
    </a>
  )
}

export default SocialButton
