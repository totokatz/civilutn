interface ProgressRingProps {
  value: number
  max: number
  label: string
  color: string
  size?: number
}

export function ProgressRing({ value, max, label, color, size = 64 }: ProgressRingProps) {
  const strokeWidth = 4
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const progress = max > 0 ? value / max : 0
  const offset = circumference * (1 - progress)

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="currentColor" strokeWidth={strokeWidth} className="text-gray-200 dark:text-gray-600" />
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth={strokeWidth} strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" className="transition-all duration-500" />
      </svg>
      <span className="text-sm font-semibold dark:text-gray-200">{value}/{max}</span>
      <span className="text-[10px] text-text-secondary dark:text-gray-400">{label}</span>
    </div>
  )
}
