import brandImage from '../../assets/logo/logo.png'
import { siteConfig } from '../../constants/site'

type BrandMarkProps = {
  compact?: boolean
  className?: string
}

function BrandMark({ compact = false, className = '' }: BrandMarkProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`.trim()}>
      <span className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-rose-100 bg-white shadow-sm shadow-rose-100">
<img
  src={brandImage}
  alt="كل شيء بالمعقول"
  className="h-full w-full object-contain p-1"
/>      </span>

      <span className={compact ? 'leading-tight' : 'leading-tight'}>
        <span className="block text-sm font-semibold tracking-[0.24em] text-rose-600 uppercase">
          {siteConfig.name}
        </span>
        <span className="block text-sm text-slate-600">{siteConfig.arabicName}</span>
      </span>
    </div>
  )
}

export default BrandMark
