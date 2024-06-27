import { DialogContent, DialogOverlay } from '@reach/dialog'
import {
  ReactNode,
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
} from 'react'

import { globalCss, keyframes, styled } from '../../stitches'
import { Icon } from '../Icon'

interface SidepanelProps {
  size?: 'medium' | 'large'
  children: ReactNode
  onClose?: () => void
}

export interface SidepanelRef {
  open: () => void
  close: () => void
}

const ANIMATION_DURATION = 500

const overlayShow = keyframes({
  '0%': { opacity: 0 },
  '100%': { opacity: 1 },
})

const overlayHide = keyframes({
  '0%': { opacity: 1 },
  '100%': { opacity: 0 },
})

const contentShow = keyframes({
  '0%': { opacity: 0, transform: 'translateX(100%)' },
  '100%': { opacity: 1, transform: 'translateX(0%)' },
})

const contentHide = keyframes({
  '0%': { opacity: 1, transform: 'translateX(0)' },
  '100%': { opacity: 0, transform: 'translateX(100%)' },
})

export const globalStyles = globalCss({
  '.sidepanel[data-reach-dialog-overlay]': {
    position: 'fixed',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: 4,
    backgroundColor: 'rgba(53, 52, 49, 0.3)',
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'flex-end',
    overflow: 'auto',
    inset: 0,
    animation: `${overlayShow} 300ms cubic-bezier(0.16, 1, 0.3, 1)`,
    '&.sidepanel--hidden': {
      animation: `${overlayHide} ${
        ANIMATION_DURATION - 50
      }ms cubic-bezier(0.16, 1, 0.3, 1) forwards !important`,
    },
  },
  '.sidepanel__content[data-reach-dialog-content]': {
    position: 'relative',
    top: 0,
    right: 0,
    bottom: 0,
    height: '100%',
    transformOrigin: 'center',
    backgroundColor: '$white',
    borderTopLeftRadius: '$radius200',
    borderBottomLeftRadius: '$radius200',
    boxShadow:
      'hsl(206 22% 7% / 35%) 0px 10px 38px -10px, hsl(206 22% 7% / 20%) 0px 10px 20px -15px',
    animation: `${contentShow} 250ms cubic-bezier(0.16, 1, 0.3, 1)`,
    willChange: 'transform',
    '&:focus': { outline: 'none' },
    '&.sidepanel__content--hidden': {
      animation: `${contentHide} ${
        ANIMATION_DURATION - 50
      }ms cubic-bezier(0.16, 1, 0.3, 1) forwards !important`,
    },
    '&.sidepanel__content--medium': {
      width: '50vw',
    },
    '&.sidepanel__content--large': {
      width: 'calc(100vw - 300px)',
    },
  },
})

const CloseButton = styled('button', {
  position: 'absolute',
  top: 18,
  left: 24,
  cursor: 'pointer',
  width: 28,
  height: 28,
  marginTop: -6,
  marginRight: -7,
  display: 'flex',
  alignItems: 'center',
  outline: 'none',
  justifyContent: 'center',
  borderRadius: '$radius100',
  transition: 'all 0.2s ease-in-out',
  '&:hover,&:focus': {
    backgroundColor: '$gray3',
  },
  '&:active': {
    backgroundColor: '$gray6',
  },
})

export const Sidepanel = forwardRef<SidepanelRef, SidepanelProps>(
  ({ onClose, size = 'large', children }, ref) => {
    const [isOpen, setIsOpen] = useState(false)
    const [visibilityState, setVisibilityState] = useState(false)
    const timeoutRef = useRef()

    const onRequestClose = () => {
      if (visibilityState === false) {
        return
      }

      setVisibilityState(false)
      // @ts-expect-error
      timeoutRef.current = setTimeout(() => {
        onClose?.()
        setIsOpen(false)
      }, ANIMATION_DURATION)
    }

    useImperativeHandle(ref, () => ({
      open: () => {
        clearTimeout(timeoutRef.current)
        setIsOpen(true)
        setVisibilityState(true)
      },
      close: () => onRequestClose(),
    }))

    if (!isOpen) {
      return null
    }

    return (
      <DialogOverlay
        className={`sidepanel ${!visibilityState ? 'sidepanel--hidden' : ''}`}
        isOpen={isOpen}
        onDismiss={onRequestClose}
        dangerouslyBypassFocusLock
      >
        <DialogContent
          className={`sidepanel__content sidepanel__content--${size} ${
            !visibilityState ? 'sidepanel__content--hidden' : ''
          }`}
        >
          <CloseButton
            onClick={onRequestClose}
            type="button"
            aria-label="Close"
          >
            <Icon src="double_arrow" color="$gray10" size={20} />
          </CloseButton>

          {children}
        </DialogContent>
      </DialogOverlay>
    )
  },
)
