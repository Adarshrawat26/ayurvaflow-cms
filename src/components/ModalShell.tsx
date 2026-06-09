import { useEffect, useState, type ReactNode, type PointerEvent as ReactPointerEvent } from 'react'
import { createPortal } from 'react-dom'
import { ArrowLeft, X } from 'lucide-react'
import {
  AnimatePresence,
  motion,
  useDragControls,
  useMotionValue,
  useTransform,
} from 'framer-motion'

interface Props {
  open: boolean
  onClose: () => void
  children: ReactNode
  preventClose?: boolean
  title?: string
  subtitle?: string
  onBack?: () => void
  backLabel?: string
  maxWidth?: 'sm' | 'md' | 'lg'
}

const DISMISS_OFFSET = 100
const DISMISS_VELOCITY = 450

function useIsMobileSheet() {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia('(max-width: 1023px)').matches : false,
  )

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 1023px)')
    const update = () => setIsMobile(mq.matches)
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  return isMobile
}

export default function ModalShell({
  open,
  onClose,
  children,
  preventClose = false,
  title,
  subtitle,
  onBack,
  backLabel = 'Back',
  maxWidth = 'md',
}: Props) {
  const isSheet = useIsMobileSheet()
  const dragControls = useDragControls()
  const dragY = useMotionValue(0)
  const backdropOpacity = useTransform(dragY, [0, 280], [1, 0.15])

  useEffect(() => {
    if (open) dragY.set(0)
  }, [open, dragY])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !preventClose) {
        if (onBack) onBack()
        else onClose()
      }
    }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [open, onClose, onBack, preventClose])

  const maxW = maxWidth === 'sm' ? 'lg:max-w-sm' : maxWidth === 'lg' ? 'lg:max-w-lg' : 'lg:max-w-md'

  const handleBack = () => {
    if (preventClose) return
    if (onBack) onBack()
    else onClose()
  }

  const startDrag = (e: ReactPointerEvent) => {
    if (preventClose || !isSheet) return
    dragControls.start(e)
  }

  const handleDragEnd = (_: unknown, info: { offset: { y: number }; velocity: { y: number } }) => {
    if (preventClose) return
    if (info.offset.y > DISMISS_OFFSET || info.velocity.y > DISMISS_VELOCITY) {
      onClose()
    }
  }

  return createPortal(
    <AnimatePresence>
      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-end lg:items-center justify-center"
          role="dialog"
          aria-modal="true"
          aria-label={title}
        >
          <motion.div
            className="absolute inset-0 bg-black/45 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ opacity: isSheet ? backdropOpacity : undefined }}
            transition={{ duration: 0.2 }}
            onClick={() => !preventClose && onClose()}
          />

          <motion.div
            drag={!preventClose && isSheet ? 'y' : false}
            dragControls={dragControls}
            dragListener={false}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.55 }}
            style={{ y: isSheet ? dragY : undefined }}
            onDragEnd={handleDragEnd}
            initial={isSheet ? { y: '100%' } : { opacity: 0, scale: 0.96, y: 0 }}
            animate={isSheet ? { y: 0 } : { opacity: 1, scale: 1, y: 0 }}
            exit={isSheet ? { y: '100%' } : { opacity: 0, scale: 0.96, y: 0 }}
            transition={{ type: 'spring', damping: 30, stiffness: 340 }}
            className={`relative bg-white w-full ${maxW} rounded-t-2xl lg:rounded-2xl shadow-2xl max-h-[min(92vh,100dvh)] flex flex-col overflow-hidden touch-pan-y`}
            onClick={e => e.stopPropagation()}
          >
            {/* Swipe handle — mobile */}
            <div
              className={`flex justify-center pt-2.5 pb-0.5 lg:hidden select-none ${preventClose ? '' : 'cursor-grab active:cursor-grabbing touch-none'}`}
              onPointerDown={startDrag}
              aria-hidden
            >
              <div className="w-10 h-1 rounded-full bg-gray-300" />
            </div>

            {(title || onBack) && (
              <div
                className={`flex items-center gap-2 px-3 py-2 border-b border-gray-100 shrink-0 lg:px-4 ${!preventClose && isSheet ? 'cursor-grab active:cursor-grabbing touch-none lg:cursor-default lg:touch-auto' : ''}`}
                onPointerDown={startDrag}
              >
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex items-center gap-1 p-2 -ml-1 text-gray-700 hover:bg-gray-100 rounded-lg text-sm font-medium shrink-0 touch-manipulation"
                  aria-label={onBack ? backLabel : 'Close'}
                >
                  <ArrowLeft size={18} />
                  <span className="lg:hidden">{onBack ? backLabel : 'Back'}</span>
                </button>
                {title && (
                  <div className="flex-1 min-w-0 text-center lg:text-left lg:pl-0 -ml-2 lg:ml-0 pointer-events-none">
                    <div className="text-sm font-semibold text-gray-900 truncate">{title}</div>
                    {subtitle && <div className="text-[10px] text-gray-400 truncate">{subtitle}</div>}
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => !preventClose && onClose()}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg shrink-0 hidden lg:flex touch-manipulation"
                  aria-label="Close"
                >
                  <X size={18} />
                </button>
                <div className="w-10 lg:hidden shrink-0" aria-hidden />
              </div>
            )}

            <div className="flex-1 overflow-y-auto overscroll-contain">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
