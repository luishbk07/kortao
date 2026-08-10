'use client'

import { useEffect } from 'react'

export const RegistrarServiceWorker = () => {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') {
      return
    }

    if (!('serviceWorker' in navigator)) {
      return
    }

    void navigator.serviceWorker.register('/sw.js').catch(() => {
      // Installability helper only; failures must not affect the app.
    })
  }, [])

  return null
}
