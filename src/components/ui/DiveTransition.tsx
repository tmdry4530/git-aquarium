'use client'

import { motion, AnimatePresence } from 'framer-motion'

interface DiveTransitionProps {
  isVisible: boolean
}

function DiveTransition({ isVisible }: DiveTransitionProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-50 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Water overlay — fills from top */}
          <motion.div
            className="absolute inset-0 bg-background"
            initial={{ scaleY: 0, originY: '0%' }}
            animate={{ scaleY: 1 }}
            transition={{ duration: 0.6, ease: 'easeIn' }}
          />
          {/* Ripple circle */}
          <motion.div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              className="w-32 h-32 rounded-full border-4 border-primary"
              initial={{ scale: 0, opacity: 1 }}
              animate={{ scale: 4, opacity: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export { DiveTransition }
