'use client'

import { motion } from 'framer-motion'

interface RecapCardProps {
  title: string
  children: React.ReactNode
  gradient?: string
}

export function RecapCard({
  title,
  children,
  gradient = 'from-blue-900 to-indigo-900',
}: RecapCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className={`flex h-[500px] w-full max-w-md flex-col items-center justify-center rounded-2xl bg-gradient-to-b ${gradient} p-8 text-center shadow-2xl`}
    >
      <h2 className="mb-6 text-2xl font-bold text-white">{title}</h2>
      <div className="flex-1 flex flex-col items-center justify-center">
        {children}
      </div>
    </motion.div>
  )
}
