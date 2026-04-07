'use client'

import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function IframeResizerInner() {
  const searchParams = useSearchParams()
  const theme = searchParams.get('theme')

  useEffect(() => {
    // Apply embedded theme if query param is set
    if (theme === 'embedded') {
      document.documentElement.setAttribute('data-theme', 'embedded')
    }

    // Post height changes to WordPress parent page
    const sendHeight = () => {
      const height = document.documentElement.scrollHeight
      window.parent.postMessage({ type: 'resize', height }, '*')
    }

    sendHeight()

    const observer = new ResizeObserver(sendHeight)
    observer.observe(document.body)

    return () => observer.disconnect()
  }, [theme])

  return null
}

export default function IframeResizer() {
  return (
    <Suspense fallback={null}>
      <IframeResizerInner />
    </Suspense>
  )
}
