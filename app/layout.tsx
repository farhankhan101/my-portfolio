// app/layout.tsx
import type { Metadata } from 'next'
import { Outfit } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/ThemeProvider'
import Navbar from '@/components/public/Navbar'
import Footer from '@/components/public/Footer'
import ChatbotWidget from '@/components/public/ChatbotWidget'
import CursorTrail from '@/components/public/CursorTrail'

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-sans',
})

export const metadata: Metadata = {
  title: 'Farhan Ahmed | Full Stack Developer Portfolio',
  description: 'Full Stack Developer specializing in SaaS applications, Next.js, React, Node.js, and Django REST Framework.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans">
        <ThemeProvider>
          <CursorTrail />
          <Navbar />
          <div className="flex-1 flex flex-col">
            {children}
          </div>
          <Footer />
          <ChatbotWidget />
        </ThemeProvider>
      </body>
    </html>
  )
}
