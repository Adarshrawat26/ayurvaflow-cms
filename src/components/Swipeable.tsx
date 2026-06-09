import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

interface Props {
  children: ReactNode
  className?: string
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  /** Minimum horizontal offset (px) to trigger */
  threshold?: number
}

export default function Swipeable({
  children,
  className,
  onSwipeLeft,
  onSwipeRight,
  threshold = 56,
}: Props) {
  return (
    <motion.div
      className={className}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.15}
      dragDirectionLock
      onDragEnd={(_, info) => {
        if (info.offset.x < -threshold || info.velocity.x < -400) {
          onSwipeLeft?.()
        } else if (info.offset.x > threshold || info.velocity.x > 400) {
          onSwipeRight?.()
        }
      }}
    >
      {children}
    </motion.div>
  )
}
