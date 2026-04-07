'use client'

import { useState } from 'react'
import Image from 'next/image'

interface Props {
  src: string
  alt: string
  className?: string
}

export default function ImageDisplay({ src, alt, className = '' }: Props) {
  const [errored, setErrored] = useState(false)

  if (errored) {
    return (
      <div
        className={`flex items-center justify-center ${className}`}
        style={{ background: 'var(--bg-card)', color: 'var(--text-muted)', fontSize: '2rem' }}
      >
        🎲
      </div>
    )
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setErrored(true)}
      loading="lazy"
    />
  )
}
