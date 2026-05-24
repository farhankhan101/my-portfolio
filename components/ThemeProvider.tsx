// components/ThemeProvider.tsx
'use client'

import { ThemeProvider as NextThemesProvider } from 'next-themes'
import { ReactNode } from 'react'

// Suppress React 19 next-themes script tag warning in development console
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  const originalError = console.error
  console.error = (...args: any[]) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('Encountered a script tag') || args[0].includes('Scripts inside React components'))
    ) {
      return
    }
    originalError.apply(console, args)
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  )
}
