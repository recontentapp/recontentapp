import { FC, ReactNode, useEffect, useState } from 'react'

import { styled } from '../../../theme'

interface CopyPasteProps {
  content: string
  children: ReactNode
}

const Tooltip = styled('div', {
  position: 'absolute',
  top: -36,
  left: '50%',
  transform: 'translateX(-50%)',
  zIndex: 1,
  pointerEvents: 'none',
  whiteSpace: 'nowrap',
  backgroundColor: '$gray16',
  borderRadius: '$radius100',
  boxShadow: '$shadow100',
  paddingY: '$space60',
  paddingX: '$space80',
  color: '$gray1',
  fontSize: '$size80',
})

export const CopyPaste: FC<CopyPasteProps> = ({ content, children }) => {
  const [copied, setIsCopied] = useState(false)

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(content)
      setIsCopied(true)
    } catch {
      // Only work on secured origins
    }
  }

  useEffect(() => {
    if (!copied) {
      return () => {}
    }

    const timeout = setTimeout(() => {
      setIsCopied(false)
    }, 2000)

    return () => clearTimeout(timeout)
  }, [copied])

  return (
    <div
      role="button"
      tabIndex={0}
      style={{
        position: 'relative',
        display: 'inline-flex',
        cursor: 'pointer',
      }}
      onClick={onCopy}
    >
      {copied && <Tooltip>Copied!</Tooltip>}
      {children}
    </div>
  )
}
