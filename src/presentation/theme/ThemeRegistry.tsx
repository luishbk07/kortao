'use client'

import { useState, type ReactNode } from 'react'
import { useServerInsertedHTML } from 'next/navigation'
import { CacheProvider } from '@emotion/react'
import createCache from '@emotion/cache'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { theme } from './theme'

type ThemeRegistryProps = {
  children: ReactNode
}

export const ThemeRegistry = ({ children }: ThemeRegistryProps) => {
  const [{ cache, flush }] = useState(() => {
    const emotionCache = createCache({ key: 'mui' })
    emotionCache.compat = true

    const previousInsert = emotionCache.insert
    let inserted: string[] = []

    emotionCache.insert = (...args) => {
      const serialized = args[1]
      if (emotionCache.inserted[serialized.name] === undefined) {
        inserted.push(serialized.name)
      }
      return previousInsert(...args)
    }

    const flushInserted = () => {
      const previousInserted = inserted
      inserted = []
      return previousInserted
    }

    return { cache: emotionCache, flush: flushInserted }
  })

  useServerInsertedHTML(() => {
    const names = flush()
    if (names.length === 0) {
      return null
    }

    let styles = ''
    for (const name of names) {
      styles += cache.inserted[name]
    }

    return (
      <style
        data-emotion={`${cache.key} ${names.join(' ')}`}
        dangerouslySetInnerHTML={{ __html: styles }}
      />
    )
  })

  return (
    <CacheProvider value={cache}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </CacheProvider>
  )
}
