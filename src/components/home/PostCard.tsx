type PostCardProps = {
  platform: string
  badge?: string
  title: string
  text: string
  href: string
  time?: string
}

function PostCard({ platform, badge, title, text, href, time }: PostCardProps) {
  return (
    <article className="group overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-2xl">
      <div className="relative h-44 overflow-hidden bg-gradient-to-br from-rose-100 via-white to-fuchsia-100">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(225,29,72,0.18),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(168,85,247,0.14),transparent_32%)]" />
        <div className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold tracking-[0.18em] text-rose-600 uppercase shadow-sm backdrop-blur">
          {platform}
        </div>
        {badge ? (
          <div className="absolute right-4 top-4 rounded-full bg-rose-600 px-3 py-1 text-xs font-semibold text-white shadow-sm">
            {badge}
          </div>
        ) : null}
        <div className="absolute bottom-4 right-4 left-4 rounded-[1.35rem] border border-white/60 bg-white/70 p-4 shadow-sm backdrop-blur-md">
          <h3 className="text-base font-bold text-slate-950">{title}</h3>
          {time ? <p className="mt-2 text-xs text-slate-500">{time}</p> : null}
        </div>
      </div>

      <div className="p-5">
        <p className="text-sm leading-7 text-slate-600">{text}</p>

        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-rose-700 transition group-hover:text-rose-800"
        >
          عرض المنشور
          <span aria-hidden="true">↗</span>
        </a>
      </div>
    </article>
  )
}

export default PostCard
