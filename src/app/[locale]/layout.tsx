import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { locales } from '@/i18n/config'
import type { Locale } from '@/i18n/config'
import { AuthProvider } from '@/components/auth/AuthProvider'

interface LocaleLayoutProps {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { locale } = await params

  if (!locales.includes(locale as Locale)) {
    notFound()
  }

  const rawMessages = await getMessages()
  const messages = JSON.parse(JSON.stringify(rawMessages)) as typeof rawMessages

  return (
    <NextIntlClientProvider messages={messages}>
      <AuthProvider>{children}</AuthProvider>
    </NextIntlClientProvider>
  )
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}
