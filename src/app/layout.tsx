import type { Metadata } from 'next'
import { Orbitron, JetBrains_Mono } from 'next/font/google'
import './globals.css'

const orbitron = Orbitron({
  variable: '--font-orbitron',
  subsets: ['latin'],
})

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-jetbrains-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Git Aquarium',
  description: 'Your GitHub activity as a living aquarium',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body
        className={`${orbitron.variable} ${jetbrainsMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  )
}
