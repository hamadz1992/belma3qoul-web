type SectionHeadingProps = {
  eyebrow: string
  title: string
  description?: string
  align?: 'left' | 'center'
  titleClassName?: string
  descriptionClassName?: string
}

function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'left',
  titleClassName = '',
  descriptionClassName = '',
}: SectionHeadingProps) {
  const alignClass = align === 'center' ? 'mx-auto text-center' : ''

  return (
    <div className={`${alignClass} max-w-3xl`}>
      {eyebrow ? (
        <div className="inline-flex items-center gap-2 rounded-full border border-rose-100 bg-rose-50 px-4 py-2 text-sm font-bold text-rose-600 shadow-sm">
          <span className="h-2 w-2 rounded-full bg-rose-500" aria-hidden="true" />
          <span>{eyebrow}</span>
        </div>
      ) : null}

      {title ? (
        <h2
          className={`mt-3 font-black tracking-tight text-slate-950 ${titleClassName || 'text-4xl'}`}
        >
          {title}
        </h2>
      ) : null}

      {description ? (
        <p
          className={`mt-4 text-base leading-7 text-slate-600 ${descriptionClassName}`}
        >
          {description}
        </p>
      ) : null}
    </div>
  )
}

export default SectionHeading
